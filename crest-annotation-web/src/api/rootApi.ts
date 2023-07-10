import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// use default backend location if not specified otherwise
// custom backend URL should only be used in development
const baseUrl = process.env.REACT_APP_BACKEND || "/api";

// base API for RTK query code-generation
export const rootApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
  }),
  endpoints: () => ({}),
});

console.log(`Using backend at ${baseUrl}`);
