import React from "react";
import { useAppSelector } from "../../../../app/hooks";
import { Transformation } from "../../../../types/geometry";
import { previewRegistry } from "../../toolbox";

export type IProps = {
  transformation: Transformation;
};

const PreviewLayer = ({ transformation }: IProps) => {
  const state = useAppSelector((state) => state.operation.current?.state);
  const selection = useAppSelector((state) => state.toolbox.selection.tool);
  const tool = state?.tool ?? selection;

  if (tool === undefined) return null;
  const Component = previewRegistry[tool];
  if (Component === undefined) return null;

  return <Component state={state} transformation={transformation} />;
};

export default PreviewLayer;
