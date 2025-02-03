import { FC, useEffect } from "react";
import { CircularProgress, Toolbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { updateProject } from "../app/slice";
import Layout from "../components/layouts/Layout";
import { CenterContainer } from "../components/Loader";

export type PropsWithProject<T> = T & {
  projectId: string;
};

export const withProject = <T extends object>(
  Component: FC<PropsWithProject<T>>
) => {
  const HOC = (props: T) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { projectId } = useParams();

    // select active project from state
    // if this does not match the project provided in the path,
    // the state will be updated accordingly
    const currentProjectId = useAppSelector((state) => state.global.projectId);

    useEffect(
      () => {
        // redirect because of missing project
        if (!projectId) navigate("/");
        // update the project in state
        else if (currentProjectId !== projectId)
          dispatch(updateProject(projectId));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [projectId]
    );

    if (projectId === undefined || currentProjectId !== projectId)
      return (
        <Layout header={<Toolbar />}>
          <CenterContainer>
            <CircularProgress />
          </CenterContainer>
        </Layout>
      );

    return <Component projectId={projectId} {...props} />;
  };

  return HOC;
};
