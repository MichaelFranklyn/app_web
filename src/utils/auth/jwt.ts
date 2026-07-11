import { getServerCookie } from "../cookies/serverCookie";
import { JwtPayload } from "./types";

export const parseJwtServer = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
};

export const getDecodedTokenServer = async (): Promise<JwtPayload | null> => {
  const token = await getServerCookie<string>("token");
  if (!token) return null;
  return parseJwtServer(token);
};
