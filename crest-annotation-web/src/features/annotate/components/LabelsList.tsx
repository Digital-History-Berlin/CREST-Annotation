import React from "react";
import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { Label } from "../../../api/openApi";
import Loader from "../../../components/Loader";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import Dot from "../../../components/Dot";

interface IProps {
  projectId?: string;
  selected?: Label;
  onSelect?: (label: Label) => void;
  onCancel?: () => void;
}

const defaultProps = {};

const LabelsList = ({ projectId, selected, onSelect, onCancel }: IProps) => {
  const theme = useTheme();

  return (
    <Loader
      emptyPlaceholder={
        <div>
          This project contains no labels. Go to the{" "}
          <Link href={`/project/${projectId}`}>project settings</Link> to create
          some and start annotating!
        </div>
      }
      disabledPlaceholder={"No project selected"}
      query={{
        ...useGetProjectLabelsQuery(
          { projectId: projectId! },
          { skip: !projectId }
        ),
        isDisabled: !projectId,
      }}
      render={({ data: labels }) => (
        <List disablePadding>
          {labels.map((label) => (
            <ListItem divider disablePadding key={label.id}>
              <ListItemButton
                selected={selected?.id === label.id}
                onClick={onSelect && (() => onSelect(label))}
              >
                <ListItemIcon>
                  <Dot color={label.color} />
                </ListItemIcon>
                <ListItemText
                  primary={label.name ?? "Unnamed"}
                  primaryTypographyProps={{
                    fontWeight:
                      // make sure user knows about active label
                      selected?.id === label.id ? "bold" : "normal",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {onCancel && (
            <ListItemButton onClick={onCancel}>
              <ListItemText
                primary="Abbrechen"
                primaryTypographyProps={{ color: theme.palette.warning.main }}
              />
            </ListItemButton>
          )}
        </List>
      )}
    />
  );
};

LabelsList.defaultProps = defaultProps;

export default LabelsList;
