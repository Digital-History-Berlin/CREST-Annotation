import { Layer } from "react-konva";
import { CvToolState } from "./types";
import { Mask } from "../../../components/shapes/Mask";
import { PreviewFC } from "../../types/preview";

export const Preview: PreviewFC<CvToolState> = ({ state, transformation }) => {
  return (
    <Layer>
      {state?.shape && (
        <Mask
          identifier={`__preview__`}
          shape={state.shape}
          color="#f00"
          transformation={transformation}
        />
      )}
    </Layer>
  );
};
