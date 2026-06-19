import Cookies from 'js-cookie';
import LZString from 'lz-string';
import { encryptKeyName, encryptValue, processEncryptedCookieValue } from './helpersCookie';
import { CHUNK_SIZE, DEFAULT_EXPIRATION_DAYS } from './cookieConstants';

export const setCookie = (name: string, value: unknown, options?: Cookies.CookieAttributes) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  const compressed = LZString.compressToEncodedURIComponent(stringValue);
  const encryptedValue = encryptValue(compressed);
  const secureName = encryptKeyName(name);

  // Aplica o padrão de 7 dias se 'expires' não for informado
  const cookieOptions = {
    path: '/',
    expires: DEFAULT_EXPIRATION_DAYS,
    ...options,
  };

  if (encryptedValue.length < CHUNK_SIZE) {
    Cookies.set(secureName, encryptedValue, cookieOptions);
    removeChunkedParts(name, cookieOptions);
  } else {
    const totalChunks = Math.ceil(encryptedValue.length / CHUNK_SIZE);

    Cookies.set(encryptKeyName(`${name}_count`), String(totalChunks), cookieOptions);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = encryptedValue.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      Cookies.set(encryptKeyName(`${name}_${i}`), chunk, cookieOptions);
    }

    Cookies.remove(secureName, cookieOptions);
  }
};

export const getCookie = <T>(name: string): T | null => {
  const allCookies = Cookies.get();
  if (!allCookies) return null;

  const secureName = encryptKeyName(name);
  let rawEncryptedValue: string | null = null;
  const singleCookie = allCookies[secureName];

  if (singleCookie !== undefined) {
    rawEncryptedValue = singleCookie;
  } else {
    const countName = encryptKeyName(`${name}_count`);
    const countStr = allCookies[countName];

    if (countStr) {
      const count = parseInt(countStr, 10);
      const chunks: string[] = [];

      for (let i = 0; i < count; i++) {
        const chunkName = encryptKeyName(`${name}_${i}`);
        const chunk = allCookies[chunkName];
        if (chunk) chunks.push(chunk);
      }

      if (chunks.length === count) {
        rawEncryptedValue = chunks.join('');
      }
    }
  }

  if (!rawEncryptedValue) return null;
  return processEncryptedCookieValue<T>(rawEncryptedValue);
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
  const secureName = encryptKeyName(name);
  const cookieOptions = { path: '/', ...options };

  Cookies.remove(secureName, cookieOptions);
  removeChunkedParts(name, cookieOptions);
};

const removeChunkedParts = (name: string, options?: Cookies.CookieAttributes) => {
  const countName = encryptKeyName(`${name}_count`);
  const countStr = Cookies.get(countName);

  if (countStr) {
    const count = parseInt(countStr, 10);
    for (let i = 0; i < count; i++) {
      const chunkName = encryptKeyName(`${name}_${i}`);
      Cookies.remove(chunkName, options);
    }
    Cookies.remove(countName, options);
  }
};
