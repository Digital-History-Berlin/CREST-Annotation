import React from "react";
import { CheckCircle } from "@mui/icons-material";
import { Card, CardActionArea, CardMedia, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetImageUriQuery } from "../../../api/enhancedApi";
import { SummaryObject } from "../../../api/openApi";
import Loader from "../../../components/Loader";

interface IProps {
  projectId?: string;
  object: SummaryObject;
}

const ObjectCard = ({ projectId, object }: IProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const imageQuery = useGetImageUriQuery({
    objectId: object.id,
    imageRequest: { thumbnail: true, width: 240 },
  });

  return (
    <Card
      sx={{
        maxWidth: "100%",
        height: "140px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/annotate/${projectId}/${object.id}`)}
      >
        <Loader
          query={imageQuery}
          render={({ data: uri }) => (
            <>
              {object.annotated && (
                <CheckCircle
                  color="success"
                  sx={{
                    position: "absolute",
                    left: theme.spacing(1),
                    top: theme.spacing(1),
                  }}
                />
              )}
              <CardMedia component="img" height="140" image={uri} />
            </>
          )}
        />
      </CardActionArea>
    </Card>
  );
};

export default ObjectCard;
