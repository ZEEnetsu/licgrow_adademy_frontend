import { useEffect } from "react";
import { Link, useMatches, useNavigate } from "react-router-dom";

import Icon from "../../../components/ui/Icon.jsx";
import NotificationBell from "../../../components/NotificationBell.jsx";
import { Avatar, DropdownMenu, IconButton, Kbd, ThemeToggle, cx } from "../../../components/admin";
import { modKeyLabel } from "../../../hooks/useHotkey.js";
import { useAuth } from "../../../app/features/auth/useAuth.js";
import { ACTOR } from "../../../app/features/auth/permissions.js";
import { ADMIN_NOTIFICATION_LINKS } from "./nav.js";

const ACTOR_LABEL = {
  [ACTOR.SUPER_ADMIN]: "Super admin",
  [ACTOR.STAFF_ADMIN]: "Staff admin",
  [ACTOR.LEARNER]: "Learner",
};

/**
 * The bar above the content: where you are (breadcrumbs), how to get
 * anywhere (⌘K), and who you are. It sits on the canvas with no fill of its
 * own and gains a hairline once the page scrolls under it.
 *
 * The page title is not here — each page's PageHeader owns the one <h1>.
 */
export default function AdminHeader({ onOpenDrawer, onOpenPalette, scrolled }) {
  return (
    <header
      className={cx(
        "relative z-30 shrink-0 transition-shadow duration-300",
        scrolled && "shadow-[0_1px_0_var(--border)]",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 px-1 sm:px-3 md:h-16 lg:px-6">
        <IconButton icon="menu" label="Open menu" onClick={onOpenDrawer} className="md:hidden" tooltip={false} />
        <Breadcrumbs />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="group/palette focus-ring hidden h-10 w-64 cursor-pointer items-center gap-2.5 rounded-full bg-surface-elevated pr-2 pl-3.5 text-sm text-text-muted shadow-[0_1px_2px_rgb(21_13_61/0.05)] ring-1 ring-inset ring-border transition-[box-shadow,color] duration-200 hover:text-text-primary hover:ring-border-strong/60 lg:flex"
          >
            <Icon name="search" className="h-4 w-4" strokeWidth={2} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <Kbd>{modKeyLabel()} K</Kbd>
          </button>
          <IconButton icon="search" label="Search or jump to" onClick={onOpenPalette} className="lg:hidden" tooltip={false} />
          <ThemeToggle variant="icon" className="md:hidden" />
          <NotificationBell links={ADMIN_NOTIFICATION_LINKS} />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}

/** Built from the matched routes' `handle.crumb`; also sets document.title. */
function Breadcrumbs() {
  const matches = useMatches();
  const crumbs = matches.filter((match) => match.handle?.crumb);
  const title = [...crumbs].reverse().find((match) => typeof match.handle.crumb === "string")?.handle.crumb;

  useEffect(() => {
    document.title = title && title !== "Admin" ? `${title} · LICPro Admin` : "LICPro Admin";
  }, [title]);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {crumbs.map((match, i) => {
          const last = i === crumbs.length - 1;
          const label = typeof match.handle.crumb === "function" ? match.handle.crumb(match) : match.handle.crumb;
          return (
            <li key={match.id} className={cx("flex min-w-0 items-center gap-1.5", !last && "max-sm:hidden", i === 0 && "max-md:hidden")}>
              {i > 0 && (
                <Icon
                  name="chevronRight"
                  className={cx("h-3.5 w-3.5 shrink-0 text-text-muted/70", i === 1 && "max-md:hidden", last && "max-sm:hidden")}
                  strokeWidth={2}
                />
              )}
              {last ? (
                <span aria-current="page" className="truncate font-semibold text-text-primary">
                  {label}
                </span>
              ) : (
                <Link
                  to={match.pathname}
                  className="focus-ring truncate rounded font-medium text-text-muted transition-colors duration-200 hover:text-text-primary"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function AccountMenu() {
  const navigate = useNavigate();
  const { actor, actorType, role, logout } = useAuth();
  const name = actor?.fullName ?? "Admin";
  const firstName = name.split(/\s+/)[0];

  return (
    <DropdownMenu
      label="Account"
      header={
        <div className="mb-1.5 flex items-center gap-3 border-b border-border px-3 pt-2 pb-3">
          <Avatar name={name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
            {actor?.email && <p className="truncate text-xs text-text-muted">{actor.email}</p>}
            <p className="caps mt-1 truncate text-[10px] font-bold text-accent">
              {ACTOR_LABEL[actorType] ?? actorType}
              {role ? ` · ${typeof role === "string" ? role : role.name ?? ""}` : ""}
            </p>
          </div>
        </div>
      }
      items={[
        { id: "site", label: "Open the public site", icon: "externalLink", onSelect: () => navigate("/") },
        { id: "logout", label: "Sign out", icon: "logOut", tone: "danger", separatorBefore: true, onSelect: logout },
      ]}
      trigger={(props, open) => (
        <button
          type="button"
          aria-label={`Account menu for ${name}`}
          {...props}
          className={cx(
            "focus-ring flex cursor-pointer items-center gap-2 rounded-full p-0.5 transition-colors duration-200 hover:bg-surface-hover sm:pr-2.5",
            open && "bg-surface-hover",
          )}
        >
          <Avatar name={name} size="sm" />
          <span className="hidden max-w-[8rem] truncate text-[13px] font-semibold text-text-primary sm:block">{firstName}</span>
          <Icon
            name="chevron"
            className={cx("hidden h-3.5 w-3.5 text-text-muted transition-transform duration-300 ease-out-expo sm:block", open && "rotate-180")}
            strokeWidth={2.25}
          />
        </button>
      )}
    />
  );
}
