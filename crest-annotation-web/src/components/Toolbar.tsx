import React, { CSSProperties, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Toolbar as MuiToolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { ToolbarButton } from "./ToolbarButton";
import { useMarkAsFinishedMutation } from "../api/enhancedApi";

interface IProps {
  title?: string;
  tools?: ReactNode;
  actions?: ReactNode;
  sx?: CSSProperties;
}

const defaultProps = {};

/**
 * Default header and toolbar
 *
 * Combines header and toolbar and should be used as the _header_ component
 * in all views with default layout.
 */
const Toolbar = ({ title, tools, actions, sx }: IProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [requestMarkAsFinished] = useMarkAsFinishedMutation();
  const { objectId } = useParams<{ objectId: string }>();

  const markAsFinished = async () => {
    if (objectId === undefined) return;
    await requestMarkAsFinished({
      objectId: objectId,
    }).unwrap();
  };

  return (
    <div
      style={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}
    >
      <MuiToolbar sx={sx}>
        <Box sx={{ flex: "1 0 0", justifyContent: "flex-start" }}>
          <ToolbarButton onClick={() => navigate("/")}>
            <Typography variant="h5" noWrap>
              CREST
            </Typography>
          </ToolbarButton>
        </Box>
        <Box>
          {title && (
            <Typography variant="h4" noWrap component="div">
              {title}
            </Typography>
          )}
          {tools}
        </Box>
        <Box sx={{ flex: "1 0 0", justifyContent: "flex-end" }}>{actions}</Box>
        <ToolbarButton onClick={() => markAsFinished()}>
          <Typography variant="h5" noWrap>
            Finish Image
          </Typography>
        </ToolbarButton>
      </MuiToolbar>
    </div>
  );
};

Toolbar.defaultProps = defaultProps;

export default Toolbar;
