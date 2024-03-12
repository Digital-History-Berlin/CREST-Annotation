import { Position } from "../types/Position";

interface Debounce {
  timeout: NodeJS.Timeout;
  reject: () => void;
}

const previewDebounceTimeout = 150;
let previewDebounce: Debounce | undefined = undefined;

const cancelPreviewDebounce = () => {
  if (previewDebounce) {
    // cancel planned preview
    clearTimeout(previewDebounce.timeout);
    // reject the promise to ensure completion
    previewDebounce.reject();
    // reset the preview state
    previewDebounce = undefined;
  }
};

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
  cancelPreviewDebounce();

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
  body: { cursor: Position }
): Promise<Response> => {
  cancelPreviewDebounce();

  // schedule new preview
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`${backend}/${algorithm}/preview`, {
          body: JSON.stringify(body),
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        // handle result (will be ignored if already rejected)
        if (response.ok) resolve(response);
        else reject();
      } finally {
        previewDebounce = undefined;
      }
    }, previewDebounceTimeout);
    // store the current timeout
    previewDebounce = { reject, timeout };
  });
};

export const run = async (
  backend: string,
  algorithm: string,
  body: { cursor: Position }
): Promise<Response> => {
  cancelPreviewDebounce();

  const response = await fetch(`${backend}/${algorithm}/run`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};
