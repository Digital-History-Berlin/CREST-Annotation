import useImage from 'use-image';
import { Image } from 'react-konva';

const url = "https://konvajs.org/assets/yoda.jpg";

export function BackgroundImage(){
    const [image] = useImage(url);
    return <Image image={image} />;
}