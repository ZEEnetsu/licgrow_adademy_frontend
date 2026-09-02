import { useState } from "react";

import Btn from "../../components/Btn.jsx";
import { getUserMessage } from "../../../../app/apis/apiError.js";
import {
  isValidYouTubeUrl,
  parseYouTubeId,
  youTubeThumbnail,
} from "../../../../app/utils/youtube.js";
import {
  useAddChapterMutation,
  useUpdateChapterMutation,
} from "../../../../app/apis/courses.api.js";

/**
 * Add or edit a chapter — `api-contracts/08-course.md` §11 / §12.
 *
 * `youtubeUrl` is required and validated at the server edge (400
 * VALIDATION_ERROR on a bad link), so the same rule runs here: a live
 * thumbnail preview appears the moment the URL resolves to a video id, which
 * doubles as confirmation the author pasted the right video.
 */
const ChapterEditor = ({ courseId, unitId, chapter, onDone, onCancel }) => {
  const isEdit = Boolean(chapter);
  const [form, setForm] = useState(() => ({
    title: chapter?.title ?? "",
    youtubeUrl: chapter?.youtubeUrl ?? "",
    description: chapter?.description ?? "",
  }));
  const [submitted, setSubmitted] = useState(false);

  const [addChapter, addState] = useAddChapterMutation();
  const [updateChapter, updateState] = useUpdateChapterMutation();
  const { isLoading, error } = isEdit ? updateState : addState;

  const handleChange = (event) =>
    setForm((prev) => ({ ...prev, [event.target.id]: event.target.value }));

  const videoId = parseYouTubeId(form.youtubeUrl);
  const urlLooksWrong = form.youtubeUrl.trim() !== "" && !videoId;
  const titleTooShort = form.title.trim().length < 3;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (titleTooShort || !isValidYouTubeUrl(form.youtubeUrl)) return;

    const payload = {
      title: form.title.trim(),
      youtubeUrl: form.youtubeUrl.trim(),
    };
    // send null rather than "" so the field is genuinely cleared
    payload.description = form.description.trim() || null;

    try {
      if (isEdit) {
        await updateChapter({
          courseId,
          unitId,
          chapterId: chapter.id,
          ...payload,
        }).unwrap();
      } else {
        await addChapter({ courseId, unitId, ...payload }).unwrap();
      }
      onDone?.();
    } catch {
      // surfaced below
    }
  };

  const issues = Object.fromEntries(
    (error?.details ?? []).map((detail) => [detail.field, detail.issue]),
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-lg p-4 bg-bg"
    >
      <p className="text-sm font-semibold text-text-primary mb-3">
        {isEdit ? "Edit chapter" : "New chapter"}
      </p>

      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-3">
          <div>
            <label htmlFor="title" className="text-xs text-text-muted">
              Title
            </label>
            <input
              id="title"
              value={form.title}
              onChange={handleChange}
              maxLength={160}
              placeholder="What is Life Insurance"
              className="mt-1 w-full text-sm py-2 px-3 bg-bg border border-border rounded-md outline-none text-text-primary placeholder:text-text-muted focus:border-border"
            />
            {submitted && titleTooShort && (
              <p className="text-danger text-xs mt-1">
                Title must be at least 3 characters.
              </p>
            )}
            {issues.title && (
              <p className="text-danger text-xs mt-1">{issues.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="youtubeUrl" className="text-xs text-text-muted">
              YouTube link
            </label>
            <input
              id="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtu.be/… or an 11-character video id"
              className={`mt-1 w-full text-sm py-2 px-3 bg-bg border rounded-md outline-none text-text-primary placeholder:text-text-muted focus:border-border ${
                urlLooksWrong ? "border-danger/40" : "border-border"
              }`}
            />
            {urlLooksWrong && (
              <p className="text-danger text-xs mt-1">
                That isn&apos;t a YouTube link. Paste a watch, youtu.be, shorts
                or embed URL — or the 11-character id.
              </p>
            )}
            {issues.youtubeUrl && (
              <p className="text-danger text-xs mt-1">{issues.youtubeUrl}</p>
            )}
            {videoId && (
              <p className="text-text-muted text-[11px] mt-1 font-mono">
                video id: {videoId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="text-xs text-text-muted">
              Description <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={2}
              maxLength={2000}
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full text-sm py-2 px-3 bg-bg border border-border rounded-md outline-none text-text-primary focus:border-border"
            />
          </div>
        </div>

        <div className="w-44 shrink-0">
          <p className="text-xs text-text-muted mb-1">Preview</p>
          {videoId ? (
            <img
              src={youTubeThumbnail(videoId, "medium")}
              alt=""
              className="w-full rounded-md border border-border"
            />
          ) : (
            <div className="w-full aspect-video rounded-md border border-dashed border-border flex items-center justify-center text-[11px] text-text-muted text-center px-2">
              paste a link to preview
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-danger text-xs font-semibold">
          {getUserMessage(error, "Couldn't save the chapter.")}
        </p>
      )}

      <div className="flex gap-3 mt-4 max-w-xs">
        <Btn type="button" title="Cancel" variant="ghost" size="sm" onClick={onCancel} />
        <Btn
          type="submit"
          title={isLoading ? "Saving…" : isEdit ? "Save" : "Add chapter"}
          variant="primary"
          size="sm"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default ChapterEditor;
