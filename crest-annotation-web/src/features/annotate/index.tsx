import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useEnv } from "../../app/hooks";
import {
  selectActiveLabel,
  selectActiveTool,
  setActiveLabel,
  setActiveTool,
  setObjectId,
  Tool,
} from "./slice";
import { Link, Stack, useTheme } from "@mui/material";
// TODO: better icons
import SelectIcon from "@mui/icons-material/TouchApp";
import PenIcon from "@mui/icons-material/Edit";
import PolygonIcon from "@mui/icons-material/PolylineOutlined";
import RectangleIcon from "@mui/icons-material/RectangleTwoTone";
import CircleIcon from "@mui/icons-material/CircleTwoTone";
import Layout from "../../components/layouts/Layout";
import Toolbar from "../../components/Toolbar";
import { ToolbarToggleButton } from "../../components/ToolbarButton";
import Canvas from "./components/Canvas";
import AnnotationsList from "./components/AnnotationsList";
import LabelsExplorer from "./components/LabelsExplorer";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import SelectProjectDialog from "../../components/dialogs/SelectProjectDialog";
import { enhancedApi } from "../../api/enhancedApi";
import Loader from "../../components/Loader";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import { Label } from "../../api/openApi";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const env = useEnv();

  const { projectId, objectId } = useParams();

  const activeTool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);

  const [getRandom, { isError: randomError }] =
    enhancedApi.useLazyGetRandomObjectQuery();

  const [showProjects, setShowProjects] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const navigateRandom = async (id: string) => {
    const random = await getRandom({ projectId: id }).unwrap();
    navigate(`/annotate/${id}/${random.id}`);
  };

  const toggleLabelSelection = (label: Label) =>
    activeLabel?.id === label.id
      ? dispatch(setActiveLabel(null))
      : dispatch(setActiveLabel(label));

  useEffect(() => {
    // start with random object
    if (projectId && !objectId) navigateRandom(projectId);
    // update object id in state
    if (objectId) dispatch(setObjectId(objectId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, objectId]);

  const showCreateDialog = async () => {
    setShowProjects(false);
    setShowCreate(true);
  };

  const renderTools = () => (
    <Stack direction="row">
      {[
        { tool: Tool.Select, icon: SelectIcon },
        { tool: Tool.Pen, icon: PenIcon },
        { tool: Tool.Rectangle, icon: RectangleIcon },
        { tool: Tool.Circle, icon: CircleIcon },
        { tool: Tool.Polygon, icon: PolygonIcon },
        { tool: Tool.Edit, icon: PenIcon },
      ].map((button) => {
        return (
          <ToolbarToggleButton
            key={button.tool}
            value={button.tool}
            onClick={() => dispatch(setActiveTool(button.tool))}
            selected={activeTool === button.tool}
          >
            {<button.icon />}
          </ToolbarToggleButton>
        );
      })}
    </Stack>
  );

  return (
    <Layout
      scrollable={true}
      header={<Toolbar tools={renderTools()} />}
      left={
        <Stack
          sx={{
            width: "300px",
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <AnnotationsList projectId={projectId} />
          <LabelsExplorer
            projectId={projectId}
            selected={activeLabel}
            onSelect={toggleLabelSelection}
          />
        </Stack>
      }
    >
      <SelectProjectDialog
        activeProjectId={projectId}
        open={!showCreate && (!projectId || showProjects)}
        onClose={() => setShowProjects(false)}
        onCreate={showCreateDialog}
      />
      <AddProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <Loader
        query={{
          isLoading: !projectId || (!objectId && !randomError),
          isError: randomError,
          data: objectId,
        }}
        errorPlaceholder={
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
        render={({ data: objectId }) => (
          <Canvas
            projectId={projectId}
            imageUri={`${env.REACT_APP_BACKEND}/objects/image/${objectId}`}
          />
        )}
      />
    </Layout>
  );
};

export default AnnotatePage;
