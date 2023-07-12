import { Position } from "../types/Position";

const cvBaseUrl = "http://localhost:9000/facebook-sam";

const debounceTimeout = 500;
let previewDebounce: NodeJS.Timeout | undefined;
let previewRunning = false;

export const prepare = async (body: { url?: string }): Promise<Response> => {
  previewRunning = false;
  // reset any previously scheduled tasks
  clearTimeout(previewDebounce);

  const response = await fetch(`${cvBaseUrl}/prepare`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return response;
};

export const preview = (
  body: { cursor: Position },
  callback?: (response: Response) => void
): void => {
  if (previewRunning) return;
  // reset any previously scheduled tasks
  clearTimeout(previewDebounce);

  // schedule new preview
  previewDebounce = setTimeout(async () => {
    previewRunning = true;
    try {
      const response = await fetch(`${cvBaseUrl}/preview`, {
        body: JSON.stringify(body),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // handle result
      callback?.(response);
    } finally {
      previewRunning = false;
    }
  }, debounceTimeout);
};

export const run = async (body: { cursor: Position }): Promise<Response> => {
  // reset any previously scheduled tasks
  clearTimeout(previewDebounce);

  const response = await fetch(`${cvBaseUrl}/run`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  return response;
};
