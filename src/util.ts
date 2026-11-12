import { useEffect, useState } from "react";

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

// "a, b e c"
export const juntar = (itens: string[]) =>
  itens.length < 2 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;

// Quebra um texto em linhas de até `largura` caracteres, sem cortar palavras
export function quebrar(texto: string, largura: number) {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of texto.split(/\s+/)) {
    if (atual && (atual + " " + palavra).length > largura) {
      linhas.push(atual);
      atual = palavra;
    } else atual = atual ? `${atual} ${palavra}` : palavra;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

export const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
