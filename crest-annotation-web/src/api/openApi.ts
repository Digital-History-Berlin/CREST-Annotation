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
    getRandomObject: build.mutation<
      GetRandomObjectApiResponse,
      GetRandomObjectApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/random-of/${queryArg.projectId}`,
        method: "POST",
      }),
    }),
    getObjectsCount: build.query<
      GetObjectsCountApiResponse,
      GetObjectsCountApiArg
    >({
      query: (queryArg) => ({ url: `/objects/total-of/${queryArg.projectId}` }),
    }),
    getObjects: build.query<GetObjectsApiResponse, GetObjectsApiArg>({
      query: (queryArg) => ({
        url: `/objects/of/${queryArg.projectId}`,
        params: { page: queryArg.page, size: queryArg.size },
      }),
    }),
    getObject: build.query<GetObjectApiResponse, GetObjectApiArg>({
      query: (queryArg) => ({ url: `/objects/id/${queryArg.objectId}` }),
    }),
    finishObject: build.mutation<FinishObjectApiResponse, FinishObjectApiArg>({
      query: (queryArg) => ({
        url: `/objects/finish/${queryArg.objectId}`,
        method: "POST",
      }),
    }),
    getImageUri: build.query<GetImageUriApiResponse, GetImageUriApiArg>({
      query: (queryArg) => ({
        url: `/objects/uri/${queryArg.objectId}`,
        method: "POST",
        body: queryArg.imageRequest,
      }),
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
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({
        url: `/projects/`,
        params: { page: queryArg.page, size: queryArg.size },
      }),
    }),
    createProject: build.mutation<
      CreateProjectApiResponse,
      CreateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/`,
        method: "POST",
        body: queryArg.createProject,
      }),
    }),
    updateProject: build.mutation<
      UpdateProjectApiResponse,
      UpdateProjectApiArg
    >({
      query: (queryArg) => ({
        url: `/projects/`,
        method: "PATCH",
        body: queryArg.patchProject,
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
    getOntologyImport: build.mutation<
      GetOntologyImportApiResponse,
      GetOntologyImportApiArg
    >({
      query: (queryArg) => ({
        url: `/import/ontology`,
        method: "GET",
        params: { url: queryArg.url },
      }),
    }),
    importOntology: build.mutation<
      ImportOntologyApiResponse,
      ImportOntologyApiArg
    >({
      query: (queryArg) => ({
        url: `/import/ontology`,
        method: "POST",
        body: queryArg.body,
        params: {
          url: queryArg.url,
          project_id: queryArg.projectId,
          method: queryArg.method,
        },
      }),
    }),
    importIiif3: build.mutation<ImportIiif3ApiResponse, ImportIiif3ApiArg>({
      query: (queryArg) => ({
        url: `/import/iiif/3`,
        method: "POST",
        params: {
          url: queryArg.url,
          project_id: queryArg.projectId,
          commit: queryArg.commit,
        },
      }),
    }),
    importIiif2: build.mutation<ImportIiif2ApiResponse, ImportIiif2ApiArg>({
      query: (queryArg) => ({
        url: `/import/iiif/2`,
        method: "POST",
        params: {
          url: queryArg.url,
          project_id: queryArg.projectId,
          commit: queryArg.commit,
        },
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
export type GetRandomObjectApiResponse =
  /** status 200 Successful Response */ Object;
export type GetRandomObjectApiArg = {
  projectId: string;
};
export type GetObjectsCountApiResponse =
  /** status 200 Successful Response */ any;
export type GetObjectsCountApiArg = {
  projectId: string;
};
export type GetObjectsApiResponse =
  /** status 200 Successful Response */ Object[];
export type GetObjectsApiArg = {
  projectId: string;
  page: number;
  size: number;
};
export type GetObjectApiResponse = /** status 200 Successful Response */ any;
export type GetObjectApiArg = {
  objectId: string;
};
export type FinishObjectApiResponse = /** status 200 Successful Response */ any;
export type FinishObjectApiArg = {
  objectId: string;
};
export type GetImageUriApiResponse = /** status 200 Successful Response */ any;
export type GetImageUriApiArg = {
  objectId: string;
  imageRequest: ImageRequest;
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
export type GetProjectsApiResponse =
  /** status 200 Successful Response */ PaginatedProject;
export type GetProjectsApiArg = {
  page: number;
  size: number;
};
export type CreateProjectApiResponse =
  /** status 200 Successful Response */ Project;
export type CreateProjectApiArg = {
  createProject: CreateProject;
};
export type UpdateProjectApiResponse =
  /** status 200 Successful Response */ Project;
export type UpdateProjectApiArg = {
  patchProject: PatchProject;
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
export type ImportIiif3ApiResponse =
  /** status 200 Successful Response */ Iiif3Import;
export type ImportIiif3ApiArg = {
  url: string;
  projectId: string;
  commit?: boolean;
};
export type ImportIiif2ApiResponse =
  /** status 200 Successful Response */ Iiif2Import;
export type ImportIiif2ApiArg = {
  url: string;
  projectId: string;
  commit?: boolean;
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
export type Object = {
  id: string;
  object_uuid?: string;
  annotated: boolean;
  annotation_data: string;
};
export type ImageRequest = {
  thumbnail?: boolean;
  width?: number;
  height?: number;
};
export type Project = {
  id: string;
  name: string;
  source?: string;
  color_table: string[];
};
export type PaginatedProject = {
  items: Project[];
  pages: number;
  page: number;
  size: number;
};
export type CreateProject = {
  id?: string;
  name: string;
  source?: string;
  color_table?: string[];
};
export type PatchProject = {
  id: string;
  name?: string;
  source?: string;
  color_table?: string[];
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
export type Id = string;
export type LngString = object;
export type ServiceItem = {
  id: Id;
  type: string;
  label?: LngString;
  profile?: string;
  service?: Service;
};
export type ServiceItem1 = {
  "@id": Id;
  "@type": string;
  profile?: string;
  service?: Service;
};
export type Service = (ServiceItem | ServiceItem1)[];
export type Iiif3ObjectData = {
  manifest: string;
  page: string;
  annotation: string;
  canvas: string;
  service: Service;
  type?: string;
};
export type Iiif3Object = {
  id?: string;
  object_uuid?: string;
  annotated?: boolean;
  annotation_data?: string;
  object_data: Iiif3ObjectData;
};
export type Iiif3Import = {
  title?: {
    [key: string]: string[];
  };
  display?: string;
  objects: Iiif3Object[];
  added: Iiif3Object[];
  problems: string[];
};
export type Service2 = {
  "@id": string;
  "@context": string;
  profile?: string;
};
export type Iiif2ObjectData = {
  manifest: string;
  sequence: string;
  canvas: string;
  image?: string;
  service: Service2;
  type?: string;
};
export type Iiif2Object = {
  id?: string;
  object_uuid?: string;
  annotated?: boolean;
  annotation_data?: string;
  object_data: Iiif2ObjectData;
};
export type Iiif2Import = {
  title?: string;
  objects: Iiif2Object[];
  added: Iiif2Object[];
  problems: string[];
};
export const {
  useGetProjectLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useGetRandomObjectMutation,
  useGetObjectsCountQuery,
  useGetObjectsQuery,
  useGetObjectQuery,
  useFinishObjectMutation,
  useGetImageUriQuery,
  useGetAnnotationsQuery,
  useStoreAnnotationsMutation,
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useGetProjectQuery,
  useDeleteProjectMutation,
  useGetOntologyImportMutation,
  useImportOntologyMutation,
  useImportIiif3Mutation,
  useImportIiif2Mutation,
} = injectedRtkApi;
