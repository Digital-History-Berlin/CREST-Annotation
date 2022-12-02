import useImage from "use-image";
import { Image } from "react-konva";

interface IProps {
  imageUri: string;
}

const defaultProps = {};

const BackgroundImage = ({ imageUri }: IProps) => {
  const [image] = useImage(imageUri);
  return <Image image={image} />;
};

BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
