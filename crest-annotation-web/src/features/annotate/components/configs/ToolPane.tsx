import { PropsWithChildren } from "react";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import SegmentPane from "./SegmentPane";
import SidebarContainer from "../../../../components/SidebarContainer";
import { Tool } from "../../slice/tools";

export const toolPaneMap = {
  [Tool.Pen]: undefined,
  [Tool.Circle]: undefined,
  [Tool.Rectangle]: undefined,
  [Tool.Polygon]: undefined,
  [Tool.Edit]: undefined,
  [Tool.Segment]: SegmentPane,
};

interface IProps {
  loading: boolean;
}

export const ToolPane = ({ loading, children }: PropsWithChildren<IProps>) => {
  return (
    <SidebarContainer title={"Tool"}>
      <Backdrop open={loading} sx={{ position: "absolute", zIndex: 99 }}>
        <CircularProgress sx={{ color: "white" }} />
      </Backdrop>
      <Box sx={{ pointerEvents: loading ? "none" : undefined }}>{children}</Box>
    </SidebarContainer>
  );
};
