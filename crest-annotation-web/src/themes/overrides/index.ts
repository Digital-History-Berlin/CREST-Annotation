import { Theme } from "@mui/material";
import { merge } from "lodash";
import Button from "./Button";
import Link from "./Link";

export default function ComponentsOverrides(theme: Theme) {
  return merge(Button(theme), Link(theme));
}
