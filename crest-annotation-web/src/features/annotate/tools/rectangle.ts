export const rectangle = undefined;
/*

const onGestureDragStart: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary) return ["ignore"];
  if (shape) throw new ShapeGestureError("Shape exists");

  return [
    "proceed",
    {
      x: x,
      y: y,
      width: 0,
      height: 0,
      tool: Tool.Rectangle,
    },
  ];
};

const onGestureDragMove: ShapeEventHandler = (
  shape,
  { overload, transformed: { x, y } }
) => {
  if (overload !== GestureOverload.Primary) return ["ignore"];
  const rectangle = validate(shape);

  return [
    "proceed",
    {
      ...rectangle,
      width: x - rectangle.x,
      height: y - rectangle.y,
    },
  ];
};

const onGestureDragEnd: ShapeEventHandler = (shape) => {
  return ["resolve", validate(shape)];
};

const RectangleTool: ShapeTool = {
  component: Rectangle,
  onGestureDragStart,
  onGestureDragMove,
  onGestureDragEnd,
};

*/
