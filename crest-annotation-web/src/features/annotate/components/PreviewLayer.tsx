import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { Transformation } from "../../../types/geometry";
import { ToolboxOperationState, useRegistry } from "../hooks/use-registry";
import { selectActiveTool } from "../slice/tools";

export type IProps = {
  state: ToolboxOperationState;
  transformation: Transformation;
};

const PreviewLayer = ({ state, transformation }: IProps) => {
  const tool = useAppSelector(selectActiveTool);

  const { previewRegistry } = useRegistry();
  const Component = previewRegistry[tool];
  if (Component === undefined) return null;

  return <Component state={state} transformation={transformation} />;
};

export default PreviewLayer;
