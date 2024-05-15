import { Layer } from "react-konva";
import ComponentShape from "../components/canvas/Shape";
import { PreviewFC } from "../types/components";
import { Shape } from "../types/shapes";

/// Generic preview for single shape tools
export const ShapePreview: PreviewFC<{ shape: Shape }> = ({
  state,
  transformation,
}) => {
  return (
    <Layer>
      {state && (
        <ComponentShape
          identifier="__preview__"
          shape={state.shape}
          color="#ff0000"
          transformation={transformation}
        />
      )}
    </Layer>
  );
};
