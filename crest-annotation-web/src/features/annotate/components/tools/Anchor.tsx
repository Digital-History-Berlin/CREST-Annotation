import React from "react";
import { ShapeConfig } from "konva/lib/Shape";
import { Circle } from "react-konva";

const Anchor = ({ ...props }: ShapeConfig) => {
  return <Circle {...props} draggable />;
};

export default Anchor;
