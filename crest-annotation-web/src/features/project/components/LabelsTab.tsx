import React from "react";
import { TreeView } from "@mui/lab";
import LabelsBranch from "./LabelsBranch";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { Project } from "../../../api/openApi";
import Loader from "../../../components/Loader";

interface IProps {
  project: Project;
}

const LabelsTab = ({ project }: IProps) => {
  const labelsQuery = useGetProjectLabelsQuery({
    projectId: project.id,
    grouped: true,
  });

  return (
    <Loader
      query={labelsQuery}
      render={({ data: labels }) => (
        <TreeView disableSelection disabledItemsFocusable>
          <LabelsBranch project={project} remoteLabels={labels} />
        </TreeView>
      )}
    />
  );
};

export default LabelsTab;
