import React from "react";
import { Link } from "@mui/material";
import { useParams } from "react-router-dom";
import ObjectCard from "./components/ObjectCard";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { Object as DataObject } from "../../api/openApi";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";

const ObjectsPage = () => {
  const { projectId } = useParams();

  const { data: project } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const renderCard = (object: DataObject) => (
    <ObjectCard projectId={projectId} object={object} />
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
