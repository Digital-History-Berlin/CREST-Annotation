import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  IconButton,
} from "@mui/material";
import CardLayout from "../../components/layouts/CardLayout";
import Toolbar from "../../components/Toolbar";
import DeleteIcon from "@mui/icons-material/Delete";
import AnnotateIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";

const ProjectsPage = () => {
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);

  const deleteProject = (project: Project) => {};

  const renderCard = (project: Project) => (
    <Card>
      <CardActionArea onClick={() => navigate(`/objects/${project.id}`)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {project.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {"TODO: Project description"}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={() => navigate(`/annotate/${project.id}`)}>
          <AnnotateIcon />
        </IconButton>
        <IconButton onClick={() => navigate(`/project/${project.id}`)}>
          <SettingsIcon />
        </IconButton>
        <IconButton color="error" onClick={() => deleteProject(project)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );

  const addButton = (
    <Button
      fullWidth
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => setShowCreate(true)}
    >
      Add Project
    </Button>
  );

  return (
    <>
      <AddProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <CardLayout
        query={useGetProjectsQuery()}
        renderCard={renderCard}
        header={<Toolbar title="Projects" />}
        placeholder={
          <PlaceholderLayout
            title="Welcome to CREST"
            description="It is time to create your first project and start annotating!"
          >
            <Box mt={4}>{addButton}</Box>
          </PlaceholderLayout>
        }
        footer={addButton}
      />
    </>
  );
};

export default ProjectsPage;
