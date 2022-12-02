import React from "react";
import {
  Container,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  useTheme,
} from "@mui/material";
import { useGetProjectLabelsQuery } from "../../../api/openApi";

interface IProps {
  projectId?: string;
}

const defaultProps = {};

const LabelsList = ({ projectId }: IProps) => {
  const theme = useTheme();

  const {
    data: labels,
    isLoading,
    isError,
  } = useGetProjectLabelsQuery({ projectId: projectId! }, { skip: !projectId });

  if (isLoading)
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: theme.spacing(3),
        }}
      >
        <CircularProgress />
      </Container>
    );

  if (labels === undefined || isError)
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: theme.spacing(3),
        }}
      >
        Failed to load labels
      </Container>
    );

  return (
    <List>
      {labels.map((label) => (
        <ListItemButton key={label.id}>
          <ListItemText primary={label.name ?? "Unnamed"} />
        </ListItemButton>
      ))}
    </List>
  );
};

LabelsList.defaultProps = defaultProps;

export default LabelsList;
