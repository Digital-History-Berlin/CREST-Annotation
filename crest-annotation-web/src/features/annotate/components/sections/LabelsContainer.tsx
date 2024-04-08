import { useCallback } from "react";
import { Label } from "../../../../api/openApi";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { toggleToolboxLabel } from "../../slice/toolbox";
import LabelsExplorer from "../LabelsExplorer";

const LabelsContainer = () => {
  const dispatch = useAppDispatch();

  const selectedLabelId = useAppSelector(
    (state) => state.toolbox.selection.labelId
  );

  const toggleLabel = useCallback(
    (label: Label) => dispatch(toggleToolboxLabel(label)),
    [dispatch]
  );

  // labels explorer is already a sidebar container
  return <LabelsExplorer selected={selectedLabelId} onSelect={toggleLabel} />;
};

export default LabelsContainer;
