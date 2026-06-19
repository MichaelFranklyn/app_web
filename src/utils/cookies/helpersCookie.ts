import CryptoJS from 'crypto-js';
import LZString from 'lz-string';

const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET_KEY;
if (!SECRET_KEY) throw new Error('NEXT_PUBLIC_COOKIE_SECRET_KEY environment variable is required');

export const encryptKeyName = (name: string): string => {
  return CryptoJS.HmacSHA256(name, SECRET_KEY).toString();
};

export const encryptValue = (value: string): string => {
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

export const decryptValue = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.warn('Failed to decrypt cookie value:', e);
    return '';
  }
};

export const processEncryptedCookieValue = <T>(encryptedValue: string): T | null => {
  try {
    const decrypted = decryptValue(encryptedValue);
    if (!decrypted) {
      // Fallback: tenta usar valor como-está se a descriptografia retornar vazio
      const decompressed = LZString.decompressFromEncodedURIComponent(encryptedValue);
      const finalString = decompressed || encryptedValue;
      return parseJSON<T>(finalString) ?? (finalString as unknown as T);
    }
    const decompressed = LZString.decompressFromEncodedURIComponent(decrypted);
    const finalString = decompressed || decrypted;
    return parseJSON<T>(finalString) ?? (finalString as unknown as T);
  } catch (e) {
    console.warn('Failed to process encrypted cookie value:', e);
    // Última tentativa: usar valor como-está (para valores não-encriptados)
    try {
      return parseJSON<T>(encryptedValue) ?? (encryptedValue as unknown as T);
    } catch (fallbackError) {
      console.warn('Failed all parsing attempts:', fallbackError);
      return null;
    }
  }
};

const isJWT = (value: string): boolean => {
  return /^ey[A-Za-z0-9_-]+\.ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
};

export const parseJSON = <T>(value: string): T | null => {
  // Se for um JWT, retorna como string sem tentar parse
  if (isJWT(value)) {
    return value as unknown as T;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed);
      } catch (e) {
        console.warn('Failed to parse double-encoded JSON:', e);
        return parsed as unknown as T;
      }
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return null;
  }
};

export const removeTypename = <T>(value: T): T => {
  if (value === null || value === undefined || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(removeTypename) as unknown as T;
  const newObj: Record<string, unknown> = {};
  Object.keys(value).forEach((key) => {
    if (key !== '__typename') {
      newObj[key] = removeTypename((value as Record<string, unknown>)[key]);
    }
  });
  return newObj as T;
};
