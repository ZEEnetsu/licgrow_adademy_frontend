// import { useState } from "react";

// import Btn from "../../components/Btn";
// import { getUserMessage } from "../../../../app/apis/apiError";
// import {
//   useAddQuestionsMutation,
//   useUpdateQuestionMutation,
// } from "../../../../app/apis/tests.api";
// import {
//   MAX_OPTIONS,
//   MIN_OPTIONS,
//   OPTION_LABELS,
//   addOption,
//   blankDraft,
//   missingHindi,
//   removeOptionAt,
//   toCreatePayload,
//   toDraft,
//   toUpdatePayload,
//   validate,
// } from "./questionDraft.js";

// /**
//  * Bilingual question editor — `api-contracts/09-test.md` §8 (create), §11 (update).
//  *
//  * English and Hindi sit side by side rather than behind language tabs. The
//  * publish gate (§6) requires `hi` on the statement AND every option, so the
//  * most useful thing this screen can do is make missing translations visible
//  * while authoring rather than at publish time — hence the amber borders.
//  *
//  * Drafts may be saved half-translated; `en` is the only hard requirement.
//  * Payload construction lives in questionDraft.js.
//  */

// const INPUT =
//   "w-full text-sm py-2 px-3 bg-bg border rounded-md outline-none text-text-primary placeholder:text-text-muted focus:border-border";

// const BilingualRow = ({ label, hint, value, onChange, textarea }) => {
//   const Field = textarea ? "textarea" : "input";

//   return (
//     <div className="grid grid-cols-[7rem_1fr_1fr] gap-3 items-start">
//       <div className="pt-2">
//         <p className="text-sm text-text-primary">{label}</p>
//         {hint && <p className="text-[10px] text-text-muted">{hint}</p>}
//       </div>
//       <Field
//         className={`${INPUT} border-border`}
//         rows={textarea ? 2 : undefined}
//         placeholder="English"
//         value={value.en}
//         onChange={(event) => onChange({ ...value, en: event.target.value })}
//       />
//       <Field
//         className={`${INPUT} ${value.hi.trim() ? "border-border" : "border-warning/40"}`}
//         rows={textarea ? 2 : undefined}
//         placeholder="हिन्दी"
//         lang="hi"
//         value={value.hi}
//         onChange={(event) => onChange({ ...value, hi: event.target.value })}
//       />
//     </div>
//   );
// };

// const QuestionEditor = ({ testId, question, onDone, onCancel }) => {
//   const isEdit = Boolean(question);
//   const [draft, setDraft] = useState(() =>
//     question ? toDraft(question) : blankDraft(),
//   );
//   const [submitted, setSubmitted] = useState(false);

//   const [addQuestions, addState] = useAddQuestionsMutation();
//   const [updateQuestion, updateState] = useUpdateQuestionMutation();
//   const { isLoading, error } = isEdit ? updateState : addState;
//   console.log(error);

//   const problems = validate(draft);
//   const hindiGaps = missingHindi(draft);

//   const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

//   const setOptionText = (index, text) =>
//     patch({
//       options: draft.options.map((option, i) =>
//         i === index ? { ...option, text } : option,
//       ),
//     });

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setSubmitted(true);
//     if (problems.length) return;

//     try {
//       if (isEdit) {
//         await updateQuestion({
//           testId,
//           questionId: question.id,
//           ...toUpdatePayload(draft, question),
//         }).unwrap();
//       } else {
//         await addQuestions({
//           testId,
//           questions: [toCreatePayload(draft)],
//         }).unwrap();
//       }
//       onDone?.();
//     } catch {
//       // rendered from `error` below
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="rounded-lg p-4 bg-surface-elevated shadow-elevate"
//     >
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-sm font-semibold text-text-primary">
//           {isEdit ? "Edit question" : "New question"}
//         </h3>
//         <label className="flex items-center gap-2 text-xs text-text-muted">
//           Marks
//           <input
//             type="number"
//             min={1}
//             value={draft.marks}
//             onChange={(event) => patch({ marks: event.target.value })}
//             className="w-16 text-sm py-1 px-2 bg-bg border border-border rounded-md outline-none text-text-primary"
//           />
//         </label>
//       </div>

//       <div className="grid grid-cols-[7rem_1fr_1fr] gap-3 mb-2">
//         <span />
//         <span className="text-[10px] uppercase tracking-wide text-text-muted">
//           English
//         </span>
//         <span className="text-[10px] uppercase tracking-wide text-text-muted">
//           हिन्दी — required to publish
//         </span>
//       </div>

//       <div className="flex flex-col gap-3">
//         <BilingualRow
//           label="Statement"
//           value={draft.statement}
//           onChange={(statement) => patch({ statement })}
//           textarea
//         />
//         <BilingualRow
//           label="Explanation"
//           hint="optional"
//           value={draft.explanation}
//           onChange={(explanation) => patch({ explanation })}
//           textarea
//         />
//       </div>

//       <div className="mt-5">
//         <p className="text-sm text-text-primary mb-2">
//           Options
//           <span className="text-[11px] text-text-muted ml-2">
//             select the correct answer · {MIN_OPTIONS}–{MAX_OPTIONS} allowed
//           </span>
//         </p>

//         <div className="flex flex-col gap-2">
//           {draft.options.map((option, index) => (
//             <div
//               key={option.id ?? `new-${index}`}
//               className="flex items-start gap-2"
//             >
//               <label className="flex items-center gap-2 pt-2 shrink-0 w-14 cursor-pointer">
//                 <input
//                   type="radio"
//                   name="correctOption"
//                   checked={draft.correctIndex === index}
//                   onChange={() => patch({ correctIndex: index })}
//                   className="accent-accent cursor-pointer"
//                   aria-label={`Mark option ${OPTION_LABELS[index]} correct`}
//                 />
//                 <span className="text-text-muted font-mono text-sm">
//                   {OPTION_LABELS[index]}
//                 </span>
//               </label>

//               <div className="flex-1 grid grid-cols-2 gap-3">
//                 <input
//                   className={`${INPUT} border-border`}
//                   placeholder="English"
//                   value={option.text.en}
//                   onChange={(event) =>
//                     setOptionText(index, {
//                       ...option.text,
//                       en: event.target.value,
//                     })
//                   }
//                 />
//                 <input
//                   className={`${INPUT} ${option.text.hi.trim() ? "border-border" : "border-warning/40"}`}
//                   placeholder="हिन्दी"
//                   lang="hi"
//                   value={option.text.hi}
//                   onChange={(event) =>
//                     setOptionText(index, {
//                       ...option.text,
//                       hi: event.target.value,
//                     })
//                   }
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setDraft(removeOptionAt(draft, index))}
//                 disabled={draft.options.length <= MIN_OPTIONS}
//                 aria-label={`Remove option ${OPTION_LABELS[index]}`}
//                 className="mt-1 px-2 py-1 text-text-muted hover:text-danger disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
//               >
//                 ✕
//               </button>
//             </div>
//           ))}
//         </div>

//         {draft.options.length < MAX_OPTIONS && (
//           <button
//             type="button"
//             onClick={() => setDraft(addOption(draft))}
//             className="mt-2 text-xs text-text-muted hover:text-text-primary cursor-pointer"
//           >
//             + add option
//           </button>
//         )}
//       </div>

//       {submitted && problems.length > 0 && (
//         <ul className="mt-4 text-xs text-danger list-disc pl-5">
//           {problems.map((problem) => (
//             <li key={problem}>{problem}</li>
//           ))}
//         </ul>
//       )}

//       {hindiGaps.length > 0 && problems.length === 0 && (
//         <p className="mt-4 text-xs text-warning">
//           Saveable as a draft, but {hindiGaps.join(", ")} still needs Hindi
//           before this test can be published.
//         </p>
//       )}

//       {error && (
//         <div className="mt-4 rounded-md bg-danger-muted border border-danger/40 px-3 py-2">
//           <p className="text-danger text-xs font-semibold">
//             {getUserMessage(error, "Couldn't save the question.")}
//           </p>
//           {error.details?.map((detail) => (
//             <p
//               key={`${detail.field}-${detail.issue}`}
//               className="text-danger text-[11px] mt-1"
//             >
//               <span className="font-mono">{detail.field}</span> — {detail.issue}
//             </p>
//           ))}
//         </div>
//       )}

//       <div className="flex gap-3 mt-5 max-w-sm">
//         <Btn
//           type="button"
//           title="Cancel"
//           variant="ghost"
//           size="sm"
//           onClick={onCancel}
//         />
//         <Btn
//           type="submit"
//           title={
//             isLoading ? "Saving…" : isEdit ? "Save changes" : "Add question"
//           }
//           variant="primary"
//           size="sm"
//           disabled={isLoading}
//         />
//       </div>
//     </form>
//   );
// };

// export default QuestionEditor;


import { useState } from "react";

import Btn from "../../components/Btn";
import { getUserMessage } from "../../../../app/apis/apiError";
import {
  useAddQuestionsMutation,
  useUpdateQuestionMutation,
} from "../../../../app/apis/tests.api";
import {
  MAX_OPTIONS,
  MIN_OPTIONS,
  OPTION_LABELS,
  addOption,
  blankDraft,
  missingHindi,
  removeOptionAt,
  toCreatePayload,
  toDraft,
  toUpdatePayload,
  validate,
} from "./questionDraft.js";

const INPUT =
  "w-full text-sm py-2 px-3 bg-bg border rounded-md outline-none text-text-primary placeholder:text-text-muted focus:border-border";

const BilingualRow = ({ label, hint, value, onChange, textarea }) => {
  const Field = textarea ? "textarea" : "input";
  
  // Bug Fix: Only pass 'rows' if it's actually a textarea to avoid DOM warnings
  const extraProps = textarea ? { rows: 2 } : {};

  return (
    <div className="grid grid-cols-[7rem_1fr_1fr] gap-3 items-start">
      <div className="pt-2">
        <p className="text-sm text-text-primary">{label}</p>
        {hint && <p className="text-[10px] text-text-muted">{hint}</p>}
      </div>
      <Field
        className={`${INPUT} border-border`}
        placeholder="English"
        value={value.en}
        onChange={(event) => onChange({ ...value, en: event.target.value })}
        {...extraProps}
      />
      <Field
        className={`${INPUT} ${
          value.hi.trim() ? "border-border" : "border-warning/40"
        }`}
        placeholder="हिन्दी"
        lang="hi"
        value={value.hi}
        onChange={(event) => onChange({ ...value, hi: event.target.value })}
        {...extraProps}
      />
    </div>
  );
};

const QuestionEditor = ({ testId, question, onDone, onCancel }) => {
  const isEdit = Boolean(question);
  const [draft, setDraft] = useState(() =>
    question ? toDraft(question) : blankDraft(),
  );
  const [submitted, setSubmitted] = useState(false);

  const [addQuestions, addState] = useAddQuestionsMutation();
  const [updateQuestion, updateState] = useUpdateQuestionMutation();
  const { isLoading, error } = isEdit ? updateState : addState;

  const problems = validate(draft);
  const hindiGaps = missingHindi(draft);

  const patch = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

  const setOptionText = (index, text) =>
    patch({
      options: draft.options.map((option, i) =>
        i === index ? { ...option, text } : option,
      ),
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    
    // Stop early if local client validation fails
    if (problems.length) return;

    try {
      if (isEdit) {
        // Evaluate payload outside to catch synchronous errors before mutation
        const payload = toUpdatePayload(draft, question);
        await updateQuestion({
          testId,
          questionId: question.id,
          ...payload,
        }).unwrap();
      } else {
        const payload = toCreatePayload(draft);
        await addQuestions({
          testId,
          questions: [payload],
        }).unwrap();
      }
      onDone?.();
    } catch (err) {
      // Bug Fix: Log the error. If toCreatePayload throws, it lands here.
      // If unwrap() throws, RTK query still populates 'error' in state, but 
      // logging it locally helps debug frontend payload parsing issues.
      console.error("Mutation failed or payload generation threw an error:", err);
    }
  };

  // Bug Fix: Safely extract details. RTK Query nests server errors inside '.data'
  const errorDetails = error?.data?.details || error?.details || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg p-4 bg-surface-elevated shadow-elevate"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {isEdit ? "Edit question" : "New question"}
        </h3>
        <label className="flex items-center gap-2 text-xs text-text-muted">
          Marks
          <input
            type="number"
            min={1}
            value={draft.marks}
            onChange={(event) => patch({ marks: event.target.value })}
            className="w-16 text-sm py-1 px-2 bg-bg border border-border rounded-md outline-none text-text-primary"
          />
        </label>
      </div>

      <div className="grid grid-cols-[7rem_1fr_1fr] gap-3 mb-2">
        <span />
        <span className="text-[10px] uppercase tracking-wide text-text-muted">
          English
        </span>
        <span className="text-[10px] uppercase tracking-wide text-text-muted">
          हिन्दी — required to publish
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <BilingualRow
          label="Statement"
          value={draft.statement}
          onChange={(statement) => patch({ statement })}
          textarea
        />
        <BilingualRow
          label="Explanation"
          hint="optional"
          value={draft.explanation}
          onChange={(explanation) => patch({ explanation })}
          textarea
        />
      </div>

      <div className="mt-5">
        <p className="text-sm text-text-primary mb-2">
          Options
          <span className="text-[11px] text-text-muted ml-2">
            select the correct answer · {MIN_OPTIONS}–{MAX_OPTIONS} allowed
          </span>
        </p>

        <div className="flex flex-col gap-2">
          {draft.options.map((option, index) => (
            <div
              key={option.id ?? `new-${index}`}
              className="flex items-start gap-2"
            >
              <label className="flex items-center gap-2 pt-2 shrink-0 w-14 cursor-pointer">
                <input
                  type="radio"
                  name="correctOption"
                  checked={draft.correctIndex === index}
                  onChange={() => patch({ correctIndex: index })}
                  className="accent-accent cursor-pointer"
                  aria-label={`Mark option ${OPTION_LABELS[index]} correct`}
                />
                <span className="text-text-muted font-mono text-sm">
                  {OPTION_LABELS[index]}
                </span>
              </label>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  className={`${INPUT} border-border`}
                  placeholder="English"
                  value={option.text.en}
                  onChange={(event) =>
                    setOptionText(index, {
                      ...option.text,
                      en: event.target.value,
                    })
                  }
                />
                <input
                  className={`${INPUT} ${
                    option.text.hi.trim() ? "border-border" : "border-warning/40"
                  }`}
                  placeholder="हिन्दी"
                  lang="hi"
                  value={option.text.hi}
                  onChange={(event) =>
                    setOptionText(index, {
                      ...option.text,
                      hi: event.target.value,
                    })
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setDraft(removeOptionAt(draft, index))}
                disabled={draft.options.length <= MIN_OPTIONS}
                aria-label={`Remove option ${OPTION_LABELS[index]}`}
                className="mt-1 px-2 py-1 text-text-muted hover:text-danger disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {draft.options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={() => setDraft(addOption(draft))}
            className="mt-2 text-xs text-text-muted hover:text-text-primary cursor-pointer"
          >
            + add option
          </button>
        )}
      </div>

      {submitted && problems.length > 0 && (
        <ul className="mt-4 text-xs text-danger list-disc pl-5">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      {hindiGaps.length > 0 && problems.length === 0 && (
        <p className="mt-4 text-xs text-warning">
          Saveable as a draft, but {hindiGaps.join(", ")} still needs Hindi
          before this test can be published.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-md bg-danger-muted border border-danger/40 px-3 py-2">
          <p className="text-danger text-xs font-semibold">
            {getUserMessage(error, "Couldn't save the question.")}
          </p>
          {/* Bug Fix: Maps correctly over errorDetails */}
          {errorDetails.map((detail) => (
            <p
              key={`${detail.field}-${detail.issue}`}
              className="text-danger text-[11px] mt-1"
            >
              <span className="font-mono">{detail.field}</span> — {detail.issue}
            </p>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-5 max-w-sm">
        <Btn
          type="button"
          title="Cancel"
          variant="ghost"
          size="sm"
          onClick={onCancel}
        />
        <Btn
          type="submit"
          title={
            isLoading ? "Saving…" : isEdit ? "Save changes" : "Add question"
          }
          variant="primary"
          size="sm"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};

export default QuestionEditor;