import { Debouncer } from "../types/debounce";
import { Position } from "../types/geometry";

const debouncer = new Debouncer<Response>(150);

export const cvInfo = async (backend: string): Promise<Response> => {
  const response = await fetch(`${backend}/info`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};

export const cvPrepare = async (
  backend: string,
  algorithm: string,
  body: { url?: string }
): Promise<Response> => {
  debouncer.cancel();

  const response = await fetch(`${backend}/${algorithm}/prepare`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};

export const cvPreview = (
  backend: string,
  algorithm: string,
  body: { cursor: Position }
): Promise<Response> => {
  return debouncer.debounce(async () => {
    const response = await fetch(`${backend}/${algorithm}/preview`, {
      body: JSON.stringify(body),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Invalid response");

    return response;
  });
};

export const cvRun = async (
  backend: string,
  algorithm: string,
  body: { cursor: Position }
): Promise<Response> => {
  debouncer.cancel();

  const response = await fetch(`${backend}/${algorithm}/run`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};
