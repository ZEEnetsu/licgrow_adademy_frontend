import { useState } from "react";
import { useSelector } from "react-redux";

import DashboardCompLayout from "../../../../layouts/DashboardCompLayout.jsx";
import Btn from "../../components/Btn.jsx";
import ProtalLayout from "../../../../layouts/PortalLayput.jsx";
import AdminForm from "./AdminForm.jsx";
import RolePanel from "./RolePanel.jsx";
import { selectIsSuperAdmin } from "../../../../app/features/auth/auth.selectors.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useChangeStaffAdminRoleMutation,
  useDeactivateStaffAdminMutation,
  useDeactivateSuperAdminMutation,
  useGetStaffAdminsQuery,
  useGetSuperAdminsQuery,
  useReactivateStaffAdminMutation,
} from "../../../../app/apis/governance.api.js";
import { useGetRolesQuery } from "../../../../app/apis/rbac.api.js";

/**
 * Administrator management — `03-staff-admin.md`, `04-super-admin.md`, `05-rbac.md`.
 *
 * Gated on ACTOR TYPE, not a permission. 03 is explicit that staff-admins
 * cannot manage each other, and the server enforces it the same way — so no
 * RBAC role can unlock this screen, and showing it to a staff-admin would only
 * produce a wall of 403s.
 */

const TABS = [
  { id: "staff", label: "Staff admins" },
  { id: "super", label: "Super admins" },
  { id: "roles", label: "Roles" },
];

const Governance = () => {
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const [tab, setTab] = useState("staff");
  const [creating, setCreating] = useState(null);
  const [actionError, setActionError] = useState(null);

  const staff = useGetStaffAdminsQuery(undefined, { skip: !isSuperAdmin });
  const supers = useGetSuperAdminsQuery(undefined, { skip: !isSuperAdmin });
  const { data: roles } = useGetRolesQuery(undefined, { skip: !isSuperAdmin });

  const [changeRole] = useChangeStaffAdminRoleMutation();
  const [deactivateStaff] = useDeactivateStaffAdminMutation();
  const [reactivateStaff] = useReactivateStaffAdminMutation();
  const [deactivateSuper] = useDeactivateSuperAdminMutation();

  if (!isSuperAdmin) {
    return (
      <DashboardCompLayout>
        <p className="text-text-muted text-sm">
          Administrator management is restricted to super-admins.
        </p>
        <p className="text-text-muted text-xs mt-1">
          Staff admins cannot create or modify each other.
        </p>
      </DashboardCompLayout>
    );
  }

  const act = async (fn) => {
    setActionError(null);
    try {
      await fn().unwrap();
    } catch (err) {
      setActionError(getUserMessage(err, "That action was rejected."));
    }
  };

  return (
    <DashboardCompLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-4 items-center">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`text-sm transition-colors cursor-pointer ${
                tab === item.id
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab !== "roles" && (
          <div className="w-44">
            <Btn
              title={tab === "staff" ? "New staff admin" : "New super admin"}
              variant="secondary"
              size="sm"
              onClick={() => setCreating(tab)}
            />
          </div>
        )}
      </div>

      {tab === "roles" && <RolePanel />}

      {tab === "staff" &&
        (staff.isLoading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : (
          <div className="flex flex-col gap-1">
            {(staff.data?.items ?? []).map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-4 py-2 px-3 rounded-md bg-surface/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">
                    {admin.fullName}
                    {!admin.isActive && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-danger">
                        deactivated
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {admin.email} · {admin.username}
                  </p>
                </div>

                <select
                  value={admin.role?.id ?? ""}
                  onChange={(event) =>
                    act(() =>
                      changeRole({ adminId: admin.id, roleId: event.target.value }),
                    )
                  }
                  title="Takes effect on their next login"
                  className="text-xs py-1 px-2 bg-bg rounded-md outline-none text-text-primary shrink-0"
                >
                  {(roles ?? []).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    act(() =>
                      admin.isActive
                        ? deactivateStaff(admin.id)
                        : reactivateStaff(admin.id),
                    )
                  }
                  className={`shrink-0 text-xs px-2 py-1 cursor-pointer ${
                    admin.isActive
                      ? "text-text-muted hover:text-danger"
                      : "text-text-muted hover:text-accent"
                  }`}
                >
                  {admin.isActive ? "deactivate" : "reactivate"}
                </button>
              </div>
            ))}
          </div>
        ))}

      {tab === "super" &&
        (supers.isLoading ? (
          <p className="text-text-muted text-sm">Loading…</p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              {(supers.data?.items ?? []).map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-4 py-2 px-3 rounded-md bg-surface/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary truncate">
                      {admin.fullName}
                      {!admin.isActive && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-danger">
                          deactivated
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      {admin.email} · {admin.username}
                    </p>
                  </div>

                  {admin.isActive && (
                    <button
                      type="button"
                      onClick={() => act(() => deactivateSuper(admin.id))}
                      className="shrink-0 text-xs text-text-muted hover:text-danger px-2 py-1 cursor-pointer"
                    >
                      deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-text-muted mt-4">
              A super-admin cannot deactivate themselves, and the last active
              one cannot be deactivated at all. Reactivation is deliberately not
              an API action — it is done through the bootstrap CLI so a
              compromised account cannot silently restore another.
            </p>
          </>
        ))}

      {actionError && (
        <p className="mt-4 text-warning text-xs font-semibold">{actionError}</p>
      )}

      {creating && (
        <ProtalLayout
          heading={creating === "staff" ? "New staff admin" : "New super admin"}
          onClose={() => setCreating(null)}
        >
          <AdminForm kind={creating} onClose={() => setCreating(null)} />
        </ProtalLayout>
      )}
    </DashboardCompLayout>
  );
};

export default Governance;
