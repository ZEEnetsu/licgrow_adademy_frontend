/**
 * Minimal path router for the mock handlers.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

/** `/admin/tests/:testId/questions/:questionId` → regex + param names. */
function compile(pattern) {
  const names = [];
  const source = pattern
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) {
        return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      names.push(segment.slice(1));
      return "([^/]+)";
    })
    .join("/");

  return { regex: new RegExp(`^${source}$`), names };
}

export function createRouter(routes) {
  const compiled = routes.map((route) => ({
    ...route,
    ...compile(route.path),
  }));

  /**
   * @param {string} method
   * @param {string} pathname already stripped of the `/api/v1` prefix
   * @returns {{ handler: Function, params: object } | null}
   */
  return function match(method, pathname) {
    for (const route of compiled) {
      if (route.method !== method) continue;

      const found = route.regex.exec(pathname);
      if (!found) continue;

      const params = {};
      route.names.forEach((name, index) => {
        params[name] = decodeURIComponent(found[index + 1]);
      });

      return { handler: route.handler, params };
    }
    return null;
  };
}
