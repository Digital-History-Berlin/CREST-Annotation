import { Layer } from "react-konva";
import { CvToolState } from "./types";
import Shape from "../../components/canvas/Shape";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<CvToolState> = ({ state, transformation }) => {
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
