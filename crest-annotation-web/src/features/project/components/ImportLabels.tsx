import React from "react";
import { Ontology, OntologyLabel } from "../../../api/openApi";
import { Box, Checkbox, Stack, Typography } from "@mui/material";
import { TreeItem, TreeView } from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface IProps {
  ontology: Ontology;
  selected: string[];
  setSelected: (selected: string[]) => void;
}

const ImportLabels = ({ ontology, selected, setSelected }: IProps) => {
  // test if every child node is selected
  const everySelected = (item: OntologyLabel): boolean => {
    if (item.children && item.children.length)
      return item.children.map(everySelected).every((a) => a);
    return selected.includes(item.id);
  };

  // test if any child node is selected
  const someSelected = (item: OntologyLabel): boolean => {
    if (item.children && item.children.length)
      return item.children.map(someSelected).some((a) => a);
    return selected.includes(item.id);
  };

  // get all leaf children
  const gatherLeafs = (item: OntologyLabel): OntologyLabel[] => {
    if (item.children && item.children.length)
      return item.children.flatMap(gatherLeafs);
    return [item];
  };

  const selectLabel = (item: OntologyLabel, select: boolean) => {
    const leafs = gatherLeafs(item).map((leaf) => leaf.id);
    const excluded = selected.filter((i) => !leafs.includes(i));

    if (select) setSelected([...excluded, ...leafs]);
    else setSelected(excluded);
  };

  const renderItem = (item: OntologyLabel) => {
    const some = someSelected(item);
    const every = everySelected(item);

    return (
      <TreeItem
        key={item.id}
        nodeId={item.id}
        label={
          <Stack direction="row" alignItems="center">
            <Checkbox
              size="small"
              checked={every}
              indeterminate={some && !every}
              onClick={(e) => {
                selectLabel(item, !every);
                e.stopPropagation();
              }}
            />
            <Typography>{item.name}</Typography>
          </Stack>
        }
      >
        {item.children?.map(renderItem)}
      </TreeItem>
    );
  };

  return (
    <Box padding={1}>
      <TreeView
        disableSelection
        defaultExpandIcon={<ChevronRightIcon />}
        defaultCollapseIcon={<ExpandMoreIcon />}
      >
        {ontology.labels.map(renderItem)}
      </TreeView>
    </Box>
  );
};

export default ImportLabels;
