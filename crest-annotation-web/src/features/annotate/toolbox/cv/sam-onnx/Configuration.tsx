import React from "react";
import { Button, Stack } from "@mui/material";
import { useCvResetAlgorithm } from "../hooks";

// const defaultConfig: CvSamOnnxConfig = { unused: undefined };

export const Configuration = () => {
  const resetAlgorithm = useCvResetAlgorithm();

  return (
    <Stack padding={2} spacing={2}>
      <Button onClick={resetAlgorithm} variant="contained">
        Reset Algorithm
      </Button>
    </Stack>
  );
};
