import React, { useEffect } from "react";
import { SkipNext } from "@mui/icons-material";
import { Link, Stack, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
// TODO: better icons
import ObjectsIcon from "@mui/icons-material/Apps";
import FinishedIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import AnnotationsList from "./components/AnnotationsList";
import AnnotationTools from "./components/AnnotationTools";
import Canvas from "./components/Canvas";
import ConfigurationContainer from "./components/ConfigurationContainer";
import EditAnnotationDialog from "./components/EditAnnotationDialog";
import LabelsExplorer from "./components/LabelsExplorer";
import { useToolboxController } from "./hooks/use-toolbox-controller";
import {
  editAnnotation,
  selectEditing,
  setObjectId,
} from "./slice/annotations";
import {
  selectActiveLabelId,
  selectActiveTool,
  setActiveLabel,
} from "./slice/tools";
import {
  enhancedApi,
  useFinishObjectMutation,
  useGetImageUriQuery,
  useGetObjectQuery,
  useGetObjectsCountQuery,
} from "../../api/enhancedApi";
import { Label, useGetProjectQuery } from "../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  ObjectFilters,
  selectObjectFilters,
  updateObjectFilters,
} from "../../app/slice";
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

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { projectId, objectId } = useParams();

  const { currentData: _ } = useGetProjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );
  const { currentData: object } = useGetObjectQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId! },
    { skip: !objectId }
  );
  const { currentData: count } = useGetObjectsCountQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { projectId: projectId! },
    { skip: !projectId }
  );
  const { data: image } = useGetImageUriQuery(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    { objectId: objectId!, imageRequest: { height: 800 } },
    { skip: !objectId }
  );

  const activeTool = useAppSelector(selectActiveTool);
  const activeLabelId = useAppSelector(selectActiveLabelId);
  const editingAnnotation = useAppSelector(selectEditing);
  const filters = useAppSelector(selectObjectFilters);
  const toolbox = useToolboxController();

  const [getRandom, { isError: randomError }] =
    enhancedApi.useGetRandomObjectMutation();
  const [requestFinishObject] = useFinishObjectMutation();

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

    // explictly respond only on project or object change
    // TODO: in case this causes problems, add other deps
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

  const renderLeft = () => (
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
  );

  // TODO: maybe move this into a component to avoid tool and state dependency
  // this is tricky though, because if there is no tool pane, the whole sidebar should be hidden
  const renderRight = () => {
    return (
      <Stack
        sx={{
          width: "440px",
          borderLeft: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ConfigurationContainer tool={activeTool} loading={false} />
      </Stack>
    );
  };

  return (
    <Layout
      sx={{ display: "flex" }}
      header={
        <Toolbar
          tools={<AnnotationTools toolbox={toolbox} />}
          actions={renderActions()}
        />
      }
      left={renderLeft()}
      right={renderRight()}
    >
      <EditAnnotationDialog
        projectId={projectId}
        annotation={editingAnnotation}
        onClose={() => dispatch(editAnnotation(null))}
      />
      <Loader
        query={{
          isLoading: !projectId || (!image && !randomError),
          isError: randomError,
          data: image,
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
          <Canvas projectId={projectId} imageUri={imageUri} toolbox={toolbox} />
        )}
      />
    </Layout>
  );
};

export default AnnotatePage;
