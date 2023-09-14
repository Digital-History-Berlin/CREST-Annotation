import { Position } from "../types/Position";

const debounceTimeout = 500;
let previewDebounce: NodeJS.Timeout | undefined;
let previewRunning = false;

export const info = async (backend: string): Promise<Response> => {
  const response = await fetch(`${backend}/info`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};

export const prepare = async (
  backend: string,
  algorithm: string,
  body: { url?: string }
): Promise<Response> => {
  previewRunning = false;
  // reset any previously scheduled tasks
  clearTimeout(previewDebounce);

  const response = await fetch(`${backend}/${algorithm}/prepare`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};

export const preview = (
  backend: string,
  algorithm: string,
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
      const response = await fetch(`${backend}/${algorithm}/preview`, {
        body: JSON.stringify(body),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // handle result
      if (response.ok) callback?.(response);
    } finally {
      previewRunning = false;
    }
  }, debounceTimeout);
};

export const run = async (
  backend: string,
  algorithm: string,
  body: { cursor: Position }
): Promise<Response> => {
  // reset any previously scheduled tasks
  clearTimeout(previewDebounce);

  const response = await fetch(`${backend}/${algorithm}/run`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};
