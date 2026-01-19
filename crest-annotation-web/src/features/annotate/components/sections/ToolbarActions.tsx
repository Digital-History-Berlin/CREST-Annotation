import {
  Check,
  CloudUploadOutlined,
  Replay,
  SkipNext,
  SkipPrevious,
  Sync,
} from "@mui/icons-material";
import { Chip, Stack, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { selectObjectFilters } from "../../../../app/slice";
import StateSelect from "../../../../components/StateSelect";
import SyncSelect from "../../../../components/SyncSelect";
import {
  ToolbarButtonWithTooltip,
  ToolbarDivider,
  ToolbarIcon,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import { useObjectController } from "../../hooks/use-object-controller";
import {
  pushAnnotations,
  resetAnnotations,
  selectChangesCount,
  selectExternal,
  selectPullState,
  selectPushState,
  useAnnotationObject,
} from "../../slice/annotations";

const spin = keyframes(`
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
`);

const ToolbarActions = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const object = useAnnotationObject();

  const { finishObject, nextObject, previousObject, changeObjectFilters } =
    useObjectController();

  const filters = useAppSelector(selectObjectFilters);
  const external = useAppSelector(selectExternal);
  const changes = useAppSelector(selectChangesCount);
  const pulling = useAppSelector(selectPullState);
  const pushing = useAppSelector(selectPushState);

  const loading = pushing?.loading && pulling?.loading;

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
      {external && !loading && (
        <>
          <ToolbarDivider />
          <ToolbarButtonWithTooltip
            tooltip={"Synchronize to external annotation source"}
            disabled={!changes}
            onClick={() => dispatch(pushAnnotations())}
          >
            <CloudUploadOutlined />
          </ToolbarButtonWithTooltip>
          <ToolbarButtonWithTooltip
            tooltip={"Discard local changes"}
            onClick={() => dispatch(resetAnnotations())}
          >
            <Replay />
          </ToolbarButtonWithTooltip>
        </>
      )}
      {external && loading && (
        <>
          <ToolbarDivider />
          <ToolbarIcon>
            <Sync sx={{ animation: `${spin} 2s linear infinite` }} />
          </ToolbarIcon>
        </>
      )}
    </Stack>
  );
};

export default ToolbarActions;
