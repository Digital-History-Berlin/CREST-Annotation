import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useAppSelector } from "../../../../app/hooks";
import SidebarContainer from "../../../../components/SidebarContainer";
import { configPaneRegistry } from "../../toolbox";

/// Renders a configuration pane for an arbitrary tool
const ConfigurationContainer = () => {
  const tool = useAppSelector((state) => state.toolbox.selection.tool);
  // TODO
  const loading = false;

  const Component = configPaneRegistry[tool];
  if (Component === undefined) return null;

  return (
    <SidebarContainer title={"Tool"}>
      <Backdrop open={loading} sx={{ position: "absolute", zIndex: 99 }}>
        <CircularProgress sx={{ color: "white" }} />
      </Backdrop>
      <Box sx={{ pointerEvents: loading ? "none" : undefined }}>
        <Component />
      </Box>
    </SidebarContainer>
  );
};

export default ConfigurationContainer;
