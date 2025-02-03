import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ObjectsIcon from "@mui/icons-material/Apps";
import ProjectsIcon from "@mui/icons-material/Collections";
import AnnotateIcon from "@mui/icons-material/LocalOffer";
import SettingsIcon from "@mui/icons-material/Settings";
import { ToolbarTabButtonWithTooltip } from "./ToolbarButton";
import { useAppSelector } from "../app/hooks";

export type ToolbarTab = "projects" | "objects" | "settings" | "annotate";

interface IProps {
  active: ToolbarTab;
}

const ToolbarTabs = ({ active }: IProps) => {
  const navigate = useNavigate();
  // project can be undefined here (i.e. if in projects view)
  const projectId = useAppSelector((state) => state.global.projectId);

  const navigateProjects = useCallback(() => navigate("/"), [navigate]);

  const navigateObjects = useCallback(
    () => projectId && navigate(`/objects/${projectId}`),
    [navigate, projectId]
  );

  const navigateAnnotate = useCallback(
    () => projectId && navigate(`/annotate/${projectId}`),
    [navigate, projectId]
  );

  const navigateSettings = useCallback(
    () => projectId && navigate(`/project/${projectId}`),
    [navigate, projectId]
  );

  return (
    <>
      <ToolbarTabButtonWithTooltip
        onClick={navigateProjects}
        tooltip={"Projects"}
        selected={active === "projects"}
        value="projects"
      >
        <ProjectsIcon />
      </ToolbarTabButtonWithTooltip>
      <ToolbarTabButtonWithTooltip
        onClick={navigateObjects}
        tooltip={"Overview"}
        selected={active === "objects"}
        value="objects"
        disabled={!projectId}
      >
        <ObjectsIcon />
      </ToolbarTabButtonWithTooltip>
      <ToolbarTabButtonWithTooltip
        onClick={navigateAnnotate}
        tooltip={"Annotate"}
        selected={active === "annotate"}
        value="annotate"
        disabled={!projectId}
      >
        <AnnotateIcon />
      </ToolbarTabButtonWithTooltip>
      <ToolbarTabButtonWithTooltip
        onClick={navigateSettings}
        tooltip={"Settings"}
        selected={active === "settings"}
        value="settings"
        disabled={!projectId}
      >
        <SettingsIcon />
      </ToolbarTabButtonWithTooltip>
    </>
  );
};

export default ToolbarTabs;
