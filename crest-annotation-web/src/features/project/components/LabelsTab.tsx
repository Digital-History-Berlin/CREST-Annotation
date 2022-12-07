import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label, Project } from "../../../api/openApi";
import { Stack } from "@mui/material";
import Loader from "../../../components/Loader";
import {
  useCreateLabelMutation,
  useGetProjectLabelsQuery,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} from "../../../api/enhancedApi";
import LabelRow from "./LabelRow";

interface IProps {
  project: Project;
}

/// Add rendering properties
// TODO: move type to LabelRow and export it
type ExtendedLabel = Label & { loading?: boolean };

const LabelsTab = ({ project }: IProps) => {
  const emptyLabel = {
    id: "__new__",
    name: "",
  };

  const labelsQuery = useGetProjectLabelsQuery({ projectId: project.id });

  const [createRequest] = useCreateLabelMutation();
  const [updateRequest] = useUpdateLabelMutation();
  const [deleteRequest] = useDeleteLabelMutation();

  const [appendLabelKey, setAppendLabelKey] = useState(uuidv4());
  // local optimistic update cache
  const [labels, setLabels] = useState<ExtendedLabel[]>([]);

  useEffect(() => {
    // re-set to server state
    if (labelsQuery.data) setLabels(labelsQuery.data);
  }, [labelsQuery.data]);

  const updateLabel = (label: Label) => {
    updateRequest({ shallowLabel: label });
  };

  const insertLabel = (label: Label) => {
    createRequest({
      // set the project and remove the default id
      shallowLabel: { ...label, id: undefined, project_id: project.id },
    });
    setLabels([...labels, { ...label, loading: true }]);
    // reset the add label row by changing it's key
    setAppendLabelKey(uuidv4());
  };

  const deleteLabel = (label: Label) => {
    setLabels(labels.filter((l) => l.id !== label.id));
    deleteRequest({ labelId: label.id });
  };

  return (
    <Loader
      query={{ ...labelsQuery, data: labels }}
      render={({ data: labels }) => (
        <Stack>
          {labels.map((label) => (
            <LabelRow
              key={label.id}
              label={label}
              defaultLoading={label.loading}
              onChange={updateLabel}
              onDelete={deleteLabel}
            />
          ))}
          <LabelRow
            autoFocus
            key={appendLabelKey}
            label={emptyLabel}
            onChange={insertLabel}
          />
        </Stack>
      )}
    />
  );
};

export default LabelsTab;
