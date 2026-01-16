import { FC, useCallback } from "react";
import { CircularProgress, Toolbar } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { getObjectAt } from "../../../app/slice";
import Layout from "../../../components/layouts/Layout";
import { CenterContainer } from "../../../components/Loader";
import { useAnnotationMiddleware } from "../hooks/use-annotation-middleware";

export const withAnnotationMiddleware = (Component: FC) => {
  const HOC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { projectId, objectId } = useParams();

    // redirect because of invalid state
    const redirect = useCallback(() => {
      // select project first
      if (!projectId) navigate("/");
      // select first object from project
      else
        dispatch(getObjectAt({ projectId }))
          .unwrap()
          .then(({ id }) => navigate(`/annotate/${projectId}/${id}`));
    }, [dispatch, navigate, projectId]);

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
