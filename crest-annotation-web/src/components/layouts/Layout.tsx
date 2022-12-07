import React, { CSSProperties, ReactNode } from "react";
import styles from "./Layout.module.scss";
import classnames from "classnames";
import { useTheme } from "@mui/material";

export interface LayoutProps {
  header?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  scrollable?: boolean;
  sx?: CSSProperties;
}

const defaultProps = {};

/**
 * Main application layout
 *
 * Should be the top component in every view,
 * unless the view deliberately deviates from this layout.
 */
const Layout = ({
  header,
  left,
  right,
  children,
  scrollable,
  sx,
}: LayoutProps) => {
  const theme = useTheme();

  return (
    <div className={styles.container}>
      {header || <div />}
      <div className={styles.body}>
        {left || <div />}
        <div
          className={classnames(styles.content, {
            [styles.scrollable]: scrollable,
          })}
          style={{ backgroundColor: theme.palette.grey.A100, ...sx }}
        >
          {children}
        </div>
        {right || <div />}
      </div>
    </div>
  );
};

Layout.defaultProps = defaultProps;

export default Layout;
