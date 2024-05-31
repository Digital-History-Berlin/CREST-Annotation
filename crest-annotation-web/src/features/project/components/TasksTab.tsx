import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import OpenIcon from "@mui/icons-material/ChevronRight";
import CancelIcon from "@mui/icons-material/Close";
import Layout from "./Layout";
import { cvTasks } from "../../../api/cvApi";
import { Project } from "../../../api/openApi";
import Dot from "../../../components/Dot";

interface Task {
  id: string;
  project_id: string;
  object_id: string;
  status: string;
}

interface IProps {
  project: Project;
}

const TasksTab = ({ project }: IProps) => {
  const theme = useTheme();

  const [backend, setBackend] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const save = async () => {
    try {
      if (!backend.length) return;

      const response = await cvTasks(backend, project.id);
      const tasks = await response.json();
      // show the current states
      setTasks(tasks);
    } catch {
      // TODO: error message
    }
  };

  const renderItemAction = (task: Task) => {
    if (task.status === "queued")
      return (
        <IconButton size="small">
          <CancelIcon />
        </IconButton>
      );
    if (task.status === "completed")
      return (
        <IconButton size="small">
          <OpenIcon />
        </IconButton>
      );
  };

  const renderItem = (task: Task) => (
    <ListItem
      disablePadding
      divider
      key={task.id}
      secondaryAction={renderItemAction(task)}
    >
      <ListItemIcon sx={{ width: 40, justifyContent: "center" }}>
        {task.status === "processing" && <CircularProgress size={20} />}
        {task.status !== "processing" && (
          <Dot
            disablePadding
            color={
              task.status === "completed"
                ? theme.palette.success.light
                : task.status === "failed"
                ? theme.palette.error.light
                : "white"
            }
          />
        )}
      </ListItemIcon>
      <ListItemText primary={task.id} secondary={task.status} />
    </ListItem>
  );

  return (
    <Layout
      customActions={
        <Button onClick={() => save()} variant="contained">
          Load backend
        </Button>
      }
    >
      <Stack padding={2} spacing={2}>
        <TextField
          label="Backend"
          variant="filled"
          value={backend}
          onChange={(e) => setBackend(e.target.value)}
        />
      </Stack>
      <Divider />
      <List disablePadding>{tasks.map(renderItem)}</List>
    </Layout>
  );
};

export default TasksTab;
