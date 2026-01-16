import React, { PropsWithChildren, ReactNode } from "react";
import { Box, Breakpoint, Container, Typography } from "@mui/material";
import { Logo } from "../Logo";

interface IProps {
  width?: false | Breakpoint;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

const defaultProps = {
  width: "xs",
};

const PlaceholderLayout = ({
  width,
  title,
  description,
  icon,
  children,
}: PropsWithChildren<IProps>) => {
  return (
    <Container maxWidth={width} sx={{ textAlign: "center" }}>
      {icon ? (
        // placement for custom icons
        <Box pt={6} pb={4} color="#ddd">
          {icon}
        </Box>
      ) : (
        <Logo height={140} color="#ddd" my={4} />
      )}
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
