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
    importOntology: {
      invalidatesTags: ["Label"],
    },
  },
});

export const {
  useGetProjectLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useGetOntologyImportQuery,
  useImportOntologyMutation,
  useCollectObjectsMutation,
  useGetRandomObjectQuery,
  useGetObjectsQuery,
  useGetImageQuery,
  useGetAnnotationsQuery,
  useStoreAnnotationsMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
  useMarkAsFinishedMutation,
} = enhancedApi;
