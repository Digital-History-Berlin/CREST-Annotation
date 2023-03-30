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

    getObject: {
      providesTags: ["Object"],
    },
    getObjects: {
      providesTags: ["Object"],
    },
    getRandomObject: {
      providesTags: ["Object"],
    },
    finishObject: {
      invalidatesTags: ["Object"],
    },
    importIiif3: {
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
  useGetRandomObjectQuery,
  useGetObjectsQuery,
  useGetObjectQuery,
  useGetImageUriQuery,
  useGetAnnotationsQuery,
  useStoreAnnotationsMutation,
  useFinishObjectMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
  useGetOntologyImportMutation,
  useImportOntologyMutation,
  useImportIiif3Mutation,
  useImportIiif2Mutation,
} = enhancedApi;
