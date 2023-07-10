import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProjectCard from "./components/ProjectCard";
import { useGetProjectsQuery } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import DeleteProjectDialog from "../../components/dialogs/DeleteProjectDialog";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";

const ProjectsPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project>();
  const [page, setPage] = useState(1);

  const projectsQuery = useGetProjectsQuery({
    page: page,
    size: 12,
  });

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
      <DeleteProjectDialog
        onClose={() => setDeleteProject(undefined)}
        project={deleteProject}
      />
      <CardLayout
        onChangePage={setPage}
        query={projectsQuery}
        renderCard={(project) => (
          <ProjectCard
            project={project}
            onDelete={() => setDeleteProject(project)}
          />
        )}
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
