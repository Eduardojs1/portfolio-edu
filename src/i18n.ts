import { useEffect, useState } from "react";

// Idioma do portfólio: português ou inglês. A escolha fica salva no navegador;
// na primeira visita, segue o idioma do navegador da pessoa.
export type Idioma = "pt" | "en";

const CHAVE = "portfolio-idioma";
const ouvintes = new Set<(i: Idioma) => void>();

function inicial(): Idioma {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === "pt" || v === "en") return v;
  } catch {
    /* sem armazenamento: segue o navegador */
  }
  return (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
}

let atual: Idioma = inicial();

function aplicar(i: Idioma) {
  document.documentElement.lang = i === "pt" ? "pt-BR" : "en";
  document.title = i === "pt" ? "Eduardo Santos | Portfólio" : "Eduardo Santos | Portfolio";
}
aplicar(atual);

export const idiomaAtual = () => atual;

export function mudarIdioma(i: Idioma) {
  if (i === atual) return;
  atual = i;
  try {
    localStorage.setItem(CHAVE, i);
  } catch {
    /* vale só para esta visita */
  }
  aplicar(i);
  ouvintes.forEach((f) => f(i));
}

export function useIdioma() {
  const [idioma, setIdioma] = useState(atual);
  useEffect(() => {
    ouvintes.add(setIdioma);
    setIdioma(atual);
    return () => {
      ouvintes.delete(setIdioma);
    };
  }, []);
  return idioma;
}

// Uso: const t = useT();  t("Projetos", "Projects")
export function useT() {
  const idioma = useIdioma();
  const t = (pt: string, en: string) => (idioma === "pt" ? pt : en);
  return Object.assign(t, { idioma });
}

// Fora de componentes (textos montados na hora)
export const tr = (pt: string, en: string) => (atual === "pt" ? pt : en);
