import { CloudUpload, LockReset } from "@mui/icons-material";
import { Stack } from "@mui/material";
import FinishedIcon from "@mui/icons-material/Check";
import SkipIcon from "@mui/icons-material/SkipNext";
import { useAppSelector } from "../../../../app/hooks";
import { selectObjectFilters } from "../../../../app/slice";
import StateSelect from "../../../../components/StateSelect";
import SyncSelect from "../../../../components/SyncSelect";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import ToolbarTabs from "../../../../components/ToolbarTabs";
import { useObjectController } from "../../hooks/use-object-controller";
import { selectExternal, useAnnotationObject } from "../../slice/annotations";

const ToolbarActions = () => {
  const object = useAnnotationObject();

  const { finishObject, skipObject, changeObjectFilters } =
    useObjectController();

  const filters = useAppSelector(selectObjectFilters);
  const external = useAppSelector(selectExternal);

  return (
    <Stack direction="row" alignItems="center">
      <StateSelect
        annotated={filters.annotated}
        onChange={(annotated) => changeObjectFilters({ annotated })}
      />
      <SyncSelect
        synced={filters.synced}
        onChange={(synced) => changeObjectFilters({ synced })}
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
      {external && (
        <ToolbarButtonWithTooltip onClick={skipObject} tooltip={"Next Image"}>
          <CloudUpload />
        </ToolbarButtonWithTooltip>
      )}
      {external && (
        <ToolbarButtonWithTooltip onClick={skipObject} tooltip={"Next Image"}>
          <LockReset />
        </ToolbarButtonWithTooltip>
      )}
      <ToolbarDivider />
      <ToolbarTabs active="annotate" />
    </Stack>
  );
};

export default ToolbarActions;
