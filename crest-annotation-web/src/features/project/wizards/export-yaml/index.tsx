import InfoPage from "./InfoPage";
import { Project } from "../../../../api/openApi";
import { WizardProps } from "../../components/WizardsTab";

type IProps = {
  project: Project;
} & WizardProps;

const ExportYaml = ({ project, onCancel, onSuccess }: IProps) => (
  <InfoPage project={project} onCancel={onCancel} onProceed={onSuccess} />
);

const wizard = {
  component: ExportYaml,
  group: "export",
  name: "YAML",
  description: "Export to YAML",
};

export default wizard;
