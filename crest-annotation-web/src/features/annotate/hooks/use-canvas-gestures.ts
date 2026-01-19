import { RefObject, useCallback, useEffect, useRef } from "react";
import { useGesture } from "@use-gesture/react";
import Konva from "konva";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectTransformation, updateTransformation } from "../slice/canvas";
import {
  ClientSize,
  ImageSize,
  scaleSize,
  translateBounds,
} from "../utils/canvas-bounds";

interface CanvasGestureOptions {
  containerRef: RefObject<HTMLDivElement>;
  stageRef: RefObject<Konva.Stage>;

  maxScale?: number;
  zoomSensitivity?: number;
  fitPadding?: number;
  lerpFactor?: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const clamp = (x: number, min: number, max: number) =>
  Math.min(max, Math.max(min, x));

const minScale = (
  { width, height }: ImageSize,
  { clientWidth, clientHeight }: ClientSize,
  fitPadding: number
) => {
  const canvasWidth = clientWidth * (1 - 2 * fitPadding);
  const canvasHeight = clientHeight * (1 - 2 * fitPadding);

  return Math.min(canvasWidth / width, canvasHeight / height);
};

/**
 * Provides gesture bindings for canvas pan/zoom using @use-gesture/react
 */
export const useCanvasGestures = ({
  containerRef,
  stageRef,
  // provide reasonable defaults
  maxScale = 1.0,
  zoomSensitivity = 0.0025,
  fitPadding = 0.02,
  lerpFactor = 0.15,
}: CanvasGestureOptions) => {
  const dispatch = useAppDispatch();
  const transformation = useAppSelector(selectTransformation);

  // use ref to access current transformation in callbacks
  const transformRef = useRef(transformation);
  transformRef.current = transformation;

  // target transformation for interpolation
  const targetRef = useRef(transformation);
  const animationRef = useRef<number | null>(null);

  // animation loop for smooth zoom
  const animate = useCallback(() => {
    const current = transformRef.current;
    const target = targetRef.current;

    const scale = lerp(current.scale, target.scale, lerpFactor);
    const x = lerp(current.translate.x, target.translate.x, lerpFactor);
    const y = lerp(current.translate.y, target.translate.y, lerpFactor);

    // check if close enough to target
    const ds = Math.abs(scale - target.scale);
    const dx = Math.abs(x - target.translate.x);
    const dy = Math.abs(y - target.translate.y);

    if (ds < 0.0001 && dx < 0.1 && dy < 0.1) {
      // snap to target and stop animation
      dispatch(updateTransformation(target));
      animationRef.current = null;
      return;
    }

    dispatch(
      updateTransformation({
        scale: scale,
        translate: { x, y },
      })
    );

    animationRef.current = requestAnimationFrame(animate);
  }, [dispatch, lerpFactor]);

  // cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // start animation towards target
  const animateTo = useCallback(
    (target: { scale: number; translate: { x: number; y: number } }) => {
      targetRef.current = target;
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      }
    },
    [animate]
  );

  const bind = useGesture(
    {
      onWheel: ({ delta: [, dy] }) => {
        const stage = stageRef.current;
        const container = containerRef.current;
        const current = transformRef.current;

        const pointer = stage?.getPointerPosition();
        const layer = stage?.findOne<Konva.Layer>("Layer");
        const image = layer?.findOne<Konva.Image>("Image");

        if (!container || !pointer || !image) return;

        // transform pointer coordinates
        const { x, y } = pointer;
        const tx = (x - current.translate.x) / current.scale;
        const ty = (y - current.translate.y) / current.scale;

        // calculate new scale with normalized delta
        const imageSize = image.size();
        const min = minScale(imageSize, container, fitPadding);
        const f = Math.exp(-dy * zoomSensitivity);
        const scale = clamp(current.scale * f, min, maxScale);

        // zoom towards cursor with pan limits applied
        const translate = translateBounds(
          { x: x - tx * scale, y: y - ty * scale },
          scaleSize(imageSize, scale),
          container
        );

        animateTo({ translate, scale });
      },
    },
    {
      wheel: {
        eventOptions: { passive: false },
      },
    }
  );

  const resize = useCallback(
    (imageSize?: ImageSize) => {
      const container = containerRef.current;

      // get the current image size if not provided
      if (!imageSize) {
        const stage = stageRef.current;
        const layer = stage?.findOne<Konva.Layer>("Layer");
        const image = layer?.findOne<Konva.Image>("Image");

        imageSize = image?.size();
      }

      if (!imageSize || !container) return;

      // show the full image (minimum scale) and center it
      const scale = minScale(imageSize, container, fitPadding);
      const x = (container.clientWidth - imageSize.width * scale) / 2;
      const y = (container.clientHeight - imageSize.height * scale) / 2;

      dispatch(
        updateTransformation({
          translate: { x, y },
          scale,
        })
      );
    },
    [dispatch, containerRef, stageRef, fitPadding]
  );

  return {
    resize,
    bind,
  };
};
