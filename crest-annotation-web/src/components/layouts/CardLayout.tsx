import React, { ReactNode } from "react";
import { Box, Container, Grid, Pagination, Stack } from "@mui/material";
import Layout, { LayoutProps } from "./Layout";
import Loader from "../Loader";

interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  pages: number;
}

interface IProps<T> {
  query: {
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
    data?: T[] | Paginated<T>;
  };
  footer?: ReactNode;
  placeholder?: ReactNode;
  renderCard: (item: T) => ReactNode;
  onChangePage: (page: number) => void;
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
  onChangePage,
  ...props
}: Props<T>) {
  return (
    <Layout {...props} scrollable={true}>
      <Loader
        query={query}
        emptyPlaceholder={placeholder}
        render={({ data }) => {
          const items = "items" in data ? data.items : data;

          return (
            <Container maxWidth="md">
              <Grid container columns={{ xs: 2, sm: 4, md: 6 }} spacing={2}>
                {items.map((item) => (
                  <Grid item key={item.id} xs={2} sm={2} md={2}>
                    {renderCard(item)}
                  </Grid>
                ))}
              </Grid>
              {"items" in data && (
                <Stack mt={2} alignItems="flex-end">
                  <Pagination
                    count={data.pages}
                    page={data.page}
                    onChange={(_, page) => onChangePage(page)}
                  />
                </Stack>
              )}
              <Box mt={2} sx={{ position: "sticky", bottom: 0 }}>
                {footer}
              </Box>
            </Container>
          );
        }}
      />
    </Layout>
  );
}
