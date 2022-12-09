import React, { ReactNode } from "react";
import { Box, Breakpoint, Container, Typography } from "@mui/material";

interface IProps {
  width?: false | Breakpoint;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

const defaultProps = {
  width: "xs",
};

const PlaceholderLayout = ({ width, title, description, children }: IProps) => {
  return (
    <Container maxWidth={width}>
      {title && <Typography variant="h5">{title}</Typography>}
      {description && (
        <Typography variant="body1" mt={1}>
          {description}
        </Typography>
      )}
      <Box mt={4}>{children}</Box>
    </Container>
  );
};

PlaceholderLayout.defaultProps = defaultProps;

export default PlaceholderLayout;
