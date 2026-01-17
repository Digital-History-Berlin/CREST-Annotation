import { useEffect } from "react";
import { Image as KonvaImage, Layer } from "react-konva";
import useImage from "use-image";
import { useAnnotationImage } from "../../slice/annotations";
import { ImageSize } from "../../utils/canvas-bounds";

interface IProps {
  onResize?: (imageSize: ImageSize) => void;
}

const BackgroundLayer = ({ onResize }: IProps) => {
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

  return (
    <Layer>
      <KonvaImage image={image} />
    </Layer>
  );
};

export default BackgroundLayer;
