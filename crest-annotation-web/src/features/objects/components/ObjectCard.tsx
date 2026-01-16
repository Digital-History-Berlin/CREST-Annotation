import React from "react";
import { CheckCircle } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
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
    <Card>
      <CardActionArea
        onClick={() => navigate(`/annotate/${projectId}/${object.id}`)}
      >
        <Box
          sx={{
            maxWidth: "100%",
            height: "140px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Loader
            query={imageQuery}
            render={({ data: uri }) => (
              <>
                {object.position && (
                  <Chip
                    label={object.position}
                    sx={{
                      position: "absolute",
                      left: theme.spacing(1),
                      bottom: theme.spacing(1),
                      background: theme.palette.grey[100],
                    }}
                  />
                )}
                {object.annotated && (
                  <CheckCircle
                    color="success"
                    sx={{
                      position: "absolute",
                      right: theme.spacing(1),
                      top: theme.spacing(1),
                    }}
                  />
                )}
                <CardMedia component="img" height="140" image={uri} />
              </>
            )}
          />
        </Box>
      </CardActionArea>
      {object.object_uuid && (
        <Typography
          variant="body2"
          sx={{
            wordBreak: "break-word",
            px: 1,
          }}
        >
          {object.object_uuid}
        </Typography>
      )}
    </Card>
  );
};

export default ObjectCard;
