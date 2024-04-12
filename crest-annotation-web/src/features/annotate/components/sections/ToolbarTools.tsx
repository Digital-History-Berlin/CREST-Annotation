import React, { CSSProperties, useCallback } from "react";
import { Icon } from "@iconify/react";
import { PriorityHigh } from "@mui/icons-material";
import { CircularProgress, Stack, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  ToolbarDivider,
  ToolbarToggleButtonWithTooltip,
} from "../../../../components/ToolbarButton";
import { useToolInfo } from "../../hooks/use-tool-info";
import { activateTool, toggleToolboxModifier } from "../../slice/toolbox";
import { Modifiers, Tool, ToolGroup, ToolStatus } from "../../types/toolbox";

const groupsInfo = [ToolGroup.Edit, ToolGroup.Shape, ToolGroup.Backend];

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
  const info = useToolInfo();

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
      {groupsInfo.map((group, i) => (
        <>
          {info
            .filter((info) => info.group === group)
            .map((info) => {
              const selected = tool === info.tool;
              const ready = info.status === ToolStatus.Ready;
              const loading = info.status === ToolStatus.Loading;
              const failed = info.status === ToolStatus.Failed;

              return (
                <ToolbarToggleButtonWithTooltip
                  key={info.tool}
                  value={info.tool}
                  onClick={() => handleActivate(info.tool)}
                  selected={selected}
                  tooltip={info.icon.tooltip}
                >
                  <Icon
                    icon={info.icon.name}
                    style={info.icon.style as CSSProperties}
                    color={!ready ? theme.palette.primary.dark : undefined}
                  />
                  {loading && (
                    <CircularProgress
                      style={{ color: "white", position: "absolute" }}
                      size={32}
                    />
                  )}
                  {failed && (
                    <PriorityHigh
                      style={{ color: "white", position: "absolute" }}
                    />
                  )}
                </ToolbarToggleButtonWithTooltip>
              );
            })}
          <ToolbarDivider key={i} />
        </>
      ))}
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
