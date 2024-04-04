import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { Transformation } from "../../../types/geometry";
import { Operation } from "../hooks/use-operation-controller";
import { useRegistry } from "../hooks/use-registry";
import { selectActiveTool } from "../slice/tools";

export type IProps = {
  operation?: Operation;
  transformation: Transformation;
};

const PreviewLayer = ({ operation, transformation }: IProps) => {
  const tool = useAppSelector(selectActiveTool);

  const { previewRegistry } = useRegistry();
  const Component = previewRegistry[tool];
  if (Component === undefined) return null;

  return <Component operation={operation} transformation={transformation} />;
};

export default PreviewLayer;
