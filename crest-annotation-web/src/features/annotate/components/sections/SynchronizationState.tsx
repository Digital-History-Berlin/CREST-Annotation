import { CheckCircle, CloudDone, CloudOff, Error } from "@mui/icons-material";
import { Chip, CircularProgress, Tooltip } from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";
import {
  MiddlewareState,
  selectChangesCount,
  selectExternal,
  selectPullState,
  selectPushState,
} from "../../slice/annotations";

const middlewareLabel = (
  pulling?: MiddlewareState,
  pushing?: MiddlewareState
) => {
  if (pulling?.error) return "Pull failed";
  if (pushing?.error) return "Push failed";
  if (pulling?.loading) return "Pulling...";
  if (pushing?.loading) return "Pushing...";
  return "Synchronization failed";
};

const changeLabel = (changes: number) => {
  if (changes === 1) return "1 change";
  return `${changes} changes`;
};

export const SynchronizationState = () => {
  const pulling = useAppSelector(selectPullState);
  const pushing = useAppSelector(selectPushState);
  const changes = useAppSelector(selectChangesCount);
  const external = useAppSelector(selectExternal);

  if (pulling?.error || pushing?.error)
    return (
      <Chip
        icon={<Error />}
        size="small"
        color="error"
        label={middlewareLabel(pulling, pushing)}
      />
    );

  if (pulling?.loading || pushing?.loading)
    return (
      <Chip
        icon={<CircularProgress size={14} />}
        size="small"
        color="info"
        label={middlewareLabel(pulling, pushing)}
      />
    );

  if (changes)
    return (
      <Tooltip title="Some changes have not been pushed.">
        <Chip
          icon={external ? <CloudOff /> : <Error />}
          size="small"
          color="warning"
          label={changeLabel(changes)}
        />
      </Tooltip>
    );

  return (
    <Chip
      icon={external ? <CloudDone /> : <CheckCircle />}
      size="small"
      color="success"
      label="No changes"
    />
  );
};
