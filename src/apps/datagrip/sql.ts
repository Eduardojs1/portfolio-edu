// Um SQL bem pequeno, só de leitura, para o console do DataGrip:
// SELECT cols|*|COUNT(*) FROM tabela [WHERE cond [AND|OR cond]...] [ORDER BY col [ASC|DESC]] [LIMIT n]
// cond: col = valor, col <> valor, col > valor, col LIKE '%x%', col ILIKE '%x%',
//       'valor' = ANY(col), col IS [NOT] NULL|TRUE|FALSE
import { acharTabela, tabelas, type Valor } from "./banco";

export type Resultado =
  | { ok: true; colunas: string[]; linhas: Valor[][]; tabela: string; ms: number }
  | { ok: false; erro: string };

type Cond = (linha: Record<string, Valor>) => boolean;

const erro = (codigo: string, msg: string): Resultado => ({ ok: false, erro: `[${codigo}] ERROR: ${msg}` });

function tokens(sql: string) {
  const out: string[] = [];
  const re = /\s*('(?:[^']|'')*'|\d+(?:\.\d+)?|[A-Za-z_][\w.]*|<>|!=|>=|<=|[=<>(),*;])/y;
  let m: RegExpExecArray | null;
  let fim = 0;
  while ((m = re.exec(sql))) {
    out.push(m[1]);
    fim = re.lastIndex;
  }
  const resto = sql.slice(fim).trim();
  if (resto) out.push(resto); // o que não deu para ler vira um token "estranho" e gera erro de sintaxe
  return out;
}

const literal = (t: string): Valor => {
  if (t.startsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
  if (/^\d/.test(t)) return Number(t);
  if (/^true$/i.test(t)) return true;
  if (/^false$/i.test(t)) return false;
  if (/^null$/i.test(t)) return null;
  return t;
};

const comoTexto = (v: Valor) => (Array.isArray(v) ? `{${v.join(",")}}` : v === null ? "" : String(v));

function like(v: Valor, padrao: string, semCaixa: boolean) {
  const re = new RegExp(`^${padrao.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".")}$`, semCaixa ? "is" : "s");
  return re.test(comoTexto(v));
}

function comparar(a: Valor, op: string, b: Valor) {
  if (a === null || b === null) return false;
  const x = typeof a === "number" && typeof b === "string" && /^\d/.test(b) ? Number(b) : b;
  switch (op) {
    case "=":
      return a === x || comoTexto(a) === comoTexto(x);
    case "<>":
    case "!=":
      return comoTexto(a) !== comoTexto(x);
    case ">":
      return (a as number) > (x as number);
    case "<":
      return (a as number) < (x as number);
    case ">=":
      return (a as number) >= (x as number);
    case "<=":
      return (a as number) <= (x as number);
  }
  return false;
}

export function executar(sqlBruto: string): Resultado {
  const sql = sqlBruto
    .split("\n")
    .map((l) => l.replace(/--.*$/, ""))
    .join(" ")
    .trim()
    .replace(/;+\s*$/, "");
  if (!sql) return erro("42601", "nada para executar (a linha do cursor é comentário?)");

  const t = tokens(sql);
  const up = (i: number) => (t[i] ?? "").toUpperCase();
  const primeiro = up(0);

  if (["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "GRANT"].includes(primeiro))
    return erro("25006", `cannot execute ${primeiro} in a read-only transaction (aqui é só olhar 😉)`);
  if (primeiro !== "SELECT") return erro("42601", `syntax error at or near "${t[0]}"`);

  // Colunas
  let i = 1;
  const pedidas: string[] = [];
  let contar = false;
  while (i < t.length && up(i) !== "FROM") {
    if (t[i] === ",") {
      i++;
      continue;
    }
    if (up(i) === "COUNT" && t[i + 1] === "(" && t[i + 2] === "*" && t[i + 3] === ")") {
      contar = true;
      i += 4;
      continue;
    }
    if (up(i) === "DISTINCT") {
      i++;
      continue;
    }
    pedidas.push(t[i].toLowerCase());
    i++;
  }
  if (up(i) !== "FROM") return erro("42601", 'syntax error: faltou o FROM (ex.: SELECT * FROM projetos)');
  const nomeTabela = (t[i + 1] ?? "").replace(/^public\./i, "");
  const tabela = acharTabela(nomeTabela);
  if (!tabela)
    return erro("42P01", `relation "${nomeTabela}" does not exist. Tabelas: ${tabelas.map((x) => x.nome).join(", ")}`);
  i += 2;

  const nomesColunas = tabela.colunas.map((c) => c.nome);
  const confere = (c: string) => nomesColunas.includes(c);
  for (const c of pedidas) if (c !== "*" && !confere(c)) return erro("42703", `column "${c}" does not exist`);

  // WHERE
  const conds: { cond: Cond; ligacao: "AND" | "OR" }[] = [];
  if (up(i) === "WHERE") {
    i++;
    let ligacao: "AND" | "OR" = "AND";
    while (i < t.length && up(i) !== "ORDER" && up(i) !== "LIMIT") {
      const a = t[i];
      const op = up(i + 1);
      let cond: Cond | null = null;
      if (a.startsWith("'") && t[i + 1] === "=" && up(i + 2) === "ANY" && t[i + 3] === "(") {
        const col = (t[i + 4] ?? "").toLowerCase();
        if (!confere(col)) return erro("42703", `column "${col}" does not exist`);
        const v = literal(a);
        cond = (l) => Array.isArray(l[col]) && (l[col] as string[]).includes(String(v));
        i += 6;
      } else if (op === "IS") {
        const col = a.toLowerCase();
        if (!confere(col)) return erro("42703", `column "${col}" does not exist`);
        const negar = up(i + 2) === "NOT";
        const alvo = literal(t[i + (negar ? 3 : 2)] ?? "");
        cond = (l) => (l[col] === alvo) !== negar;
        i += negar ? 4 : 3;
      } else if (op === "LIKE" || op === "ILIKE" || (op === "NOT" && (up(i + 2) === "LIKE" || up(i + 2) === "ILIKE"))) {
        const col = a.toLowerCase();
        if (!confere(col)) return erro("42703", `column "${col}" does not exist`);
        const negar = op === "NOT";
        const tipo = negar ? up(i + 2) : op;
        const padrao = String(literal(t[i + (negar ? 3 : 2)] ?? "''"));
        cond = (l) => like(l[col], padrao, tipo === "ILIKE") !== negar;
        i += negar ? 4 : 3;
      } else if (["=", "<>", "!=", ">", "<", ">=", "<="].includes(t[i + 1] ?? "")) {
        const col = a.toLowerCase();
        if (!confere(col)) return erro("42703", `column "${col}" does not exist`);
        const o = t[i + 1];
        const v = literal(t[i + 2] ?? "");
        cond = (l) => comparar(l[col], o, v);
        i += 3;
      } else return erro("42601", `syntax error at or near "${a}"`);
      conds.push({ cond, ligacao });
      if (up(i) === "AND" || up(i) === "OR") {
        ligacao = up(i) as "AND" | "OR";
        i++;
      }
    }
  }

  // ORDER BY e LIMIT
  let ordem: { col: string; desc: boolean } | null = null;
  if (up(i) === "ORDER" && up(i + 1) === "BY") {
    const col = (t[i + 2] ?? "").toLowerCase();
    if (!confere(col)) return erro("42703", `column "${col}" does not exist`);
    ordem = { col, desc: up(i + 3) === "DESC" };
    i += up(i + 3) === "DESC" || up(i + 3) === "ASC" ? 4 : 3;
  }
  let limite = Infinity;
  if (up(i) === "LIMIT") {
    limite = Number(t[i + 1]);
    if (!Number.isFinite(limite)) return erro("42601", `syntax error at or near "${t[i + 1] ?? ""}"`);
    i += 2;
  }
  if (i < t.length) return erro("42601", `syntax error at or near "${t[i]}"`);

  // Executa
  const inicio = performance.now();
  let linhas = tabela.linhas.map((l) => Object.fromEntries(nomesColunas.map((c, k) => [c, l[k]])) as Record<string, Valor>);
  if (conds.length)
    linhas = linhas.filter((l) =>
      conds.reduce<boolean>((acc, { cond, ligacao }, k) => (k === 0 ? cond(l) : ligacao === "AND" ? acc && cond(l) : acc || cond(l)), true)
    );
  if (ordem) {
    const { col, desc } = ordem;
    linhas.sort((a, b) => {
      const x = a[col];
      const y = b[col];
      const r = typeof x === "number" && typeof y === "number" ? x - y : comoTexto(x).localeCompare(comoTexto(y));
      return desc ? -r : r;
    });
  }
  linhas = linhas.slice(0, limite);
  const ms = Math.round(performance.now() - inicio) + 4 + Math.floor(Math.random() * 30);

  if (contar) return { ok: true, colunas: ["count"], linhas: [[linhas.length]], tabela: tabela.nome, ms };
  const colunas = pedidas.length === 0 || pedidas.includes("*") ? nomesColunas : pedidas;
  return { ok: true, colunas, linhas: linhas.map((l) => colunas.map((c) => l[c])), tabela: tabela.nome, ms };
}
