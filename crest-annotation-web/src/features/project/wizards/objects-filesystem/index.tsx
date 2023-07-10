import React from "react";
import { Box, Button, Divider, Stack } from "@mui/material";
import { WizardProps } from "../../components/WizardsTab";

const ObjectsFileSystem = ({ onCancel }: WizardProps) => {
  return (
    <>
      <Box padding={2}>Not available</Box>
      <Divider />

      <Stack direction="row" spacing={1} padding={2} justifyContent="flex-end">
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
      </Stack>
    </>
  );
};

const wizard = {
  component: ObjectsFileSystem,
  group: "objects",
  name: "File System",
  description: "Import images directly from file system",
};

export default wizard;
