import { useSelector } from "react-redux";

import { selectCan } from "../../app/features/auth/auth.selectors.js";

/**
 * Inline permission gate — for hiding buttons, menu entries, table actions.
 *
 * NOT A SECURITY BOUNDARY. Conventions §10: "the frontend hiding a button is
 * never the only guard." A user who un-hides this in DevTools still gets a 403
 * from the server. Use it to keep the UI honest, not to keep data safe.
 *
 * @example
 * <Can perm={PERMISSIONS.TEST_AUTHOR}>
 *   <Btn title="Draft test" onClick={openDraft} />
 * </Can>
 *
 * <Can perm={[PERMISSIONS.BATCH_MANAGE, PERMISSIONS.COURSE_AUTHOR]} mode="any">
 *   <PublishControls />
 * </Can>
 *
 * // render-prop form, when you want to disable rather than hide
 * <Can perm={PERMISSIONS.LEARNER_SUSPEND}>
 *   {(allowed) => <Btn title="Suspend" disabled={!allowed} />}
 * </Can>
 */
const Can = ({ perm, mode = "all", fallback = null, children }) => {
  const can = useSelector(selectCan);
  const allowed = can(perm, { mode });

  if (typeof children === "function") return children(allowed);

  return allowed ? children : fallback;
};

export default Can;
