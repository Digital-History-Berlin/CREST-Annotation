import React, { ReactElement, ReactNode } from "react";
import { CircularProgress, Container, styled } from "@mui/material";

interface IProps<T> {
  query: {
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
    isDisabled?: boolean;
    data?: T;
  };
  loadOnFetch?: boolean;
  render: (data: { isFetching?: boolean; data: T }) => ReactElement;
  emptyPlaceholder?: ReactNode;
  errorPlaceholder?: ReactNode;
  disabledPlaceholder?: ReactNode;
}

const CenterContainer = styled(Container)(({ theme }) => ({
  "&": {
    display: "flex",
    justifyContent: "center",
    padding: theme.spacing(3),
  },
}));

export default function Loader<T>({
  query,
  loadOnFetch,
  render,
  emptyPlaceholder,
  errorPlaceholder,
  disabledPlaceholder,
}: IProps<T>) {
  const { isLoading, isFetching, isError, isDisabled, data } = query;

  if (isLoading || (isFetching && loadOnFetch))
    return (
      <CenterContainer>
        <CircularProgress />
      </CenterContainer>
    );

  if (isDisabled)
    return (
      <CenterContainer>
        {disabledPlaceholder ?? <div>Not available</div>}
      </CenterContainer>
    );

  if (data === undefined || isError)
    return (
      <CenterContainer>
        {errorPlaceholder ?? <div>Failed to data</div>}
      </CenterContainer>
    );

  if (Array.isArray(data) && data.length === 0 && emptyPlaceholder)
    return <CenterContainer>{emptyPlaceholder}</CenterContainer>;

  return render({ isFetching, data });
}
