import { FC, useCallback } from "react";
import { CircularProgress, Toolbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/layouts/Layout";
import { CenterContainer } from "../../../components/Loader";
import { useAnnotationMiddleware } from "../hooks/use-annotation-middleware";
import { useNavigateRandom } from "../hooks/use-navigate-random";

export const withAnnotationMiddleware = (Component: FC) => {
  const HOC = () => {
    const navigate = useNavigate();
    const { navigateRandom } = useNavigateRandom();
    const { projectId, objectId } = useParams();

    // redirect because of missing object
    const redirect = useCallback(
      (projectId: string | undefined) => {
        // select missing project
        if (!projectId) navigate("/");
        // select random object from project
        else
          navigateRandom(projectId, (filters) => ({
            ...filters,
            offset: 0,
          }));
      },
      [navigateRandom, navigate]
    );

    const { valid } = useAnnotationMiddleware({
      projectId,
      objectId,
      redirect,
    });

    if (!valid)
      return (
        <Layout header={<Toolbar />}>
          <CenterContainer>
            <CircularProgress />
          </CenterContainer>
        </Layout>
      );

    return <Component />;
  };

  return HOC;
};
