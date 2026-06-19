export const getLocalStorage = <T>(keyName: string, defaultValue: T): T => {
  // Verificação para ambiente Next.js (SSR)
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = window.localStorage.getItem(keyName);

    // Se o item não existe ou é a string "undefined" (comum em erros de parse)
    if (!item || item === 'undefined') return defaultValue;

    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
};

export const setLocalStorage = <T>(keyName: string, newValue: T): void => {
  if (typeof window === 'undefined') return;

  try {
    const valueToStore = JSON.stringify(newValue);
    window.localStorage.setItem(keyName, valueToStore);

    // Dispara eventos para atualizar os hooks useLocalStorage em abas iguais ou diferentes
    window.dispatchEvent(new Event('local-storage'));
  } catch {}
};

export const removeLocalStorage = (keyName: string): void => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(keyName);
    window.dispatchEvent(new Event('local-storage'));
  } catch {}
};
