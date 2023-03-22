import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// base API for RTK query code-generation
export const rootApi = createApi({
  baseQuery: fetchBaseQuery({
    // use default backend location if not specified otherwise
    // custom backend URL should only be used in development
    baseUrl: process.env.REACT_APP_BACKEND || "/api",
  }),
  endpoints: () => ({}),
});
