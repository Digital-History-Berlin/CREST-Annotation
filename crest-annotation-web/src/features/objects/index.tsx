import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link, Card, CardActionArea, CardMedia } from "@mui/material";
import CardLayout from "../../components/layouts/CardLayout";
import Toolbar from "../../components/Toolbar";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { Object } from "../../api/openApi";
import { useEnv } from "../../app/hooks";

const ObjectsPage = () => {
  const navigate = useNavigate();
  const env = useEnv();

  const { projectId } = useParams();

  const { data: project } = useGetProjectQuery(
    { projectId: projectId! },
    { skip: !projectId }
  );

  const renderCard = (object: Object) => (
    <Card>
      <CardActionArea
        onClick={() => navigate(`/annotate/${projectId}/${object.id}`)}
      >
        <CardMedia
          component="img"
          height="140"
          image={`${env.REACT_APP_BACKEND}/objects/image/${object.id}`}
        />
      </CardActionArea>
    </Card>
  );

  return (
    <>
      <CardLayout
        query={useGetObjectsQuery(
          { projectId: projectId! },
          { skip: !projectId }
        )}
        renderCard={renderCard}
        header={<Toolbar title={project?.name ?? "Objects"} />}
        placeholder={
          <PlaceholderLayout
            title="This project contains no objects."
            description={
              <>
                Go to the{" "}
                <Link href={`/project/${projectId}`}>project settings</Link> to
                scan the project source for new objects and start annotating!
              </>
            }
          />
        }
      />
    </>
  );
};

export default ObjectsPage;
