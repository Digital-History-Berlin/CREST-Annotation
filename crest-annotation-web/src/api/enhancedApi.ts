import { crestApi as api } from "./openApi";

export const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ["Project", "Label", "Object", "Annotation"],
  endpoints: {
    getProject: {
      providesTags: ["Project"],
    },
    getProjects: {
      providesTags: ["Project"],
    },
    updateProject: {
      invalidatesTags: ["Project"],
    },
    getObjects: {
      providesTags: ["Object"],
    },
    getRandomObject: {
      providesTags: ["Object"],
    },
    collectObjects: {
      invalidatesTags: ["Object"],
    },
  },
});

export const {
  useGetProjectLabelsQuery,
  useCollectObjectsMutation,
  useGetRandomObjectQuery,
  useGetObjectsQuery,
  useGetImageQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
} = enhancedApi;
