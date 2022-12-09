import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetProjectQuery } from "../../api/enhancedApi";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import Layout from "../../components/layouts/Layout";
import Toolbar from "../../components/Toolbar";
import Loader from "../../components/Loader";
import SettingsTab from "./components/SettingsTab";
import LabelsTab from "./components/LabelsTab";

const ProjectPage = () => {
  const { projectId } = useParams();

  const projectQuery = useGetProjectQuery(
    { projectId: projectId! },
    { skip: !projectId }
  );

  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Layout
      scrollable
      header={<Toolbar title={projectQuery.data?.name ?? "Project Settings"} />}
    >
      <Container maxWidth="sm">
        <Typography variant="h5" color="info">
          Project Settings
        </Typography>

        <Loader
          query={projectQuery}
          render={({ data: project }) => (
            <Paper>
              <Box mt={2} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={currentTab}
                  onChange={(_, value) => setCurrentTab(value)}
                >
                  <Tab label="Settings" />
                  <Tab label="Labels" />
                </Tabs>
              </Box>
              <Box hidden={currentTab !== 0}>
                <SettingsTab project={project} />
              </Box>
              <Box hidden={currentTab !== 1}>
                <LabelsTab project={project} />
              </Box>
            </Paper>
          )}
        />
      </Container>
    </Layout>
  );
};

export default ProjectPage;
