import { rootApi as api } from "./rootApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectLabels: build.query<
      GetProjectLabelsApiResponse,
      GetProjectLabelsApiArg
    >({
      query: (queryArg) => ({ url: `/labels/of/${queryArg.projectId}` }),
    }),
    collectObjects: build.query<
      CollectObjectsApiResponse,
      CollectObjectsApiArg
    >({
      query: (queryArg) => ({
        url: `/objects/collect-of/${queryArg.projectId}`,
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
  }),
  overrideExisting: false,
});
export { injectedRtkApi as crestApi };
export type GetProjectLabelsApiResponse =
  /** status 200 Successful Response */ Label[];
export type GetProjectLabelsApiArg = {
  projectId: string;
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
export type Object = {
  annotationData: string;
  id: string;
};
export type Project = {
  name: string;
  id: string;
};
export type ShallowProject = {
  name: string;
  id?: string;
  source?: string;
};
export const {
  useGetProjectLabelsQuery,
  useCollectObjectsQuery,
  useGetRandomObjectQuery,
  useGetImageQuery,
  useGetProjectsQuery,
  useCreateProjectMutation,
} = injectedRtkApi;
