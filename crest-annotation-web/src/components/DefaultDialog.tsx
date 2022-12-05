import { useTheme } from "@mui/material";
import { Dialog } from "@mui/material";
import React, { ComponentProps, ReactNode } from "react";

interface IProps {
  title: string;
}

type Props = IProps & ComponentProps<typeof Dialog>;

const DefaultDialog = (props: Props) => {
  const theme = useTheme();

  return (
    <Dialog {...props}>
      <div
        style={{
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <h4>{props.title}</h4>
      </div>
      {props.children}
    </Dialog>
  );
};

export default DefaultDialog;
