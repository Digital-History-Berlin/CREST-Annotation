import { Layer } from "react-konva";
import { CvToolInfo, CvToolState } from "./types";
import { useAppSelector } from "../../../../app/hooks";
import { PreviewFC } from "../../types/preview";
import { Tool } from "../../types/toolbox";

export const Preview: PreviewFC<CvToolState> = (props) => {
  const info = useAppSelector(
    (state) => state.toolbox.tools[Tool.Cv] as CvToolInfo | undefined
  );

  if (info?.preview === undefined)
    // return empty layer while module is loading
    return <Layer />;

  const InterfacePreview = info.preview;
  return <InterfacePreview {...props} />;
};
