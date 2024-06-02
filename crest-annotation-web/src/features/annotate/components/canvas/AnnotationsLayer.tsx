import React from "react";
import { Layer } from "react-konva";
import ComponentShape from "./Shape";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  Annotation,
  selectAnnotations,
  toggleAnnotation,
  updateShape,
} from "../../slice/annotations";
import { selectTransformation } from "../../slice/canvas";
import { Shape as DataShape } from "../../types/shapes";
import { Modifiers, Tool } from "../../types/toolbox";

interface IProps {
  onRequestCursor?: (cursor: string | undefined) => void;
}

const AnnotationsLayer = ({ onRequestCursor }: IProps) => {
  const dispatch = useAppDispatch();

  const transformation = useAppSelector(selectTransformation);
  const annotations = useAppSelector(selectAnnotations);

  // render transparent if group annotation is selected
  const modifiers = useAppSelector(
    (state) => state.toolbox.selection.modifiers
  );
  // check if annotations should be in edit mode
  const editable = useAppSelector(
    (state) => state.toolbox.selection.tool === Tool.Edit
  );
  // get current group annotation
  const groupAnnotationId = useAppSelector(
    (state) => state.toolbox.modifiers[Modifiers.Group] as string | undefined
  );

  const renderAnnotation = (annotation: Annotation) => {
    if (annotation.hidden || !annotation.shapes?.length) return;

    // toggle current annotation
    const toggle = () => dispatch(toggleAnnotation(annotation));

    return annotation.shapes.map((shape, index) => {
      // update current shape
      const update = (shape: unknown) => {
        dispatch(
          updateShape({
            id: annotation.id,
            shape: shape as DataShape,
            index,
          })
        );
      };

      const transparent =
        modifiers.includes(Modifiers.Group) &&
        annotation.id !== groupAnnotationId;

      return (
        <ComponentShape
          key={`${annotation.id}.${index}`}
          identifier={`${annotation.id}.${index}`}
          shape={shape}
          color={annotation.label?.color ?? "#f00"}
          transformation={transformation}
          selected={annotation.selected === true}
          editable={editable}
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
