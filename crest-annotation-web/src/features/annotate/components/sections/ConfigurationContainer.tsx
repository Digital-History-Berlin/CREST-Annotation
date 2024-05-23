import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";
import SidebarContainer from "../../../../components/SidebarContainer";
import { useToolStateSelector } from "../../hooks/use-tool-state";
import { selectToolboxTool } from "../../slice/toolbox";
import { configPaneRegistry, selectorsRegistry } from "../../toolbox";
import { CvToolState } from "../../toolbox/cv/types";
import { Tool, ToolStatus } from "../../types/toolbox";

/// Renders a configuration pane for an arbitrary tool
const ConfigurationContainer = () => {
  const tool = useAppSelector(selectToolboxTool);
  const status = useToolStateSelector(tool, selectorsRegistry[tool].status);
  const loading = status === ToolStatus.Loading;

  // HACK: the CV tool changes the display configuration pane
  // track the algorithm state to ensure it is reloaded
  useToolStateSelector<CvToolState, unknown>(
    Tool.Cv,
    (state) => state?.algorithm
  );

  const Component = configPaneRegistry[tool];
  if (Component === undefined) return null;

  return (
    <SidebarContainer title="Tool configuration">
      <Backdrop
        open={loading}
        sx={{
          position: "absolute",
          zIndex: 99,
        }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </Backdrop>
      <Box
        sx={{
          pointerEvents: loading ? "none" : undefined,
          height: "100%",
        }}
      >
        <Component />
      </Box>
    </SidebarContainer>
  );
};

export default ConfigurationContainer;
