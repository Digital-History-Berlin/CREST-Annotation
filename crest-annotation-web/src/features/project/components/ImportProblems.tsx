import React from "react";
import { Ontology } from "../../../api/openApi";
import { Divider, Stack, Typography, useTheme } from "@mui/material";

interface IProps {
  ontology: Ontology;
}

const ImportProblems = ({ ontology }: IProps) => {
  const theme = useTheme();

  return (
    <Stack
      padding={2}
      spacing={1}
      sx={{
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.contrastText,
      }}
    >
      <Typography variant="h4">Problems</Typography>
      {ontology.problems.map((problem, i) => (
        <Typography key={i} variant="body1">
          {problem}
        </Typography>
      ))}
    </Stack>
  );
};

export default ImportProblems;
