import { CvCrestDetectionSorting } from "./types";

export const validateSorting = (sorting: string): CvCrestDetectionSorting => {
  if (sorting === "position") return "position";
  return "rating";
};
