import React, { ComponentProps } from "react";
import { Dialog, useTheme } from "@mui/material";

interface IProps {
  title: string;
}

type Props = IProps & ComponentProps<typeof Dialog>;

const DefaultDialog = ({ title, children, ...props }: Props) => {
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
        <h4>{title}</h4>
      </div>
      {children}
    </Dialog>
  );
};

export default DefaultDialog;
