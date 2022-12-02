import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// base API for RTK query code-generation
export const rootApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BACKEND }),
  endpoints: () => ({}),
});
