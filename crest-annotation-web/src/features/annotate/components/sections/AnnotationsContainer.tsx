import React, { useState } from "react";
import { LinkRounded } from "@mui/icons-material";
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
import { useObjectLock } from "../../hooks/use-object-lock";
import {
  Annotation,
  deleteAnnotation,
  hideAnnotation,
  lockAnnotation,
  selectAnnotations,
  selectExternal,
  showAnnotation,
  startEditAnnotation,
  toggleAnnotation,
  unlockAnnotation,
} from "../../slice/annotations";

const AnnotationsContainer = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const annotations = useAppSelector(selectAnnotations);
  const external = useAppSelector(selectExternal);
  const lock = useObjectLock();

  const [reference, setReference] = useState(false);

  const borderColor = (annotation: Annotation) => {
    // local only (not yet synchronized to external)
    if (!annotation.external) return theme.palette.error.dark;
    // local changes (but the annotation exists on external)
    if (annotation.dirty) return theme.palette.warning.dark;
    // external annotation (synced)
    return theme.palette.success.dark;
  };

  const renderListActions = () => {
    const background = (toggled: boolean) => {
      return toggled ? theme.palette.grey[300] : "transparent";
    };

    return (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton
          onClick={() => setReference((current) => !current)}
          sx={{ backgroundColor: background(reference) }}
          size="small"
        >
          <LinkRounded />
        </IconButton>
      </Stack>
    );
  };

  const renderItemActions = (annotation: Annotation) => {
    // editing is not allowed if object is not locked
    if (!lock) return null;

    return (
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
            disabled={annotation.locked}
            size="small"
          >
            <HiddenIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => dispatch(hideAnnotation(annotation))}
            disabled={annotation.locked}
            size="small"
          >
            <VisibleIcon />
          </IconButton>
        )}

        <IconButton
          onClick={() => dispatch(startEditAnnotation(annotation))}
          disabled={annotation.locked}
          size="small"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          onClick={() => dispatch(deleteAnnotation(annotation))}
          disabled={annotation.locked}
          size="small"
          color="error"
          // HACK: custom button alignment
          sx={{ marginRight: theme.spacing(1) }}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    );
  };

  return (
    <SidebarContainer title="Annotations" actions={renderListActions()}>
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
                secondaryAction={renderItemActions(annotation)}
              >
                <ListItemButton
                  onClick={() => dispatch(toggleAnnotation(annotation))}
                  selected={annotation.selected}
                  disableGutters
                  // reduce list item size
                  sx={{
                    minHeight: 40,
                    py: 0,
                    // show left border for external annotations
                    borderLeft: external
                      ? `solid 5px ${borderColor(annotation)}`
                      : "none",
                  }}
                >
                  <Dot
                    color={
                      annotation.label?.color ??
                      annotation.inlineLabel?.color ??
                      "white"
                    }
                  />
                  <ListItemText
                    primary={
                      annotation.label?.name ??
                      annotation.inlineLabel?.name ??
                      "Unnamed"
                    }
                    secondary={reference && annotation.id}
                    secondaryTypographyProps={{
                      // HACK: avoid overflowing action buttons
                      sx: { wordWrap: "break-word", pr: "100px" },
                    }}
                  />
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
