// Entende a pergunta e escolhe a resposta. Sem IA: palavras-chave e algumas regras.
import { projetos } from "../dados/projetos";
import { foraDaLista, grupos, type Tecnologia } from "../dados/stack";
import { foraDaStack, intencoes, naoEntendi, sobreProjetos, sobreTecnologias } from "./respostas";
import type { Resposta } from "./tipos";

export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.+#\s]/g, " ")
    .replace(/\.(\s|$)/g, " ") // ponto final de frase
    .replace(/\s+/g, " ")
    .trim();
}

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\#]/g, "\\$&");

function regexDe(palavra: string) {
  const radical = palavra.endsWith("*");
  const base = escapar(radical ? palavra.slice(0, -1) : palavra);
  return new RegExp(`(^|\\s)${base}${radical ? "[a-z0-9]*" : ""}(?=\\s|$)`, "g");
}

type Achado<T> = { item: T; inicio: number; fim: number };

// Acha apelidos no texto. Se um apelido cabe dentro de outro maior ("java" em "java ee"), fica só o maior.
function acharTermos<T>(texto: string, itens: { item: T; apelidos: string[] }[]): T[] {
  const achados: Achado<T>[] = [];
  for (const { item, apelidos } of itens) {
    for (const a of apelidos) {
      for (const m of texto.matchAll(regexDe(a))) {
        const inicio = (m.index ?? 0) + m[1].length;
        achados.push({ item, inicio, fim: inicio + a.length });
      }
    }
  }
  achados.sort((x, y) => y.fim - y.inicio - (x.fim - x.inicio));
  const aceitos: Achado<T>[] = [];
  for (const a of achados) {
    if (!aceitos.some((b) => a.inicio < b.fim && b.inicio < a.fim)) aceitos.push(a);
  }
  aceitos.sort((x, y) => x.inicio - y.inicio);
  return [...new Set(aceitos.map((a) => a.item))];
}

function pontuar(texto: string, palavras: string[]) {
  let pontos = 0;
  for (const p of palavras) {
    if (regexDe(p).test(texto)) pontos += p.includes(" ") ? 2 : 1;
  }
  return pontos;
}

const todasTechs = grupos.flatMap((g) => g.techs.map((t) => ({ tech: t, frase: g.frase })));

function projetosQueUsam(techs: Tecnologia[]) {
  return projetos.filter((p) =>
    p.stack.some((s) => {
      const n = normalizar(s);
      return techs.some((t) => normalizar(t.nome) === n || t.apelidos.includes(n));
    })
  );
}

export function responder(pergunta: string): Resposta {
  const texto = normalizar(pergunta);
  if (!texto) return naoEntendi();

  const pontos = intencoes.map((i) => ({ i, p: pontuar(texto, i.palavras) }));
  const melhor = (lista: typeof pontos) =>
    lista.reduce<(typeof pontos)[number] | null>((m, x) => (x.p > 0 && (!m || x.p > m.p) ? x : m), null);

  // 1. Assuntos fortes: preço, contato, currículo… ganham de tudo
  const forte = melhor(pontos.filter((x) => x.i.forte));
  if (forte) return forte.i.resposta();

  // 2. Projeto citado pelo nome
  const projs = acharTermos(texto, projetos.map((p) => ({ item: p, apelidos: p.apelidos })));
  if (projs.length) return sobreProjetos(projs);

  // 3. Tecnologia citada
  const techs = acharTermos(
    texto,
    todasTechs.map((t) => ({ item: t, apelidos: t.tech.apelidos }))
  );
  if (techs.length) return sobreTecnologias(techs, projetosQueUsam(techs.map((t) => t.tech)));

  // 4. Tecnologia que não está na lista
  const fora = acharTermos(texto, foraDaLista.map((f) => ({ item: f, apelidos: [f] })));
  if (fora.length) {
    const escrito = pergunta.match(new RegExp(escapar(fora[0]), "i"))?.[0] ?? fora[0];
    const nomeBonito = escrito === escrito.toLowerCase() ? escrito[0].toUpperCase() + escrito.slice(1) : escrito;
    return foraDaStack(nomeBonito);
  }

  // 5. Assuntos gerais
  const geral = melhor(pontos);
  if (geral) return geral.i.resposta();

  return naoEntendi();
}
