import React, { ReactNode } from "react";
import { Search } from "@mui/icons-material";
import { Box, Container, Grid, Pagination, Stack } from "@mui/material";
import Layout, { LayoutProps } from "./Layout";
import PlaceholderLayout from "./PlaceholderLayout";
import Loader from "../Loader";
import SearchBar from "../SearchBar";

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
  activeFilters?: boolean;
  renderCard: (item: T) => ReactNode;
  onChangePage: (page: number) => void;
  onSearch?: (search: string | undefined) => void;
}

type Props<T> = IProps<T> & LayoutProps;

const FiltersPlaceholder = () => {
  return (
    <PlaceholderLayout
      description={"No results found"}
      icon={<Search sx={{ fontSize: "4rem" }} />}
    />
  );
};

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
  activeFilters,
  renderCard,
  onChangePage,
  onSearch,
  ...props
}: Props<T>) {
  return (
    <Layout {...props} scrollable={true}>
      <Container maxWidth="md">
        {onSearch && <SearchBar onSearch={onSearch} />}
        <Loader
          loadOnFetch
          query={query}
          render={({ data }) => {
            const items = "items" in data ? data.items : data;
            if (!activeFilters && placeholder && items.length === 0)
              // evaluate placeholder on actual items
              return <>{placeholder}</>;

            return (
              <>
                <Grid container columns={{ xs: 2, sm: 4, md: 6 }} spacing={2}>
                  {items.map((item) => (
                    <Grid item key={item.id} xs={2} sm={2} md={2}>
                      {renderCard(item)}
                    </Grid>
                  ))}
                </Grid>
                {activeFilters && !items.length && <FiltersPlaceholder />}
                {"items" in data && !!items.length && (
                  <Stack mt={2} alignItems="flex-end">
                    <Pagination
                      count={data.pages}
                      page={data.page}
                      onChange={(_, page) => onChangePage(page)}
                    />
                  </Stack>
                )}
              </>
            );
          }}
        />
        <Box mt={2} sx={{ position: "sticky", bottom: 0 }}>
          {footer}
        </Box>
      </Container>
    </Layout>
  );
}
