import { createContext, useContext, useEffect, useState } from "react";

export type AppCtx = {
  abrir: (id: string, ancora?: string) => void;
  alternarTerminal: (forcar?: boolean) => void;
  executar: () => void;
  abrirBusca: () => void;
  avisar: (mensagem: string) => void;
};

export const Contexto = createContext<AppCtx | null>(null);

export function useApp() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useApp fora do Contexto");
  return ctx;
}

export function useMedia(consulta: string) {
  const [bate, setBate] = useState(() => matchMedia(consulta).matches);
  useEffect(() => {
    const m = matchMedia(consulta);
    const ouvir = () => setBate(m.matches);
    m.addEventListener("change", ouvir);
    return () => m.removeEventListener("change", ouvir);
  }, [consulta]);
  return bate;
}

export const reduzMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

// Compara sem acento e sem maiúscula
export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const atalhos = {
  busca: "Shift Shift",
  terminal: "Alt+F12",
  executar: "Shift+F10",
  projeto: "Alt+1",
};
