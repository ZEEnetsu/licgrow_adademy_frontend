import { useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";

import { useGetMyCourseQuery } from "../../app/apis/courses.api.js";
import { ERROR_CODES, getUserMessage } from "../../app/apis/apiError.js";
import {
  youTubeEmbedUrl,
  youTubeThumbnail,
} from "../../app/utils/youtube.js";

/**
 * Learner course reader — `api-contracts/08-course.md` §15.
 *
 * Reached only through a batch: `/me/batches/:batchId/courses/:courseId`.
 * There is deliberately no global "open any course" route.
 *
 * The quiz on a unit is a reference only — id, title, question count and the
 * learner's own best score. Question content and answer keys never appear in
 * this tree; they are governed entirely by the test/submission contracts.
 */
const CourseReader = () => {
  const { batchId, courseId } = useParams();
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(null);

  const { data: course, isLoading, isError, error } = useGetMyCourseQuery(
    { batchId, courseId },
    { skip: !batchId || !courseId },
  );

  if (isLoading) {
    return <p className="text-text-muted text-sm">Loading course…</p>;
  }

  if (isError) {
    const locked = error?.code === ERROR_CODES.NOT_A_BATCH_MEMBER;
    return (
      <div>
        <p className="text-danger text-sm">
          {locked
            ? "This course is locked. You are not a member of this batch."
            : `Couldn't load this course — ${getUserMessage(error)}`}
        </p>
        <button
          type="button"
          onClick={() => navigate(`/student/batches/${batchId}`)}
          className="mt-3 text-sm text-accent underline cursor-pointer"
        >
          Back to the batch
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(`/student/batches/${batchId}`)}
        className="text-sm text-text-muted hover:text-text-primary cursor-pointer"
      >
        ← Back to the batch
      </button>

      <h1 className="text-2xl font-semibold mt-3">{course.title}</h1>
      {course.description && (
        <p className="text-sm text-text-muted mt-2 max-w-prose">
          {course.description}
        </p>
      )}

      <div className="flex flex-col gap-6 mt-8">
        {course.units.map((unit, index) => (
          <section key={unit.id}>
            <h2 className="text-sm font-semibold text-text-primary">
              <span className="text-text-muted uppercase tracking-wide text-[10px] mr-2">
                Unit {index + 1}
              </span>
              {unit.title}
            </h2>

            <div className="flex flex-col gap-2 mt-3">
              {unit.chapters.map((chapter, chapterIndex) => {
                const isPlaying = playing === chapter.id;

                return (
                  <div
                    key={chapter.id}
                    className="rounded-lg border border-border-muted bg-surface overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setPlaying(isPlaying ? null : chapter.id)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <img
                        src={youTubeThumbnail(chapter.youtubeUrl, "default")}
                        alt=""
                        className="h-10 w-16 object-cover rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary truncate">
                          <span className="text-text-muted mr-2">
                            {chapterIndex + 1}.
                          </span>
                          {chapter.title}
                        </p>
                        {chapter.description && (
                          <p className="text-[11px] text-text-muted truncate">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      <span className="text-text-muted text-xs shrink-0">
                        {isPlaying ? "close" : "watch"}
                      </span>
                    </button>

                    {isPlaying && (
                      <div className="aspect-video bg-black">
                        <iframe
                          src={youTubeEmbedUrl(chapter.youtubeUrl)}
                          title={chapter.title}
                          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {unit.quiz && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-border-muted p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary truncate">
                    <span className="text-accent mr-2">Quiz</span>
                    {unit.quiz.title}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {unit.quiz.questionCount} question
                    {unit.quiz.questionCount === 1 ? "" : "s"}
                    {unit.quiz.myBestScorePct !== null &&
                      ` · best ${unit.quiz.myBestScorePct}%`}
                  </p>
                </div>
                <NavLink
                  to={`/student/tests/${unit.quiz.id}`}
                  className="px-4 py-2 rounded-md text-sm bg-accent/20 text-accent hover:bg-accent/30 transition-colors shrink-0"
                >
                  Start quiz
                </NavLink>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default CourseReader;
