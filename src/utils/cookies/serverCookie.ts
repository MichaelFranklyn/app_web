import LZString from "lz-string";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import {
  encryptKeyName,
  encryptValue,
  processEncryptedCookieValue,
} from "./helpersCookie";
import { CHUNK_SIZE, DEFAULT_EXPIRATION_DAYS } from "./cookieConstants";

interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const setServerCookie = async (
  name: string,
  value: unknown,
  options?: CookieOptions
) => {
  const cookieStore = await cookies();

  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  const compressed = LZString.compressToEncodedURIComponent(stringValue);
  const encryptedValue = encryptValue(compressed);
  const secureName = encryptKeyName(name);

  const expiresInput = options?.expires ?? DEFAULT_EXPIRATION_DAYS;

  const cookieOptions: Partial<ResponseCookie> = {
    path: "/",
    ...options,
  };

  if (typeof expiresInput === "number") {
    cookieOptions.expires = Date.now() + expiresInput * 24 * 60 * 60 * 1000;
  } else if (expiresInput instanceof Date) {
    cookieOptions.expires = expiresInput;
  }

  if (encryptedValue.length < CHUNK_SIZE) {
    cookieStore.set(secureName, encryptedValue, cookieOptions);
    await deleteChunkedPartsInternal(name);
  } else {
    const totalChunks = Math.ceil(encryptedValue.length / CHUNK_SIZE);

    const countName = encryptKeyName(`${name}_count`);
    cookieStore.set(countName, String(totalChunks), cookieOptions);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = encryptedValue.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const chunkName = encryptKeyName(`${name}_${i}`);
      cookieStore.set(chunkName, chunk, cookieOptions);
    }

    cookieStore.delete(secureName);
  }
};

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const getServerCookie = async <T>(name: string): Promise<T | null> => {
  const cookieStore = await cookies();
  const secureName = encryptKeyName(name);

  let rawEncryptedValue: string | null = null;
  const singleCookie = cookieStore.get(secureName);

  if (singleCookie) {
    rawEncryptedValue = decodeCookieValue(singleCookie.value);
  } else {
    const countName = encryptKeyName(`${name}_count`);
    const countCookie = cookieStore.get(countName);

    if (countCookie) {
      const count = parseInt(countCookie.value, 10);
      const chunks: string[] = [];

      for (let i = 0; i < count; i++) {
        const chunkName = encryptKeyName(`${name}_${i}`);
        const chunk = cookieStore.get(chunkName);
        if (chunk) chunks.push(decodeCookieValue(chunk.value));
      }

      if (chunks.length === count) {
        rawEncryptedValue = chunks.join("");
      }
    }
  }

  if (!rawEncryptedValue) {
    return null;
  }
  const result = processEncryptedCookieValue<T>(rawEncryptedValue);
  return result;
};

export const removeServerCookie = async (name: string) => {
  const cookieStore = await cookies();
  const secureName = encryptKeyName(name);

  cookieStore.delete(secureName);
  await deleteChunkedPartsInternal(name);
};

const deleteChunkedPartsInternal = async (name: string) => {
  const cookieStore = await cookies();
  const countName = encryptKeyName(`${name}_count`);
  const countCookie = cookieStore.get(countName);

  if (countCookie) {
    const count = parseInt(countCookie.value, 10);
    for (let i = 0; i < count; i++) {
      const chunkName = encryptKeyName(`${name}_${i}`);
      cookieStore.delete(chunkName);
    }
    cookieStore.delete(countName);
  }
};
