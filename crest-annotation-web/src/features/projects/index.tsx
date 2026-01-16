import { useState } from "react";
import { Box, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ProjectCard from "./components/ProjectCard";
import { useGetProjectsQuery } from "../../api/enhancedApi";
import { Project } from "../../api/openApi";
import { useDialog } from "../../app/hooks";
import AddProjectDialog from "../../components/dialogs/AddProjectDialog";
import DeleteProjectDialog from "../../components/dialogs/DeleteProjectDialog";
import CardLayout from "../../components/layouts/CardLayout";
import PlaceholderLayout from "../../components/layouts/PlaceholderLayout";
import Toolbar from "../../components/Toolbar";
import ToolbarTabs from "../../components/ToolbarTabs";

const ProjectsPage = () => {
  const createDialog = useDialog();
  const deleteDialog = useDialog<Project>();
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
      onClick={createDialog.handleOpen}
    >
      Add Project
    </Button>
  );

  return (
    <>
      <AddProjectDialog
        open={createDialog.open}
        onClose={createDialog.handleClose}
      />
      <DeleteProjectDialog
        project={deleteDialog.data}
        onClose={deleteDialog.handleClose}
      />
      <CardLayout
        onChangePage={setPage}
        query={projectsQuery}
        renderCard={(project) => (
          <ProjectCard
            project={project}
            onDelete={() => deleteDialog.handleOpen(project)}
          />
        )}
        header={
          <Toolbar title="Projects" tabs={<ToolbarTabs active="projects" />} />
        }
        placeholder={
          <PlaceholderLayout
            title={
              <span>
                Welcome to
                <span style={{ fontFamily: "Times New Roman" }}> CREST</span>!
              </span>
            }
            description="It is time to create your first project and start annotating."
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
