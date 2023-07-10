import { useEffect } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface IProps {
  imageUri: string;
  onResize?: (width: number, height: number) => void;
}

const defaultProps = {};

const BackgroundImage = ({ imageUri, onResize }: IProps) => {
  const [image] = useImage(imageUri);

  useEffect(() => {
    // forward to parent component
    if (image?.width && image.height) onResize?.(image.width, image.height);
  }, [image?.width, image?.height, onResize]);

  return <KonvaImage image={image} />;
};

BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
