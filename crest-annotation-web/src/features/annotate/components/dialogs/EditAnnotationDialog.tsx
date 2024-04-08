import { Button, DialogActions, DialogContent } from "@mui/material";
import { Label } from "../../../../api/openApi";
import DefaultDialog from "../../../../components/dialogs/DefaultDialog";
import { Annotation } from "../../slice/annotations";
import LabelsExplorer from "../LabelsExplorer";

interface IProps {
  annotation: Annotation | null;
  onSubmit: (label: Label) => void;
  onClose: () => void;
}

const EditAnnotationDialog = ({ annotation, onSubmit, onClose }: IProps) => {
  return (
    <DefaultDialog
      onClose={onClose}
      open={!!annotation}
      maxWidth="sm"
      fullWidth={true}
      title="Edit Annotation"
    >
      <DialogContent sx={{ padding: 0 }}>
        <LabelsExplorer selected={annotation?.label?.id} onSelect={onSubmit} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </DefaultDialog>
  );
};

export default EditAnnotationDialog;
