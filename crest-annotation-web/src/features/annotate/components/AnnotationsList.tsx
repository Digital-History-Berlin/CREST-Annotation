import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectAnnotations } from "../slice";
import { List, ListItemButton, ListItemText } from "@mui/material";

const AnnotationsList = () => {
  const annotations = useAppSelector(selectAnnotations);

  return (
    <List>
      {annotations.map((annotation) => (
        <ListItemButton key={annotation.id}>
          <ListItemText primary={annotation.label ?? "Unnamed"} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default AnnotationsList;
