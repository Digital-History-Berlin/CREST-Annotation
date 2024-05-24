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
import Layout from "./Layout";
import { cvTasks } from "../../../api/cvApi";
import { Project } from "../../../api/openApi";
import Dot from "../../../components/Dot";

interface IProps {
  project: Project;
}

const TasksTab = ({ project }: IProps) => {
  const theme = useTheme();

  const [backend, setBackend] = useState("");
  const [tasks, setTasks] = useState<
    {
      id: string;
      project_id: string;
      object_id: string;
      status: string;
    }[]
  >([]);

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

  const renderItemAction = () => (
    <IconButton size="small">
      <OpenIcon />
    </IconButton>
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
      <List disablePadding>
        {tasks.map((task) => (
          <ListItem
            disablePadding
            divider
            key={task.id}
            secondaryAction={renderItemAction()}
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
        ))}
      </List>
    </Layout>
  );
};

export default TasksTab;
