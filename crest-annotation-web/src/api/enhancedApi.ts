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
    createProject: {
      invalidatesTags: ["Project"],
    },
    updateProject: {
      invalidatesTags: ["Project"],
    },
    deleteProject: {
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

    getProjectLabels: {
      providesTags: ["Label"],
    },
    createLabel: {
      invalidatesTags: ["Label"],
    },
    updateLabel: {
      invalidatesTags: ["Label"],
    },
    deleteLabel: {
      invalidatesTags: ["Label"],
    },
  },
});

export const {
  useGetProjectLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useCollectObjectsMutation,
  useGetRandomObjectQuery,
  useGetObjectsQuery,
  useGetImageQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
} = enhancedApi;
