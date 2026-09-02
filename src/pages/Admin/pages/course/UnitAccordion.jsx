import { useState } from "react";
import { NavLink } from "react-router-dom";

import Can from "../../../../components/auth/Can.jsx";
import ChapterEditor from "./ChapterEditor.jsx";
import { PERMISSIONS } from "../../../../app/features/auth/permissions.js";
import { youTubeThumbnail, youTubeWatchUrl } from "../../../../app/utils/youtube.js";
import {
  useDeleteChapterMutation,
  useDeleteUnitMutation,
  useReorderChaptersMutation,
  useUpdateUnitMutation,
} from "../../../../app/apis/courses.api.js";

/**
 * One unit in the authoring tree — `api-contracts/08-course.md` §7–14.
 *
 * Reordering uses the full-array PUT endpoints rather than per-item moves;
 * the contract calls this out as "simpler and race-free", so the ↑/↓ buttons
 * send the whole new order.
 */

const IconButton = ({ label, children, danger, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`h-6 w-6 rounded text-xs text-text-muted hover:bg-surface-elevated-hover disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer ${
      danger ? "hover:text-danger" : "hover:text-text-primary"
    }`}
    {...props}
  >
    {children}
  </button>
);

const ChapterRow = ({ courseId, unitId, chapter, index, total, onEdit, onMove, busy }) => {
  const [deleteChapter, { isLoading: deleting }] = useDeleteChapterMutation();

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-surface-elevated group">
      <span className="text-[11px] text-text-muted font-mono w-5 shrink-0">
        {index + 1}
      </span>

      <a
        href={youTubeWatchUrl(chapter.youtubeUrl) ?? "#"}
        target="_blank"
        rel="noreferrer"
        className="shrink-0"
        title="Open on YouTube"
      >
        <img
          src={youTubeThumbnail(chapter.youtubeUrl, "default")}
          alt=""
          className="h-9 w-16 object-cover rounded border border-border"
        />
      </a>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-primary truncate">{chapter.title}</p>
        {chapter.description && (
          <p className="text-[11px] text-text-muted truncate">
            {chapter.description}
          </p>
        )}
      </div>

      <Can perm={PERMISSIONS.COURSE_AUTHOR}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <IconButton label="Move up" disabled={index === 0 || busy} onClick={() => onMove(index, -1)}>
            ↑
          </IconButton>
          <IconButton
            label="Move down"
            disabled={index === total - 1 || busy}
            onClick={() => onMove(index, 1)}
          >
            ↓
          </IconButton>
          <IconButton label="Edit chapter" onClick={onEdit} disabled={busy}>
            ✎
          </IconButton>
          <IconButton
            label="Delete chapter"
            danger
            disabled={busy || deleting}
            onClick={() => deleteChapter({ courseId, unitId, chapterId: chapter.id })}
          >
            ✕
          </IconButton>
        </div>
      </Can>
    </div>
  );
};

const UnitAccordion = ({ courseId, unit, index, total, onMove, busy }) => {
  const [open, setOpen] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(unit.title);
  const [addingChapter, setAddingChapter] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);

  const [updateUnit, { isLoading: renamingUnit }] = useUpdateUnitMutation();
  const [deleteUnit, { isLoading: deletingUnit }] = useDeleteUnitMutation();
  const [reorderChapters, { isLoading: reorderingChapters }] =
    useReorderChaptersMutation();

  const chapters = unit.chapters ?? [];
  const chapterBusy = busy || reorderingChapters;

  const saveTitle = async () => {
    if (title.trim().length >= 3 && title !== unit.title) {
      await updateUnit({ courseId, unitId: unit.id, title: title.trim() });
    }
    setRenaming(false);
  };

  const moveChapter = async (from, direction) => {
    const next = [...chapters];
    const to = from + direction;
    if (to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to], next[from]];

    await reorderChapters({
      courseId,
      unitId: unit.id,
      orderedChapterIds: next.map((chapter) => chapter.id),
    });
  };

  return (
    <div className="rounded-lg border border-border-muted bg-surface/40">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
        >
          <span className="text-text-muted text-xs w-3">{open ? "▾" : "▸"}</span>
          <span className="text-[10px] uppercase tracking-wide text-text-muted shrink-0">
            Unit {index + 1}
          </span>
          {!renaming && (
            <span className="text-sm font-medium text-text-primary truncate">
              {unit.title}
            </span>
          )}
        </button>

        {renaming && (
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={saveTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") saveTitle();
              if (event.key === "Escape") {
                setTitle(unit.title);
                setRenaming(false);
              }
            }}
            disabled={renamingUnit}
            className="flex-1 text-sm py-1 px-2 bg-bg border border-border rounded outline-none text-text-primary"
          />
        )}

        <span className="text-[11px] text-text-muted shrink-0">
          {chapters.length} chapter{chapters.length === 1 ? "" : "s"}
        </span>

        <Can perm={PERMISSIONS.COURSE_AUTHOR}>
          <div className="flex items-center gap-1 shrink-0">
            <IconButton label="Move unit up" disabled={index === 0 || busy} onClick={() => onMove(index, -1)}>
              ↑
            </IconButton>
            <IconButton
              label="Move unit down"
              disabled={index === total - 1 || busy}
              onClick={() => onMove(index, 1)}
            >
              ↓
            </IconButton>
            <IconButton label="Rename unit" onClick={() => setRenaming(true)}>
              ✎
            </IconButton>
            <IconButton
              label="Delete unit"
              danger
              disabled={deletingUnit}
              onClick={() => deleteUnit({ courseId, unitId: unit.id })}
            >
              ✕
            </IconButton>
          </div>
        </Can>
      </div>

      {open && (
        <div className="px-3 pb-3 flex flex-col gap-1">
          {chapters.length === 0 && !addingChapter && (
            <p className="text-[11px] text-text-muted px-3 py-2">
              No chapters. A course needs at least one before it can be
              published.
            </p>
          )}

          {chapters.map((chapter, chapterIndex) =>
            editingChapterId === chapter.id ? (
              <ChapterEditor
                key={chapter.id}
                courseId={courseId}
                unitId={unit.id}
                chapter={chapter}
                onDone={() => setEditingChapterId(null)}
                onCancel={() => setEditingChapterId(null)}
              />
            ) : (
              <ChapterRow
                key={chapter.id}
                courseId={courseId}
                unitId={unit.id}
                chapter={chapter}
                index={chapterIndex}
                total={chapters.length}
                busy={chapterBusy}
                onEdit={() => setEditingChapterId(chapter.id)}
                onMove={moveChapter}
              />
            ),
          )}

          {addingChapter ? (
            <ChapterEditor
              courseId={courseId}
              unitId={unit.id}
              onDone={() => setAddingChapter(false)}
              onCancel={() => setAddingChapter(false)}
            />
          ) : (
            <Can perm={PERMISSIONS.COURSE_AUTHOR}>
              <button
                type="button"
                onClick={() => setAddingChapter(true)}
                className="self-start text-xs text-text-muted hover:text-text-primary px-3 py-1 cursor-pointer"
              >
                + add chapter
              </button>
            </Can>
          )}

          {/*
            The unit's quiz is a REFERENCE only (08 §3) — id, title, counts.
            Question content and answer keys live entirely in the test module.
          */}
          {unit.quiz ? (
            <NavLink
              to={`/admin/manage-test/tests/${unit.quiz.id}`}
              className="mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-surface-elevated hover:bg-surface-elevated transition-colors"
            >
              <span className="text-accent">Quiz</span>
              <span className="text-text-primary truncate">{unit.quiz.title}</span>
              <span className="text-text-muted">
                · {unit.quiz.questionCount} question
                {unit.quiz.questionCount === 1 ? "" : "s"} · {unit.quiz.status}
              </span>
              <span className="ml-auto text-text-muted">→</span>
            </NavLink>
          ) : (
            <p className="mt-2 text-[11px] text-text-muted px-3">
              No quiz. Create one in the test module with kind “quiz” and this
              unit&apos;s id.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UnitAccordion;
