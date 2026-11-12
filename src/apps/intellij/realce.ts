// Realce de sintaxe no esquema "Dark" do IntelliJ. Simples: só o que os arquivos do projeto usam.
import type { Linguagem } from "./projeto";

export type Pedaco = { t: string; c?: string };
export type Linha = Pedaco[];

function juntarPedaco(linha: Linha, t: string, c?: string) {
  const ult = linha[linha.length - 1];
  if (ult && ult.c === c) ult.t += t;
  else linha.push({ t, c });
}

// ---------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------
const PALAVRAS_JAVA = new Set([
  "package", "import", "public", "private", "protected", "class", "enum", "record", "interface",
  "static", "final", "void", "new", "return", "boolean", "int", "long", "true", "false", "null",
  "this", "extends", "implements", "if", "else", "for", "while", "try", "catch", "throw", "throws",
  "var", "default", "abstract", "super",
]);

function java(fonte: string): Linha[] {
  let emDoc = false;
  let emBloco = false; // text block """
  return fonte.split("\n").map((l) => {
    const out: Linha = [];
    let i = 0;
    let anterior = "";
    const declaracao = /^\s*(public|private|protected|static|\s)*[\w<>[\],\s]+\s+\w+\s*\(.*\)\s*(\{|throws|$)/.test(l) && !/[=;]|\bnew\b|\breturn\b/.test(l.split("(")[0]);
    while (i < l.length) {
      const resto = l.slice(i);
      if (emBloco) {
        const fim = resto.indexOf('"""');
        const ate = fim === -1 ? resto.length : fim + 3;
        juntarPedaco(out, resto.slice(0, ate), "t-str");
        i += ate;
        if (fim !== -1) emBloco = false;
        continue;
      }
      if (emDoc) {
        const fim = resto.indexOf("*/");
        const ate = fim === -1 ? resto.length : fim + 2;
        const trecho = resto.slice(0, ate);
        // @tags do Javadoc em negrito
        trecho.split(/(@\w+)/).forEach((p) => p && juntarPedaco(out, p, p.startsWith("@") ? "t-doc-tag" : "t-doc"));
        i += ate;
        if (fim !== -1) emDoc = false;
        continue;
      }
      if (resto.startsWith("/*")) {
        emDoc = true;
        continue;
      }
      if (resto.startsWith("//")) {
        juntarPedaco(out, resto, "t-com");
        break;
      }
      if (resto.startsWith('"""')) {
        juntarPedaco(out, '"""', "t-str");
        i += 3;
        emBloco = true;
        continue;
      }
      let m = /^"(?:[^"\\]|\\.)*"/.exec(resto);
      if (m) {
        juntarPedaco(out, m[0], "t-str");
        i += m[0].length;
        continue;
      }
      m = /^@\w+/.exec(resto);
      if (m) {
        juntarPedaco(out, m[0], "t-anot");
        i += m[0].length;
        continue;
      }
      m = /^\d[\d_.]*[LlFfDd]?/.exec(resto);
      if (m) {
        juntarPedaco(out, m[0], "t-num");
        i += m[0].length;
        continue;
      }
      m = /^[A-Za-z_]\w*/.exec(resto);
      if (m) {
        const w = m[0];
        const depois = resto.slice(w.length);
        let c: string | undefined;
        if (PALAVRAS_JAVA.has(w)) c = "t-kw";
        else if (anterior === "package" || anterior === "import") c = undefined;
        else if (/^[A-Z][A-Z0-9_]+$/.test(w)) c = "t-const";
        else if (/^\s*\(/.test(depois) && declaracao && !["new", "record", "class", "enum", "interface"].includes(anterior)) c = "t-met";
        else if (/^\s*\(/.test(depois) && /^[a-z]/.test(w) && anterior !== "new") c = "t-met-uso";
        else if (/^\s*=(?!=)/.test(depois) && !/^\s*(return|var)\b/.test(l)) c = "t-campo";
        else if (/^\s*;\s*$/.test(depois) && /^\s*(private|public|protected)?\s*(static\s+)?(final\s+)?[\w<>[\], ]+\s+\w+\s*;/.test(l)) c = "t-campo";
        else if (anterior === "this" || out[out.length - 1]?.t.endsWith("this.")) c = "t-campo";
        juntarPedaco(out, w, c);
        if (anterior !== "package" && anterior !== "import") anterior = w;
        i += w.length;
        continue;
      }
      juntarPedaco(out, resto[0]);
      i += 1;
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// XML e HTML
// ---------------------------------------------------------------------------
function xml(fonte: string): Linha[] {
  let emComentario = false;
  let emTag = false;
  return fonte.split("\n").map((l) => {
    const out: Linha = [];
    let i = 0;
    while (i < l.length) {
      const resto = l.slice(i);
      if (emComentario) {
        const fim = resto.indexOf("-->");
        const ate = fim === -1 ? resto.length : fim + 3;
        juntarPedaco(out, resto.slice(0, ate), "t-com");
        i += ate;
        if (fim !== -1) emComentario = false;
        continue;
      }
      if (resto.startsWith("<!--")) {
        emComentario = true;
        continue;
      }
      if (emTag) {
        let m = /^\s+/.exec(resto);
        if (m) {
          juntarPedaco(out, m[0]);
          i += m[0].length;
          continue;
        }
        m = /^\/?\??>/.exec(resto);
        if (m) {
          juntarPedaco(out, m[0], "t-tag");
          i += m[0].length;
          emTag = false;
          continue;
        }
        m = /^[\w:.-]+/.exec(resto);
        if (m) {
          juntarPedaco(out, m[0], m[0].startsWith("th:") ? "t-attr-th" : "t-attr");
          i += m[0].length;
          continue;
        }
        m = /^"[^"]*"?/.exec(resto);
        if (m) {
          juntarPedaco(out, m[0], "t-val");
          i += m[0].length;
          continue;
        }
        juntarPedaco(out, resto[0]);
        i += 1;
        continue;
      }
      const m = /^<[/?!]?[\w:.-]*/.exec(resto);
      if (m && m[0].length > 1) {
        juntarPedaco(out, m[0], "t-tag");
        i += m[0].length;
        emTag = true;
        continue;
      }
      const texto = /^[^<]+/.exec(resto);
      if (texto) {
        juntarPedaco(out, texto[0]);
        i += texto[0].length;
        continue;
      }
      juntarPedaco(out, resto[0]);
      i += 1;
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// YAML e properties
// ---------------------------------------------------------------------------
function valor(out: Linha, v: string) {
  if (!v) return;
  const com = v.indexOf(" #");
  const corpo = com === -1 ? v : v.slice(0, com);
  const espaco = /^\s*/.exec(corpo)![0];
  const resto = corpo.slice(espaco.length);
  juntarPedaco(out, espaco);
  if (/^(true|false|null)$/.test(resto.trim())) juntarPedaco(out, resto, "t-kw");
  else if (/^-?\d+(\.\d+)?$/.test(resto.trim())) juntarPedaco(out, resto, "t-num");
  else if (resto.includes("${")) resto.split(/(\$\{[^}]*\})/).forEach((p) => p && juntarPedaco(out, p, p.startsWith("${") ? "t-var" : "t-str"));
  else juntarPedaco(out, resto, "t-str");
  if (com !== -1) juntarPedaco(out, v.slice(com), "t-com");
}

function yaml(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    const out: Linha = [];
    if (/^\s*#/.test(l)) return [{ t: l, c: "t-com" }];
    const lista = /^(\s*)(- )(.*)$/.exec(l);
    if (lista) {
      juntarPedaco(out, lista[1]);
      juntarPedaco(out, lista[2], "t-pont");
      valor(out, lista[3]);
      return out;
    }
    const m = /^(\s*)([\w.-]+)(:)(.*)$/.exec(l);
    if (m) {
      juntarPedaco(out, m[1]);
      juntarPedaco(out, m[2], "t-chave");
      juntarPedaco(out, m[3]);
      valor(out, m[4]);
      return out;
    }
    return l ? [{ t: l }] : [];
  });
}

function properties(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    if (/^\s*#/.test(l)) return [{ t: l, c: "t-com" }];
    const m = /^([^=]+)(=)(.*)$/.exec(l);
    return m ? [{ t: m[1], c: "t-chave" }, { t: m[2] }, { t: m[3], c: "t-str" }] : l ? [{ t: l }] : [];
  });
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------
const PALAVRAS_SQL = new Set(
  "select from where and or not null insert into values create table primary key default order by asc desc limit as on join left inner update set delete distinct group having like ilike any array is true false references unique".split(" ")
);
const TIPOS_SQL = new Set("bigserial serial varchar text boolean integer int bigint numeric timestamp date".split(" "));

export function sql(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    const out: Linha = [];
    let i = 0;
    while (i < l.length) {
      const resto = l.slice(i);
      if (resto.startsWith("--")) {
        juntarPedaco(out, resto, "t-com");
        break;
      }
      let m = /^'(?:[^']|'')*'?/.exec(resto);
      if (m) {
        juntarPedaco(out, m[0], "t-str");
        i += m[0].length;
        continue;
      }
      m = /^\d+(\.\d+)?/.exec(resto);
      if (m) {
        juntarPedaco(out, m[0], "t-num");
        i += m[0].length;
        continue;
      }
      m = /^[A-Za-z_]\w*/.exec(resto);
      if (m) {
        const w = m[0].toLowerCase();
        const c = PALAVRAS_SQL.has(w) ? "t-kw" : TIPOS_SQL.has(w) ? "t-kw" : /^\s*\(/.test(resto.slice(m[0].length)) && w === "count" ? "t-met" : undefined;
        juntarPedaco(out, m[0], c);
        i += m[0].length;
        continue;
      }
      juntarPedaco(out, resto[0]);
      i += 1;
    }
    return out;
  });
}

// ---------------------------------------------------------------------------
// Markdown, Dockerfile, shell, .gitignore
// ---------------------------------------------------------------------------
function markdown(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    if (/^#{1,6} /.test(l)) return [{ t: l, c: "t-md-titulo" }];
    if (/^>/.test(l)) return [{ t: l, c: "t-com" }];
    if (/^(---|\|[\s|:-]+\|)$/.test(l)) return [{ t: l, c: "t-pont" }];
    const out: Linha = [];
    let resto = l;
    const item = /^(\s*[-*] |\s*\d+\. |\| )/.exec(resto);
    if (item) {
      juntarPedaco(out, item[1], "t-kw");
      resto = resto.slice(item[1].length);
    }
    resto
      .split(/(`[^`]*`|\*\*[^*]+\*\*|!?\[[^\]]*\]\([^)]*\))/)
      .forEach((p) => {
        if (!p) return;
        if (p.startsWith("`")) juntarPedaco(out, p, "t-str");
        else if (p.startsWith("**")) juntarPedaco(out, p, "t-md-negrito");
        else if (/^!?\[/.test(p)) juntarPedaco(out, p, "t-md-link");
        else juntarPedaco(out, p);
      });
    return out;
  });
}

function docker(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    if (/^\s*#/.test(l)) return [{ t: l, c: "t-com" }];
    const m = /^([A-Z]+)(\s.*)?$/.exec(l);
    if (!m) return l ? [{ t: l }] : [];
    const out: Linha = [{ t: m[1], c: "t-kw" }];
    (m[2] ?? "").split(/("[^"]*")/).forEach((p) => p && juntarPedaco(out, p, p.startsWith('"') ? "t-str" : undefined));
    return out;
  });
}

function shell(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    if (/^\s*(#|@REM)/i.test(l)) return [{ t: l, c: "t-com" }];
    const out: Linha = [];
    l.split(/("[^"]*"|\$\{[^}]*\}|\$\w+|%\w+%|\b(?:set|exec|echo|if|then|fi)\b)/).forEach((p) => {
      if (!p) return;
      if (p.startsWith('"')) juntarPedaco(out, p, "t-str");
      else if (p.startsWith("$") || p.startsWith("%")) juntarPedaco(out, p, "t-var");
      else if (/^(set|exec|echo|if|then|fi)$/.test(p)) juntarPedaco(out, p, "t-kw");
      else juntarPedaco(out, p);
    });
    return out;
  });
}

function ignore(fonte: string): Linha[] {
  return fonte.split("\n").map((l) => {
    if (/^\s*#/.test(l)) return [{ t: l, c: "t-com" }];
    if (l.startsWith("!")) return [{ t: "!", c: "t-kw" }, { t: l.slice(1) }];
    return l ? [{ t: l }] : [];
  });
}

const porLinguagem: Record<Linguagem, (f: string) => Linha[]> = {
  java,
  xml,
  html: xml,
  yaml,
  properties,
  sql,
  md: markdown,
  docker,
  shell,
  ignore,
  texto: (f) => f.split("\n").map((l) => (l ? [{ t: l }] : [])),
};

const cache = new Map<string, Linha[]>();

export function realcar(id: string, ling: Linguagem, texto: string): Linha[] {
  const chave = `${id}::${texto.length}`;
  if (!cache.has(chave)) cache.set(chave, porLinguagem[ling](texto.replace(/\n$/, "")));
  return cache.get(chave)!;
}
