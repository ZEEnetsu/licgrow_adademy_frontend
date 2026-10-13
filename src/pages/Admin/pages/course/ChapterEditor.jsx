import { useRef, useState } from "react";

import Icon from "../../../../components/ui/Icon.jsx";
import {
  Button,
  Field,
  FormActions,
  FormError,
  Input,
  Textarea,
  fieldIssues,
  useToast,
} from "../../../../components/admin";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import { parseYouTubeId, youTubeThumbnail } from "../../../../app/utils/youtube.js";
import { useAddChapterMutation, useUpdateChapterMutation } from "../../../../app/apis/courses.api.js";

/**
 * Add or edit a chapter, inline in its unit — `api-contracts/08-course.md`
 * §11 / §12.
 *
 * `youtubeUrl` is required and validated at the server edge (400
 * VALIDATION_ERROR on a bad link), so the same rule runs here. The preview
 * shows the video's still the moment the link resolves to an id, which
 * doubles as confirmation the right video was pasted.
 *
 * Layout: fields and preview side by side from `sm`, stacked below it, so it
 * fits a 360px screen. Escape cancels.
 */

const TITLE_MIN = 3;

const ChapterEditor = ({ courseId, unitId, chapter, onDone, onCancel }) => {
  const isEdit = Boolean(chapter);
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    title: chapter?.title ?? "",
    youtubeUrl: chapter?.youtubeUrl ?? "",
    description: chapter?.description ?? "",
  }));
  const [submitted, setSubmitted] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const titleRef = useRef(null);
  const urlRef = useRef(null);

  const [addChapter, addState] = useAddChapterMutation();
  const [updateChapter, updateState] = useUpdateChapterMutation();
  const { isLoading, error } = isEdit ? updateState : addState;

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const title = form.title.trim();
  const url = form.youtubeUrl.trim();
  const videoId = parseYouTubeId(url);
  const issues = fieldIssues(error);

  const titleError = submitted && title.length < TITLE_MIN ? "Give the chapter a title of at least 3 characters." : issues.title;
  const urlError =
    submitted && !url
      ? "Paste the chapter's YouTube link."
      : url && !videoId && (submitted || urlTouched)
        ? "That isn't a YouTube link. Paste a watch, youtu.be, shorts or embed link, or the 11-character video id."
        : issues.youtubeUrl;
  const formError =
    error && !Object.keys(issues).length
      ? getUserMessage(error, "Couldn't save the chapter. Please try again.")
      : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (title.length < TITLE_MIN) {
      titleRef.current?.focus();
      return;
    }
    if (!videoId) {
      urlRef.current?.focus();
      return;
    }

    const description = form.description.trim();
    try {
      if (isEdit) {
        await updateChapter({
          courseId,
          unitId,
          chapterId: chapter.id,
          title,
          youtubeUrl: url,
          // null clears a description that was there; "" would store an empty one
          description: description || null,
        }).unwrap();
        toast.success(`“${title}” is saved`);
      } else {
        const payload = { courseId, unitId, title, youtubeUrl: url };
        if (description) payload.description = description;
        await addChapter(payload).unwrap();
        toast.success(`Added “${title}”`, { description: "It's at the end of the unit." });
      }
      onDone?.();
    } catch {
      // shown inline: per-field issues and the form-level message
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={isEdit ? `Edit chapter “${chapter.title}”` : "New chapter"}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !isLoading) {
          event.stopPropagation();
          onCancel?.();
        }
      }}
      className="mx-1 rounded-2xl bg-surface-muted p-4 ring-1 ring-border/60 ring-inset sm:p-5"
    >
      <p className="caps text-[11px] font-bold text-text-muted">{isEdit ? "Edit chapter" : "New chapter"}</p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_13rem] lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Field label="Title" required error={titleError}>
            <Input
              ref={titleRef}
              value={form.title}
              onChange={set("title")}
              maxLength={160}
              placeholder="What is Life Insurance"
              autoComplete="off"
              autoFocus
            />
          </Field>

          <Field
            label="YouTube link"
            required
            hint="A youtube.com or youtu.be link, or the 11-character video id."
            error={urlError}
          >
            <Input
              ref={urlRef}
              type="url"
              inputMode="url"
              value={form.youtubeUrl}
              onChange={set("youtubeUrl")}
              onBlur={() => setUrlTouched(true)}
              placeholder="https://youtu.be/…"
              autoComplete="off"
              spellCheck={false}
            />
          </Field>

          <Field label="Description" optional error={issues.description}>
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
              maxLength={2000}
              placeholder="One line on what this lesson covers"
            />
          </Field>
        </div>

        <VideoPreview videoId={videoId} />
      </div>

      <FormError className="mt-4">{formError}</FormError>

      <FormActions className="mt-5">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="tonal" icon={isEdit ? "check" : "plus"} loading={isLoading}>
          {isEdit ? "Save chapter" : "Add chapter"}
        </Button>
      </FormActions>
    </form>
  );
};

export default ChapterEditor;

/** The video's still, or a play glyph on sand until the link resolves. */
function VideoPreview({ videoId }) {
  // remembers WHICH id failed, so pasting a different link tries again
  const [failedId, setFailedId] = useState(null);
  const src = videoId ? youTubeThumbnail(videoId, "medium") : null;
  const showImage = src && failedId !== videoId;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-sm font-semibold text-text-primary" aria-hidden>
        Preview
      </p>
      <div className="relative aspect-video w-full max-w-[20rem] overflow-hidden rounded-2xl bg-tint-slate text-text-muted sm:max-w-none">
        {showImage ? (
          <img
            src={src}
            alt="Thumbnail of the linked video"
            width={320}
            height={180}
            decoding="async"
            onError={() => setFailedId(videoId)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-elevated text-text-primary shadow-elevate">
              <Icon name="play" className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="text-xs">{videoId ? "No preview for this video" : "Paste a link to preview"}</span>
          </div>
        )}
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-border/60 ring-inset" aria-hidden />
      </div>
      {videoId && (
        <p className="text-xs text-text-muted">
          Video id <span className="font-mono text-text-primary">{videoId}</span>
        </p>
      )}
    </div>
  );
}
