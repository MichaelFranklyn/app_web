import LZString from "lz-string";

// ATENÇÃO: isto é OFUSCAÇÃO, não um controle de segurança.
// A chave usa prefixo NEXT_PUBLIC_, então é embutida no bundle do navegador —
// qualquer atacante client-side pode lê-la. Serve apenas para não deixar valores
// em texto claro no DevTools; NÃO garante confidencialidade contra XSS. Dados
// sensíveis de sessão (token) não devem depender disto — a proteção real seria
// cookie httpOnly gravado no servidor.
//
// A ofuscação é feita com LZString (compressão) em vez de AES: o crypto-js pesava
// ~71 KB no bundle do cliente só para uma cifra que a própria chave pública tornava
// simbólica. O nome do cookie é derivado por um hash não-criptográfico (FNV-1a)
// salgado com a chave — determinístico e estável entre servidor e cliente.
const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET_KEY;
if (!SECRET_KEY)
  throw new Error(
    "NEXT_PUBLIC_COOKIE_SECRET_KEY environment variable is required"
  );

// FNV-1a 32-bit (determinístico, sem dependência de cripto). Math.imul mantém a
// multiplicação em 32-bit; `>>> 0` normaliza para unsigned antes do hex.
function fnv1aHex(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// Nome ofuscado e estável do cookie. Prefixo "c" garante um nome de cookie válido
// (começa por letra). Salgado com a chave para não ser um hash trivialmente
// reconhecível do nome cru.
export const encryptKeyName = (name: string): string =>
  `c${fnv1aHex(`${SECRET_KEY}:${name}`)}`;

// Ofusca uma string comprimindo-a (URL-safe). Faz roundtrip com decryptValue.
export const encryptValue = (value: string): string =>
  LZString.compressToEncodedURIComponent(value);

// Reverte encryptValue. Valores que não são nossos (formato antigo, lixo) fazem
// o LZString devolver null/"" → retornamos "" para o chamador tratar como ausente.
export const decryptValue = (stored: string): string => {
  try {
    return LZString.decompressFromEncodedURIComponent(stored) || "";
  } catch {
    return "";
  }
};

export const processEncryptedCookieValue = <T>(stored: string): T | null => {
  try {
    const decompressed = decryptValue(stored);
    // Fallback: se não descomprimir (valor não-nosso), usa o valor cru como está.
    const finalString = decompressed || stored;
    return parseJSON<T>(finalString) ?? (finalString as unknown as T);
  } catch (e) {
    console.warn("Failed to process cookie value:", e);
    return null;
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
    if (typeof parsed === "string") {
      try {
        return JSON.parse(parsed);
      } catch (e) {
        console.warn("Failed to parse double-encoded JSON:", e);
        return parsed as unknown as T;
      }
    }
    return parsed;
  } catch (e) {
    console.warn("Failed to parse JSON:", e);
    return null;
  }
};

export const removeTypename = <T>(value: T): T => {
  if (value === null || value === undefined || typeof value !== "object")
    return value;
  if (Array.isArray(value)) return value.map(removeTypename) as unknown as T;
  const newObj: Record<string, unknown> = {};
  Object.keys(value).forEach((key) => {
    if (key !== "__typename") {
      newObj[key] = removeTypename((value as Record<string, unknown>)[key]);
    }
  });
  return newObj as T;
};
