import React from "react";
import { CheckCircle } from "@mui/icons-material";
import { Card, CardActionArea, CardMedia, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetImageUriQuery } from "../../../api/enhancedApi";
import { Object as DataObject } from "../../../api/openApi";
import Loader from "../../../components/Loader";

interface IProps {
  projectId?: string;
  object: DataObject;
}

const ObjectCard = ({ projectId, object }: IProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Card
      sx={{
        maxWidth: "260px",
        height: "140px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <CardActionArea
        onClick={() => navigate(`/annotate/${projectId}/${object.id}`)}
      >
        <Loader
          query={useGetImageUriQuery({
            objectId: object.id,
            imageRequest: { thumbnail: true, width: 240 },
          })}
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
