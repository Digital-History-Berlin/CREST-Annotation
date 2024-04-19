import { Layer } from "react-konva";
import Shape from "../../../components/canvas/Shape";
import { MaskShape } from "../../../components/shapes/Mask";
import { PreviewFC } from "../../../types/preview";
import { CvToolState } from "../types";

export const Preview: PreviewFC<CvToolState & { shape: MaskShape }> = ({
  state,
  transformation,
}) => {
  return (
    <Layer>
      {state?.shape && (
        <Shape
          identifier={`__preview__`}
          shape={state.shape}
          color="#f00"
          transformation={transformation}
        />
      )}
    </Layer>
  );
};
