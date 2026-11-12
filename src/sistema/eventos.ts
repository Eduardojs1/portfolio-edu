// Recado entre apps (ex.: o menu Iniciar pede para o IntelliJ abrir um arquivo).
// Se o app ainda não está aberto, o recado espera até ele começar a ouvir.
type Ouvinte = (dados: string) => void;

const ouvintes = new Map<string, Set<Ouvinte>>();
const pendentes = new Map<string, string[]>();

export function emitir(evento: string, dados = "") {
  const lista = ouvintes.get(evento);
  if (lista && lista.size) lista.forEach((o) => o(dados));
  else pendentes.set(evento, [...(pendentes.get(evento) ?? []), dados]);
}

export function ouvir(evento: string, ouvinte: Ouvinte) {
  if (!ouvintes.has(evento)) ouvintes.set(evento, new Set());
  ouvintes.get(evento)!.add(ouvinte);
  const fila = pendentes.get(evento);
  if (fila) {
    pendentes.delete(evento);
    fila.forEach((d) => setTimeout(() => ouvinte(d), 0));
  }
  return () => {
    ouvintes.get(evento)?.delete(ouvinte);
  };
}

// ---------------------------------------------------------------------------
// Sinais: estados ligados/desligados que vários lugares leem
// ("app-rodando", "guia-aberto", "desktop-ativo")
// ---------------------------------------------------------------------------
const sinais = new Map<string, boolean>();
const ouvintesSinal = new Map<string, Set<(v: boolean) => void>>();

export function definirSinal(nome: string, valor: boolean) {
  if ((sinais.get(nome) ?? false) === valor) return;
  sinais.set(nome, valor);
  ouvintesSinal.get(nome)?.forEach((f) => f(valor));
}

export const lerSinal = (nome: string) => sinais.get(nome) ?? false;

export function ouvirSinal(nome: string, f: (v: boolean) => void) {
  if (!ouvintesSinal.has(nome)) ouvintesSinal.set(nome, new Set());
  ouvintesSinal.get(nome)!.add(f);
  return () => {
    ouvintesSinal.get(nome)?.delete(f);
  };
}
