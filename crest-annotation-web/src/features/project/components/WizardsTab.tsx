import React, { useState } from "react";
import { KeyboardArrowRight } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { Project } from "../../../api/openApi";
import ExportYaml from "../wizards/export-yaml";
import LabelsOntology from "../wizards/labels-ontology";
import ObjectsDigitalHeraldry from "../wizards/objects-digital-heraldry";
import ObjectsFileSystem from "../wizards/objects-filesystem";
import ObjectsIiif2 from "../wizards/objects-iiif2";
import ObjectsIiif3 from "../wizards/objects-iiif3";

const wizards = {
  "labels-ontology": LabelsOntology,
  "objects-filesystem": ObjectsFileSystem,
  "objects-iiif3": ObjectsIiif3,
  "objects-iiif2": ObjectsIiif2,
  "objects-digital-heraldry": ObjectsDigitalHeraldry,
  "export-yaml": ExportYaml,
} as const;

const wizardsByGroup = [
  { name: "Labels", entries: ["labels-ontology"] },
  {
    name: "Images",
    entries: [
      "objects-filesystem",
      "objects-iiif3",
      "objects-iiif2",
      "objects-digital-heraldry",
    ],
  },
  { name: "Export", entries: ["export-yaml"] },
] as const;

type Wizard = keyof typeof wizards;

export interface WizardProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface IProps {
  project: Project;
  onSuccess: (group: string) => void;
}

const WizardsTab = ({ project, onSuccess }: IProps) => {
  const [wizard, setWizard] = useState<Wizard>();

  const cancel = () => setWizard(undefined);
  const succeed = () => {
    if (!wizard) return;

    onSuccess(wizards[wizard].group);
    // reset the wizard
    setWizard(undefined);
  };

  if (wizard) {
    // get active wizard as JSX components
    const Wizard = wizards[wizard].component;
    // render active wizard
    return <Wizard project={project} onCancel={cancel} onSuccess={succeed} />;
  }

  return (
    <List disablePadding>
      {wizardsByGroup.map(({ name, entries }) => (
        <>
          <ListSubheader sx={{ lineHeight: "28px", bgcolor: "secondary.main" }}>
            {name}
          </ListSubheader>
          {entries.map((identifier) => {
            const details = wizards[identifier];

            return (
              <ListItem key={identifier} disablePadding>
                <ListItemButton onClick={() => setWizard(identifier)}>
                  <ListItemText secondary={details.description}>
                    {details.name}
                  </ListItemText>
                  <KeyboardArrowRight />
                </ListItemButton>
              </ListItem>
            );
          })}
        </>
      ))}
    </List>
  );
};

export default WizardsTab;
