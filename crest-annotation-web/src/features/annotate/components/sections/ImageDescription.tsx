import { Typography } from "@mui/material";
import { useGetImageDescriptionQuery } from "../../../../api/enhancedApi";
import { useAnnotationObject } from "../../slice/annotations";

export const ImageDescription = () => {
  const object = useAnnotationObject();

  const { data: description } = useGetImageDescriptionQuery({
    objectId: object.id,
  });

  return (
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  );
};
