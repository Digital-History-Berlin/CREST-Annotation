import React, { useState } from "react";
import { PlayArrow } from "@mui/icons-material";
import { Link, Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import ObjectCard from "./components/ObjectCard";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { SummaryObject } from "../../api/openApi";
import { useAppSelector } from "../../app/hooks";
import { selectObjectFilters, updateObjectFilters } from "../../app/slice";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import StateSelect from "../../components/StateSelect";
import Toolbar from "../../components/Toolbar";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
} from "../../components/ToolbarButton";

const ObjectsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  const filters = useAppSelector(selectObjectFilters);

  const { data: project } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );

  const objectsQuery = useGetObjectsQuery(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      projectId: projectId!,
      page: page,
      size: 12,
      ...filters,
    },
    { skip: !projectId }
  );

  const changeState = (annotated: boolean | undefined) =>
    dispatch(updateObjectFilters({ ...filters, annotated, offset: 0 }));

  const renderCard = (object: SummaryObject) => (
    <ObjectCard projectId={projectId} object={object} />
  );

  const renderActions = () => (
    <Stack direction="row">
      <StateSelect annotated={filters.annotated} onChange={changeState} />
      <ToolbarDivider />
      <ToolbarButtonWithTooltip
        onClick={() => navigate(`/annotate/${projectId}`)}
        tooltip={"Annotate Images"}
      >
        <PlayArrow />
      </ToolbarButtonWithTooltip>
      <ToolbarButtonWithTooltip
        onClick={() => navigate(`/project/${projectId}`)}
        tooltip={"Settings"}
      >
        <SettingsIcon />
      </ToolbarButtonWithTooltip>
    </Stack>
  );

  return (
    <>
      <CardLayout
        onChangePage={setPage}
        query={objectsQuery}
        renderCard={renderCard}
        header={
          <Toolbar
            title={project?.name ?? "Objects"}
            actions={renderActions()}
          />
        }
        placeholder={
          <PlaceholderLayout
            title="This project contains no images."
            description={
              <>
                Go to the{" "}
                <Link href={`/project/${projectId}`}>project settings</Link> to
                scan the project source for new images and start annotating!
              </>
            }
          />
        }
      />
    </>
  );
};

export default ObjectsPage;
