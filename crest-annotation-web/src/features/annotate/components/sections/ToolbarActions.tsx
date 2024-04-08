import { useCallback } from "react";
import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ObjectsIcon from "@mui/icons-material/Apps";
import FinishedIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import SkipIcon from "@mui/icons-material/SkipNext";
import { useAppSelector } from "../../../../app/hooks";
import { selectObjectFilters } from "../../../../app/slice";
import StateSelect from "../../../../components/StateSelect";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import { useObjectController } from "../../hooks/use-object-controller";
import {
  useAnnotationObject,
  useAnnotationProject,
} from "../../slice/annotations";

const ToolbarActions = () => {
  const navigate = useNavigate();
  const project = useAnnotationProject();
  const object = useAnnotationObject();

  const { finishObject, skipObject, changeObjectFilters } =
    useObjectController();

  const filters = useAppSelector(selectObjectFilters);

  const navigateSettings = useCallback(
    () => navigate(`/project/${project.id}`),
    [navigate, project]
  );

  const navigateObjects = useCallback(
    () => navigate(`/objects/${project.id}`),
    [navigate, project]
  );

  return (
    <Stack direction="row">
      <StateSelect
        annotated={filters.annotated}
        onChange={changeObjectFilters}
      />
      <ToolbarDivider />
      <ToolbarToggleButtonWithTooltip
        value={"annotated"}
        onClick={finishObject}
        selected={!!object?.annotated}
        tooltip={"Finish Image"}
      >
        <FinishedIcon />
      </ToolbarToggleButtonWithTooltip>
      <ToolbarButtonWithTooltip onClick={skipObject} tooltip={"Next Image"}>
        <SkipIcon />
      </ToolbarButtonWithTooltip>
      <ToolbarDivider />
      <ToolbarButtonWithTooltip
        onClick={navigateObjects}
        tooltip={"Project Overview"}
      >
        <ObjectsIcon />
      </ToolbarButtonWithTooltip>
      <ToolbarButtonWithTooltip onClick={navigateSettings} tooltip={"Settings"}>
        <SettingsIcon />
      </ToolbarButtonWithTooltip>
    </Stack>
  );
};

export default ToolbarActions;
