import React from "react";
import { useAppSelector } from "../../../../app/hooks";
import { RootState } from "../../../../app/store";
import { Transformation } from "../../../../types/geometry";
import { selectToolboxTool } from "../../slice/toolbox";
import { previewRegistry } from "../../toolbox";
import { operationStateOfGroup } from "../../types/operation";
import { ToolOperation } from "../../types/toolbox-operations";

export type IProps = {
  transformation: Transformation;
};

const selectToolOperationState = (state: RootState) =>
  operationStateOfGroup<ToolOperation>(state.operation.current, "tool/");

const PreviewLayer = ({ transformation }: IProps) => {
  const state = useAppSelector(selectToolOperationState);
  const selection = useAppSelector(selectToolboxTool);
  const tool = state?.tool ?? selection;

  if (tool === undefined) return null;
  const Component = previewRegistry[tool];
  if (Component === undefined) return null;

  return <Component state={state} transformation={transformation} />;
};

export default PreviewLayer;
