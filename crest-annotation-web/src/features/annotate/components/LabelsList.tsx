import React from "react";
import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Label, useGetProjectLabelsQuery } from "../../../api/openApi";
import Loader from "../../../components/Loader";

interface IProps {
  projectId?: string;
  selectLabel?: (label: Label) => void;
}

const defaultProps = {};

const LabelsList = ({ projectId, selectLabel }: IProps) => {
  return (
    <Loader
      emptyPlaceholder={
        <div>
          This project contains no labels. Go to the{" "}
          <Link href={`/project/{projectId}`}>project settings</Link> to create
          some and start annotating!
        </div>
      }
      query={useGetProjectLabelsQuery(
        { projectId: projectId! },
        { skip: !projectId }
      )}
      render={({ data: labels }) => (
        <List>
          {labels.map((label) => (
            <ListItem disablePadding key={label.id}>
              <ListItemButton
                onClick={selectLabel && (() => selectLabel(label))}
              >
                <ListItemText primary={label.name ?? "Unnamed"} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    />
  );
};

LabelsList.defaultProps = defaultProps;

export default LabelsList;
