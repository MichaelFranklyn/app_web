"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";

// Chave client-side (mesma do Embed). RESTRINJA-a por referrer HTTP no Google
// Cloud Console — ela vai no bundle do navegador.
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Singleton no módulo: várias telas pedem o mapa sem recarregar o script.
let loadPromise: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (!MAPS_KEY)
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ausente"));
  if (!loadPromise) {
    setOptions({ key: MAPS_KEY, v: "weekly" });
    // "maps" traz o Map; "marker" traz google.maps.Marker (usado no radar).
    loadPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]).then(() => undefined);
  }
  return loadPromise;
}

interface State {
  ready: boolean;
  error: boolean;
  /** true quando a chave nem está configurada — mensagem específica na UI. */
  missingKey: boolean;
}

/** Carrega a Google Maps JavaScript API sob demanda. */
export function useGoogleMapsLoader(): State {
  const [state, setState] = useState<State>({
    ready: false,
    error: false,
    missingKey: !MAPS_KEY,
  });

  useEffect(() => {
    if (!MAPS_KEY) return;
    let active = true;
    loadMaps()
      .then(
        () =>
          active && setState({ ready: true, error: false, missingKey: false })
      )
      .catch(
        () =>
          active && setState({ ready: false, error: true, missingKey: false })
      );
    return () => {
      active = false;
    };
  }, []);

  return state;
}
