import { crestApi as api } from "./openApi";

export const enhancedApi = api.enhanceEndpoints({
  addTagTypes: ["Project", "Label", "Object", "Annotation", "Lock"],
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
    getObjectsCount: {
      providesTags: ["Object"],
    },
    finishObject: {
      invalidatesTags: ["Object"],
    },
    importFilesystem: {
      invalidatesTags: ["Object"],
    },
    importIiif2: {
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

    getLockStatus: {
      providesTags: ["Lock"],
    },
    lockObject: {
      invalidatesTags: ["Lock"],
    },
    unlockObject: {
      invalidatesTags: ["Lock"],
    },
  },
});

export const {
  useGetProjectLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useGetObjectAtQuery,
  useNavigateFromQuery,
  useGetObjectsCountQuery,
  useGetObjectsQuery,
  useGetAllObjectsQuery,
  useGetObjectQuery,
  useFinishObjectMutation,
  useGetLockStatusQuery,
  useLockObjectMutation,
  useUnlockObjectMutation,
  useGetImageUriQuery,
  useGetImageDescriptionQuery,
  useGetCachedImageQuery,
  useGetLocalImageQuery,
  useGetAnnotationsQuery,
  useStoreAnnotationsMutation,
  usePullAnnotationsMutation,
  usePushAnnotationsMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
  useGetOntologyImportMutation,
  useImportOntologyMutation,
  useImportFilesystemMutation,
  useImportIiif3Mutation,
  useImportIiif2Mutation,
  useImportDigitalHeraldryMutation,
  useGetYamlExportQuery,
} = enhancedApi;
