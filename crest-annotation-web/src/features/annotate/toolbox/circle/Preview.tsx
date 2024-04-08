import { Layer } from "react-konva";
import { CircleToolState } from "./types";
import { Circle } from "../../components/shapes/Circle";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<CircleToolState> = ({ state }) => {
  return (
    <Layer>
      {state && (
        <Circle
          identifier="__preview__"
          shapeConfig={{ stroke: "#ff0000" }}
          shape={state.shape}
        />
      )}
    </Layer>
  );
};
