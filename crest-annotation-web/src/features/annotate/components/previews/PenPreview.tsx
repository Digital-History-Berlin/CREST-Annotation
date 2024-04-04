import { Layer } from "react-konva";
import { PreviewFC } from "../../types/tools";
import { Line, LineShape } from "../shapes/Line";

export interface PenToolState {
  shape: LineShape;
  // additional operation state
  labeling?: boolean;
}

export const PenPreview: PreviewFC<PenToolState> = ({ state }) => {
  return (
    <Layer>
      {state && (
        <Line
          identifier="__preview__"
          shapeConfig={{ stroke: "#ff0000" }}
          shape={state.shape}
        />
      )}
    </Layer>
  );
};
