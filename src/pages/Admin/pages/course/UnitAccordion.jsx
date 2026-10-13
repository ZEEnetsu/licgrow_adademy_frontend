import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Icon from "../../../../components/ui/Icon.jsx";
import { EXPO } from "../../../../components/motion/primitives.js";
import {
  Button,
  Card,
  EmptyState,
  Field,
  FormActions,
  FormError,
  IconButton,
  Input,
  StatusBadge,
  cx,
  fieldIssues,
  useConfirm,
  usePendingIds,
  useToast,
} from "../../../../components/admin";
import { plural } from "../../../../components/admin/format.js";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import { youTubeThumbnail, youTubeWatchUrl } from "../../../../app/utils/youtube.js";
import { useDeleteChapterMutation, useReorderChaptersMutation } from "../../../../app/apis/courses.api.js";
import ChapterEditor from "./ChapterEditor.jsx";

/**
 * One unit of the authoring tree — `api-contracts/08-course.md` §7–14.
 *
 * A card whose header toggles an animated body (height auto, 350ms EXPO; the
 * chevron turns with it). The header carries the unit's own actions — move
 * up/down, rename, delete — which the course page owns, because they touch
 * the course's unit list. The body lists the chapters (each with move, edit
 * and delete), an inline chapter editor, and the unit's quiz reference.
 *
 * Reordering sends the full new order (the contract's "simpler and
 * race-free" PUT) and is optimistic: the cache moves first (courses.api.js),
 * `motion.li layout` slides the rows, and a failed request puts them back.
 */

// a stable empty list, so callbacks keyed on `chapters` don't change every render
const NO_CHAPTERS = [];

const UnitAccordion = ({ courseId, unit, index, total, canEdit, pending = false, focusRef, onMove, onRename, onDelete }) => {
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const bodyId = useId();
  const chapterFocus = useRef(null);
  const upRef = useRef(null);
  const downRef = useRef(null);
  const settleFocus = useMoveFocus(focusRef, unit.id, index, upRef, downRef);
  const reduceMotion = useReducedMotion();

  const confirm = useConfirm();
  const toast = useToast();
  const { pendingIds, run } = usePendingIds();
  const [deleteChapter] = useDeleteChapterMutation();
  const [reorderChapters] = useReorderChaptersMutation();

  const chapters = unit.chapters ?? NO_CHAPTERS;

  const restoreChapters = useCallback(
    async (orderedChapterIds) => {
      try {
        await reorderChapters({ courseId, unitId: unit.id, orderedChapterIds }).unwrap();
        toast.info("Chapter order restored");
      } catch (error) {
        toast.error("Couldn't restore the chapter order", { description: getUserMessage(error, "Please try again.") });
      }
    },
    [courseId, unit.id, reorderChapters, toast],
  );

  const moveChapter = useCallback(
    async (chapter, delta) => {
      const ids = chapters.map((item) => item.id);
      const from = ids.indexOf(chapter.id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= ids.length) return;
      const next = [...ids];
      [next[from], next[to]] = [next[to], next[from]];

      const direction = delta < 0 ? "up" : "down";
      // keyboard focus follows the chapter to its new place (useMoveFocus)
      chapterFocus.current = { id: chapter.id, direction, index: to };
      try {
        await reorderChapters({ courseId, unitId: unit.id, orderedChapterIds: next }).unwrap();
        toast.success(`Moved “${chapter.title}” ${direction}`, {
          id: `reorder-chapters-${unit.id}`,
          description: `It's chapter ${to + 1} of ${ids.length} in ${unit.title}.`,
          action: { label: "Undo", onClick: () => restoreChapters(ids) },
        });
      } catch (error) {
        if (chapterFocus.current?.id === chapter.id) chapterFocus.current = null;
        toast.error(`Couldn't move “${chapter.title}”`, {
          description: getUserMessage(error, "The previous order is back. Please try again."),
        });
      }
    },
    [chapters, courseId, unit.id, unit.title, reorderChapters, restoreChapters, toast],
  );

  const removeChapter = useCallback(
    async (chapter) => {
      const done = await confirm({
        title: `Delete “${chapter.title}”?`,
        description: `It's removed from ${unit.title} for good, and the chapters after it move up. The YouTube video itself isn't affected.`,
        confirmLabel: "Delete chapter",
        tone: "danger",
        icon: "trash",
        onConfirm: () =>
          run(chapter.id, () => deleteChapter({ courseId, unitId: unit.id, chapterId: chapter.id }).unwrap()),
      });
      if (done) toast.success(`“${chapter.title}” is deleted`);
    },
    [confirm, courseId, deleteChapter, run, toast, unit.id, unit.title],
  );

  const toggle = () => setOpen((value) => !value);

  const startAdding = () => {
    setOpen(true);
    setEditingId(null);
    setAdding(true);
  };

  return (
    <motion.li
      layout="position"
      transition={{ duration: 0.35, ease: EXPO }}
      onLayoutAnimationComplete={settleFocus}
      aria-busy={pending || undefined}
    >
      <Card padding="none" className={cx("transition-opacity duration-200", pending && "opacity-60")}>
        {/* ── header ── */}
        {renaming ? (
          <div className="p-4 sm:p-5">
            <UnitTitleForm
              label={`Rename unit ${index + 1}`}
              initialTitle={unit.title}
              submitLabel="Save"
              submitIcon="check"
              onCancel={() => setRenaming(false)}
              onSubmit={async (title) => {
                if (title !== unit.title) await onRename(unit, title);
                setRenaming(false);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 p-2 sm:p-3">
            <div className="flex min-w-0 flex-1 basis-56 items-center gap-2 py-1 pl-1">
              {/* the disclosure control; its wrapper turns the chevron */}
              <span
                className={cx("inline-flex shrink-0 transition-transform duration-300 ease-out-expo", !open && "-rotate-90")}
              >
                <IconButton
                  icon="chevron"
                  label={`Chapters in ${unit.title}`}
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={toggle}
                />
              </span>
              {/* pointer convenience: the title toggles too (keyboard and AT use the button) */}
              <div onClick={toggle} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl py-1 pr-2">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tint-slate font-display text-[15px] font-extrabold text-text-primary tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[15px] font-bold tracking-tight text-text-primary">
                    <span className="sr-only">Unit {index + 1}: </span>
                    {unit.title}
                  </h3>
                  <span className="block truncate text-[13px] text-text-muted">
                    {plural(chapters.length, "chapter")}
                    {unit.quiz && (
                      <>
                        <span aria-hidden> · </span>quiz
                      </>
                    )}
                  </span>
                </span>
              </div>
            </div>

            {canEdit && (
              <div className="ml-auto flex shrink-0 items-center gap-0.5 pr-1">
                <IconButton
                  icon="arrowUp"
                  label="Move unit up"
                  size="sm"
                  ref={upRef}
                  disabled={index === 0 || pending}
                  onClick={() => onMove(unit, -1)}
                />
                <IconButton
                  icon="arrowDown"
                  label="Move unit down"
                  size="sm"
                  ref={downRef}
                  disabled={index === total - 1 || pending}
                  onClick={() => onMove(unit, 1)}
                />
                <IconButton icon="pencil" label="Rename unit" size="sm" disabled={pending} onClick={() => setRenaming(true)} />
                <IconButton
                  icon="trash"
                  label="Delete unit"
                  size="sm"
                  tone="danger"
                  loading={pending}
                  onClick={() => onDelete(unit)}
                />
              </div>
            )}
          </div>
        )}

        {/* ── body ── */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              id={bodyId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: EXPO }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 border-t border-border/70 px-2 pt-3 pb-4 sm:px-3">
                {chapters.length > 0 && (
                  <ul aria-label={`Chapters in ${unit.title}`} className="flex flex-col gap-1">
                    {chapters.map((chapter, chapterIndex) =>
                      editingId === chapter.id ? (
                        <motion.li key={chapter.id} layout="position" transition={{ duration: 0.35, ease: EXPO }}>
                          <ChapterEditor
                            courseId={courseId}
                            unitId={unit.id}
                            chapter={chapter}
                            onDone={() => setEditingId(null)}
                            onCancel={() => setEditingId(null)}
                          />
                        </motion.li>
                      ) : (
                        <ChapterRow
                          key={chapter.id}
                          chapter={chapter}
                          index={chapterIndex}
                          total={chapters.length}
                          canEdit={canEdit}
                          pending={pendingIds.has(chapter.id)}
                          focusRef={chapterFocus}
                          onMove={moveChapter}
                          onEdit={(item) => {
                            setAdding(false);
                            setEditingId(item.id);
                          }}
                          onDelete={removeChapter}
                        />
                      ),
                    )}
                  </ul>
                )}

                {adding ? (
                  <ChapterEditor
                    courseId={courseId}
                    unitId={unit.id}
                    onDone={() => setAdding(false)}
                    onCancel={() => setAdding(false)}
                  />
                ) : chapters.length === 0 ? (
                  <EmptyState
                    compact
                    icon="play"
                    title={canEdit ? "No chapters yet" : "No chapters"}
                    description={
                      canEdit
                        ? "Paste a YouTube link to add the first lesson. A course needs at least one chapter before it can be published."
                        : "This unit has no lessons yet."
                    }
                    action={
                      canEdit && (
                        <Button variant="secondary" size="sm" icon="plus" onClick={startAdding}>
                          Add chapter
                        </Button>
                      )
                    }
                    className="mx-1"
                  />
                ) : (
                  canEdit && (
                    <Button variant="ghost" size="sm" icon="plus" onClick={startAdding} className="self-start">
                      Add chapter
                    </Button>
                  )
                )}

                <QuizReference quiz={unit.quiz} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.li>
  );
};

export default UnitAccordion;

/* ── keyboard focus after a move ────────────────────────────────────────── */

/**
 * After a reorder, put keyboard focus back on the moved row's arrow — the
 * same direction, or the other one once the row reaches an end — so a
 * keyboard user can keep pressing to move it further.
 *
 * The parent writes `{ id, direction, index }` into `requestRef` when it
 * moves a row; the row with that id acts once it is AT that index (RTK's
 * auto-batching delays the store notification a frame, so the click handler
 * can't do this itself). Focus moves at once; with motion it is re-applied
 * when the layout slide ends, because a tooltip is placed when it opens and
 * would otherwise stay where the row used to be.
 *
 * Returns the callback for the row's `onLayoutAnimationComplete`.
 */
function useMoveFocus(requestRef, id, index, upRef, downRef) {
  const reduceMotion = useReducedMotion();

  const target = useCallback(
    (direction) => {
      const [preferred, other] = direction === "up" ? [upRef.current, downRef.current] : [downRef.current, upRef.current];
      const button = preferred && !preferred.disabled ? preferred : other;
      return button && !button.disabled ? button : null;
    },
    [upRef, downRef],
  );

  const settle = useCallback(() => {
    const request = requestRef?.current;
    if (!request || request.id !== id || request.index !== index) return;
    requestRef.current = null;
    const button = target(request.direction);
    if (!button) return;
    if (document.activeElement !== button) {
      button.focus({ preventScroll: true });
      return;
    }
    // already focused: its tooltip opened where the row used to be. Blur and
    // re-focus a frame later (in one tick the two would batch into "still
    // open"), so the tooltip re-opens at the button's new position.
    button.blur();
    requestAnimationFrame(() => button.focus({ preventScroll: true }));
  }, [requestRef, id, index, target]);

  useEffect(() => {
    const request = requestRef?.current;
    if (!request || request.id !== id || request.index !== index) return undefined;
    if (reduceMotion) {
      settle();
      return undefined;
    }
    target(request.direction)?.focus({ preventScroll: true });
    // settle() normally runs from onLayoutAnimationComplete; this is the
    // fallback should no layout animation run
    const timer = setTimeout(settle, 500);
    return () => clearTimeout(timer);
  }, [requestRef, id, index, reduceMotion, settle, target]);

  return settle;
}

/* ── chapter row ────────────────────────────────────────────────────────── */

function ChapterRow({ chapter, index, total, canEdit, pending, focusRef, onMove, onEdit, onDelete }) {
  const upRef = useRef(null);
  const downRef = useRef(null);
  const settleFocus = useMoveFocus(focusRef, chapter.id, index, upRef, downRef);

  return (
    <motion.li
      layout="position"
      transition={{ duration: 0.35, ease: EXPO }}
      onLayoutAnimationComplete={settleFocus}
      aria-busy={pending || undefined}
      className={cx(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl p-2 transition-[background-color,opacity] duration-200 hover:bg-surface-hover/60",
        pending && "opacity-60",
      )}
    >
      <div className="flex min-w-0 flex-1 basis-60 items-center gap-3">
        <ChapterThumb key={chapter.youtubeUrl} chapter={chapter} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{chapter.title}</p>
          <p className="truncate text-[13px] text-text-muted">
            <span className="tabular-nums">Chapter {index + 1}</span>
            {chapter.description && (
              <>
                <span aria-hidden> · </span>
                {chapter.description}
              </>
            )}
          </p>
        </div>
      </div>

      {canEdit && (
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <IconButton
            icon="arrowUp"
            label="Move chapter up"
            size="sm"
            ref={upRef}
            disabled={index === 0 || pending}
            onClick={() => onMove(chapter, -1)}
          />
          <IconButton
            icon="arrowDown"
            label="Move chapter down"
            size="sm"
            ref={downRef}
            disabled={index === total - 1 || pending}
            onClick={() => onMove(chapter, 1)}
          />
          <IconButton icon="pencil" label="Edit chapter" size="sm" disabled={pending} onClick={() => onEdit(chapter)} />
          <IconButton icon="trash" label="Delete chapter" size="sm" tone="danger" loading={pending} onClick={() => onDelete(chapter)} />
        </div>
      )}
    </motion.li>
  );
}

/**
 * The chapter's YouTube still, lazy-loaded, linking out to the video. Falls
 * back to a play glyph on sand when the link has no id or the still fails.
 * Keyed by the URL at the call site, so an edited link gets a fresh try.
 */
function ChapterThumb({ chapter }) {
  const [failed, setFailed] = useState(false);
  const src = youTubeThumbnail(chapter.youtubeUrl, "medium");
  const href = youTubeWatchUrl(chapter.youtubeUrl);
  const showImage = src && !failed;

  const inner = (
    <>
      {showImage ? (
        <img
          src={src}
          alt=""
          width={96}
          height={54}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon name="play" className="h-5 w-5" strokeWidth={2} />
      )}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border/60 ring-inset" aria-hidden />
    </>
  );

  const box =
    "relative grid h-[45px] w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-tint-slate text-text-muted sm:h-[54px] sm:w-24";

  if (!href) return <span className={box}>{inner}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Watch “${chapter.title}” on YouTube (opens in a new tab)`}
      className={cx("group/thumb focus-ring", box)}
    >
      {inner}
      {showImage && (
        <span
          className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100"
          aria-hidden
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-elevated text-text-primary shadow-pop">
            <Icon name="play" className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
        </span>
      )}
    </a>
  );
}

/* ── quiz reference ─────────────────────────────────────────────────────── */

/**
 * The unit's quiz is a REFERENCE only (08 §3) — id, title, counts. Question
 * content and answer keys live entirely in the test module, so this links
 * there.
 */
function QuizReference({ quiz }) {
  if (!quiz) {
    return (
      <p className="flex items-start gap-2 px-2 text-[13px] text-text-muted">
        <Icon name="listOrdered" className="mt-0.5 h-4 w-4 shrink-0" />
        No quiz linked. A unit quiz is a test of kind “quiz” linked to this unit from Tests.
      </p>
    );
  }

  return (
    <Link
      to={`/admin/manage-test/tests/${quiz.id}`}
      className="group/quiz focus-ring mx-1 flex items-center gap-3 rounded-2xl bg-surface-muted px-3 py-2.5 ring-1 ring-border/60 ring-inset transition-colors duration-200 hover:bg-surface-hover"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-muted text-accent">
        <Icon name="listOrdered" className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="caps block text-[10px] font-bold text-text-muted">Unit quiz</span>
        <span className="block truncate text-sm font-semibold text-text-primary transition-colors duration-200 group-hover/quiz:text-accent">
          {quiz.title}
        </span>
      </span>
      <span className="shrink-0 text-[13px] text-text-muted tabular-nums max-sm:hidden">
        {plural(quiz.questionCount ?? 0, "question")}
      </span>
      {quiz.status && <StatusBadge status={quiz.status} size="sm" />}
      <Icon
        name="arrowRight"
        className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 ease-out-expo group-hover/quiz:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  );
}

/* ── unit title form ────────────────────────────────────────────────────── */

/**
 * The inline form for a unit's title — renaming one here, adding one on the
 * course page. `onSubmit(title)` returns a promise; a rejection is shown
 * inline (per-field issue or form-level message), success is the caller's to
 * toast and close. Escape cancels.
 */
export function UnitTitleForm({ label = "Unit title", initialTitle = "", submitLabel, submitIcon = "plus", onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTitle);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const trimmed = title.trim();
  const issues = fieldIssues(error);
  const titleError = submitted && trimmed.length < 3 ? "Give the unit a title of at least 3 characters." : issues.title;
  const formError = error && !issues.title ? getUserMessage(error, "Couldn't save the unit. Please try again.") : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (trimmed.length < 3) {
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      onKeyDown={(event) => {
        if (event.key === "Escape" && !busy) {
          event.stopPropagation();
          onCancel();
        }
      }}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Field label={label} required error={titleError} className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={160}
            placeholder="e.g. Policy Types"
            autoComplete="off"
            autoFocus
          />
        </Field>
        <FormActions className="sm:pt-7">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="tonal" icon={submitIcon} loading={busy}>
            {submitLabel}
          </Button>
        </FormActions>
      </div>
      <FormError>{formError}</FormError>
    </form>
  );
}
