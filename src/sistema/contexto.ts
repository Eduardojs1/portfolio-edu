import { createContext, useContext } from "react";

export type AppId = "intellij" | "datagrip" | "spotify" | "navegador" | "bloco";

export type SistemaCtx = {
  abrir: (app: AppId) => void;
  desligar: () => void;
  celular: boolean;
  mudo: boolean; // o ícone de som da barra de tarefas
};

export const Sistema = createContext<SistemaCtx | null>(null);

export function useSistema() {
  const ctx = useContext(Sistema);
  if (!ctx) throw new Error("useSistema fora do Sistema");
  return ctx;
}

// O que cada app recebe para desenhar os botões da própria janela
export type ControleJanela = {
  maximizada: boolean;
  focada: boolean;
  minimizar: () => void;
  alternarMaximizar: () => void;
  fechar: () => void;
};
