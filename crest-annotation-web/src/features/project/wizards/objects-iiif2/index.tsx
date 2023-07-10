import React, { useState } from "react";
import InfoPage from "./InfoPage";
import SourcePage from "./SourcePage";
import { Iiif2Import, Project } from "../../../../api/openApi";
import { WizardProps } from "../../components/WizardsTab";

type IProps = {
  project: Project;
} & WizardProps;

const ObjectsIiif2 = ({ project, onCancel, onSuccess }: IProps) => {
  const [step, setStep] = useState<number>(0);
  // data from steps
  const [source, setSource] = useState<string>();
  const [data, setData] = useState<Iiif2Import>();

  // proceed to next step (as one-liner)
  const proceed = () => setStep(step + 1);

  if (step === 0)
    return (
      <SourcePage
        project={project}
        onCancel={onCancel}
        onProceed={(source, data) => {
          setSource(source);
          setData(data);
          proceed();
        }}
      />
    );

  // missing data after step
  if (!source || !data) return null;

  if (step === 1)
    return (
      <InfoPage
        project={project}
        source={source}
        data={data}
        onCancel={onCancel}
        onProceed={onSuccess}
      />
    );

  // invalid page
  return null;
};

const wizard = {
  component: ObjectsIiif2,
  group: "objects",
  name: "IIIF 2",
  description: "Import images from IIIF 2.1 or 2.0 manifest",
};

export default wizard;
