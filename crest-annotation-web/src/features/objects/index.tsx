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
import SyncSelect from "../../components/SyncSelect";
import Toolbar from "../../components/Toolbar";
import ToolbarTabs from "../../components/ToolbarTabs";
import { withProject } from "../../hocs/with-project";

const ObjectsPage = withProject(({ projectId }) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>();

  const filters = useAppSelector(selectObjectFilters);

  const { data: project } = useGetProjectQuery({ projectId });
  const objectsQuery = useGetObjectsQuery({
    projectId,
    page: page,
    size: 12,
    search: search,
    ...filters,
  });

  const changeState = (annotated: boolean | undefined) => {
    dispatch(updateObjectFilters({ ...filters, annotated, offset: 0 }));
    // reset the page when filtering
    setPage(1);
  };

  const changeSynced = (synced: boolean | undefined) => {
    dispatch(updateObjectFilters({ ...filters, synced, offset: 0 }));
    // reset the page when filtering
    setPage(1);
  };

  const handleSearch = (search: string | undefined) => {
    setSearch(search);
    // reset the page when searching
    setPage(1);
  };

  const renderCard = (object: SummaryObject) => (
    <ObjectCard projectId={projectId} object={object} />
  );

  const renderActions = () => (
    <Stack direction="row" spacing={1} alignItems="center">
      <StateSelect annotated={filters.annotated} onChange={changeState} />
      <SyncSelect synced={filters.synced} onChange={changeSynced} />
    </Stack>
  );

  return (
    <>
      <CardLayout
        onChangePage={setPage}
        onSearch={handleSearch}
        query={objectsQuery}
        activeFilters={!!search || !!filters.annotated || !!filters.synced}
        renderCard={renderCard}
        header={
          <Toolbar
            title={project?.name ?? "Objects"}
            tabs={<ToolbarTabs active="objects" />}
            actions={renderActions()}
          />
        }
        placeholder={
          <PlaceholderLayout
            title={"This project contains no images."}
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
