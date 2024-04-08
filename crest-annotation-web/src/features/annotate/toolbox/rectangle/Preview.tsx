import { Layer } from "react-konva";
import { RectangleToolState } from "./types";
import { Rectangle } from "../../components/shapes/Rectangle";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<RectangleToolState> = ({ state }) => {
  return (
    <Layer>
      {state && (
        <Rectangle
          identifier="__preview__"
          shapeConfig={{ stroke: "#ff0000" }}
          shape={state.shape}
        />
      )}
    </Layer>
  );
};
