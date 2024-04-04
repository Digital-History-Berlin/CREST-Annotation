import { useMemo } from "react";
import { Layer } from "react-konva";
import { PreviewFC } from "../../types/tools";
import { Polygon, PolygonShape } from "../shapes/Polygon";

export interface PolygonToolState {
  shape: PolygonShape;
  // additional operation state
  preview?: [number, number];
  labeling?: boolean;
}

export const PolygonPreview: PreviewFC<PolygonToolState> = ({ state }) => {
  const shape = useMemo(() => {
    if (state === undefined) return undefined;
    if (state.preview === undefined) return state.shape;

    return {
      ...state.shape,
      // append the preview to the points
      points: [...state.shape.points, ...state.preview],
    };
  }, [state]);

  return (
    <Layer>
      {shape && (
        <Polygon
          identifier="__preview__"
          shapeConfig={{ stroke: "#ff0000" }}
          shape={shape}
        />
      )}
    </Layer>
  );
};
