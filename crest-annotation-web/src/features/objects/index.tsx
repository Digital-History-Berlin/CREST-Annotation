import React from "react";
import { Link, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AnnotateIcon from "@mui/icons-material/HistoryEdu";
import SettingsIcon from "@mui/icons-material/Settings";
import ObjectCard from "./components/ObjectCard";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { Object as DataObject } from "../../api/openApi";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";
import { ToolbarButtonWithTooltip } from "../../components/ToolbarButton";

const ObjectsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const { data: project } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const renderCard = (object: DataObject) => (
    <ObjectCard projectId={projectId} object={object} />
  );

  const renderActions = () => (
    <Stack direction="row">
      <ToolbarButtonWithTooltip
        onClick={() => navigate(`/project/${projectId}`)}
        tooltip={"Settings"}
      >
        <SettingsIcon />
      </ToolbarButtonWithTooltip>
      <ToolbarButtonWithTooltip
        onClick={() => navigate(`/annotate/${projectId}`)}
        tooltip={"Annotate Images"}
      >
        <AnnotateIcon />
      </ToolbarButtonWithTooltip>
    </Stack>
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
        header={
          <Toolbar
            title={project?.name ?? "Objects"}
            actions={renderActions()}
          />
        }
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
