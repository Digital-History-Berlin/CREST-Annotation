import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, Stack, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
// TODO: better icons
import ObjectsIcon from "@mui/icons-material/Apps";
import FinishedIcon from "@mui/icons-material/Check";
import CircleIcon from "@mui/icons-material/CircleTwoTone";
import RectangleIcon from "@mui/icons-material/RectangleTwoTone";
import SettingsIcon from "@mui/icons-material/Settings";
import AnnotationsList from "./components/AnnotationsList";
import Canvas from "./components/Canvas";
import LabelsExplorer from "./components/LabelsExplorer";
import {
  Modifiers,
  Tool,
  selectActiveLabel,
  selectActiveModifiers,
  selectActiveTool,
  setActiveLabel,
  setActiveTool,
  setObjectId,
  toggleModifier,
} from "./slice";
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
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../components/ToolbarButton";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { projectId, objectId } = useParams();

  const activeTool = useAppSelector(selectActiveTool);
  const activeLabel = useAppSelector(selectActiveLabel);
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
    activeLabel?.id === label.id
      ? dispatch(setActiveLabel(undefined))
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

  const finishObject = async () => {
    if (!objectId) return;

    await rqeuestFinishObject({
      objectId: objectId,
    }).unwrap();

    if (projectId) navigateRandom(projectId);
  };

  const toolIcons = {
    [Tool.Select]: () => (
      <Icon
        icon="material-symbols:drag-pan-rounded"
        style={{ fontSize: "27px" }}
      />
    ),
    [Tool.Pen]: () => (
      <Icon icon="majesticons:edit-pen-4-line" style={{ fontSize: "27px" }} />
    ),
    [Tool.Rectangle]: RectangleIcon,
    [Tool.Circle]: CircleIcon,
    [Tool.Polygon]: () => (
      <Icon icon="mdi:vector-polygon" style={{ fontSize: "27px" }} />
    ),
    [Tool.Edit]: () => (
      <Icon icon="mdi:vector-polyline-edit" style={{ fontSize: "27px" }} />
    ),
  };

  const renderTools = () => (
    <Stack direction="row">
      {[
        { tool: Tool.Select, tooltip: "Select" },
        { tool: Tool.Pen, tooltip: "Pen" },
        { tool: Tool.Rectangle, tooltip: "Rectangle" },
        { tool: Tool.Circle, tooltip: "Circle" },
        { tool: Tool.Polygon, tooltip: "Polygon" },
        {
          tool: Tool.Edit,
          icon: <Icon icon="mdi:vector-polyline-edit" />,
          tooltip: "Edit",
        },
      ].map((button) => {
        const Icon = toolIcons[button.tool];
        return (
          <ToolbarToggleButtonWithTooltip
            key={button.tool}
            value={button.tool}
            onClick={() => dispatch(setActiveTool(button.tool))}
            selected={activeTool === button.tool}
            tooltip={button.tooltip}
          >
            <Icon />
          </ToolbarToggleButtonWithTooltip>
        );
      })}
      <ToolbarDivider />
      {[
        {
          modifier: Modifiers.Group,
          icon: <Icon icon="mdi:vector-link" style={{ fontSize: "25px" }} />,
        },
      ].map((button) => {
        return (
          <ToolbarToggleButtonWithTooltip
            key={button.modifier}
            value={button.modifier}
            onClick={() => dispatch(toggleModifier(button.modifier))}
            selected={activeModifiers.includes(button.modifier)}
            tooltip={"Group Annotations"}
          >
            {button.icon}
          </ToolbarToggleButtonWithTooltip>
        );
      })}
    </Stack>
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
        onClick={() => navigate(`/objects/${projectId}`)}
        tooltip={"Project Overview"}
      >
        <ObjectsIcon />
      </ToolbarButtonWithTooltip>
      <ToolbarButtonWithTooltip
        onClick={() => finishObject()}
        tooltip={"Finish Image"}
      >
        <FinishedIcon />
      </ToolbarButtonWithTooltip>
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
