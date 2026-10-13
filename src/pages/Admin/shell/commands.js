import { PERMISSIONS } from "../../../app/features/auth/permissions.js";
import { visibleSections } from "./nav.js";

/**
 * Everything the command palette can do, filtered to what this admin may do.
 * Pure: the palette hands in `navigate`, the theme setter and the predicates.
 */
export function buildCommands({ can, isSuperAdmin, navigate, mode, setMode, logout }) {
  const go = (to) => () => navigate(to);

  const pages = visibleSections(can, isSuperAdmin).flatMap((section) =>
    section.items.map((item) => ({
      id: `go-${item.id}`,
      group: "Go to",
      label: item.label,
      hint: section.label,
      icon: item.icon,
      keywords: item.keywords,
      run: go(item.to),
    })),
  );

  const create = [
    { id: "new-batch", label: "New batch", icon: "layers", to: "/admin/manage-batch?new=1", perm: PERMISSIONS.BATCH_MANAGE, keywords: "create cohort" },
    { id: "new-course", label: "New course", icon: "book", to: "/admin/manage-course?new=1", perm: PERMISSIONS.COURSE_AUTHOR, keywords: "create" },
    { id: "new-test", label: "Draft a test", icon: "clipboardCheck", to: "/admin/manage-test?new=1", perm: PERMISSIONS.TEST_AUTHOR, keywords: "create quiz new" },
    { id: "new-announcement", label: "New announcement", icon: "megaphone", to: "/admin/announcements?new=1", perm: PERMISSIONS.ANNOUNCEMENT_MANAGE, keywords: "create post notice" },
    { id: "new-admin", label: "Add an administrator", icon: "userPlus", to: "/admin/administrators?new=1", superOnly: true, keywords: "create staff invite" },
    { id: "review", label: "Review pending enrollments", icon: "userCheck", to: "/admin/enrollments", perm: PERMISSIONS.ENROLLMENT_REVIEW, keywords: "approve requests queue" },
  ]
    .filter((command) => (command.superOnly ? isSuperAdmin : can(command.perm)))
    .map(({ to, perm: _perm, superOnly: _superOnly, ...command }) => ({ ...command, group: "Actions", run: go(to) }));

  const next = mode === "dark" ? "light" : "dark";
  const preferences = [
    {
      id: "theme",
      group: "Preferences",
      label: `Switch to ${next} theme`,
      icon: next === "dark" ? "moon" : "sun",
      keywords: "dark light mode appearance colour color",
      run: () => setMode(next),
    },
    { id: "site", group: "Preferences", label: "Open the public site", icon: "externalLink", keywords: "landing home website", run: go("/") },
    { id: "logout", group: "Preferences", label: "Sign out", icon: "logOut", keywords: "log out exit", run: logout },
  ];

  return [...pages, ...create, ...preferences];
}

/**
 * Ranks commands against a query: a label that starts with it beats a word
 * that starts with it, which beats a substring, which beats a keyword match.
 * An empty query keeps the original order.
 */
export function rankCommands(commands, query) {
  const q = query.trim().toLowerCase();
  if (!q) return commands;

  return commands
    .map((command, index) => {
      const label = command.label.toLowerCase();
      let score = 0;
      if (label.startsWith(q)) score = 4;
      else if (label.split(/\s+/).some((word) => word.startsWith(q))) score = 3;
      else if (label.includes(q)) score = 2;
      else if ((command.keywords ?? "").toLowerCase().includes(q) || (command.hint ?? "").toLowerCase().includes(q)) score = 1;
      return { command, score, index };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.command);
}
