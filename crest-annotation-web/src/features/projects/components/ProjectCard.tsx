import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ObjectsIcon from "@mui/icons-material/Apps";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import { Project, useGetObjectsCountQuery } from "../../../api/openApi";

interface IProps {
  project: Project;
  onDelete: () => void;
}

const ProjectCard = ({ project, onDelete }: IProps) => {
  const navigate = useNavigate();

  const { data: count } = useGetObjectsCountQuery({ projectId: project.id });

  const progress =
    count && count.total && (count.annotated / count.total) * 100;

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/annotate/${project.id}`)}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {project.name}
          </Typography>
          {count && (
            <Stack direction="column" alignItems="stretch" spacing={1}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="text.secondary">
                {count.annotated} of {count.total} annotated
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
      <CardActions disableSpacing sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={() => navigate(`/objects/${project.id}`)}>
          <ObjectsIcon />
        </IconButton>
        <IconButton onClick={() => navigate(`/project/${project.id}`)}>
          <SettingsIcon />
        </IconButton>
        <IconButton color="error" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
