import React, { useCallback } from "react";
import { Icon } from "@iconify/react";
import { PriorityHigh } from "@mui/icons-material";
import { CircularProgress, Stack, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import { activateTool, toggleToolboxModifier } from "../../slice/toolbox";
import { Modifiers, Tool } from "../../types/toolbox";

const toolsInfo = [
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

const modifiersInfo = [
  {
    modifier: Modifiers.Group,
    icon: "mdi:vector-link",
    style: { fontSize: "25px" },
  },
];

const ToolbarTools = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const tool = useAppSelector((state) => state.toolbox.selection.tool);

  const handleActivate = useCallback(
    (tool: Tool) => {
      dispatch(activateTool({ tool }));
    },
    [dispatch]
  );

  const modifiers = useAppSelector(
    (state) => state.toolbox.selection.modifiers
  );

  const toggleModifier = useCallback(
    // TODO: implement side effects from activation
    (modifier: Modifiers) => dispatch(toggleToolboxModifier(modifier)),
    [dispatch]
  );

  return (
    <Stack direction="row">
      {toolsInfo.map((button, index) => {
        if (button.tool === undefined) return <ToolbarDivider key={index} />;
        const selected = tool === button.tool;

        //const { status } = toolStates[button.tool];
        const ready = true; //!active || status === ToolStatus.Ready;
        const loading = false; //active && status === ToolStatus.Loading;
        const failed = false; //active && status === ToolStatus.Failed;

        return (
          <ToolbarToggleButtonWithTooltip
            key={index}
            value={button.tool}
            onClick={() => handleActivate(button.tool)}
            selected={selected}
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
      {modifiersInfo.map((button) => {
        return (
          <ToolbarToggleButtonWithTooltip
            key={button.modifier}
            value={button.modifier}
            onClick={() => toggleModifier(button.modifier)}
            selected={modifiers.includes(button.modifier)}
            tooltip={"Group Annotations"}
          >
            <Icon icon={button.icon} style={button.style} />
          </ToolbarToggleButtonWithTooltip>
        );
      })}
    </Stack>
  );
};

export default ToolbarTools;
