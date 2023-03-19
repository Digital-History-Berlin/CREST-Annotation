import React, { useEffect } from "react";
import { Divider, Link, Stack, Typography } from "@mui/material";
import { Ontology } from "../../../../api/openApi";
import Layout from "../../components/Layout";
import ProblemsList from "../../components/wizards/ProblemsList";

interface IProps {
  ontology: Ontology;
  onCancel: () => void;
  onProceed: () => void;
}

const InfoPage = ({ ontology, onCancel, onProceed }: IProps) => {
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
  const problems = ontology.problems;

  useEffect(() => {
    if (!title && !creators && !licenses && !description && !problems)
      // proceed automatically if page is empty
      onProceed();
  });

  return (
    <Layout onCancel={onCancel} onProceed={onProceed}>
      <Stack padding={2} spacing={1}>
        {title && <Typography variant="h4">{title}</Typography>}
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

      {ontology.problems && !!ontology.problems.length && (
        <>
          <Divider />
          <ProblemsList
            title="Ontology contains problems"
            problems={ontology.problems}
          />
        </>
      )}
    </Layout>
  );
};

export default InfoPage;
