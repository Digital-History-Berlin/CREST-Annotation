import React, { useState } from "react";
import { Link, Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import ObjectCard from "./components/ObjectCard";
import { useGetObjectsQuery, useGetProjectQuery } from "../../api/enhancedApi";
import { SummaryObject } from "../../api/openApi";
import { useAppSelector } from "../../app/hooks";
import { selectObjectFilters, updateObjectFilters } from "../../app/slice";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import StateSelect from "../../components/StateSelect";
import Toolbar from "../../components/Toolbar";
import { ToolbarDivider } from "../../components/ToolbarButton";
import ToolbarTabs from "../../components/ToolbarTabs";
import { withProject } from "../../hocs/with-project";

const ObjectsPage = withProject(({ projectId }) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);

  const filters = useAppSelector(selectObjectFilters);

  const { data: project } = useGetProjectQuery({ projectId });
  const objectsQuery = useGetObjectsQuery({
    projectId,
    page: page,
    size: 12,
    ...filters,
  });

  const changeState = (annotated: boolean | undefined) =>
    dispatch(updateObjectFilters({ ...filters, annotated, offset: 0 }));

  const renderCard = (object: SummaryObject) => (
    <ObjectCard projectId={projectId} object={object} />
  );

  const renderActions = () => (
    <Stack direction="row">
      <StateSelect annotated={filters.annotated} onChange={changeState} />
      <ToolbarDivider />
      <ToolbarTabs active="objects" />
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
});

export default ObjectsPage;
