import React, { useState } from "react";
import {
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  useTheme,
} from "@mui/material";
import OpenIcon from "@mui/icons-material/ChevronRight";
import ListView from "@mui/icons-material/List";
import StarredView from "@mui/icons-material/Star";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Label } from "../../../api/openApi";
import Dot from "../../../components/Dot";
import Loader from "../../../components/Loader";
import SidebarContainer from "../../../components/SidebarContainer";

interface IProps {
  projectId?: string;
  selected?: string;
  onSelect?: (label: Label) => void;
}

const defaultProps = {};

const LabelsExplorer = ({ projectId, selected, onSelect }: IProps) => {
  const theme = useTheme();

  // first label is currently active
  const [stack, setStack] = useState<Label[]>([]);
  const [view, setView] = useState("list");

  const labelsQuery = useGetProjectLabelsQuery(
    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      projectId: projectId!,
      starred: view === "starred" ? true : undefined,
      grouped: view === "list",
    },
    { skip: !projectId }
  );

  const pushLabel = (label: Label) => {
    setStack([label, ...stack]);
  };

  const popLabel = () => {
    setStack(stack?.slice(1));
  };

  const renderListActions = () => {
    const background = (self: string) => {
      return view === self ? theme.palette.grey[300] : "transparent";
    };

    return (
      <Stack direction="row">
        <IconButton
          onClick={() => setView("list")}
          sx={{ backgroundColor: background("list") }}
          size="small"
        >
          <ListView />
        </IconButton>
        <IconButton
          onClick={() => setView("starred")}
          sx={{ backgroundColor: background("starred") }}
          size="small"
        >
          <StarredView />
        </IconButton>
      </Stack>
    );
  };

  const renderItemActions = (label: Label) => {
    if (!label.children || !label.children.length) return undefined;

    return (
      <IconButton
        onClick={() => pushLabel(label)}
        size="small"
        // HACK: custom button alignment
        sx={{ marginRight: theme.spacing(1) }}
      >
        <OpenIcon />
      </IconButton>
    );
  };

  const activeParent = stack.length ? stack[0] : undefined;

  return (
    <SidebarContainer
      title={activeParent?.name ?? "Labels"}
      onBack={activeParent ? popLabel : undefined}
      actions={renderListActions()}
    >
      <Loader
        emptyPlaceholder={
          <div>
            This project contains no (starred) labels. Go to the{" "}
            <Link href={`/project/${projectId}`}>project settings</Link> to
            create some and start annotating!
          </div>
        }
        disabledPlaceholder={"No project selected"}
        query={{
          ...labelsQuery,
          isDisabled: !projectId,
        }}
        render={({ data: labels }) => {
          const activeLabels =
            view === "list" && activeParent ? activeParent.children : labels;

          return (
            <List disablePadding>
              {activeLabels?.map((label) => (
                <ListItem
                  divider
                  disablePadding
                  disableGutters
                  key={label.id}
                  secondaryAction={renderItemActions(label)}
                >
                  <ListItemButton
                    disableGutters
                    selected={selected === label.id}
                    onClick={onSelect && (() => onSelect(label))}
                  >
                    <Dot color={label.color} />
                    <ListItemText
                      primary={label.name ?? "Unnamed"}
                      primaryTypographyProps={{
                        fontWeight:
                          // make sure user knows about active label
                          selected === label.id ? "bold" : "normal",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          );
        }}
      />
    </SidebarContainer>
  );
};

LabelsExplorer.defaultProps = defaultProps;

export default LabelsExplorer;
