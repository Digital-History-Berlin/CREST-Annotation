import { Button, DialogActions, DialogContent } from "@mui/material";
import LabelsExplorer from "./LabelsExplorer";
import { Label } from "../../../api/openApi";
import { useAppDispatch } from "../../../app/hooks";
import DefaultDialog from "../../../components/dialogs/DefaultDialog";
import { Annotation, updateAnnotation } from "../slice/annotations";

interface IProps {
  annotation: Annotation | null;
  onClose: () => void;
  projectId?: string;
}

const EditAnnotationDialog = ({ annotation, projectId, onClose }: IProps) => {
  const dispatch = useAppDispatch();

  const updateLabel = (label: Label) => {
    if (annotation)
      dispatch(
        updateAnnotation({
          ...annotation,
          label: label,
        })
      );

    onClose();
  };

  return (
    <DefaultDialog
      onClose={onClose}
      open={!!annotation}
      maxWidth="sm"
      fullWidth={true}
      title="Edit Annotation"
    >
      <DialogContent sx={{ padding: 0 }}>
        <LabelsExplorer
          projectId={projectId}
          selected={annotation?.label?.id}
          onSelect={updateLabel}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </DefaultDialog>
  );
};

export default EditAnnotationDialog;
