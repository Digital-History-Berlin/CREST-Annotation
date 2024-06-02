import { PolygonToolOperation } from "./types";
import { PolygonShape } from "../../components/shapes/Polygon";
import { updateAnnotation } from "../../slice/annotations";
import { operationBegin } from "../../slice/operation";
import {
  GestureEvent,
  GestureIdentifier,
  GestureOverload,
} from "../../types/events";
import { OperationContextApi } from "../../types/operation-thunks";
import { ShapeType } from "../../types/shapes";
import { Tool, ToolGroup } from "../../types/toolbox";
import {
  ToolApi,
  ToolGesturePayload,
  ToolThunk,
  ToolThunks,
  ToolboxThunkApi,
} from "../../types/toolbox-thunks";
import {
  createActivateThunk,
  createLabelShapeThunk,
  createToolSelectors,
  withCurrentOperationContext,
} from "../create-custom-tool";
import { selectGroupModifierState } from "../tool-modifiers";

const activate = createActivateThunk({ tool: Tool.Polygon });

const proceedClose = (
  operation: PolygonToolOperation,
  contextApi: OperationContextApi<PolygonToolOperation>,
  thunkApi: ToolboxThunkApi,
  { requestLabel, cancelLabel }: ToolApi
) => {
  // discard if polygon is too small
  if (operation.state.shape.points.length < 6) return contextApi.cancel();

  const shape = { ...operation.state.shape, closed: true };
  const group = selectGroupModifierState(thunkApi.getState());
  if (group)
    return contextApi.complete().then(() => {
      thunkApi.dispatch(
        updateAnnotation({
          ...group,
          // append the shape to the existing group annotation
          shapes: [...(group.shapes || []), shape],
        })
      );
    });

  // complete polygon and request label
  return contextApi
    .update({
      ...operation,
      state: {
        ...operation.state,
        shape,
        preview: undefined,
        labeling: true,
      },
      cancellation: cancelLabel,
      completion: cancelLabel,
    })
    .then(() => requestLabel());
};

const proceedClick = (
  { transformation, transformed: { x, y } }: GestureEvent,
  operation: PolygonToolOperation,
  contextApi: OperationContextApi<PolygonToolOperation>,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => {
  // labeling process can be canceled by clicking
  if (operation.state.labeling) return contextApi.cancel();

  // finish on click near start
  const dx = operation.state.shape.points[0] - x;
  const dy = operation.state.shape.points[1] - y;
  const threshold = 5 / transformation.scale;
  if (dx * dx + dy * dy < threshold * threshold)
    return proceedClose(operation, contextApi, thunkApi, toolApi);

  // append new point
  return contextApi.update({
    ...operation,
    state: {
      ...operation.state,
      // change existing shape
      shape: {
        ...operation.state.shape,
        points: [...operation.state.shape.points, x, y],
      },
    },
  });
};

const proceedMove = (
  { transformed: { x, y } }: GestureEvent,
  operation: PolygonToolOperation,
  contextApi: OperationContextApi<PolygonToolOperation>
) => {
  if (operation?.state.shape.closed === false)
    // update preview for explicitly open polygons
    return contextApi.state({ ...operation.state, preview: [x, y] });
};

const proceed = (
  gesture: GestureEvent,
  contextApi: OperationContextApi<PolygonToolOperation>,
  thunkApi: ToolboxThunkApi,
  toolApi: ToolApi
) => {
  const operation = contextApi.getState();

  if (
    gesture.identifier === GestureIdentifier.Click ||
    // during polygon creation, one might do short drags instead of clicks
    // (i.e. if the mouse is being moved fast)
    // it is more intuitive to treat these as clicks
    gesture.identifier === GestureIdentifier.DragEnd
  ) {
    switch (gesture.overload) {
      case GestureOverload.Primary:
        return proceedClick(gesture, operation, contextApi, thunkApi, toolApi);
      case GestureOverload.Secondary:
        return proceedClose(operation, contextApi, thunkApi, toolApi);
      case GestureOverload.Tertiary:
        return contextApi.cancel();
    }
  }

  if (
    gesture.identifier === GestureIdentifier.Move ||
    gesture.identifier === GestureIdentifier.DragMove
  )
    return proceedMove(gesture, operation, contextApi);
};

const begin: ToolThunk<GestureEvent> = async (
  { identifier, overload, transformed: { x, y } },
  { dispatch }
) => {
  if (
    identifier === GestureIdentifier.Click &&
    overload === GestureOverload.Primary
  ) {
    // create a new polygon
    const shape: PolygonShape = {
      type: ShapeType.Polygon,
      points: [x, y],
      closed: false,
    };

    await dispatch(
      operationBegin<PolygonToolOperation>({
        operation: {
          type: "tool/polygon",
          state: { tool: Tool.Polygon, shape, preview: [x, y] },
        },
      })
    ).unwrap();
  }
};

export const gesture: ToolThunk<ToolGesturePayload> = (
  { gesture },
  thunkApi,
  toolApi
) =>
  withCurrentOperationContext<PolygonToolOperation>(
    { thunkApi, type: "tool/polygon" },
    // proceed with existing polygon
    (contextApi) => proceed(gesture, contextApi, thunkApi, toolApi),
    // start with new polygon
    () => begin(gesture, thunkApi, toolApi)
  );

export const label = createLabelShapeThunk({ operation: "tool/polygon" });

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
