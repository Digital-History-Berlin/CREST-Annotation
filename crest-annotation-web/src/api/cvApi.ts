import { Debouncer } from "../types/debounce";

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
  body: unknown
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
  body: unknown
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
  body: unknown
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

export const cvGet = async (
  backend: string,
  algorithm: string,
  url: string
): Promise<Response> => {
  const response = await fetch(`${backend}/${algorithm}/${url}`);

  if (!response.ok) throw new Error("Invalid response");

  return response;
};

export const cvPost = async (
  backend: string,
  algorithm: string,
  url: string,
  body: unknown
): Promise<Response> => {
  const response = await fetch(`${backend}/${algorithm}/${url}`, {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Invalid response");

  return response;
};
