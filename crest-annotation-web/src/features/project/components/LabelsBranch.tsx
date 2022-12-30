import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useUpdateLabelMutation,
} from "../../../api/enhancedApi";
import { Label, Project } from "../../../api/openApi";
import { TreeItem } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LabelRow, { PartialLabel } from "./LabelRow";
import { Box, styled } from "@mui/material";

interface IProps {
  project: Project;
  parent?: PartialLabel;
  remoteLabels?: Label[];
}

const Expandable = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    padding: "0px",
    backgroundColor: "transparent !important",

    "& .MuiTreeItem-iconContainer": {
      width: "40px",
      padding: "0px",
      margin: "0px",
    },
    "& .MuiTreeItem-label": {
      padding: "0px",
      margin: "0px",
    },
  },
}));

const AddRow = styled(Box)(({ theme }) => ({
  "&": {
    marginLeft: "40px",
  },
}));

const LabelsBranch = ({ project, parent, remoteLabels }: IProps) => {
  const emptyLabel = {
    // HACK: simplifies working label.id
    // overridden in insertLabel()
    id: "__new__",
    name: "",
  };

  const [appendLabelKey, setAppendLabelKey] = useState(uuidv4());
  // local optimistic update cache
  const [labels, setLabels] = useState<PartialLabel[]>([]);

  const [createRequest] = useCreateLabelMutation();
  const [updateRequest] = useUpdateLabelMutation();
  const [deleteRequest] = useDeleteLabelMutation();

  useEffect(() => {
    // re-set to server state
    if (remoteLabels) setLabels(remoteLabels);
  }, [remoteLabels]);

  const updateLabel = (label: PartialLabel) => {
    updateRequest({ patchLabel: label });
  };

  const getLabelColor = () => {
    const occurences = project.color_table.map((color) => ({
      color: color,
      count: labels.filter((label) => label.color === color).length,
    }));

    // get least used color
    const min = occurences.reduce((min, cur) =>
      cur.count < min.count ? cur : min
    );

    return min.color;
  };

  const insertLabel = (label: PartialLabel) => {
    if (!label.name) return;

    createRequest({
      createLabel: {
        ...label,
        // remove the default id (__new__)
        id: undefined,
        project_id: project.id,
        parent_id: parent?.id,
        name: label.name!,
        color: getLabelColor(),
      },
    });
    setLabels([...labels, { ...label, loading: true }]);
    // reset the add label row by changing it's key
    setAppendLabelKey(uuidv4());
  };

  const deleteLabel = (label: PartialLabel) => {
    setLabels(labels.filter((l) => l.id !== label.id));
    deleteRequest({ labelId: label.id });
  };

  return (
    <>
      {labels?.map((label) => (
        <Expandable
          key={label.id}
          nodeId={label.id}
          expandIcon={<ChevronRightIcon />}
          collapseIcon={<ExpandMoreIcon />}
          label={
            <LabelRow
              key={label.id}
              label={label}
              defaultLoading={label.loading}
              onChange={updateLabel}
              onDelete={deleteLabel}
            />
          }
        >
          <LabelsBranch
            project={project}
            parent={label}
            remoteLabels={label.children}
          />
        </Expandable>
      ))}
      <AddRow>
        <LabelRow
          autoFocus
          key={appendLabelKey}
          label={emptyLabel}
          onChange={insertLabel}
        />
      </AddRow>
    </>
  );
};

export default LabelsBranch;
