import React from "react";
import { Layer } from "react-konva";
import ShapeComponent from "./tools/Shape";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  Annotation,
  Shape as AnnotationShape,
  selectAnnotations,
  toggleAnnotation,
  updateShape,
} from "../slice/annotations";
import { selectTransformation } from "../slice/canvas";
import {
  Modifiers,
  Tool,
  selectActiveModifiers,
  selectActiveTool,
  selectGroupAnnotationId,
} from "../slice/tools";

interface IProps {
  onRequestCursor?: (cursor: string | undefined) => void;
}

const AnnotationsLayer = ({ onRequestCursor }: IProps) => {
  const dispatch = useAppDispatch();

  const annotations = useAppSelector(selectAnnotations);
  const transformation = useAppSelector(selectTransformation);
  const modifiers = useAppSelector(selectActiveModifiers);
  const tool = useAppSelector(selectActiveTool);

  const groupAnnotationId = useAppSelector(selectGroupAnnotationId);

  const renderAnnotation = (annotation: Annotation) => {
    if (annotation.hidden || !annotation.shapes?.length) return;

    // toggle current annotation
    const toggle = () => dispatch(toggleAnnotation(annotation));

    return annotation.shapes.map((shape, index) => {
      // update current shape
      const update = (shape: AnnotationShape) => {
        dispatch(
          updateShape({
            id: annotation.id,
            shape,
            index,
          })
        );
      };

      const transparent =
        modifiers.includes(Modifiers.Group) &&
        annotation.id !== groupAnnotationId;

      return (
        <ShapeComponent
          identifier={`${annotation.id}.${index}`}
          shape={shape}
          color={annotation.label?.color ?? "#f00"}
          transformation={transformation}
          selected={annotation.selected === true}
          editable={tool.tool === Tool.Edit}
          transparent={transparent}
          onClick={toggle}
          onUpdate={update}
          onRequestCursor={onRequestCursor}
        />
      );
    });
  };

  return <Layer>{annotations.map(renderAnnotation)}</Layer>;
};

export default AnnotationsLayer;
