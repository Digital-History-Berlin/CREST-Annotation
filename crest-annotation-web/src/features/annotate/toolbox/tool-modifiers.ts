import { RootState } from "../../../app/store";
import { Modifiers } from "../types/toolbox";

export const selectGroupModifierState = (state: RootState) => {
  const {
    toolbox: { selection, modifiers },
    annotations: { annotations },
  } = state;

  // check if the group modifier is active
  const grouping = selection.modifiers.includes(Modifiers.Group);
  const id = modifiers[Modifiers.Group] as string;
  return grouping
    ? annotations.find((annotation) => annotation.id === id)
    : undefined;
};
