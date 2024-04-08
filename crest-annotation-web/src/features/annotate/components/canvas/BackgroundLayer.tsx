import { Layer } from "react-konva";
import BackgroundImage from "./BackgroundImage";
import { useGetImageUriQuery } from "../../../../api/enhancedApi";
import { useAnnotationObject } from "../../slice/annotations";

interface IProps {
  onResize?: (width: number, height: number) => void;
}

const BackgroundLayer = ({ onResize }: IProps) => {
  const object = useAnnotationObject();

  const { data, isLoading, isError } = useGetImageUriQuery({
    objectId: object.id,
    imageRequest: { height: 800 },
  });

  return (
    <Layer>
      {data && <BackgroundImage imageUri={data} onResize={onResize} />}
    </Layer>
  );
};

export default BackgroundLayer;
