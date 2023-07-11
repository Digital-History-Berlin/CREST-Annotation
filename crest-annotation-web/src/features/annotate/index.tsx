import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { SkipNext } from "@mui/icons-material";
import { Link, Stack, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
// TODO: better icons
import ObjectsIcon from "@mui/icons-material/Apps";
import FinishedIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import AnnotationsList from "./components/AnnotationsList";
import Canvas from "./components/Canvas";
import EditAnnotationDialog from "./components/EditAnnotationDialog";
import LabelsExplorer from "./components/LabelsExplorer";
import {
  editAnnotation,
  selectEditing,
  setObjectId,
} from "./slice/annotations";
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
  useGetObjectQuery,
  useGetObjectsCountQuery,
} from "../../api/enhancedApi";
import { Label } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  ObjectFilters,
  selectObjectFilters,
  updateObjectFilters,
} from "../../app/slice";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import Layout from "../../components/layouts/Layout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Loader from "../../components/Loader";
import StateSelect from "../../components/StateSelect";
import Toolbar from "../../components/Toolbar";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../components/ToolbarButton";

const tools = [
  {
    tool: Tool.Pen,
    icon: "majesticons:edit-pen-4-line",
    style: { fontSize: "22px" },
    tooltip: "Pen",
  },
  {
    tool: Tool.Rectangle,
    icon: "mdi:vector-square",
    style: { fontSize: "25px" },
    tooltip: "Rectangle",
  },
  {
    tool: Tool.Circle,
    icon: "mdi:vector-circle-variant",
    style: { fontSize: "25px" },
    tooltip: "Circle",
  },
  {
    tool: Tool.Polygon,
    icon: "mdi:vector-polygon",
    style: { fontSize: "25px" },
    tooltip: "Polygon",
  },
  { tool: undefined },
  {
    tool: Tool.Edit,
    icon: "mdi:vector-polyline-edit",
    style: { fontSize: "25px" },
    tooltip: "Edit",
  },
  { tool: undefined },
  {
    tool: Tool.Segment,
    icon: "fluent:brain-circuit-24-regular",
    style: { fontSize: "25px" },
    tooltip: "Segment",
  },
];

const modifiers = [
  {
    modifier: Modifiers.Group,
    icon: "mdi:vector-link",
    style: { fontSize: "25px" },
  },
];

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { projectId, objectId } = useParams();

  const activeTool = useAppSelector(selectActiveTool);
  const activeLabelId = useAppSelector(selectActiveLabelId);
  const activeModifiers = useAppSelector(selectActiveModifiers);
  const editingAnnotation = useAppSelector(selectEditing);
  const filters = useAppSelector(selectObjectFilters);

  const [getRandom, { isError: randomError }] =
    enhancedApi.useGetRandomObjectMutation();
  const [requestFinishObject] = useFinishObjectMutation();
  const { currentData: count } = useGetObjectsCountQuery(
    { projectId: projectId! },
    { skip: !projectId }
  );
  const { currentData: object } = useGetObjectQuery(
    { objectId: objectId! },
    { skip: !objectId }
  );

  // TODO: move to image component
  const { data: imageUri } = useGetImageUriQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId!, imageRequest: {} },
    { skip: !objectId }
  );

  const [showCreate, setShowCreate] = useState(false);

  const navigateRandom = async (id: string, filters: ObjectFilters) => {
    const random = await getRandom({
      projectId: id,
      ...filters,
    }).unwrap();

    navigate(`/annotate/${id}/${random.id}`);
    // automatically update filters
    dispatch(updateObjectFilters(filters));
  };

  const toggleLabelSelection = (label: Label) =>
    activeLabelId === label.id
      ? dispatch(setActiveLabel(undefined))
      : dispatch(setActiveLabel(label));

  useEffect(() => {
    // select project first
    if (!projectId) navigate("/");
    // start with random object
    else if (!objectId) navigateRandom(projectId, { ...filters, offset: 0 });
    // update object id in state
    else dispatch(setObjectId({ projectId, objectId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, objectId]);

  const finishObject = async () => {
    if (!object) return;

    const annotated = !object.annotated;
    await requestFinishObject({
      objectId: object.id,
      finished: annotated,
    }).unwrap();

    if (
      projectId &&
      filters.annotated !== undefined &&
      filters.annotated !== annotated
    )
      // update current object if neccessary
      navigateRandom(projectId, filters);
  };

  const skipObject = async () => {
    if (projectId)
      navigateRandom(projectId, { ...filters, offset: filters.offset + 1 });
  };

  const changeState = (annotated: boolean | undefined) => {
    if (projectId)
      navigateRandom(projectId, { ...filters, annotated, offset: 0 });
  };

  const renderTools = () => (
    <Stack direction="row">
      {tools.map((button, index) => {
        if (button.tool === undefined) return <ToolbarDivider key={index} />;
        return (
          <ToolbarToggleButtonWithTooltip
            key={index}
            value={button.tool}
            onClick={() => dispatch(setActiveTool(button.tool))}
            selected={activeTool === button.tool}
            tooltip={button.tooltip}
          >
            <Icon icon={button.icon} style={button.style} />
          </ToolbarToggleButtonWithTooltip>
        );
      })}
      <ToolbarDivider />
      {modifiers.map((button) => {
        return (
          <ToolbarToggleButtonWithTooltip
            key={button.modifier}
            value={button.modifier}
            onClick={() => dispatch(toggleModifier(button.modifier))}
            selected={activeModifiers.includes(button.modifier)}
            tooltip={"Group Annotations"}
          >
            <Icon icon={button.icon} style={button.style} />
          </ToolbarToggleButtonWithTooltip>
        );
      })}
    </Stack>
  );

  const renderActions = () => (
    <Stack direction="row">
      <StateSelect annotated={filters.annotated} onChange={changeState} />
      <ToolbarDivider />
      <ToolbarToggleButtonWithTooltip
        value={"annotated"}
        onClick={() => finishObject()}
        selected={!!object?.annotated}
        tooltip={"Finish Image"}
      >
        <FinishedIcon />
      </ToolbarToggleButtonWithTooltip>
      <ToolbarButtonWithTooltip
        onClick={() => skipObject()}
        tooltip={"Next Image"}
      >
        <SkipNext />
      </ToolbarButtonWithTooltip>
      <ToolbarDivider />
      <ToolbarButtonWithTooltip
        onClick={() => navigate(`/objects/${projectId}`)}
        tooltip={"Project Overview"}
      >
        <ObjectsIcon />
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
    <Layout
      sx={{ display: "flex" }}
      header={<Toolbar tools={renderTools()} actions={renderActions()} />}
      left={
        <Stack
          sx={{
            width: "440px",
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
      <AddProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <EditAnnotationDialog
        projectId={projectId}
        annotation={editingAnnotation}
        onClose={() => dispatch(editAnnotation(null))}
      />
      <Loader
        query={{
          isLoading: !projectId || (!imageUri && !randomError),
          isError: randomError,
          data: imageUri,
        }}
        errorPlaceholder={
          <PlaceholderLayout
            title={
              count?.total > 0
                ? "There are no more images in this project."
                : "The project does not contain any images."
            }
            description={
              <>
                Go to the{" "}
                <Link href={`/project/${projectId}`}>project settings</Link> to
                import new images or export the results!
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
