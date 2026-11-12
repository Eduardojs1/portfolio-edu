import { Fragment, type ReactNode } from "react";

// Preview de Markdown (o suficiente para o README): títulos, parágrafos, listas,
// tabelas, imagens, citação, código e links. Links com "acao:", "abrir:", "app:" e
// "site:" chamam onLink em vez de navegar.
type Props = { texto: string; onLink: (destino: string) => void };

function inline(texto: string, onLink: Props["onLink"], chave = ""): ReactNode[] {
  const partes = texto.split(/(`[^`]+`|\*\*[^*]+\*\*|!\[[^\]]*\]\([^)]*\)|\[[^\]]+\]\([^)]+\))/);
  return partes.map((p, i) => {
    const k = `${chave}${i}`;
    if (!p) return null;
    if (p.startsWith("`")) return <code key={k}>{p.slice(1, -1)}</code>;
    if (p.startsWith("**")) return <strong key={k}>{inline(p.slice(2, -2), onLink, k)}</strong>;
    const img = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(p);
    if (img) return <img key={k} src={img[2]} alt={img[1]} className={img[3] ? `md-${img[3]}` : undefined} />;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    if (link) {
      const [, rotulo, destino] = link;
      const interno = /^(acao|abrir|app|site):/.test(destino);
      return interno ? (
        <a
          key={k}
          href="#"
          className="md-acao"
          onClick={(e) => {
            e.preventDefault();
            onLink(destino);
          }}
        >
          {inline(rotulo, onLink, k)}
        </a>
      ) : (
        <a key={k} href={destino} target={destino.startsWith("mailto:") ? undefined : "_blank"} rel="noopener">
          {inline(rotulo, onLink, k)}
        </a>
      );
    }
    return <Fragment key={k}>{p}</Fragment>;
  });
}

export function Markdown({ texto, onLink }: Props) {
  const linhas = texto.split("\n");
  const blocos: ReactNode[] = [];
  let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    const k = `b${i}`;
    if (!l.trim()) {
      i++;
      continue;
    }
    const titulo = /^(#{1,6}) (.*)$/.exec(l);
    if (titulo) {
      const nivel = titulo[1].length;
      const Tag = `h${nivel}` as "h1";
      blocos.push(<Tag key={k}>{inline(titulo[2], onLink)}</Tag>);
      i++;
      continue;
    }
    if (/^---+$/.test(l)) {
      blocos.push(<hr key={k} />);
      i++;
      continue;
    }
    if (l.startsWith(">")) {
      const itens: string[] = [];
      while (i < linhas.length && linhas[i].startsWith(">")) itens.push(linhas[i++].replace(/^>\s?/, ""));
      blocos.push(<blockquote key={k}>{inline(itens.join(" "), onLink)}</blockquote>);
      continue;
    }
    if (/^\s*[-*] /.test(l)) {
      const itens: string[] = [];
      while (i < linhas.length && /^\s*[-*] /.test(linhas[i])) itens.push(linhas[i++].replace(/^\s*[-*] /, ""));
      blocos.push(
        <ul key={k}>
          {itens.map((it, j) => (
            <li key={j}>{inline(it, onLink, `${k}-${j}-`)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (l.startsWith("|")) {
      const linhasTabela: string[][] = [];
      while (i < linhas.length && linhas[i].startsWith("|")) {
        const celulas = linhas[i]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        if (!celulas.every((c) => /^:?-+:?$/.test(c))) linhasTabela.push(celulas);
        i++;
      }
      const [cab, ...corpo] = linhasTabela;
      blocos.push(
        <table key={k}>
          <thead>
            <tr>
              {cab.map((c, j) => (
                <th key={j}>{inline(c, onLink)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {corpo.map((linha, r) => (
              <tr key={r}>
                {linha.map((c, j) => (
                  <td key={j}>{inline(c, onLink, `${k}-${r}-${j}-`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }
    // Parágrafo: junta as linhas seguidas
    const corpo: string[] = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#{1,6} |[-*] |\||>|---)/.test(linhas[i])) corpo.push(linhas[i++]);
    const unico = corpo.length === 1 && /^!\[/.test(corpo[0]);
    blocos.push(
      unico ? (
        <Fragment key={k}>{inline(corpo[0], onLink)}</Fragment>
      ) : (
        <p key={k}>{inline(corpo.join(" "), onLink)}</p>
      )
    );
  }
  return <div className="md">{blocos}</div>;
}
