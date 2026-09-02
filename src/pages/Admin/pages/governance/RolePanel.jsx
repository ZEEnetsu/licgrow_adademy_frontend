import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  useGetPermissionCatalogQuery,
  useGetRolesQuery,
} from "../../../../app/apis/rbac.api.js";

/**
 * Roles and the permission catalog — `api-contracts/05-rbac.md`.
 *
 * The RBAC data layer has been finished since Phase 0; this is the first
 * screen to actually read it.
 *
 * Read-only by design for now. §5 allows replacing a custom role's
 * permissions, but the seeded roles are immutable (422 SYSTEM_ROLE_IMMUTABLE)
 * and there are no custom roles yet, so an editor would have nothing to act on.
 */
const RolePanel = () => {
  const roles = useGetRolesQuery();
  const catalog = useGetPermissionCatalogQuery();

  if (roles.isLoading || catalog.isLoading) {
    return <p className="text-text-muted text-sm">Loading roles…</p>;
  }

  if (roles.isError) {
    return (
      <p className="text-danger text-sm">
        Couldn&apos;t load roles — {getUserMessage(roles.error)}
      </p>
    );
  }

  const permissions = catalog.data ?? [];
  const describe = (name) =>
    permissions.find((p) => p.name === name)?.description ?? "";

  return (
    <div className="flex flex-col gap-4">
      {(roles.data ?? []).map((role) => (
        <div
          key={role.id}
          className="rounded-lg border border-border-muted bg-surface/40 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {role.name}
                {role.isSystem && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-text-muted">
                    built-in
                  </span>
                )}
              </p>
              {role.description && (
                <p className="text-[11px] text-text-muted mt-0.5">
                  {role.description}
                </p>
              )}
            </div>
            <span className="text-xs text-text-muted shrink-0">
              {role.permissions.length} permissions
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {role.permissions.map((permission) => (
              <span
                key={permission}
                title={describe(permission)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-text-muted"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-text-muted">
        Built-in roles cannot be edited. A permission change takes effect on the
        affected admin&apos;s next login, because permissions are embedded in
        the access token when it is issued.
      </p>
    </div>
  );
};

export default RolePanel;
