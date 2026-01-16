import React from "react";
import { MenuItem, TextFieldProps } from "@mui/material";
import { ToolbarSelect } from "./ToolbarSelect";

type IProps = {
  synced?: boolean;
  onChange?: (synced: boolean | undefined) => void;
} & Omit<TextFieldProps, "label" | "value" | "onChange">;

const SyncSelect = ({ synced, onChange, ...other }: IProps) => {
  const state =
    synced === true ? "synced" : synced === false ? "unsynced" : "all";

  const mapState = (state: string) =>
    state === "synced" ? true : state === "unsynced" ? false : undefined;

  return (
    <ToolbarSelect
      value={state}
      label="Synchronization"
      onChange={(e) => onChange?.(mapState(e.target.value as string))}
      {...other}
    >
      <MenuItem value={"all"}>All</MenuItem>
      <MenuItem value={"synced"}>Synchronized</MenuItem>
      <MenuItem value={"unsynced"}>Not synchronized</MenuItem>
    </ToolbarSelect>
  );
};

export default SyncSelect;
