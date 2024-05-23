import React from "react";
import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockedIcon from "@mui/icons-material/Lock";
import UnlockedIcon from "@mui/icons-material/LockOpen";
import VisibleIcon from "@mui/icons-material/Visibility";
import HiddenIcon from "@mui/icons-material/VisibilityOff";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import Dot from "../../../../components/Dot";
import Loader from "../../../../components/Loader";
import SidebarContainer from "../../../../components/SidebarContainer";
import {
  Annotation,
  deleteAnnotation,
  hideAnnotation,
  lockAnnotation,
  selectAnnotations,
  showAnnotation,
  startEditAnnotation,
  toggleAnnotation,
  unlockAnnotation,
} from "../../slice/annotations";

const AnnotationsContainer = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const annotations = useAppSelector(selectAnnotations);

  const renderActions = (annotation: Annotation) => (
    <Stack direction="row">
      {annotation.locked ? (
        <IconButton
          onClick={() => dispatch(unlockAnnotation(annotation))}
          size="small"
        >
          <LockedIcon />
        </IconButton>
      ) : (
        <IconButton
          onClick={() => dispatch(lockAnnotation(annotation))}
          size="small"
        >
          <UnlockedIcon />
        </IconButton>
      )}

      {annotation.hidden ? (
        <IconButton
          onClick={() => dispatch(showAnnotation(annotation))}
          size="small"
        >
          <HiddenIcon />
        </IconButton>
      ) : (
        <IconButton
          onClick={() => dispatch(hideAnnotation(annotation))}
          size="small"
        >
          <VisibleIcon />
        </IconButton>
      )}

      <IconButton
        onClick={() => dispatch(startEditAnnotation(annotation))}
        size="small"
      >
        <EditIcon />
      </IconButton>
      <IconButton
        onClick={() => dispatch(deleteAnnotation(annotation))}
        size="small"
        // HACK: custom button alignment
        sx={{ marginRight: theme.spacing(1) }}
      >
        <DeleteIcon color="error" />
      </IconButton>
    </Stack>
  );

  return (
    <SidebarContainer title="Annotations">
      <Loader
        emptyPlaceholder={"Start drawing to create annotations."}
        query={{ data: annotations }}
        render={({ data: annotations }) => (
          <List disablePadding>
            {annotations.map((annotation) => (
              <ListItem
                divider
                disablePadding
                disableGutters
                key={annotation.id}
                secondaryAction={renderActions(annotation)}
              >
                <ListItemButton
                  onClick={() => dispatch(toggleAnnotation(annotation))}
                  selected={annotation.selected}
                  disableGutters
                >
                  <Dot color={annotation.label?.color ?? "white"} />
                  <ListItemText primary={annotation.label?.name ?? "Unnamed"} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      />
    </SidebarContainer>
  );
};

export default AnnotationsContainer;
