import React, { useState } from "react";
import { LinkRounded } from "@mui/icons-material";
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
import { useAnnotationProject } from "../slice/annotations";

interface IProps {
  selected?: string;
  onSelect?: (label: Label) => void;
}

const LabelsExplorer = ({ selected, onSelect }: IProps) => {
  const theme = useTheme();
  const project = useAnnotationProject();

  // first label is currently active
  const [reference, setReference] = useState(false);
  const [stack, setStack] = useState<Label[]>([]);
  const [view, setView] = useState("list");

  const labelsQuery = useGetProjectLabelsQuery({
    projectId: project.id,
    starred: view === "starred" ? true : undefined,
    grouped: view === "list",
  });

  const pushLabel = (label: Label) => {
    setStack([label, ...stack]);
  };

  const popLabel = () => {
    setStack(stack?.slice(1));
  };

  const renderListActions = () => {
    const background = (toggled: boolean) => {
      return toggled ? theme.palette.grey[300] : "transparent";
    };

    return (
      <Stack direction="row">
        <IconButton
          onClick={() => setView("list")}
          sx={{ backgroundColor: background(view === "list") }}
          size="small"
        >
          <ListView />
        </IconButton>
        <IconButton
          onClick={() => setView("starred")}
          sx={{ backgroundColor: background(view === "starred") }}
          size="small"
        >
          <StarredView />
        </IconButton>
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

  // TODO: render the navigation in parent component
  // this component should not render as sidebar container
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
            <Link href={`/project/${project.id}`}>project settings</Link> to
            create some and start annotating!
          </div>
        }
        query={labelsQuery}
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
                    // reduce list item size
                    sx={{ minHeight: 40, py: 0 }}
                  >
                    <Dot color={label.color} />
                    <ListItemText
                      primary={label.name ?? "Unnamed"}
                      primaryTypographyProps={{
                        fontWeight:
                          // make sure user knows about active label
                          selected === label.id ? "bold" : "normal",
                      }}
                      secondary={reference && label.reference}
                      secondaryTypographyProps={{
                        // avoid overflowing action buttons
                        sx: { wordWrap: "break-word" },
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

export default LabelsExplorer;
