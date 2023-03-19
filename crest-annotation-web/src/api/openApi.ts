import { rootApi as api } from "./rootApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectLabels: build.query<
      GetProjectLabelsApiResponse,
      GetProjectLabelsApiArg
    >({
      query: (queryArg) => ({
        url: `/labels/of/${queryArg.projectId}`,
        params: {
          sorting: queryArg.sorting,
          direction: queryArg.direction,
          starred: queryArg.starred,
          grouped: queryArg.grouped,
        },
      }),
    }),
    createLabel: build.mutation<CreateLabelApiResponse, CreateLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/`,
        method: "POST",
        body: queryArg.createLabel,
      }),
    }),
    updateLabel: build.mutation<UpdateLabelApiResponse, UpdateLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/`,
        method: "PATCH",
        body: queryArg.patchLabel,
      }),
    }),
    deleteLabel: build.mutation<DeleteLabelApiResponse, DeleteLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/${queryArg.labelId}`,
        method: "DELETE",
      }),
    }),
    getOntologyImport: build.query<
      GetOntologyImportApiResponse,
      GetOntologyImportApiArg
    >({
      query: (queryArg) => ({
        url: `/labels/import/ontology`,
        params: { url: queryArg.url },
      }),
    }),
    importOntology: build.mutation<
      ImportOntologyApiResponse,
      ImportOntologyApiArg
    >({
      query: (queryArg) => ({
        url: `/labels/import/ontology`,
        method: "POST",
        body: queryArg.body,
        params: {
          url: queryArg.url,
          project_id: queryArg.projectId,
          method: queryArg.method,
        },
      }),
    }),
    collectObjects: build.mutation<
      CollectObjectsApiResponse,
      CollectObjectsApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/collect-of/${queryArg.projectId}`,
        method: "POST",
      }),
    }),
    getRandomObject: build.query<
      GetRandomObjectApiResponse,
      GetRandomObjectApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/random-of/${queryArg.projectId}`,
      }),
    }),
    getObjects: build.query<GetObjectsApiResponse, GetObjectsApiArg>({
      query: (queryArg) => ({ url: `/objects/of/${queryArg.projectId}` }),
    }),
    getImage: build.query<GetImageApiResponse, GetImageApiArg>({
      query: (queryArg) => ({ url: `/objects/image/${queryArg.objectId}` }),
    }),
    getAnnotations: build.query<
      GetAnnotationsApiResponse,
      GetAnnotationsApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/annotations/${queryArg.objectId}`,
      }),
    }),
    storeAnnotations: build.mutation<
      StoreAnnotationsApiResponse,
      StoreAnnotationsApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/annotations/${queryArg.objectId}`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    finishObject: build.mutation<FinishObjectApiResponse, FinishObjectApiArg>({
      query: (queryArg) => ({
        url: `/objects/finish/${queryArg.objectId}`,
        method: "POST",
      }),
    }),
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: () => ({ url: `/projects/` }),
    }),
    createProject: build.mutation<
      CreateProjectApiResponse,
      CreateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/`,
        method: "POST",
        body: queryArg.shallowProject,
      }),
    }),
    updateProject: build.mutation<
      UpdateProjectApiResponse,
      UpdateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/`,
        method: "PATCH",
        body: queryArg.shallowProject,
      }),
    }),
    getProject: build.query<GetProjectApiResponse, GetProjectApiArg>({
      query: (queryArg) => ({ url: `/projects/by-id/${queryArg.projectId}` }),
    }),
    deleteProject: build.mutation<
      DeleteProjectApiResponse,
      DeleteProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/${queryArg.projectId}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as crestApi };
export type GetProjectLabelsApiResponse =
  /** status 200 Successful Response */ Label[];
export type GetProjectLabelsApiArg = {
  projectId: string;
  sorting?: Sorting;
  direction?: SortDirection;
  starred?: boolean;
  grouped?: boolean;
};
export type CreateLabelApiResponse =
  /** status 200 Successful Response */ Label;
export type CreateLabelApiArg = {
  createLabel: CreateLabel;
};
export type UpdateLabelApiResponse =
  /** status 200 Successful Response */ Label;
export type UpdateLabelApiArg = {
  patchLabel: PatchLabel;
};
export type DeleteLabelApiResponse = /** status 200 Successful Response */ any;
export type DeleteLabelApiArg = {
  labelId: string;
};
export type GetOntologyImportApiResponse =
  /** status 200 Successful Response */ Ontology;
export type GetOntologyImportApiArg = {
  url: string;
};
export type ImportOntologyApiResponse =
  /** status 200 Successful Response */ any;
export type ImportOntologyApiArg = {
  url: string;
  projectId: string;
  method?: string;
  body: string[];
};
export type CollectObjectsApiResponse =
  /** status 200 Successful Response */ any;
export type CollectObjectsApiArg = {
  projectId: string;
};
export type GetRandomObjectApiResponse =
  /** status 200 Successful Response */ Object;
export type GetRandomObjectApiArg = {
  projectId: string;
};
export type GetObjectsApiResponse =
  /** status 200 Successful Response */ Object[];
export type GetObjectsApiArg = {
  projectId: string;
};
export type GetImageApiResponse = /** status 200 Successful Response */ any;
export type GetImageApiArg = {
  objectId: string;
};
export type GetAnnotationsApiResponse =
  /** status 200 Successful Response */ any;
export type GetAnnotationsApiArg = {
  objectId: string;
};
export type StoreAnnotationsApiResponse =
  /** status 200 Successful Response */ any;
export type StoreAnnotationsApiArg = {
  objectId: string;
  body: string;
};
export type FinishObjectApiResponse = /** status 200 Successful Response */ any;
export type FinishObjectApiArg = {
  objectId: string;
};
export type GetProjectsApiResponse =
  /** status 200 Successful Response */ Project[];
export type GetProjectsApiArg = void;
export type CreateProjectApiResponse =
  /** status 200 Successful Response */ Project;
export type CreateProjectApiArg = {
  shallowProject: ShallowProject;
};
export type UpdateProjectApiResponse =
  /** status 200 Successful Response */ Project;
export type UpdateProjectApiArg = {
  shallowProject: ShallowProject;
};
export type GetProjectApiResponse =
  /** status 200 Successful Response */ Project;
export type GetProjectApiArg = {
  projectId: string;
};
export type DeleteProjectApiResponse =
  /** status 200 Successful Response */ any;
export type DeleteProjectApiArg = {
  projectId: string;
};
export type Label = {
  id: string;
  parent_id?: string;
  reference?: string;
  name: string;
  starred: boolean;
  count: number;
  color: string;
  children?: Label[];
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type Sorting = "name" | "count";
export type SortDirection = "asc" | "desc";
export type CreateLabel = {
  id?: string;
  project_id?: string;
  parent_id?: string;
  reference?: string;
  name: string;
  starred?: boolean;
  count?: number;
  color: string;
};
export type PatchLabel = {
  id: string;
  project_id?: string;
  parent_id?: string;
  reference?: string;
  name?: string;
  starred?: boolean;
  count?: number;
  color?: string;
};
export type OntologyDescription = {
  language: string;
  value: string;
};
export type OntologyLabel = {
  id: string;
  name: string;
  children?: OntologyLabel[];
};
export type Ontology = {
  creators?: string[];
  titles?: string[];
  licenses?: string[];
  descriptions?: OntologyDescription[];
  labels: OntologyLabel[];
  problems: string[];
};
export type Object = {
  annotation_data: string;
  id: string;
};
export type Project = {
  name: string;
  id: string;
  source?: string;
  color_table: string[];
};
export type ShallowProject = {
  name: string;
  id?: string;
  source?: string;
  color_table?: string[];
};
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
  useFinishObjectMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
} = injectedRtkApi;
