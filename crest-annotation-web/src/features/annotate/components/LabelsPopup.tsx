import React from "react";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import Dot from "../../../components/Dot";
import Loader from "../../../components/Loader";

interface IProps {
  projectId?: string;
  onSelect?: (label: Label) => void;
  onCancel?: () => void;
}

const defaultProps = {};

const LabelsPopup = ({ projectId, onSelect, onCancel }: IProps) => {
  return (
    <Loader
      emptyPlaceholder="This project contains no labels"
      disabledPlaceholder={"No project selected"}
      query={{
        ...useGetProjectLabelsQuery(
          {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            projectId: projectId!,
            starred: true,
            grouped: false,
          },
          { skip: !projectId }
        ),
        isDisabled: !projectId,
      }}
      render={({ data: labels }) => {
        return (
          <List disablePadding>
            {labels?.map((label) => (
              <ListItem divider disablePadding disableGutters key={label.id}>
                <ListItemButton
                  disableGutters
                  onClick={onSelect && (() => onSelect(label))}
                >
                  <Dot color={label.color} />
                  <ListItemText primary={label.name ?? "Unnamed"} />
                </ListItemButton>
              </ListItem>
            ))}
            {onCancel && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={onCancel}
                  sx={{ justifyContent: "center" }}
                >
                  <CancelIcon color="error" sx={{ width: "20px" }} />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        );
      }}
    />
  );
};

LabelsPopup.defaultProps = defaultProps;

export default LabelsPopup;
