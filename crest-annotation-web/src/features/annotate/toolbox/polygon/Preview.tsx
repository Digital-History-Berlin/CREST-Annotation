import { useMemo } from "react";
import { Layer } from "react-konva";
import { PolygonToolOperationState } from "./types";
import Shape from "../../components/canvas/Shape";
import { PreviewFC } from "../../types/components";

export const Preview: PreviewFC<PolygonToolOperationState> = ({
  state,
  transformation,
}) => {
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
        <Shape
          identifier="__preview__"
          shape={shape}
          color="#ff0000"
          transformation={transformation}
        />
      )}
    </Layer>
  );
};
