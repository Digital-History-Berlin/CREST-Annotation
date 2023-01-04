import React from "react";
import { Project } from "../../../api/openApi";
import Loader from "../../../components/Loader";
import { useGetProjectLabelsQuery } from "../../../api/enhancedApi";
import { TreeView } from "@mui/lab";
import LabelsBranch from "./LabelsBranch";

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
