import Icon from "../../../../components/ui/Icon.jsx";
import {
  Callout,
  Card,
  CardGrid,
  LoadError,
  Skeleton,
  SkeletonCard,
  StatusBadge,
  humanize,
} from "../../../../components/admin";
import { useGetStaffAdminsQuery } from "../../../../app/apis/governance.api.js";
import {
  useGetPermissionCatalogQuery,
  useGetRolesQuery,
} from "../../../../app/apis/rbac.api.js";

/**
 * Roles and the permission catalog — `api-contracts/05-rbac.md`.
 *
 * Read-only by design for now. §5 allows replacing a custom role's
 * permissions, but the seeded roles are immutable (422 SYSTEM_ROLE_IMMUTABLE)
 * and there are no custom roles yet, so an editor would have nothing to act on.
 *
 * Each card counts its active staff admins with the server's `meta.total`
 * (`roleId` + `isActive` filters, `limit: 1`) rather than counting a page.
 */
export default function RolePanel() {
  const roles = useGetRolesQuery();
  const catalog = useGetPermissionCatalogQuery();

  if (roles.isError) return <LoadError what="roles" error={roles.error} onRetry={roles.refetch} />;

  const describe = (name) => catalog.data?.find((permission) => permission.name === name)?.description;

  return (
    <>
      <Callout tone="info" title="Changes apply at the next sign-in">
        Permissions are written into an admin&apos;s session when they sign in, so a new role reaches them the next time
        they sign in. Built-in roles can&apos;t be edited.
      </Callout>

      <CardGrid cols={3}>
        {roles.isLoading
          ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
          : (roles.data ?? []).map((role) => <RoleCard key={role.id} role={role} describe={describe} />)}
      </CardGrid>
    </>
  );
}

function RoleCard({ role, describe }) {
  const name = humanize(role.name);

  return (
    <Card as="article" className="flex min-w-0 flex-col gap-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tint-slate text-text-primary">
          <Icon name="key" className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="font-display text-lg font-extrabold tracking-tight text-text-primary">{name}</h2>
            {role.isSystem && <StatusBadge size="sm" tone="neutral" icon="lock" label="Built-in" />}
          </div>
          {role.description && <p className="mt-0.5 text-[13px] leading-snug text-text-muted">{role.description}</p>}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface-muted px-4 py-3">
          <dt className="caps text-[10.5px] font-bold text-text-muted">Permissions</dt>
          <dd className="mt-1 font-display text-2xl leading-none font-extrabold text-text-primary tabular-nums">
            {role.permissions.length}
          </dd>
        </div>
        <div className="rounded-2xl bg-surface-muted px-4 py-3">
          <dt className="caps text-[10.5px] font-bold text-text-muted">Active admins</dt>
          <dd className="mt-1 font-display text-2xl leading-none font-extrabold text-text-primary tabular-nums">
            <ActiveAdminCount roleId={role.id} />
          </dd>
        </div>
      </dl>

      <ul aria-label={`${name} permissions`} className="flex flex-wrap gap-1.5">
        {role.permissions.map((permission) => (
          <li
            key={permission}
            title={describe(permission)}
            className="rounded-full bg-surface-muted px-2.5 py-1 text-[11.5px] font-medium text-text-muted ring-1 ring-inset ring-border/60"
          >
            {permission}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActiveAdminCount({ roleId }) {
  const { data, isLoading, isError } = useGetStaffAdminsQuery({ roleId, isActive: "true", limit: 1 });
  if (isLoading) return <Skeleton className="h-6 w-8" />;
  if (isError) return "—";
  return data?.meta?.total ?? 0;
}
