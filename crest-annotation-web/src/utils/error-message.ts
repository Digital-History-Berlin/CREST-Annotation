interface PossibleData {
  detail?: string;
}

interface PossibleError {
  message?: string;
  data?: PossibleData;
}

/**
 * Try to return the most helpful message
 */
export const errorMessage = (error: unknown): string => {
  console.error(error);

  if (typeof error === "object") {
    const possible = error as PossibleError;
    if (possible.message) return possible.message;
    if (possible.data?.detail) return possible.data.detail;
  }

  return "Unknown error";
};
