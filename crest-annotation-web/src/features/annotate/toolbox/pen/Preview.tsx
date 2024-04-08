import { Layer } from "react-konva";
import { PenToolState } from "./types";
import { Line } from "../../components/shapes/Line";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<PenToolState> = ({ state }) => {
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
