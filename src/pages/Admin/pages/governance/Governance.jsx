import { useCallback, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  Avatar,
  Button,
  Callout,
  DataTable,
  EmptyState,
  LoadError,
  PageHeader,
  Pagination,
  RowActions,
  SearchInput,
  SegmentedTabs,
  Select,
  StatusBadge,
  Toolbar,
  humanize,
  useClampPage,
  useConfirm,
  useListParams,
  useModalParam,
  usePendingIds,
  useTabParam,
  useToast,
} from "../../../../components/admin";
import { formatDate } from "../../../../components/admin/format.js";
import { selectActor, selectIsSuperAdmin } from "../../../../app/features/auth/auth.selectors.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import governanceApi, {
  useChangeStaffAdminRoleMutation,
  useDeactivateStaffAdminMutation,
  useDeactivateSuperAdminMutation,
  useGetStaffAdminsQuery,
  useGetSuperAdminsQuery,
  useReactivateStaffAdminMutation,
} from "../../../../app/apis/governance.api.js";
import { useGetRolesQuery } from "../../../../app/apis/rbac.api.js";
import AdminForm from "./AdminForm.jsx";
import RolePanel from "./RolePanel.jsx";

/**
 * Administrator management — `03-staff-admin.md`, `04-super-admin.md`, `05-rbac.md`.
 *
 * Gated on ACTOR TYPE, not a permission. 03 is explicit that staff-admins
 * cannot manage each other, and the server enforces it the same way — so no
 * RBAC role can unlock this screen, and showing it to a staff-admin would only
 * produce a wall of 403s.
 *
 *   PageHeader → view tabs (?tab=) → Toolbar → DataTable → Pagination
 *
 * "Add administrator" lives at `?new=1` (the command palette links to it).
 */

const HEADER = {
  eyebrow: "Governance",
  title: "Administrators",
};

// no icons: all three fit in one row at 360px
const VIEWS = [
  { value: "staff", label: "Staff" },
  { value: "super", label: "Super admins" },
  { value: "roles", label: "Roles" },
];
const VIEW_VALUES = VIEWS.map((view) => view.value);

const STATUS_TABS = [
  { value: null, label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Deactivated" },
];

/*
 * 04 marks these user-safe, but apiError.js doesn't list them, so
 * getUserMessage would show the generic message. Re-marked here so the
 * confirm dialog shows the real reason.
 */
const SUPER_ADMIN_ERRORS = {
  CANNOT_DEACTIVATE_SELF: "You can't deactivate your own account.",
  LAST_SUPER_ADMIN: "At least one active super admin is required.",
};

const Governance = () => {
  const isSuperAdmin = useSelector(selectIsSuperAdmin);

  if (!isSuperAdmin) {
    return (
      <>
        <PageHeader {...HEADER} description="The people who run licgrow: staff admins, super admins and their roles." />
        <EmptyState
          icon="lock"
          title="Restricted"
          description="Only super admins can add administrators, change their roles or deactivate them. Ask a super admin if you need different access."
        />
      </>
    );
  }

  return <AdministratorsConsole />;
};

export default Governance;

/* ── the console (super admins) ─────────────────────────────────────────── */

function AdministratorsConsole() {
  const [view] = useTabParam("tab", { values: VIEW_VALUES, defaultValue: "staff" });
  const [, setParams] = useSearchParams();
  const [isNewOpen, openNew, closeNew] = useModalParam("new");

  // one URL write: a view switch drops the old view's page, search and
  // filters (the super-admin list takes none of them)
  const showView = useCallback(
    (next) =>
      setParams(
        () => {
          const out = new URLSearchParams();
          if (next !== "staff") out.set("tab", next);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  return (
    <>
      <PageHeader
        {...HEADER}
        description="Add staff and super admins, choose what each staff admin can do, and switch off access when someone leaves."
        actions={
          <Button variant="primary" icon="userPlus" onClick={openNew}>
            Add administrator
          </Button>
        }
      />

      <SegmentedTabs
        layoutId="governance-view"
        ariaLabel="Administrators view"
        items={VIEWS}
        value={view}
        onChange={showView}
        className="self-start"
      />

      {view === "staff" && <StaffAdmins onAdd={openNew} />}
      {view === "super" && <SuperAdmins />}
      {view === "roles" && <RolePanel />}

      <AdminForm
        open={isNewOpen}
        defaultKind={view === "super" ? "super" : "staff"}
        onClose={closeNew}
        // closing the dialog and showing the new account's list is one URL write
        onCreated={showView}
      />
    </>
  );
}

/** Avatar, name and email — the first cell of both tables. */
function AdminIdentity({ admin, isYou = false }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={admin.fullName} />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate font-semibold text-text-primary">{admin.fullName}</span>
          {isYou && <StatusBadge size="sm" tone="accent" dot={false} label="You" />}
        </span>
        <span className="block truncate text-[13px] text-text-muted">{admin.email}</span>
      </span>
    </span>
  );
}

/* ── staff admins (03) ──────────────────────────────────────────────────── */

function StaffAdmins({ onAdd }) {
  const list = useListParams({ filters: { isActive: null } });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetStaffAdminsQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const { data: roles } = useGetRolesQuery();
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [changeRole] = useChangeStaffAdminRoleMutation();
  const [deactivate] = useDeactivateStaffAdminMutation();
  const [reactivate] = useReactivateStaffAdminMutation();

  // the next page, so "Next" is instant
  const prefetchList = governanceApi.usePrefetch("getStaffAdmins");
  useEffect(() => {
    if (data?.meta?.hasNext) prefetchList({ ...list.args, page: list.page + 1 }, { ifOlderThan: 30 });
  }, [data?.meta?.hasNext, list.args, list.page, prefetchList]);

  const onRoleChange = useCallback(
    async (admin, roleId) => {
      if (!roleId || roleId === admin.role?.id) return;
      const next = humanize(roles?.find((role) => role.id === roleId)?.name);
      const done = await confirm({
        title: `Make ${admin.fullName} a ${next}?`,
        description: admin.role
          ? `Takes effect on their next sign-in. Until then they keep the ${humanize(admin.role.name)} permissions.`
          : "Takes effect on their next sign-in.",
        confirmLabel: "Change role",
        icon: "key",
        onConfirm: () => run(admin.id, () => changeRole({ adminId: admin.id, roleId }).unwrap()),
      });
      if (done) toast.success(`${admin.fullName} is now a ${next}`, { description: "Takes effect on their next sign-in." });
    },
    [changeRole, confirm, roles, run, toast],
  );

  const onDeactivate = useCallback(
    async (admin) => {
      const done = await confirm({
        title: `Deactivate ${admin.fullName}?`,
        description:
          "They're blocked from signing in straight away. Their account, role and history are kept, and you can reactivate them at any time.",
        confirmLabel: "Deactivate admin",
        tone: "danger",
        icon: "userX",
        onConfirm: () => run(admin.id, () => deactivate(admin.id).unwrap()),
      });
      if (done) toast.success(`${admin.fullName} is deactivated`, { description: "They can't sign in until reactivated." });
    },
    [confirm, deactivate, run, toast],
  );

  const onReactivate = useCallback(
    (admin) =>
      run(admin.id, async () => {
        try {
          await reactivate(admin.id).unwrap();
          toast.success(`${admin.fullName} is active again`, { description: "They can sign in with their existing password." });
        } catch (err) {
          toast.error(`Couldn't reactivate ${admin.fullName}`, { description: getUserMessage(err) });
        }
      }),
    [reactivate, run, toast],
  );

  const columns = useMemo(
    () => [
      {
        id: "admin",
        header: "Administrator",
        mobile: "primary",
        cell: (admin) => <AdminIdentity admin={admin} />,
      },
      {
        id: "role",
        header: "Role",
        width: "12rem",
        cell: (admin) => (
          <span className="block w-full max-md:max-w-60">
            <Select
              value={admin.role?.id ?? ""}
              onChange={(event) => onRoleChange(admin, event.target.value)}
              aria-label={`Role for ${admin.fullName}`}
              title="Takes effect on their next sign-in"
            >
              {!admin.role && (
                <option value="" disabled>
                  No role
                </option>
              )}
              {(roles ?? (admin.role ? [admin.role] : [])).map((role) => (
                <option key={role.id} value={role.id}>
                  {humanize(role.name)}
                </option>
              ))}
            </Select>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        width: "9.5rem",
        cell: (admin) => <StatusBadge status={admin.isActive ? "active" : "deactivated"} />,
      },
      {
        id: "created",
        header: "Added",
        width: "9rem",
        hideBelow: "lg",
        cell: (admin) => <span className="text-text-muted tabular-nums">{formatDate(admin.createdAt)}</span>,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        width: "4.5rem",
        align: "end",
        mobile: "end",
        className: "relative z-10",
        cell: (admin) => (
          <RowActions
            label={`Actions for ${admin.fullName}`}
            items={[
              {
                id: "deactivate",
                label: "Deactivate admin",
                description: "Blocks sign-in straight away",
                icon: "userX",
                tone: "danger",
                hidden: !admin.isActive,
                onSelect: () => onDeactivate(admin),
              },
              {
                id: "reactivate",
                label: "Reactivate admin",
                icon: "refresh",
                hidden: admin.isActive,
                onSelect: () => onReactivate(admin),
              },
            ]}
          />
        ),
      },
    ],
    [onDeactivate, onReactivate, onRoleChange, roles],
  );

  return (
    <>
      <Toolbar
        isFetching={isFetching && !isLoading}
        start={
          <SegmentedTabs
            layoutId="staff-admin-status"
            ariaLabel="Filter staff admins by status"
            items={STATUS_TABS}
            value={list.filters.isActive}
            onChange={(value) => list.setFilter("isActive", value)}
          />
        }
        end={
          <SearchInput
            label="Search staff admins"
            placeholder="Search name or email…"
            value={list.search.value}
            onChange={list.search.onChange}
            isSearching={list.search.isPending || (isFetching && Boolean(list.search.committed))}
          />
        }
      />

      {isError ? (
        <LoadError what="staff admins" error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            caption="Staff admins"
            columns={columns}
            rows={items}
            isLoading={isLoading}
            isFetching={isFetching}
            pendingIds={pendingIds}
            empty={
              list.isFiltered ? (
                <EmptyState
                  compact
                  icon="search"
                  title="No staff admins match"
                  description={
                    list.search.committed
                      ? `Nothing for “${list.search.committed}” with these filters.`
                      : "No staff admins have this status."
                  }
                />
              ) : (
                <EmptyState
                  icon="users"
                  title="No staff admins yet"
                  description="Staff admins run batches, content and learners. Add one and choose their role."
                  action={
                    <Button variant="secondary" icon="userPlus" onClick={onAdd}>
                      Add administrator
                    </Button>
                  }
                />
              )
            }
          />
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="staff admins" isFetching={isFetching} />
        </div>
      )}
    </>
  );
}

/* ── super admins (04) ──────────────────────────────────────────────────── */

function SuperAdmins() {
  // 04 §1 takes pagination only: no search, no filters
  const list = useListParams();
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSuperAdminsQuery(list.args);
  const items = data?.items ?? [];
  useClampPage(data?.meta, list.page, list.setPage);

  const myId = useSelector(selectActor)?.id;
  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [deactivate] = useDeactivateSuperAdminMutation();

  const onDeactivate = useCallback(
    async (admin) => {
      const done = await confirm({
        title: `Deactivate ${admin.fullName}?`,
        description:
          "They're blocked from signing in straight away. Their account is kept, but only the bootstrap CLI can reactivate a super admin.",
        confirmLabel: "Deactivate super admin",
        tone: "danger",
        icon: "userX",
        onConfirm: () =>
          run(admin.id, async () => {
            try {
              await deactivate(admin.id).unwrap();
            } catch (err) {
              const copy = SUPER_ADMIN_ERRORS[err?.code];
              throw copy ? { ...err, userSafe: true, message: copy } : err;
            }
          }),
      });
      if (done) toast.success(`${admin.fullName} is deactivated`, { description: "They can't sign in any more." });
    },
    [confirm, deactivate, run, toast],
  );

  const columns = useMemo(
    () => [
      {
        id: "admin",
        header: "Super admin",
        mobile: "primary",
        cell: (admin) => <AdminIdentity admin={admin} isYou={admin.id === myId} />,
      },
      {
        id: "status",
        header: "Status",
        width: "9.5rem",
        cell: (admin) => <StatusBadge status={admin.isActive ? "active" : "deactivated"} />,
      },
      {
        id: "created",
        header: "Added",
        width: "9rem",
        hideBelow: "lg",
        cell: (admin) => <span className="text-text-muted tabular-nums">{formatDate(admin.createdAt)}</span>,
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        width: "4.5rem",
        align: "end",
        mobile: "end",
        className: "relative z-10",
        cell: (admin) => (
          <RowActions
            label={`Actions for ${admin.fullName}`}
            items={[
              {
                id: "deactivate",
                label: "Deactivate super admin",
                description: "Only the bootstrap CLI can undo this",
                icon: "userX",
                tone: "danger",
                // 04 §3: no deactivating yourself; no reactivation over the API
                hidden: !admin.isActive || admin.id === myId,
                onSelect: () => onDeactivate(admin),
              },
            ]}
          />
        ),
      },
    ],
    [myId, onDeactivate],
  );

  return (
    <>
      <Callout tone="info" title="Deactivation is one-way here">
        You can&apos;t deactivate yourself, and the last active super admin can&apos;t be deactivated. Reactivating a
        super admin is done with the bootstrap CLI, so a compromised account can&apos;t quietly restore another.
      </Callout>

      {isError ? (
        <LoadError what="super admins" error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable
            caption="Super admins"
            columns={columns}
            rows={items}
            isLoading={isLoading}
            isFetching={isFetching}
            skeletonRows={3}
            pendingIds={pendingIds}
            empty={
              <EmptyState
                compact
                icon="shield"
                title="No super admins listed"
                description="The first super admin is created with the bootstrap CLI."
              />
            }
          />
          <Pagination meta={data?.meta} onPageChange={list.setPage} itemLabel="super admins" isFetching={isFetching} />
        </div>
      )}
    </>
  );
}
