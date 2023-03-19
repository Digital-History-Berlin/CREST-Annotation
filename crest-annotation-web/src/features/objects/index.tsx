import React from "react";
import { Card, CardActionArea, CardMedia, Link } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { Object as DataObject } from "../../api/openApi";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";

const ObjectsPage = () => {
  const navigate = useNavigate();

  const { projectId } = useParams();

  const { data: project } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const renderCard = (object: DataObject) => (
    <Card>
      <CardActionArea
        onClick={() => navigate(`/annotate/${projectId}/${object.id}`)}
      >
        <CardMedia component="img" height="140" image={object.uri} />
      </CardActionArea>
    </Card>
  );

  return (
    <>
      <CardLayout
        query={useGetObjectsQuery(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
