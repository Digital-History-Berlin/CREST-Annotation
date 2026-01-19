import { useEffect } from "react";
import { Image as KonvaImage, Layer } from "react-konva";
import useImage from "use-image";
import { useAppSelector } from "../../../../app/hooks";
import { useAnnotationImage } from "../../slice/annotations";
import { selectInitialized } from "../../slice/canvas";
import { ImageSize } from "../../utils/canvas-bounds";

interface IProps {
  onResize?: (imageSize: ImageSize) => void;
}

const BackgroundLayer = ({ onResize }: IProps) => {
  const initialized = useAppSelector(selectInitialized);
  const source = useAnnotationImage();
  const [image] = useImage(source);

  useEffect(() => {
    // forward to parent component
    if (image?.width && image.height)
      onResize?.({
        width: image.width,
        height: image.height,
      });
  }, [image?.width, image?.height, onResize]);

  // avoid flickering
  if (!initialized) return null;

  return (
    <Layer>
      <KonvaImage image={image} />
    </Layer>
  );
};

export default BackgroundLayer;
