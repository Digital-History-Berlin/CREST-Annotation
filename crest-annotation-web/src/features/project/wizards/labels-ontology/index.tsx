import React, { useState } from "react";
import InfoPage from "./InfoPage";
import LabelsPage from "./LabelsPage";
import SourcePage from "./SourcePage";
import { Ontology, Project } from "../../../../api/openApi";
import { WizardProps } from "../../components/WizardsTab";

type IProps = {
  project: Project;
} & WizardProps;

const LabelsOntology = ({ project, onCancel, onSuccess }: IProps) => {
  const [step, setStep] = useState<number>(0);
  // data from steps
  const [source, setSource] = useState<string>();
  const [ontology, setOntology] = useState<Ontology>();

  // proceed to next step (as one-liner)
  const proceed = () => setStep(step + 1);

  if (step === 0)
    return (
      <SourcePage
        onCancel={onCancel}
        onProceed={(source, ontology) => {
          setSource(source);
          setOntology(ontology);
          proceed();
        }}
      />
    );

  // missing data after step
  if (!source || !ontology) return null;

  if (step === 1)
    return (
      <InfoPage ontology={ontology} onCancel={onCancel} onProceed={proceed} />
    );

  if (step === 2)
    return (
      <LabelsPage
        project={project}
        source={source}
        ontology={ontology}
        onCancel={onCancel}
        onProceed={onSuccess}
      />
    );

  // invalid page
  return null;
};

const wizard = {
  component: LabelsOntology,
  group: "labels",
  name: "OWL 2",
  description: "Import labels from OWL 2 JSON-LD ontology",
};

export default wizard;
