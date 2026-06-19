import { getServerCookie } from "../cookies/serverCookie";

export const parseJwtServer = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getDecodedTokenServer = async () => {
  const token = await getServerCookie<string>("token");
  if (!token) return null;
  return parseJwtServer(token);
};

export const getUserPermission = async () => {
  const decoded = await getDecodedTokenServer();
  if (!decoded) return null;
  return decoded["/"];
};
