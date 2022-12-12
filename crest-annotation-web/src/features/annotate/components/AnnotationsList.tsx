import React from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectAnnotations,
  deleteAnnotation,
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
import Loader from "../../../components/Loader";

interface IProps {
  projectId?: string;
}

const defaultProps = {};

const AnnotationsList = ({ projectId }: IProps) => {
  const dispatch = useAppDispatch();
  const annotations = useAppSelector(selectAnnotations);

  const toggleAnnotationSelection = (annotation: Annotation) =>
    annotation.selected
      ? dispatch(unselectAnnotation(annotation))
      : dispatch(selectAnnotation(annotation));

  const renderActions = (annotation: Annotation) => (
    <Stack direction="row">
      {annotation.locked ? (
        <IconButton onClick={() => dispatch(unlockAnnotation(annotation))}>
          <LockedIcon />
        </IconButton>
      ) : (
        <IconButton onClick={() => dispatch(lockAnnotation(annotation))}>
          <UnlockedIcon />
        </IconButton>
      )}

      {annotation.hidden ? (
        <IconButton onClick={() => dispatch(showAnnotation(annotation))}>
          <HiddenIcon />
        </IconButton>
      ) : (
        <IconButton onClick={() => dispatch(hideAnnotation(annotation))}>
          <VisibleIcon />
        </IconButton>
      )}

      <IconButton onClick={() => dispatch(deleteAnnotation(annotation))}>
        <DeleteIcon color="error" />
      </IconButton>
    </Stack>
  );

  return (
    <Loader
      emptyPlaceholder={"Start drawing to create annotations."}
      disabledPlaceholder={"No project selected"}
      query={{ isDisabled: !projectId, data: annotations }}
      render={({ data: annotations }) => (
        <List disablePadding>
          {annotations.map((annotation) => (
            <ListItem
              divider
              disablePadding
              key={annotation.id}
              secondaryAction={renderActions(annotation)}
            >
              <ListItemButton
                onClick={() => toggleAnnotationSelection(annotation)}
                selected={annotation.selected}
                disableRipple
              >
                <ListItemText primary={annotation.label?.name ?? "Unnamed"} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    />
  );
};

AnnotationsList.defaultProps = defaultProps;

export default AnnotationsList;
