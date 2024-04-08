import { useMemo } from "react";
import { Layer } from "react-konva";
import { PolygonToolState } from "./types";
import { Polygon } from "../../components/shapes/Polygon";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<PolygonToolState> = ({ state }) => {
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
