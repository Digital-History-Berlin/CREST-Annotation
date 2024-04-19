import { useEffect } from "react";
import { Image as KonvaImage, Layer } from "react-konva";
import useImage from "use-image";
import { useAnnotationImage } from "../../slice/annotations";

interface IProps {
  onResize?: (width: number, height: number) => void;
}

const BackgroundLayer = ({ onResize }: IProps) => {
  const source = useAnnotationImage();
  const [image] = useImage(source);

  useEffect(() => {
    // forward to parent component
    if (image?.width && image.height) onResize?.(image.width, image.height);
  }, [image?.width, image?.height, onResize]);

  return (
    <Layer>
      <KonvaImage image={image} />
    </Layer>
  );
};

export default BackgroundLayer;
