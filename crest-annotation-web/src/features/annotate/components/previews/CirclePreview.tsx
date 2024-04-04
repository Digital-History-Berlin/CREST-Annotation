import { Circle as KonvaCircle, Layer } from "react-konva";
import { CircleOperation } from "../../tools/circle";
import { PreviewFC } from "../../types/tools";
import { Circle } from "../shapes/Circle";

export const CirclePreview: PreviewFC<CircleOperation> = ({
  operation,
  transformation,
}) => {
  return (
    <Layer>
      {operation && (
        <Circle
          identifier="__preview__"
          shapeConfig={{ fill: "#ff0000" }}
          shape={operation.shape}
        />
      )}
      <KonvaCircle x={20} y={20} radius={200} />
    </Layer>
  );
};
