import {
  Check,
  CloudUpload,
  LockReset,
  SkipNext,
  SkipPrevious,
} from "@mui/icons-material";
import { Chip, Stack, useTheme } from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";
import { selectObjectFilters } from "../../../../app/slice";
import StateSelect from "../../../../components/StateSelect";
import SyncSelect from "../../../../components/SyncSelect";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import { useObjectController } from "../../hooks/use-object-controller";
import { selectExternal, useAnnotationObject } from "../../slice/annotations";

const ToolbarActions = () => {
  const theme = useTheme();
  const object = useAnnotationObject();

  const { finishObject, nextObject, previousObject, changeObjectFilters } =
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
      <Chip
        // user readable offset
        label={object.position}
        sx={{ background: theme.palette.grey[100] }}
      />
      <ToolbarButtonWithTooltip
        onClick={previousObject}
        tooltip={"Previous Image"}
      >
        <SkipPrevious />
      </ToolbarButtonWithTooltip>
      <ToolbarToggleButtonWithTooltip
        value={"annotated"}
        onClick={finishObject}
        selected={!!object?.annotated}
        tooltip={"Finish Image"}
      >
        <Check />
      </ToolbarToggleButtonWithTooltip>
      <ToolbarButtonWithTooltip onClick={nextObject} tooltip={"Next Image"}>
        <SkipNext />
      </ToolbarButtonWithTooltip>
      {external && (
        <>
          <ToolbarDivider />
          <ToolbarButtonWithTooltip
            tooltip={"Synchronize to external annotation source"}
          >
            <CloudUpload />
          </ToolbarButtonWithTooltip>
          <ToolbarButtonWithTooltip tooltip={"Discard local changes"}>
            <LockReset />
          </ToolbarButtonWithTooltip>
        </>
      )}
    </Stack>
  );
};

export default ToolbarActions;
