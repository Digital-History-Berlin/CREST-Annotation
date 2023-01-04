import React from "react";
import { Box, styled } from "@mui/material";

interface IProps {
  color: string;
}

const defaultProps = {};

const DotBox = styled(Box)(({ theme }) => ({
  "&": {
    width: "14px",
    height: "14px",
    borderRadius: "7px",
    border: `1px solid ${theme.palette.divider}`,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

const Dot = ({ color }: IProps) => (
  <DotBox
    className="Dot"
    sx={{
      backgroundColor: color,
    }}
  />
);

Dot.defaultProps = defaultProps;

export default Dot;
