import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Arquivo } from "./projeto";
import { realcar, type Linha } from "./realce";
import { Markdown } from "./Markdown";
import {
  IcAjustar,
  IcAumentar,
  IcCheck,
  IcDiminuir,
  IcDividido,
  IcExecutar,
  IcSoCodigo,
  IcSoPreview,
  IcTamanhoReal,
} from "./icones";

export type ModoMd = "editor" | "dividido" | "preview";

// Tira os primeiros n caracteres de uma linha realçada (para desenhar as guias de recuo)
function cortarInicio(linha: Linha, n: number): Linha {
  const out: Linha = [];
  let resta = n;
  for (const p of linha) {
    if (resta >= p.t.length) {
      resta -= p.t.length;
      continue;
    }
    out.push({ t: p.t.slice(resta), c: p.c });
    resta = 0;
  }
  return out;
}

type Marca = "app" | "teste" | null;

function marcaDaLinha(arquivo: Arquivo, texto: string, anterior: string): Marca {
  if (arquivo.icone === "aplicacao" && /class PortfolioApplication|static void main/.test(texto)) return "app";
  if (arquivo.icone === "teste" && (/^class \w+Tests/.test(texto) || (/@Test/.test(anterior) && /void \w+\(/.test(texto)))) return "teste";
  return null;
}

type PropsCodigo = {
  arquivo: Arquivo;
  onCursor: (linha: number, coluna: number) => void;
  onRodar: (marca: "app" | "teste") => void;
};

export function CodigoView({ arquivo, onCursor, onRodar }: PropsCodigo) {
  const texto = arquivo.texto ?? "";
  const linhas = useMemo(() => realcar(arquivo.id, arquivo.ling ?? "texto", texto), [arquivo.id, arquivo.ling, texto]);
  const brutas = useMemo(() => texto.replace(/\n$/, "").split("\n"), [texto]);
  const [atual, setAtual] = useState(0);
  const medida = useRef<HTMLSpanElement>(null);
  const largura = useRef(7.8);

  useLayoutEffect(() => {
    if (medida.current) largura.current = medida.current.getBoundingClientRect().width / 20;
  }, []);

  const clicar = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const caixa = e.currentTarget.querySelector(".cod-texto")!.getBoundingClientRect();
    const coluna = Math.min(brutas[i].length, Math.max(0, Math.round((e.clientX - caixa.left) / largura.current))) + 1;
    setAtual(i);
    onCursor(i + 1, coluna);
  };

  return (
    <div className="cod" role="document" aria-label={arquivo.nome}>
      <span className="cod-medida" ref={medida} aria-hidden="true">
        00000000000000000000
      </span>
      <div className="cod-linhas">
        {linhas.map((linha, i) => {
          const bruta = brutas[i] ?? "";
          const recuo = bruta.trim() ? /^ */.exec(bruta)![0].length : 0;
          const guias = Math.floor(recuo / 4);
          const marca = marcaDaLinha(arquivo, bruta, brutas[i - 1] ?? "");
          return (
            <div key={i} className={`cod-linha${i === atual ? " atual" : ""}`} onMouseDown={clicar(i)}>
              <span className="cod-num">{i + 1}</span>
              <span className="cod-gutter">
                {marca && (
                  <button
                    className="cod-rodar"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onRodar(marca)}
                    title={marca === "app" ? "Run 'PortfolioApplication'" : "Run tests"}
                    aria-label={marca === "app" ? "Rodar PortfolioApplication" : "Rodar testes"}
                  >
                    <IcExecutar tamanho={12} />
                  </button>
                )}
              </span>
              <code className="cod-texto">
                {Array.from({ length: guias }, (_, g) => (
                  <span key={`g${g}`} className="cod-guia">
                    {"    "}
                  </span>
                ))}
                {(guias ? cortarInicio(linha, guias * 4) : linha).map((p, j) => (
                  <span key={j} className={p.c}>
                    {p.t}
                  </span>
                ))}
                {i === atual && <span className="cod-cursor" aria-hidden="true" />}
                {"\n"}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visualizador de imagem
// ---------------------------------------------------------------------------
export function ImagemView({ arquivo }: { arquivo: Arquivo }) {
  const img = arquivo.imagem!;
  const [zoom, setZoom] = useState<number | "ajustar">("ajustar");
  const z = typeof zoom === "number" ? zoom : null;
  return (
    <div className="img-view">
      <div className="img-barra">
        <button onClick={() => setZoom((v) => Math.min(4, (typeof v === "number" ? v : 1) * 1.25))} title="Zoom In" aria-label="Aumentar">
          <IcAumentar />
        </button>
        <button onClick={() => setZoom((v) => Math.max(0.1, (typeof v === "number" ? v : 1) / 1.25))} title="Zoom Out" aria-label="Diminuir">
          <IcDiminuir />
        </button>
        <button onClick={() => setZoom(1)} title="Actual Size" aria-label="Tamanho real">
          <IcTamanhoReal />
        </button>
        <button onClick={() => setZoom("ajustar")} title="Fit Zoom to Window" aria-label="Ajustar">
          <IcAjustar />
        </button>
        <span className="img-zoom">{z ? `${Math.round(z * 100)}%` : "ajustado"}</span>
      </div>
      <div className="img-area">
        <img
          src={img.src}
          alt={arquivo.nome}
          style={z ? { width: img.largura * z, maxWidth: "none" } : undefined}
          className={z ? "" : "ajustar"}
        />
      </div>
      <div className="img-info">
        {img.largura}×{img.altura} WebP ({img.kb} kB)
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Markdown com os três modos do IntelliJ
// ---------------------------------------------------------------------------
type PropsMd = {
  arquivo: Arquivo;
  modo: ModoMd;
  onCursor: PropsCodigo["onCursor"];
  onLink: (destino: string) => void;
};

export function MarkdownView({ arquivo, modo, onCursor, onLink }: PropsMd) {
  return (
    <div className={`md-view md-${modo}`}>
      {modo !== "preview" && (
        <div className="md-fonte">
          <CodigoView arquivo={arquivo} onCursor={onCursor} onRodar={() => {}} />
        </div>
      )}
      {modo !== "editor" && (
        <div className="md-preview">
          <Markdown texto={arquivo.texto ?? ""} onLink={onLink} />
        </div>
      )}
    </div>
  );
}

// Canto de cima do editor: modos do Markdown e o "sem problemas" da inspeção
export function FerramentasEditor({ md, modo, onModo }: { md: boolean; modo: ModoMd; onModo: (m: ModoMd) => void }) {
  const modos: [ModoMd, string, () => React.JSX.Element][] = [
    ["editor", "Editor Only", () => <IcSoCodigo />],
    ["dividido", "Editor and Preview", () => <IcDividido />],
    ["preview", "Preview Only", () => <IcSoPreview />],
  ];
  return (
    <div className="ed-ferramentas">
      <span className="ed-inspecao" title="No problems found">
        <IcCheck tamanho={14} />
      </span>
      {md &&
        modos.map(([m, nome, Ic]) => (
          <button key={m} aria-pressed={modo === m} onClick={() => onModo(m)} title={nome} aria-label={nome}>
            <Ic />
          </button>
        ))}
    </div>
  );
}
