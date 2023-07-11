import React from "react";
import { MenuItem, SelectProps } from "@mui/material";
import { ToolbarSelect } from "./ToolbarSelect";

type IProps = {
  annotated?: boolean;
  onChange?: (annotated: boolean | undefined) => void;
} & Omit<SelectProps, "label" | "value" | "onChange">;

const StateSelect = ({ annotated, onChange, ...other }: IProps) => {
  const state =
    annotated === true ? "labeled" : annotated === false ? "unlabeled" : "all";

  const mapState = (state: string) =>
    state === "labeled" ? true : state === "unlabeled" ? false : undefined;

  return (
    <ToolbarSelect
      size="small"
      value={state}
      label="State"
      onChange={(e) => onChange?.(mapState(e.target.value as string))}
      {...other}
    >
      <MenuItem value={"all"}>All</MenuItem>
      <MenuItem value={"labeled"}>Labeled</MenuItem>
      <MenuItem value={"unlabeled"}>Unlabeled</MenuItem>
    </ToolbarSelect>
  );
};

export default StateSelect;
