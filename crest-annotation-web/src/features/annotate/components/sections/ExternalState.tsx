import { CloudDone, CloudOff } from "@mui/icons-material";
import { Chip, Tooltip } from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";
import { selectChangesCount, selectExternal } from "../../slice/annotations";

export const ExternalState = () => {
  const changes = useAppSelector(selectChangesCount);
  const external = useAppSelector(selectExternal);

  // no synchronization state needed
  if (!external) return null;

  // unsynchronized changes
  if (changes)
    return (
      <Tooltip title="Some changes have not been synchronized to the external annotation source.">
        <Chip
          icon={<CloudOff />}
          size="small"
          color="warning"
          label={changes === 1 ? "1 change" : `${changes} changes`}
        />
      </Tooltip>
    );

  // everything synchronized
  return (
    <Chip
      icon={<CloudDone />}
      size="small"
      color="success"
      label="No changes"
    />
  );
};
