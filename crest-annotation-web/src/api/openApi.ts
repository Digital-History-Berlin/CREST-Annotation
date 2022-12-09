import { rootApi as api } from "./rootApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectLabels: build.query<
      GetProjectLabelsApiResponse,
      GetProjectLabelsApiArg
    >({
      query: (queryArg) => ({ url: `/labels/of/${queryArg.projectId}` }),
    }),
    createLabel: build.mutation<CreateLabelApiResponse, CreateLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/`,
        method: "POST",
        body: queryArg.shallowLabel,
      }),
    }),
    updateLabel: build.mutation<UpdateLabelApiResponse, UpdateLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/`,
        method: "PATCH",
        body: queryArg.shallowLabel,
      }),
    }),
    deleteLabel: build.mutation<DeleteLabelApiResponse, DeleteLabelApiArg>({
      query: (queryArg) => ({
        url: `/labels/${queryArg.labelId}`,
        method: "DELETE",
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
      query: (queryArg) => ({ url: `/objects/image/${queryArg.id}` }),
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
};
export type CreateLabelApiResponse =
  /** status 200 Successful Response */ Label;
export type CreateLabelApiArg = {
  shallowLabel: ShallowLabel;
};
export type UpdateLabelApiResponse =
  /** status 200 Successful Response */ Label;
export type UpdateLabelApiArg = {
  shallowLabel: ShallowLabel;
};
export type DeleteLabelApiResponse = /** status 200 Successful Response */ any;
export type DeleteLabelApiArg = {
  labelId: string;
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
  id: string;
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
  name: string;
  id: string;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type ShallowLabel = {
  name: string;
  id?: string;
  project_id?: string;
};
export type Object = {
  annotation_data: string;
  id: string;
};
export type Project = {
  name: string;
  id: string;
  source?: string;
};
export type ShallowProject = {
  name: string;
  id?: string;
  source?: string;
};
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
} = injectedRtkApi;
