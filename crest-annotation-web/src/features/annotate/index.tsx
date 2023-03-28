import React, { useEffect, useState } from "react";
import { Link, Stack, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
// TODO: better icons
import ObjectsIcon from "@mui/icons-material/Apps";
import FinishedIcon from "@mui/icons-material/Check";
import CircleIcon from "@mui/icons-material/CircleTwoTone";
import EditIcon from "@mui/icons-material/CropRotate";
import GroupIcon from "@mui/icons-material/DashboardCustomize";
import PenIcon from "@mui/icons-material/Edit";
import PolygonIcon from "@mui/icons-material/PolylineOutlined";
import RectangleIcon from "@mui/icons-material/RectangleTwoTone";
import SelectIcon from "@mui/icons-material/TouchApp";
import AnnotationsList from "./components/AnnotationsList";
import Canvas from "./components/Canvas";
import LabelsExplorer from "./components/LabelsExplorer";
import { setObjectId } from "./slice/annotations";
import {
  Modifiers,
  Tool,
  selectActiveLabelId,
  selectActiveModifiers,
  selectActiveTool,
  setActiveLabel,
  setActiveTool,
  toggleModifier,
} from "./slice/tools";
import {
  enhancedApi,
  useFinishObjectMutation,
  useGetImageUriQuery,
} from "../../api/enhancedApi";
import { Label } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import SelectProjectDialog from "../../components/dialogs/SelectProjectDialog";
import Layout from "../../components/layouts/Layout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Loader from "../../components/Loader";
import Toolbar from "../../components/Toolbar";
import {
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
} from "../../components/ToolbarButton";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { projectId, objectId } = useParams();

  const activeTool = useAppSelector(selectActiveTool);
  const activeLabelId = useAppSelector(selectActiveLabelId);
  const activeModifiers = useAppSelector(selectActiveModifiers);

  const [getRandom, { isError: randomError }] =
    enhancedApi.useLazyGetRandomObjectQuery();
  const [rqeuestFinishObject] = useFinishObjectMutation();

  // TODO: move to image component
  const { data: imageUri } = useGetImageUriQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId!, imageRequest: {} },
    { skip: !objectId }
  );

  const [showProjects, setShowProjects] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const navigateRandom = async (id: string) => {
    const random = await getRandom({ projectId: id }).unwrap();
    navigate(`/annotate/${id}/${random.id}`);
  };

  const toggleLabelSelection = (label: Label) =>
    activeLabelId === label.id
      ? dispatch(setActiveLabel(undefined))
      : dispatch(setActiveLabel(label));

  useEffect(() => {
    // start with random object
    if (projectId && !objectId) navigateRandom(projectId);
    // update object id in state
    if (projectId && objectId) dispatch(setObjectId({ projectId, objectId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, objectId]);

  const showCreateDialog = async () => {
    setShowProjects(false);
    setShowCreate(true);
  };

  const finishObject = async () => {
    if (!objectId) return;

    await rqeuestFinishObject({
      objectId: objectId,
    }).unwrap();

    if (projectId) navigateRandom(projectId);
  };

  const renderTools = () => (
    <Stack direction="row">
      {[
        { tool: Tool.Select, icon: SelectIcon },
        { tool: Tool.Pen, icon: PenIcon },
        { tool: Tool.Rectangle, icon: RectangleIcon },
        { tool: Tool.Circle, icon: CircleIcon },
        { tool: Tool.Polygon, icon: PolygonIcon },
        { tool: Tool.Edit, icon: EditIcon },
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
      <ToolbarDivider />
      {[{ modifier: Modifiers.Group, icon: GroupIcon }].map((button) => {
        return (
          <ToolbarToggleButton
            key={button.modifier}
            value={button.modifier}
            onClick={() => dispatch(toggleModifier(button.modifier))}
            selected={activeModifiers.includes(button.modifier)}
          >
            {<button.icon />}
          </ToolbarToggleButton>
        );
      })}
    </Stack>
  );

  const renderActions = () => (
    <Stack direction="row">
      <ToolbarButton onClick={() => navigate(`/objects/${projectId}`)}>
        <ObjectsIcon />
      </ToolbarButton>
      <ToolbarButton onClick={() => finishObject()}>
        <FinishedIcon />
      </ToolbarButton>
    </Stack>
  );

  return (
    <Layout
      sx={{ display: "flex" }}
      header={<Toolbar tools={renderTools()} actions={renderActions()} />}
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
            selected={activeLabelId}
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
          isLoading: !projectId || (!imageUri && !randomError),
          isError: randomError,
          data: imageUri,
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
        render={({ data: imageUri }) => (
          <Canvas projectId={projectId} imageUri={imageUri} />
        )}
      />
    </Layout>
  );
};

export default AnnotatePage;
