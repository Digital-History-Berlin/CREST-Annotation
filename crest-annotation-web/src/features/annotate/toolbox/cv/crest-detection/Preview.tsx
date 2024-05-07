import { Layer } from "react-konva";
import { SamBoundingBox } from "./types";
import Shape from "../../../components/canvas/Shape";
import { RectangleShape } from "../../../components/shapes/Rectangle";
import { PreviewFC } from "../../../types/components";
import { ShapeType } from "../../../types/shapes";
import { CvToolState } from "../types";

export const Preview: PreviewFC<
  CvToolState & { boundingBoxes?: SamBoundingBox[] }
> = ({ state, transformation }) => {
  console.log(state);

  return (
    <Layer>
      {state?.boundingBoxes?.map((boundingBox) => {
        const shape: RectangleShape = {
          type: ShapeType.Rectangle,
          x: boundingBox.bbox[0],
          y: boundingBox.bbox[1],
          width: boundingBox.bbox[2],
          height: boundingBox.bbox[3],
        };

        if (boundingBox["predictedIou"] < 1.0) return null;

        return (
          <Shape
            identifier={`__preview__`}
            shape={shape}
            color="#f00"
            transformation={transformation}
          />
        );
      })}
    </Layer>
  );
};
