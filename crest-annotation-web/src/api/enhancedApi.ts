import { crestApi as api } from "./openApi";

export const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ["Annotation"],
  endpoints: {},
});

export const {
  useGetProjectLabelsQuery,
  useCollectObjectsQuery,
  useGetRandomObjectQuery,
  useGetImageQuery,
  useGetProjectsQuery,
} = enhancedApi;
