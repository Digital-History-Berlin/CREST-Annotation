import React from "react";
import { ToggleButton } from "@mui/material";
// TODO: better icons
import PenIcon from "@mui/icons-material/Gesture";
import RectangleIcon from "@mui/icons-material/Crop";
import CircleIcon from "@mui/icons-material/RadioButtonUnchecked";
import Layout from "../../components/Layout";
import Toolbar from "../../components/Toolbar";
import ToolbarButtonGroup from "../../components/ToolbarButtonGroup";
import { Canvas } from "../canvas/Canvas";
import { selectActiveTool, setActiveTool, Tool } from "./slice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const AnnotatePage = () => {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectActiveTool);

  const renderTools = () => (
    <ToolbarButtonGroup
      exclusive
      value={activeTool}
      onChange={(_, value) => dispatch(setActiveTool(value))}
    >
      {[
        { tool: Tool.Pen, icon: PenIcon },
        { tool: Tool.Circle, icon: RectangleIcon },
        { tool: Tool.Rectangle, icon: CircleIcon },
      ].map((button) => {
        return (
          <ToggleButton value={button.tool}>{<button.icon />}</ToggleButton>
        );
      })}
    </ToolbarButtonGroup>
  );

  return (
    <Layout header={<Toolbar tools={renderTools()} />} left={<div></div>}>
      <Canvas />
    </Layout>
  );
};

export default AnnotatePage;
