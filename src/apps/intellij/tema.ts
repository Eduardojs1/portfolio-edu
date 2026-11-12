import { useEffect, useState } from "react";

// Tema das IDEs. IntelliJ e DataGrip trocam juntos e a escolha fica salva no navegador.
// "Light" é como o do IntelliJ de verdade: corpo claro e barra de cima escura.
// "Light with Light Header" deixa a barra de cima clara também.
export type TemaIde = "dark" | "light" | "light-header";

export const temasIde: { id: TemaIde; nome: string }[] = [
  { id: "dark", nome: "Dark" },
  { id: "light", nome: "Light" },
  { id: "light-header", nome: "Light with Light Header" },
];

const CHAVE = "portfolio-tema-ide";
const ouvintes = new Set<(t: TemaIde) => void>();

let atual: TemaIde = (() => {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === "light" || v === "light-header") return v;
  } catch {
    /* sem armazenamento: começa no Dark */
  }
  return "dark";
})();

export function mudarTemaIde(t: TemaIde) {
  atual = t;
  try {
    localStorage.setItem(CHAVE, t);
  } catch {
    /* vale só para esta visita */
  }
  ouvintes.forEach((f) => f(t));
}

export function useTemaIde() {
  const [tema, setTema] = useState(atual);
  useEffect(() => {
    ouvintes.add(setTema);
    setTema(atual);
    return () => {
      ouvintes.delete(setTema);
    };
  }, []);
  return tema;
}

// Classes que vão na raiz da IDE (.ij)
export const classeTema = (t: TemaIde) => (t === "light" ? " claro cabecalho-escuro" : t === "light-header" ? " claro" : "");
