import { Backdrop, Box, CircularProgress } from "@mui/material";
import SidebarContainer from "../../../components/SidebarContainer";
import { useRegistry } from "../hooks/use-registry";
import { Tool } from "../types/tools";

interface IProps {
  tool: Tool;
  loading: boolean;
}

/**
 * Renders a config pane of arbitrary type
 *
 * Simplifies the use of different config panes.
 * Contains shared logic between different panes,
 * like loading spinner or empty pane.
 */
const ConfigurationContainer = ({ tool, loading }: IProps) => {
  const { configPaneRegistry } = useRegistry();
  const Component = configPaneRegistry[tool];
  // TODO: hide container if empty
  if (Component === undefined) return <SidebarContainer></SidebarContainer>;

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
