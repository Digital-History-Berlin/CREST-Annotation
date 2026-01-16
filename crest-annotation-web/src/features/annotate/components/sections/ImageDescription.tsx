import { Typography } from "@mui/material";
import { useAnnotationObject } from "../../slice/annotations";

export const ImageDescription = () => {
  const object = useAnnotationObject();

  return (
    <Typography variant="body2" color="text.secondary">
      {object.object_uuid}
    </Typography>
  );
};
