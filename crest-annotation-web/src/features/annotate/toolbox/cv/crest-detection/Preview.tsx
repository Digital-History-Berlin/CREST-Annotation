import { Fragment, useCallback, useMemo } from "react";
import { Layer } from "react-konva";
import { toMaskShape, toRectShape, update } from "./thunks";
import {
  CvCrestDetectionToolOperationState,
  useCvCrestDetectionToolData,
} from "./types";
import { useAppDispatch } from "../../../../../app/hooks";
import Shape from "../../../components/canvas/Shape";
import { RectangleShape } from "../../../components/shapes/Rectangle";
import { PreviewFC } from "../../../types/components";

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

export const Preview: PreviewFC<CvCrestDetectionToolOperationState> = ({
  state,
  transformation,
}) => {
  const dispatch = useAppDispatch();
  const { data } = useCvCrestDetectionToolData();

  const rect = useMemo(
    () =>
      state?.boundingBox && {
        ...toRectShape(state.boundingBox),
        caption: state.boundingBox.predictedIou.toFixed(2),
      },
    [state?.boundingBox]
  );

  const mask = useMemo(
    () => state?.mask && toMaskShape(state.mask),
    [state?.mask]
  );

  const handleEdit = useCallback(
    (data: unknown) => dispatch(update({ shape: data as RectangleShape })),
    [dispatch]
  );

  if (rect) {
    return (
      <Layer>
        <Shape
          identifier={`__previewRect__`}
          shape={rect}
          color="#f00"
          transformation={transformation}
          editable={state?.edit}
          onUpdate={handleEdit}
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
        const shape = {
          ...toRectShape(boundingBox),
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
