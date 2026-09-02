/**
 * Notification emission — `api-contracts/12-notification.md`.
 *
 * Notifications are SYSTEM-GENERATED; there is no create endpoint. This module
 * is the emitter the domain handlers call.
 *
 * THE CONTRACT'S KEY GUARANTEE: "Delivery is best-effort and never blocks the
 * triggering action (the notification service swallows and logs its own
 * failures). Treat missing notifications as non-fatal."
 *
 * So every function here is wrapped: a failure to notify must never turn a
 * successful enrollment approval into a failed request. That is enforced by
 * `safely()` below, and asserted in the test suite.
 *
 * TEMPORARY DEV SCAFFOLDING. See src/mocks/README.md.
 */

import { db, nextId } from "./db.js";

export const NOTIFICATION_TYPE = Object.freeze({
  ENROLLMENT_REQUESTED: "ENROLLMENT_REQUESTED",
  ENROLLMENT_APPROVED: "ENROLLMENT_APPROVED",
  ENROLLMENT_REJECTED: "ENROLLMENT_REJECTED",
  ANNOUNCEMENT_POSTED: "ANNOUNCEMENT_POSTED",
  TEST_PUBLISHED: "TEST_PUBLISHED",
  COURSE_PUBLISHED: "COURSE_PUBLISHED",
});

/**
 * Run an emission, absorbing anything it throws.
 *
 * The contract requires this. Without it, a bug in notification fan-out would
 * surface to the learner as "approval failed" — the worst possible failure
 * mode for a best-effort side channel.
 */
function safely(label, fn) {
  try {
    fn();
  } catch (error) {
    // the real service logs; the mock warns and carries on
    console.warn(`[mock] notification emission failed (${label})`, error);
  }
}

function push({ recipientId, type, title, body, relatedEntityType, relatedEntityId }) {
  db.notifications.push({
    id: nextId("ntf"),
    recipientId,
    type,
    title,
    body,
    relatedEntityType: relatedEntityType ?? null,
    relatedEntityId: relatedEntityId ?? null,
    isRead: false,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

/** Staff-admins who can act on an enrollment — the ones worth telling. */
function reviewers() {
  return db.accounts.filter((account) => {
    if (account.type !== "staff_admin" || account.status !== "active") return false;
    const permissions = db.permissionsFor(account);
    return permissions.includes("enrollment:review");
  });
}

const activeMemberIds = (batchId) =>
  db.batchMembers
    .filter((m) => m.batchId === batchId && m.isActive)
    .map((m) => m.learnerId);

// ── emitters, one per catalog entry ────────────────────────────────────────

export function notifyEnrollmentRequested(enrollment) {
  safely("ENROLLMENT_REQUESTED", () => {
    const learner = db.findAccountById(enrollment.learnerId);
    const batch = db.findBatch(enrollment.batchId);

    for (const admin of reviewers()) {
      push({
        recipientId: admin.id,
        type: NOTIFICATION_TYPE.ENROLLMENT_REQUESTED,
        title: "New enrollment request",
        body: `${learner?.fullName ?? "A learner"} requested to join ${batch?.name ?? "a batch"}.`,
        relatedEntityType: "enrollment",
        relatedEntityId: enrollment.id,
      });
    }
  });
}

export function notifyEnrollmentDecided(enrollment, approved) {
  safely("ENROLLMENT_DECIDED", () => {
    const batch = db.findBatch(enrollment.batchId);

    push({
      recipientId: enrollment.learnerId,
      type: approved
        ? NOTIFICATION_TYPE.ENROLLMENT_APPROVED
        : NOTIFICATION_TYPE.ENROLLMENT_REJECTED,
      title: approved ? "You're in!" : "Enrollment not approved",
      body: approved
        ? `Your enrollment for ${batch?.name ?? "the batch"} was approved.`
        : `Your enrollment for ${batch?.name ?? "the batch"} was not approved.`,
      // deep-link target: the batch on approval, the request on rejection
      relatedEntityType: approved ? "batch" : "enrollment",
      relatedEntityId: approved ? enrollment.batchId : enrollment.id,
    });
  });
}

/** Batch scope reaches that batch's members; global reaches every learner. */
export function notifyAnnouncementPosted(announcement) {
  safely("ANNOUNCEMENT_POSTED", () => {
    const recipients =
      announcement.scope === "global"
        ? db.accounts
            .filter((a) => a.type === "learner" && a.status === "active")
            .map((a) => a.id)
        : activeMemberIds(announcement.batchId);

    for (const recipientId of recipients) {
      push({
        recipientId,
        type: NOTIFICATION_TYPE.ANNOUNCEMENT_POSTED,
        title: announcement.title,
        body: announcement.body.slice(0, 200),
        relatedEntityType: "announcement",
        relatedEntityId: announcement.id,
      });
    }
  });
}

export function notifyContentPublished({ batchId, kind, contentId, title }) {
  safely("CONTENT_PUBLISHED", () => {
    const batch = db.findBatch(batchId);

    for (const recipientId of activeMemberIds(batchId)) {
      push({
        recipientId,
        type:
          kind === "course"
            ? NOTIFICATION_TYPE.COURSE_PUBLISHED
            : NOTIFICATION_TYPE.TEST_PUBLISHED,
        title: kind === "course" ? "New course available" : "New test available",
        body: `"${title}" was added to ${batch?.name ?? "your batch"}.`,
        relatedEntityType: kind,
        relatedEntityId: contentId,
      });
    }
  });
}

export function __resetNotifications() {
  db.notifications = [];
}
