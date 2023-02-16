import React, { ReactNode } from "react";
import { Box, Container, Grid } from "@mui/material";
import Layout, { LayoutProps } from "./Layout";
import Loader from "../Loader";

interface IProps<T> {
  query: {
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
    data?: T[];
  };
  footer?: ReactNode;
  placeholder?: ReactNode;
  renderCard: (item: T) => ReactNode;
}

type Props<T> = IProps<T> & LayoutProps;

/**
 * Special application layout
 *
 * Shows a list of objects as a grid of cards.
 * Can be used instead of the default layout.
 */
export default function CardLayout<T extends { id: string }>({
  query,
  footer,
  placeholder,
  renderCard,
  ...props
}: Props<T>) {
  return (
    <Layout {...props} scrollable={true}>
      <Loader
        query={query}
        emptyPlaceholder={placeholder}
        render={({ data }) => (
          <Container maxWidth="md">
            <Grid container columns={{ xs: 2, sm: 4, md: 6 }} spacing={2}>
              {data.map((item) => (
                <Grid item key={item.id} xs={2} sm={2} md={2}>
                  {renderCard(item)}
                </Grid>
              ))}
            </Grid>
            <Box mt={2} sx={{ sticky: "bottom" }}>
              {footer}
            </Box>
          </Container>
        )}
      />
    </Layout>
  );
}
