import React, { useState } from "react";
import { KeyboardArrowRight } from "@mui/icons-material";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Project } from "../../../api/openApi";
import LabelsOntology from "../wizards/labels-ontology";
//import ObjectsFileSystem from "../wizards/objects-filesystem";
import ObjectsIiif2 from "../wizards/objects-iiif2";
import ObjectsIiif3 from "../wizards/objects-iiif3";

const wizards = {
  "labels-ontology": LabelsOntology,
  //"objects-filesystem": ObjectsFileSystem,
  "objects-iiif3": ObjectsIiif3,
  "objects-iiif2": ObjectsIiif2,
} as const;

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
    <List>
      {Object.entries(wizards).map(([identifier, details]) => (
        <ListItem key={identifier} disablePadding>
          <ListItemButton onClick={() => setWizard(identifier as Wizard)}>
            <ListItemText secondary={details.description}>
              {details.name}
            </ListItemText>
            <KeyboardArrowRight />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default WizardsTab;
