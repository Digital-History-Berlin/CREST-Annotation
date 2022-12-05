import React, { ReactElement } from "react";
import { CircularProgress, Container, styled } from "@mui/material";

interface IProps<T> {
  query: {
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    data?: T;
  };
  render: (data: { isFetching: boolean; data: T }) => ReactElement;
  error?: string;
}

export default function Loader<T>({ query, render, error }: IProps<T>) {
  const { isLoading, isFetching, isError, data } = query;

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

  if (data === undefined || isError)
    return (
      <CenterContainer>
        <div>{error ?? "Failed to data"}</div>
      </CenterContainer>
    );

  return render({ isFetching, data });
}
