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
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
}));

const Dot = ({ color }: IProps) => <DotBox sx={{ backgroundColor: color }} />;

Dot.defaultProps = defaultProps;

export default Dot;
