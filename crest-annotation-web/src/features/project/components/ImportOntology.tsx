import React, { useEffect, useState } from "react";
import { Ontology, OntologyLabel, Project } from "../../../api/openApi";
import { Button, Divider, Stack } from "@mui/material";
import ImportMeta from "./ImportMeta";
import ImportProblems from "./ImportProblems";
import ImportLabels from "./ImportLabels";

interface IProps {
  project: Project;
  ontology: Ontology;

  onImport: (itemIds: string[], method: string) => void;
  onSuccess: () => void;
}

const ImportOntology = ({ project, ontology, onImport, onSuccess }: IProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [itemIds, setItemIds] = useState<string[]>([]);

  // refresh flattened selection data
  useEffect(() => {
    // get overlapping selected children
    const gatherSelected = (item: OntologyLabel): OntologyLabel[] => {
      if (item.children && item.children.length) {
        const children = item.children.flatMap(gatherSelected);

        // explicitly include this item if any children are included
        return children.length > 0 ? [item, ...children] : [];
      }

      return selected.includes(item.id) ? [item] : [];
    };

    const itemIds = new Set(
      ontology.labels.flatMap((item) =>
        gatherSelected(item).map((item) => item.id)
      )
    );

    setItemIds(Array.from(itemIds.values()));
  }, [ontology, selected]);

  return (
    <Stack>
      <ImportMeta ontology={ontology} />
      <Divider />

      {ontology.problems && !!ontology.problems.length && (
        <>
          <ImportProblems ontology={ontology} />
          <Divider />
        </>
      )}

      <ImportLabels
        ontology={ontology}
        selected={selected}
        setSelected={setSelected}
      />
      <Divider />

      <Stack
        direction="row"
        spacing={1}
        padding={2}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Button
          onClick={() => onImport(itemIds, "none")}
          disabled={itemIds.length === 0}
          variant="outlined"
        >
          Import {itemIds.length} labels
        </Button>
      </Stack>
    </Stack>
  );
};

export default ImportOntology;
