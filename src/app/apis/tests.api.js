import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const testSlice = createApi({
  reducerPath: "test",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),
  tagTypes: ["Test"],
  endpoints: (builder) => ({
    getTests: builder.query({
      query: () => "/admin/tests", // viewAllTest.jsx
    }),
    getTestDetail: builder.query({
      query: (testId) => `/admin/tests/${testId}`, // testDetail.jsx
    }),
    draftTest: builder.mutation({
      query: (data) => ({
        url: "/admin/tests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Test"], // Invalidate the "Test" tag after mutation
    }),
    // admin/tests/${testId}/questions <POST>
    // adding Bulk Questions to a Draft Test
    // body:
    //   "questions": [
    //     {
    //       "lang": "hi",
    //       "questionStatement": "भारत की राजधानी का नाम क्या है?",
    //       "options": [
    //         { "optionStatement": "मुंबई" },
    //         { "optionStatement": "नई दिल्ली" },
    //         { "optionStatement": "कोलकाता" },
    //         { "optionStatement": "चेन्नई" }
    //       ],
    //       "correctOptionIndex": 1
    //     }
    //   ] // return the created Questions with their generated IDs
    addQuestions: builder.mutation({
      query: ({ testId, questions }) => ({
        url: `/admin/tests/${testId}/questions`,
        method: "POST",
        body: questions,
      }),
    }),
  }),
});




export const {
  useGetTestsQuery,
  useDraftTestMutation,
  useAddQuestionsMutation,
  useGetTestDetailQuery,
} = testSlice;
