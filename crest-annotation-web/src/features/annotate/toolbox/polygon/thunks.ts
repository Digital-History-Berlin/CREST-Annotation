import { PolygonToolOperation } from "./types";
import {
  operationBegin,
  operationCancel,
  operationUpdate,
} from "../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../types/events";
import { ShapeType } from "../../types/shapes";
import { ToolGesturePayload, ToolThunks } from "../../types/thunks";
import { Tool, ToolGroup } from "../../types/toolbox";
import {
  AtomicToolThunk,
  createActivateThunk,
  createLabelThunk,
  createToolSelectors,
  createToolThunk,
} from "../custom-tool";

const activate = createActivateThunk({ tool: Tool.Polygon });

const closePolygon: AtomicToolThunk<GestureEvent, PolygonToolOperation> = (
  gesture,
  operation,
  { dispatch },
  { requestLabel, cancelLabel }
) => {
  if (operation === undefined) return;
  // discard if polygon is too small
  if (operation.state.shape.points.length < 6)
    return dispatch(operationCancel(operation));

  // complete ongoing polygon
  dispatch(
    operationUpdate({
      ...operation,
      state: {
        ...operation.state,
        shape: { ...operation.state.shape, closed: true },
        preview: undefined,
        labeling: true,
      },
      // register cleanup
      cancellation: cancelLabel,
      finalization: cancelLabel,
    })
  );

  // request a label for the shape
  requestLabel();
};

const primaryClick: AtomicToolThunk<GestureEvent, PolygonToolOperation> = (
  gesture,
  operation,
  thunkApi,
  toolApi
) => {
  const {
    transformation,
    transformed: { x, y },
  } = gesture;

  if (operation === undefined)
    return thunkApi.dispatch(
      operationBegin({
        type: "tool/polygon",
        state: {
          tool: Tool.Polygon,
          // create new shape
          shape: {
            type: ShapeType.Polygon,
            points: [x, y],
            closed: false,
          },
          preview: [x, y],
        },
      })
    );

  if (operation.state.labeling)
    // labeling process is can be canceled by clicking
    return thunkApi.dispatch(operationCancel(operation));

  // finish on click near start
  const dx = operation.state.shape.points[0] - x;
  const dy = operation.state.shape.points[1] - y;
  const threshold = 5 / transformation.scale;
  if (dx * dx + dy * dy < threshold * threshold)
    return closePolygon(gesture, operation, thunkApi, toolApi);

  // append new point
  return thunkApi.dispatch(
    operationUpdate({
      ...operation,
      state: {
        ...operation.state,
        // change existing shape
        shape: {
          ...operation.state.shape,
          points: [...operation.state.shape.points, x, y],
        },
      },
    })
  );
};

const move: AtomicToolThunk<GestureEvent, PolygonToolOperation> = (
  { transformed: { x, y } },
  operation,
  { dispatch }
) => {
  // update preview only for open polygons
  if (operation?.state.shape.closed !== false) return;

  return dispatch(
    operationUpdate({
      ...operation,
      state: { ...operation.state, preview: [x, y] },
    })
  );
};

export const gesture = createToolThunk<
  ToolGesturePayload,
  PolygonToolOperation
>(
  { operation: "tool/polygon" },
  ({ gesture }, operation, thunkApi, toolApi) => {
    if (
      gesture.identifier === GestureIdentifier.Click ||
      // during polygon creation, one might do short drags instead of clicks
      // (i.e. if the mouse is being moved fast)
      // it is more intuitive to treat these as clicks
      gesture.identifier === GestureIdentifier.DragEnd
    ) {
      switch (gesture.overload) {
        case GestureOverload.Primary:
          return primaryClick(gesture, operation, thunkApi, toolApi);
        case GestureOverload.Secondary:
          return closePolygon(gesture, operation, thunkApi, toolApi);
        case GestureOverload.Tertiary:
          return thunkApi.dispatch(operationCancel(operation));
      }
    }

    if (
      gesture.identifier === GestureIdentifier.Move ||
      gesture.identifier === GestureIdentifier.DragMove
    )
      return move(gesture, operation, thunkApi, toolApi);
  }
);

export const label = createLabelThunk({ operation: "tool/polygon" });

export const polygonThunks: ToolThunks = {
  activate,
  gesture,
  label,
};

export const polygonSelectors = createToolSelectors({
  tool: Tool.Polygon,
  group: ToolGroup.Shape,
  icon: {
    name: "mdi:vector-polygon-variant",
    style: { fontSize: "25px" },
    tooltip: "Polygon",
  },
});
