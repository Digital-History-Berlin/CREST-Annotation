import { Fragment, useMemo } from "react";
import { Layer } from "react-konva";
import {
  CvCrestDetectionToolData,
  CvCrestDetectionToolOperationState,
} from "./types";
import Shape from "../../../components/canvas/Shape";
import { RectangleShape } from "../../../components/shapes/Rectangle";
import { PreviewFC } from "../../../types/components";
import { ShapeType } from "../../../types/shapes";
import { useCvToolData } from "../hooks";

const previewPalette = [
  "#ff8700",
  "#0aff99",
  "#580aff",
  "#ffd300",
  "#147df5",
  "#a1ff0a",
  "#0aefff",
  "#deff0a",
  "#be0aff",
];

const defaultData: CvCrestDetectionToolData = {};

export const Preview: PreviewFC<CvCrestDetectionToolOperationState> = ({
  state,
  transformation,
}) => {
  const { data } = useCvToolData({ frontend: "crest-detection", defaultData });

  const rect = useMemo(
    () =>
      state?.boundingBox && {
        type: ShapeType.Rectangle,
        x: state.boundingBox.bbox[0],
        y: state.boundingBox.bbox[1],
        width: state.boundingBox.bbox[2],
        height: state.boundingBox.bbox[3],
        caption: state.boundingBox.predictedIou.toFixed(2),
      },
    [state?.boundingBox]
  );

  const mask = useMemo(
    () =>
      state?.mask && {
        type: ShapeType.Mask,
        mask: state.mask.mask,
        width: state.mask.mask[0].length,
        height: state.mask.mask.length,
        dx: 0,
        dy: 0,
        preview: true,
      },
    [state?.mask]
  );

  if (rect) {
    return (
      <Layer>
        <Shape
          identifier={`__previewRect__`}
          shape={rect}
          color="#f00"
          transformation={transformation}
        />
        {mask && (
          <Shape
            identifier={`__previewMask__`}
            shape={mask}
            color="#f00"
            transformation={transformation}
          />
        )}
      </Layer>
    );
  }

  if (data === undefined) return <Fragment />;

  return (
    <Layer>
      {data?.boundingBoxes?.map((boundingBox, i) => {
        const shape: RectangleShape = {
          type: ShapeType.Rectangle,
          x: boundingBox.bbox[0],
          y: boundingBox.bbox[1],
          width: boundingBox.bbox[2],
          height: boundingBox.bbox[3],
          caption: boundingBox.predictedIou.toFixed(2),
        };

        return (
          <Shape
            key={i}
            identifier={`__preview__`}
            shape={shape}
            color={previewPalette[i % previewPalette.length]}
            transformation={transformation}
          />
        );
      })}
    </Layer>
  );
};
