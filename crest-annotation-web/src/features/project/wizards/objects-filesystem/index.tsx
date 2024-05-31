import { useState } from "react";
import InfoPage from "./InfoPage";
import SourcePage from "./SourcePage";
import { FilesystemImport, Project } from "../../../../api/openApi";
import { WizardProps } from "../../components/WizardsTab";

type IProps = {
  project: Project;
} & WizardProps;

const ObjectsFileSystem = ({ project, onSuccess, onCancel }: IProps) => {
  const [path, setPath] = useState<string>();
  const [data, setData] = useState<FilesystemImport>();

  if (!data || !path)
    return (
      <SourcePage
        project={project}
        onCancel={onCancel}
        onProceed={(path, data) => {
          setPath(path);
          setData(data);
        }}
      />
    );

  return (
    <InfoPage
      project={project}
      path={path}
      data={data}
      onCancel={onCancel}
      onProceed={onSuccess}
    />
  );
};

const wizard = {
  component: ObjectsFileSystem,
  group: "objects",
  name: "File System",
  description: "Import images directly from file system",
};

export default wizard;
