import React from "react";
import { Link, Stack, Typography } from "@mui/material";
import { Ontology } from "../../../api/openApi";

interface IProps {
  ontology: Ontology;
}

const ImportMeta = ({ ontology }: IProps) => {
  // helper to select entry by language (or fallback)
  const selectLanguage = <T extends { language: string | undefined }>(
    entries: T[] | undefined,
    language: string
  ) => {
    return (
      entries?.find((entry) => entry.language === language) ||
      entries?.find((entry) => entry.language === undefined)
    );
  };

  const title = ontology.titles?.at(0);
  const creators = ontology.creators?.join(", ");
  const licenses = ontology.licenses;
  const description = selectLanguage(ontology.descriptions, "en");

  if (!title && !creators && !licenses && !description)
    return (
      <Stack padding={2}>
        <Typography variant="body1">No meta data available</Typography>
      </Stack>
    );

  return (
    <Stack padding={2} spacing={1}>
      {title && <Typography variant="h3">{title}</Typography>}
      {creators && (
        <Typography variant="body2">Creators: {creators}</Typography>
      )}
      {licenses && (
        <Stack>
          {licenses?.map((license) => (
            <Typography key={license} variant="body2">
              License:{" "}
              <Link href={license} target="_blank">
                {license}
              </Link>
            </Typography>
          ))}
        </Stack>
      )}
      {description && (
        <Typography variant="body1">{description?.value}</Typography>
      )}
    </Stack>
  );
};

export default ImportMeta;
