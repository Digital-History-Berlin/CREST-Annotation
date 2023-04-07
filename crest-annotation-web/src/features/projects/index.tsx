import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ObjectsIcon from "@mui/icons-material/Apps";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { useGetProjectsQuery } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import DeleteProjectDialog from "../../components/dialogs/DeleteProjectDialog";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";

const ProjectsPage = () => {
  const navigate = useNavigate();

  const [showDelete, setShowDelete] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);

  const projectsQuery = useGetProjectsQuery({
    page: page,
    size: 12,
  });

  const renderCard = (project: Project) => (
    <Card>
      <DeleteProjectDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        project={project}
      />
      <CardActionArea onClick={() => navigate(`/annotate/${project.id}`)}>
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
        <IconButton onClick={() => navigate(`/objects/${project.id}`)}>
          <ObjectsIcon />
        </IconButton>
        <IconButton onClick={() => navigate(`/project/${project.id}`)}>
          <SettingsIcon />
        </IconButton>
        <IconButton color="error" onClick={() => setShowDelete(true)}>
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
        onChangePage={setPage}
        query={projectsQuery}
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
