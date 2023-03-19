import React from "react";
import { Warning } from "@mui/icons-material";
import { Stack, Typography, useTheme } from "@mui/material";

interface IProps {
  title: string;
  problems: string[];
}

const ProblemsList = ({ title, problems }: IProps) => {
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
      <Stack direction="row" spacing={2}>
        <Warning />
        <Typography variant="h5">{title}</Typography>
      </Stack>
      <ul>
        {problems.map((problem, i) => (
          <li>
            <Typography key={i} variant="body1">
              {problem}
            </Typography>
          </li>
        ))}
      </ul>
    </Stack>
  );
};

export default ProblemsList;
