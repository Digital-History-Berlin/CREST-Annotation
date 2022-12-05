import React from "react";
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "react-router-dom";
import { LinkProps } from "@mui/material/Link";
import { Theme } from "@mui/material";

/**
 * Override MaterialUI Link to render a React Router Link
 *
 * This allows to use the MaterialUI styling and theme
 * while using the functionality of the React Router.
 */
export default function Link(theme: Theme) {
  const LinkBehavior = React.forwardRef<
    HTMLAnchorElement,
    Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
  >((props, ref) => {
    const { href, ...other } = props;

    // map .href (mui) to .to (react-router)
    return <RouterLink ref={ref} to={href} {...other} />;
  });

  return {
    MuiLink: {
      defaultProps: {
        component: LinkBehavior,
      } as LinkProps,
    },
  };
}
