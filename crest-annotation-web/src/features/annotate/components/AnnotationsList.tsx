import React from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectAnnotations,
  selectAnnotation,
  unselectAnnotation,
  lockAnnotation,
  unlockAnnotation,
  hideAnnotation,
  showAnnotation,
  Annotation,
} from "../slice";
import {
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import LockedIcon from "@mui/icons-material/Lock";
import UnlockedIcon from "@mui/icons-material/LockOpen";
import VisibleIcon from "@mui/icons-material/Visibility";
import HiddenIcon from "@mui/icons-material/VisibilityOff";

const AnnotationsList = () => {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector(selectAnnotations);

  const toggleAnnotationSelection = (annotation: Annotation) =>
    annotation.selected
      ? dispatch(unselectAnnotation(annotation))
      : dispatch(selectAnnotation(annotation));

  return (
    <List>
      {annotations.map((annotation) => (
        <ListItem
          disablePadding
          key={annotation.id}
          secondaryAction={
            <Stack direction="row">
              {annotation.locked ? (
                <IconButton
                  onClick={() => dispatch(unlockAnnotation(annotation))}
                >
                  <LockedIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => dispatch(lockAnnotation(annotation))}
                >
                  <UnlockedIcon />
                </IconButton>
              )}

              {annotation.hidden ? (
                <IconButton
                  onClick={() => dispatch(showAnnotation(annotation))}
                >
                  <HiddenIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => dispatch(hideAnnotation(annotation))}
                >
                  <VisibleIcon />
                </IconButton>
              )}
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Stack>
          }
        >
          <ListItemButton
            onClick={() => toggleAnnotationSelection(annotation)}
            selected={annotation.selected}
            disableRipple
          >
            <ListItemText primary={annotation.label ?? "Unnamed"} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default AnnotationsList;
