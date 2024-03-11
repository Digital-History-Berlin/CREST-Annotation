import React from "react";
import { Icon } from "@iconify/react";
import { PriorityHigh } from "@mui/icons-material";
import { CircularProgress, Stack, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../components/ToolbarButton";
import {
  Modifiers,
  Tool,
  ToolState,
  selectActiveModifiers,
  selectActiveState,
  selectActiveTool,
  toggleModifier,
} from "../slice/tools";

const tools = [
  {
    tool: Tool.Pen,
    icon: "majesticons:edit-pen-4-line",
    style: { fontSize: "22px" },
    tooltip: "Pen",
  },
  {
    tool: Tool.Rectangle,
    icon: "mdi:vector-square",
    style: { fontSize: "25px" },
    tooltip: "Rectangle",
  },
  {
    tool: Tool.Circle,
    icon: "mdi:vector-circle-variant",
    style: { fontSize: "25px" },
    tooltip: "Circle",
  },
  {
    tool: Tool.Polygon,
    icon: "mdi:vector-polygon-variant",
    style: { fontSize: "25px" },
    tooltip: "Polygon",
  },
  { tool: undefined },
  {
    tool: Tool.Edit,
    icon: "mdi:vector-polyline-edit",
    style: { fontSize: "25px" },
    tooltip: "Edit",
  },
  { tool: undefined },
  {
    tool: Tool.Segment,
    icon: "mdi:auto-fix",
    style: { fontSize: "25px" },
    tooltip: "Segment",
  },
];

const modifiers = [
  {
    modifier: Modifiers.Group,
    icon: "mdi:vector-link",
    style: { fontSize: "25px" },
  },
];

interface IProps {
  onActivate: (tool: Tool) => void;
}

const AnnotationTools = ({ onActivate }: IProps) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const activeTool = useAppSelector(selectActiveTool);
  const activeState = useAppSelector(selectActiveState);
  const activeModifiers = useAppSelector(selectActiveModifiers);

  return (
    <Stack direction="row">
      {tools.map((button, index) => {
        if (button.tool === undefined) return <ToolbarDivider key={index} />;
        const active = activeTool === button.tool;
        const ready = !active || activeState === ToolState.Ready;
        const loading = active && activeState === ToolState.Loading;
        const failed = active && activeState === ToolState.Failed;

        return (
          <ToolbarToggleButtonWithTooltip
            key={index}
            value={button.tool}
            onClick={() => onActivate(button.tool)}
            selected={active}
            tooltip={button.tooltip}
          >
            <Icon
              icon={button.icon}
              style={{ ...button.style }}
              color={!ready ? theme.palette.primary.dark : undefined}
            />
            {loading && (
              <CircularProgress
                style={{ color: "white", position: "absolute" }}
                size={32}
              />
            )}
            {failed && (
              <PriorityHigh style={{ color: "white", position: "absolute" }} />
            )}
          </ToolbarToggleButtonWithTooltip>
        );
      })}
      <ToolbarDivider />
      {modifiers.map((button) => {
        return (
          <ToolbarToggleButtonWithTooltip
            key={button.modifier}
            value={button.modifier}
            onClick={() => dispatch(toggleModifier(button.modifier))}
            selected={activeModifiers.includes(button.modifier)}
            tooltip={"Group Annotations"}
          >
            <Icon icon={button.icon} style={button.style} />
          </ToolbarToggleButtonWithTooltip>
        );
      })}
    </Stack>
  );
};

export default AnnotationTools;
