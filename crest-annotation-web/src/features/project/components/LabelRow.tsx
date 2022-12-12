import React, { useState, useEffect } from "react";
import { Label } from "../../../api/openApi";
import {
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  styled,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Dot from "../../../components/Dot";

interface IProps {
  label: Label;
  defaultLoading?: boolean;
  autoFocus?: boolean;
  onChange: (label: Label) => void;
  onDelete?: (label: Label) => void;
}

const Row = styled(Box)(({ theme }) => ({
  "&": {
    backgroundColor: theme.palette.common.white,
    borderBottom: `1px solid ${theme.palette.divider}`,

    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
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
  const [changes, setChanges] = useState(label);
  const [loading, setLoading] = useState(false);

  const commitChanges = () => {
    // validate label
    if (changes.name === undefined) return;
    // check for actual changes
    if (changes.name !== label.name) {
      setLoading(true);
      onChange(changes);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.target.blur();
    }
  };

  // server data is pushed
  useEffect(() => {
    setLoading(defaultLoading || false);
    setChanges(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  return (
    <Row>
      <Dot color={label.color} />
      <InputBase
        fullWidth
        placeholder="Enter label name"
        autoFocus={autoFocus}
        value={changes.name}
        onKeyDown={handleKeyDown}
        onChange={(e) => setChanges({ ...changes, name: e.target.value })}
        onBlur={commitChanges}
      />
      {loading && <CircularProgress size="18px" />}
      {onDelete && (
        <IconButton color="error" onClick={() => onDelete(label)}>
          <DeleteIcon />
        </IconButton>
      )}
    </Row>
  );
};

export default LabelRow;
