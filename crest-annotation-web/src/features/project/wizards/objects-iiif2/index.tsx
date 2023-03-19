import React from "react";
import { Box, Button, Divider, Stack } from "@mui/material";
import { WizardProps } from "../../components/WizardsTab";

const ObjectsIiif2 = ({ onCancel }: WizardProps) => {
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
  component: ObjectsIiif2,
  group: "objects",
  name: "IIIF 2",
  description: "Import images from IIIF 2.1 or 2.0 manifest",
};

export default wizard;
