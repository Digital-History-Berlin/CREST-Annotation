import { Layer } from "react-konva";
import { CvGenericSingleMaskToolOperationState } from "./types";
import Shape from "../../../components/canvas/Shape";
import { PreviewFC } from "../../../types/components";

export const Preview: PreviewFC<CvGenericSingleMaskToolOperationState> = ({
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
