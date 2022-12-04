import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// base API for RTK query code-generation
export const rootApi = createApi({
  baseQuery: fetchBaseQuery({
    // use either injected environment variable for static builds
    // or the NodeJS environment variable
    baseUrl: global.config?.REACT_APP_BACKEND || process.env.REACT_APP_BACKEND,
  }),
  endpoints: () => ({}),
});
