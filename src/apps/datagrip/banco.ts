// O banco "portfolio" que o DataGrip mostra: as mesmas tabelas das migrations do projeto,
// preenchidas com os dados de src/dados.
import { perfil } from "../../dados/perfil";
import { projetos } from "../../dados/projetos";
import { estudando, stack } from "../../dados/stack";

export type Valor = string | number | boolean | null | string[];
export type Coluna = { nome: string; tipo: string; pk?: boolean };
export type Tabela = { nome: string; colunas: Coluna[]; linhas: Valor[][] };

export const tabelas: Tabela[] = [
  {
    nome: "projetos",
    colunas: [
      { nome: "id", tipo: "bigserial", pk: true },
      { nome: "nome", tipo: "varchar(80)" },
      { nome: "tipo", tipo: "varchar(80)" },
      { nome: "resumo", tipo: "text" },
      { nome: "o_que_fiz", tipo: "text" },
      { nome: "stack", tipo: "text[]" },
      { nome: "imagem", tipo: "varchar(200)" },
    ],
    linhas: projetos.map((p, i) => [i + 1, p.nome, p.rotulo, p.resumo, p.fiz, p.stack, p.imagem?.src ?? null]),
  },
  {
    nome: "tecnologias",
    colunas: [
      { nome: "id", tipo: "serial", pk: true },
      { nome: "area", tipo: "varchar(30)" },
      { nome: "nome", tipo: "varchar(40)" },
      { nome: "estudando", tipo: "boolean" },
    ],
    linhas: stack.flatMap((g) => g.itens.map((t) => [g.grupo, t, estudando.includes(t)] as Valor[])).map((l, i) => [i + 1, ...l]),
  },
  {
    nome: "formacao",
    colunas: [
      { nome: "id", tipo: "serial", pk: true },
      { nome: "curso", tipo: "varchar(120)" },
      { nome: "instituicao", tipo: "varchar(120)" },
    ],
    linhas: perfil.formacao.map((f, i) => [i + 1, f.curso, f.onde]),
  },
  {
    nome: "contato",
    colunas: [
      { nome: "canal", tipo: "varchar(20)", pk: true },
      { nome: "valor", tipo: "varchar(120)" },
    ],
    linhas: [
      ["email", perfil.email],
      ["whatsapp", perfil.whatsapp.exibir],
      ["github", `github.com/${perfil.github}`],
      ["linkedin", `in/${perfil.linkedin}`],
    ],
  },
];

export const acharTabela = (nome: string) => tabelas.find((t) => t.nome === nome.toLowerCase());

// Como o PostgreSQL mostra um valor na grade
export function formatar(v: Valor): string {
  if (v === null) return "<null>";
  if (Array.isArray(v)) return `{${v.map((x) => (/[\s,{}"]/.test(x) ? `"${x}"` : x)).join(",")}}`;
  return String(v);
}
