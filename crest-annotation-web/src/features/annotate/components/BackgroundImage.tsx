import { Image } from "react-konva";
import useImage from "use-image";

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
