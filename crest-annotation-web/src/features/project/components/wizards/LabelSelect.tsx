import React from "react";
import { TreeItem, TreeView } from "@mui/lab";
import { Box, Checkbox, Stack, Typography } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/// Minimal properties a label must have
export interface LabelNode {
  id: string;
  name: string;
  children?: LabelNode[];
}

interface IProps {
  labels: LabelNode[];
  selected: string[];
  setSelected: (leafs: string[], flat: string[]) => void;
}

const LabelSelect = ({ labels, selected, setSelected }: IProps) => {
  // test if every child node is selected
  const everySelected = (item: LabelNode): boolean => {
    if (item.children && item.children.length)
      return item.children.map(everySelected).every((a) => a);
    return selected.includes(item.id);
  };

  // test if any child node is selected
  const someSelected = (item: LabelNode): boolean => {
    if (item.children && item.children.length)
      return item.children.map(someSelected).some((a) => a);
    return selected.includes(item.id);
  };

  // get overlapping selected children
  const selectedOf = (item: LabelNode, leafs: string[]): LabelNode[] => {
    if (item.children?.length) {
      const children = item.children.flatMap((child) =>
        selectedOf(child, leafs)
      );
      // include this node if any children are included
      return children.length > 0 ? [item, ...children] : [];
    }
    // include this leaf if it is included in selection
    return leafs.includes(item.id) ? [item] : [];
  };

  // get all leaf children
  const leafsOf = (item: LabelNode): LabelNode[] => {
    if (item.children && item.children.length)
      return item.children.flatMap(leafsOf);
    return [item];
  };

  const selectLabel = (item: LabelNode, select: boolean) => {
    // update the selected leafs
    const changing = leafsOf(item).map((leaf) => leaf.id);
    const remainder = selected.filter((i) => !changing.includes(i));
    const leafs = select ? [...changing, ...remainder] : remainder;

    // gather all selected elements
    const flat = labels
      .flatMap((label) => selectedOf(label, leafs))
      .map((label) => label.id);

    // select unique elements
    setSelected(
      Array.from(new Set(leafs).values()),
      Array.from(new Set(flat).values())
    );
  };

  const renderItem = (item: LabelNode) => {
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
        {labels.map(renderItem)}
      </TreeView>
    </Box>
  );
};

export default LabelSelect;
