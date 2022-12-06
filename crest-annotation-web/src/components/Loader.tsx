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
  render: (data: { isFetching?: boolean; data: T }) => ReactElement;
  emptyPlaceholder?: ReactNode;
  errorPlaceholder?: ReactNode;
  disabledPlaceholder?: ReactNode;
}

export default function Loader<T>({
  query,
  render,
  emptyPlaceholder,
  errorPlaceholder,
  disabledPlaceholder,
}: IProps<T>) {
  const { isLoading, isFetching, isError, isDisabled, data } = query;

  const CenterContainer = styled(Container)(({ theme }) => ({
    "&": {
      display: "flex",
      justifyContent: "center",
      padding: theme.spacing(3),
    },
  }));

  if (isLoading)
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

  if (Array.isArray(data) && data.length === 0)
    return (
      <CenterContainer>
        {emptyPlaceholder ?? <div>No data</div>}
      </CenterContainer>
    );

  return render({ isFetching, data });
}
