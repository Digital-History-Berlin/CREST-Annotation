import { Stack } from "@mui/material";
import FinishedIcon from "@mui/icons-material/Check";
import SkipIcon from "@mui/icons-material/SkipNext";
import { useAppSelector } from "../../../../app/hooks";
import { selectObjectFilters } from "../../../../app/slice";
import StateSelect from "../../../../components/StateSelect";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import ToolbarTabs from "../../../../components/ToolbarTabs";
import { useObjectController } from "../../hooks/use-object-controller";
import { useAnnotationObject } from "../../slice/annotations";

const ToolbarActions = () => {
  const object = useAnnotationObject();

  const { finishObject, skipObject, changeObjectFilters } =
    useObjectController();

  const filters = useAppSelector(selectObjectFilters);

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
      <ToolbarTabs active="annotate" />
    </Stack>
  );
};

export default ToolbarActions;
