import React, { useState, useEffect } from "react";
import { Label } from "../../../api/openApi";
import {
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  styled,
} from "@mui/material";
import StarredIcon from "@mui/icons-material/Star";
import StarIcon from "@mui/icons-material/StarBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import Dot from "../../../components/Dot";

/// Adds rendering properties
export type PartialLabel = Partial<Omit<Label, "id">> & {
  id: string;
  loading?: boolean;
};

interface IProps {
  label: PartialLabel;
  defaultLoading?: boolean;
  autoFocus?: boolean;
  onChange: (label: PartialLabel) => void;
  onDelete?: (label: PartialLabel) => void;
}

const Row = styled(Box)(({ theme }) => ({
  "&": {
    backgroundColor: theme.palette.common.white,
    borderBottom: `1px solid ${theme.palette.divider}`,

    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto auto",
    alignItems: "center",

    height: "3rem",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),

    "& .MuiInputBase-root": {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
}));

const LabelRow = ({
  label,
  defaultLoading,
  autoFocus,
  onChange,
  onDelete,
}: IProps) => {
  const makePatch = (label: PartialLabel) => ({
    id: label.id,
    name: label.name,
    starred: !!label.starred,
  });

  const [changes, setChanges] = useState(makePatch(label));
  const [loading, setLoading] = useState(false);

  const commitChanges = (patch: PartialLabel) => {
    // validate label
    if (!patch.name) return;
    // check for actual changes
    if (patch.name !== label.name || patch.starred !== label.starred) {
      setLoading(true);
      onChange(patch);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  const onStar = () => {
    const patch = { ...changes, starred: !label.starred };
    // commit changes to server
    commitChanges(patch);
    // update optimistic update cache
    setChanges(patch);
  };

  // server data is pushed
  useEffect(() => {
    setLoading(false);
    setChanges(makePatch(label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  return (
    <Row onClick={(e) => e.stopPropagation()}>
      <Dot color={label.color ?? "#fff"} />
      <InputBase
        fullWidth
        placeholder="Enter label name"
        autoFocus={autoFocus}
        value={changes.name}
        onKeyDown={handleKeyDown}
        onChange={(e) => setChanges({ ...changes, name: e.target.value })}
        onBlur={() => commitChanges(changes)}
      />
      {loading && <CircularProgress size="18px" />}
      {label.starred !== undefined && (
        <IconButton sx={{ color: "#eb0" }} onClick={onStar}>
          {changes.starred ? <StarredIcon /> : <StarIcon />}
        </IconButton>
      )}
      {onDelete && (
        <IconButton color="error" onClick={() => onDelete(label)}>
          <DeleteIcon />
        </IconButton>
      )}
    </Row>
  );
};

export default LabelRow;
