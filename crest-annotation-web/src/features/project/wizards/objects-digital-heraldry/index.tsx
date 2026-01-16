import React, { useState } from "react";
import InfoPage from "./InfoPage";
import SourcePage from "./SourcePage";
import { DigitalHeraldryImport, Project } from "../../../../api/openApi";
import { WizardProps } from "../../components/WizardsTab";

type IProps = {
  project: Project;
} & WizardProps;

const ObjectsDigitalHeraldry = ({ project, onCancel, onSuccess }: IProps) => {
  const [step, setStep] = useState<number>(0);
  // data from steps
  const [source, setSource] = useState<string>();
  const [query, setQuery] = useState<string>();
  const [data, setData] = useState<DigitalHeraldryImport>();

  // proceed to next step (as one-liner)
  const proceed = () => setStep(step + 1);

  if (step === 0)
    return (
      <SourcePage
        project={project}
        onCancel={onCancel}
        onProceed={(source, query, data) => {
          setSource(source);
          setQuery(query);
          setData(data);
          proceed();
        }}
      />
    );

  // missing data after step
  if (!source || !query || !data) return null;

  if (step === 1)
    return (
      <InfoPage
        project={project}
        source={source}
        query={query}
        data={data}
        onCancel={onCancel}
        onProceed={onSuccess}
      />
    );

  // invalid page
  return null;
};

const wizard = {
  component: ObjectsDigitalHeraldry,
  group: "objects",
  name: "Digital Heraldry",
  description: "Import images from the Digital Heraldry Ontology",
};

export default wizard;
