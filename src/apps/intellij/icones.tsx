// Ícones no estilo da interface nova do IntelliJ (traço fino, 16px)
type P = { tamanho?: number };

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const svg = (t: number, filhos: React.ReactNode, extra: object = traco) => (
  <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }} {...extra}>
    {filhos}
  </svg>
);

// ---------- Barra principal ----------
export const IcMenu = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />);
export const IcChevron = ({ tamanho = 12 }: P) => svg(tamanho, <path d="M5 6.5l3 3 3-3" />, { ...traco, strokeWidth: 1.3 });
export const IcRamo = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="4.5" cy="3.5" r="1.5" />
      <circle cx="4.5" cy="12.5" r="1.5" />
      <circle cx="11.5" cy="5" r="1.5" />
      <path d="M4.5 5v6M11.5 6.5c0 3-4 2.5-6.6 4.9" />
    </>
  );
export const IcAtualizar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M12.5 3.5l-9 9M3.5 6.5v6h6" />, { ...traco, stroke: "var(--ij-ico-azul, #548af7)" });
export const IcEnviar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3.5 12.5l9-9M6.5 3.5h6v6" />, { ...traco, stroke: "var(--ij-ico-verde, #5fb865)" });
export const IcExecutar = ({ tamanho = 16, cor = "var(--ij-ico-verde, #5fb865)" }: P & { cor?: string }) =>
  svg(tamanho, <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.3-5.2a.5.5 0 0 0 0-.86l-8.3-5.2a.5.5 0 0 0-.76.43z" />, { fill: cor });
export const IcDepurar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M5.2 6.2h5.6v4.3a2.8 2.8 0 0 1-5.6 0z" />
      <path d="M6 6.2a2 2 0 0 1 4 0M8 6.6v6.6M2.5 9h2.7M10.8 9h2.7M3 5.3l2.2 1.4M13 5.3l-2.2 1.4M3 13l2.4-1.3M13 13l-2.4-1.3" />
    </>,
    { ...traco, stroke: "var(--ij-ico-verde, #5fb865)" }
  );
export const IcMais = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="3.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12.5" r="1" fill="currentColor" stroke="none" />
    </>
  );
export const IcIA = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M8 2.2a5.8 5.8 0 1 0 5.8 5.8" />
      <path d="M8 5a3 3 0 1 0 3 3" />
      <circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none" />
    </>
  );
export const IcColab = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="6.5" cy="5.5" r="2.5" />
      <path d="M2 13.5c.4-2.4 2.2-3.8 4.5-3.8s4.1 1.4 4.5 3.8M12.5 4v4M10.5 6h4" />
    </>
  );
export const IcBusca = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5l-3.3-3.3" />
    </>
  );
export const IcEngrenagem = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7L3.6 3.6" />
      <circle cx="8" cy="8" r="4.6" />
    </>
  );
export const IcParar = ({ tamanho = 16, ativo = true }: P & { ativo?: boolean }) =>
  svg(tamanho, <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" />, { fill: ativo ? "#db5c5c" : "var(--ij-ico-inativo, #5a5d63)" });
export const IcReexecutar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M12 1.8v2.8H9.2" />
    </>,
    { ...traco, stroke: "var(--ij-ico-verde, #5fb865)" }
  );
export const IcSpringBoot = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M13.6 2.4c-6.6-.5-11 3.4-10.3 9 .2 1.4 1 2.2 2.3 2.2 5.6 0 8.6-5 8-11.2z" fill="var(--ij-ico-verde, #5fb865)" stroke="none" />
      <path d="M4.3 12.9c1.6-3.4 4-5.8 7.2-7.6" stroke="#2b2d30" strokeWidth="1.2" />
    </>,
    { fill: "none", strokeLinecap: "round" }
  );

// Botões da janela (estilo Windows)
export const IcMinimizarJanela = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3 8h10" />, { ...traco, strokeWidth: 1 });
export const IcMaximizarJanela = ({ tamanho = 16 }: P) =>
  svg(tamanho, <rect x="3.5" y="3.5" width="9" height="9" rx="1" />, { ...traco, strokeWidth: 1 });
export const IcRestaurarJanela = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="3" y="5" width="8" height="8" rx="1" />
      <path d="M5.5 5V3.8a.8.8 0 0 1 .8-.8h5.9a.8.8 0 0 1 .8.8v5.9a.8.8 0 0 1-.8.8H11" />
    </>,
    { ...traco, strokeWidth: 1 }
  );
export const IcFecharJanela = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />, { ...traco, strokeWidth: 1 });

// ---------- Faixas laterais ----------
export const IcProjeto = ({ tamanho = 20 }: P) =>
  svg(tamanho, <path d="M1.8 4a1 1 0 0 1 1-1h3.4l1.5 1.5h5.5a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H2.8a1 1 0 0 1-1-1z" />);
export const IcCommit = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M1.5 8h3.9M10.6 8h3.9" />
    </>
  );
export const IcEstrutura = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="2" width="4.5" height="3.5" rx=".7" />
      <rect x="9.5" y="6.3" width="4.5" height="3.5" rx=".7" />
      <rect x="9.5" y="11" width="4.5" height="3.5" rx=".7" />
      <path d="M4.2 5.5v7h5.3M4.2 8h5.3" />
    </>
  );
export const IcFavoritos = ({ tamanho = 20 }: P) => svg(tamanho, <path d="M4.5 2.5h7v11l-3.5-2.6-3.5 2.6z" />);
export const IcMaisFerramentas = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="3.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="8" r="1" fill="currentColor" stroke="none" />
    </>
  );
export const IcServicos = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="5.6" cy="7" r=".8" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="7" r=".8" fill="currentColor" stroke="none" />
      <path d="M5.5 10.2c1.4 1.2 3.6 1.2 5 0" />
    </>
  );
export const IcExecucao = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M6.6 5.6v4.8L10.4 8z" />
    </>
  );
export const IcTerminal = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M4.5 6l2 2-2 2M8.5 10.5h3" />
    </>
  );
export const IcProblemas = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.8v3.8" />
      <circle cx="8" cy="11" r=".8" fill="currentColor" stroke="none" />
    </>
  );
export const IcGit = IcRamo;
export const IcNotificacoes = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M4 11V7.2a4 4 0 0 1 8 0V11l1.2 1.5H2.8z" />
      <path d="M6.5 14a1.6 1.6 0 0 0 3 0" />
    </>
  );
export const IcBanco = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <ellipse cx="8" cy="3.8" rx="5" ry="1.8" />
      <path d="M3 3.8v8.4c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V3.8M3 8c0 1 2.2 1.8 5 1.8S13 9 13 8" />
    </>
  );
export const IcMaven = ({ tamanho = 20 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" style={{ flex: "none" }}>
    <text x="8" y="12" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontStyle="italic" fontWeight="600" fontSize="13" fill="currentColor">
      m
    </text>
  </svg>
);
export const IcEndpoints = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M8 1.8l5.4 3.1v6.2L8 14.2l-5.4-3.1V4.9z" />
      <path d="M8 8l5.2-3M8 8L2.8 5M8 8v6" />
    </>
  );

// ---------- Janela Projeto ----------
export const IcSeta = ({ tamanho = 16, aberta = true }: P & { aberta?: boolean }) =>
  svg(tamanho, <path d={aberta ? "M5 6.5l3 3 3-3" : "M6.5 5l3 3-3 3"} />, { ...traco, strokeWidth: 1.3 });
export const IcAdicionar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M8 3v10M3 8h10" />);
export const IcLocalizar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="4.5" />
      <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" />
    </>
  );
export const IcExpandir = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M4.5 6l3.5-3 3.5 3M4.5 10l3.5 3 3.5-3" />);
export const IcRecolher = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M4.5 3l3.5 3 3.5-3M4.5 13l3.5-3 3.5 3" />);
export const IcOcultar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3.5 8h9" />);
export const IcFechar = ({ tamanho = 12 }: P) => svg(tamanho, <path d="M4 4l8 8M12 4l-8 8" />);
export const IcCheck = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3.5 8.5l3 3 6-7" />, { ...traco, stroke: "var(--ij-ico-verde, #5fb865)", strokeWidth: 1.6 });

// Pastas
type PapelPasta = "comum" | "fonte" | "recursos" | "teste" | "excluida" | "pacote" | "modulo";
const corPasta: Record<PapelPasta, string> = {
  comum: "var(--ij-ico-cinza, #9da0a8)",
  fonte: "var(--ij-ico-azul, #548af7)",
  recursos: "#c99e5b",
  teste: "var(--ij-ico-verde, #5fb865)",
  excluida: "#e08855",
  pacote: "var(--ij-ico-cinza, #9da0a8)",
  modulo: "var(--ij-ico-cinza, #9da0a8)",
};
export const IcPasta = ({ tamanho = 16, papel = "comum" }: P & { papel?: PapelPasta }) => {
  const cor = corPasta[papel];
  return svg(
    tamanho,
    <>
      <path
        d="M1.5 4a1 1 0 0 1 1-1h3.6l1.5 1.5h5.9a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"
        stroke={cor}
        fill={papel === "fonte" || papel === "teste" ? cor : "none"}
        fillOpacity={0.2}
      />
      {papel === "pacote" && <circle cx="8" cy="9" r="1.5" fill={cor} stroke="none" />}
      {papel === "recursos" && <path d="M5 8.5h6M5 10.5h4" stroke={cor} />}
      {papel === "modulo" && <rect x="10" y="8.5" width="3" height="3" rx=".5" fill="var(--ij-ico-azul, #548af7)" stroke="none" />}
    </>,
    { ...traco, strokeWidth: 1.1 }
  );
};
export const IcBibliotecas = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="3" width="3" height="10" rx=".6" />
      <rect x="6.2" y="3" width="3" height="10" rx=".6" />
      <path d="M10.6 3.6l2.8-.8 2 9.6-2.8.8z" />
    </>,
    { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1.1 }
  );
export const IcRascunhos = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M4.5 6l2 2-2 2M8 10h3" />
    </>,
    { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1.1 }
  );

// Arquivos
export type TipoIcone =
  | "classe"
  | "interface"
  | "enum"
  | "record"
  | "aplicacao"
  | "teste"
  | "anotacao"
  | "maven"
  | "xml"
  | "yaml"
  | "sql"
  | "md"
  | "docker"
  | "ignore"
  | "shell"
  | "cmd"
  | "html"
  | "imagem"
  | "properties"
  | "jar"
  | "jdk"
  | "texto"
  | "site";

const letra = (t: number, l: string, cor: string, extra?: React.ReactNode) => (
  <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }}>
    <circle cx="8" cy="8" r="6.6" fill={cor} fillOpacity={0.18} stroke={cor} strokeWidth="1.1" />
    <text x="8" y="11.2" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="700" fontSize="8.6" fill={cor}>
      {l}
    </text>
    {extra}
  </svg>
);

const rotulo = (t: number, txt: string, cor: string, fs = 6.6) => (
  <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }}>
    <path d="M3 1.8h6.6L13 5.2v9H3z" fill="none" stroke="var(--ij-ico-cinza, #9da0a8)" strokeWidth="1" strokeLinejoin="round" />
    <rect x="1" y="7.6" width="12.4" height="6.2" rx="1.2" fill={cor} />
    <text x="7.2" y="12.6" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="800" fontSize={fs} fill="#fff">
      {txt}
    </text>
  </svg>
);

export function IcArquivo({ tipo, tamanho = 16 }: P & { tipo: TipoIcone }) {
  const t = tamanho;
  switch (tipo) {
    case "classe":
      return letra(t, "C", "var(--ij-ico-azul, #548af7)");
    case "interface":
      return letra(t, "I", "var(--ij-ico-verde, #5fb865)");
    case "enum":
      return letra(t, "E", "#d6a14b");
    case "record":
      return letra(t, "R", "var(--ij-ico-azul, #548af7)");
    case "anotacao":
      return letra(t, "@", "var(--ij-ico-verde, #5fb865)");
    case "aplicacao":
      return letra(t, "C", "var(--ij-ico-azul, #548af7)", <path d="M10.6 10.2v4.6l3.8-2.3z" fill="var(--ij-ico-verde, #5fb865)" stroke="var(--ij-editor, #1e1f22)" strokeWidth=".6" />);
    case "teste":
      return letra(t, "C", "var(--ij-ico-azul, #548af7)", <circle cx="12.6" cy="12.6" r="2.6" fill="var(--ij-ico-verde, #5fb865)" stroke="var(--ij-editor, #1e1f22)" strokeWidth=".6" />);
    case "maven":
      return (
        <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }}>
          <text x="8" y="12.4" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontStyle="italic" fontWeight="700" fontSize="13" fill="#6b9bfa">
            m
          </text>
        </svg>
      );
    case "xml":
      return rotulo(t, "</>", "#e07b39", 5.4);
    case "yaml":
      return rotulo(t, "YML", "#cf5a5a", 5);
    case "sql":
      return svg(
        t,
        <>
          <ellipse cx="8" cy="4" rx="5" ry="1.8" stroke="var(--ij-ico-azul, #548af7)" />
          <path d="M3 4v8.2c0 1 2.2 1.8 5 1.8s5-.8 5-1.8V4M3 8.1c0 1 2.2 1.8 5 1.8s5-.8 5-1.8" stroke="var(--ij-ico-azul, #548af7)" />
        </>,
        { ...traco, strokeWidth: 1.1 }
      );
    case "md":
      return (
        <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }}>
          <text x="8" y="11.5" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="800" fontSize="7.4" fill="#8fa3c4">
            M↓
          </text>
        </svg>
      );
    case "docker":
      return svg(
        t,
        <>
          <path d="M1.5 8.2h11.6c.9 0 1.5-.6 1.7-1.3.3.2.7.7.7 1.3-.6.1-1 .4-1.2.9-1 3-3.6 4.6-7.4 4.6-3.5 0-5.4-2-5.4-5.5z" fill="#2496ed" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={2.4 + i * 2.3} y="5.8" width="1.9" height="1.9" fill="#2496ed" />
          ))}
          {[1, 2].map((i) => (
            <rect key={i} x={2.4 + i * 2.3} y="3.5" width="1.9" height="1.9" fill="#2496ed" />
          ))}
        </>,
        {}
      );
    case "ignore":
      return svg(
        t,
        <>
          <circle cx="8" cy="8" r="5.6" />
          <path d="M4 12l8-8" />
        </>,
        { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)" }
      );
    case "shell":
    case "cmd":
      return svg(
        t,
        <>
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
          <path d="M4.5 6l2 2-2 2M8.5 10.5h3" />
        </>,
        { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1.1 }
      );
    case "html":
      return rotulo(t, "<>", "#e07b39", 6);
    case "imagem":
      return svg(
        t,
        <>
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
          <circle cx="6" cy="6.3" r="1.1" />
          <path d="M2.5 12l3.5-3.3 2.4 2.3 1.9-1.7 3.2 2.9" />
        </>,
        { ...traco, stroke: "#c77dbb", strokeWidth: 1.1 }
      );
    case "properties":
      return rotulo(t, "≡", "#7a7e85", 7);
    case "jar":
      return svg(
        t,
        <>
          <rect x="3" y="2" width="10" height="12" rx="1.2" />
          <path d="M8 2v6M6.6 4h2.8M6.6 6h2.8" />
        </>,
        { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1.1 }
      );
    case "jdk":
      return svg(
        t,
        <>
          <path d="M4 6.5h7v4a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z" />
          <path d="M11 7.5h1a1.5 1.5 0 0 1 0 3h-1M6 2.5c-.6.8.6 1.4 0 2.2M8.5 2.5c-.6.8.6 1.4 0 2.2" />
        </>,
        { ...traco, stroke: "#e07b39", strokeWidth: 1.1 }
      );
    case "site":
      return svg(
        t,
        <>
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" />
        </>,
        { ...traco, stroke: "var(--ij-ico-azul, #548af7)", strokeWidth: 1.1 }
      );
    default:
      return svg(t, <path d="M3.5 1.8h6.1L12.5 5v9.2h-9z" />, { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1 });
  }
}

// ---------- Editor ----------
export const IcSoCodigo = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3 4h10M3 8h7M3 12h9" />);
export const IcDividido = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M8 2.5v11" />
    </>
  );
export const IcSoPreview = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <circle cx="6" cy="6.3" r="1.1" />
      <path d="M2.5 12l3.5-3.3 2.4 2.3 1.9-1.7 3.2 2.9" />
    </>
  );
export const IcVoltar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M13 8H3.5M7.5 4L3.5 8l4 4" />);
export const IcAvancar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3 8h9.5M8.5 4l4 4-4 4" />);
export const IcRecarregar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M12 1.8v2.8H9.2" />
    </>
  );
export const IcCadeado = ({ tamanho = 14 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </>
  );
export const IcAumentar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5l-3.3-3.3M7 5v4M5 7h4" />
    </>
  );
export const IcDiminuir = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5l-3.3-3.3M5 7h4" />
    </>
  );
export const IcTamanhoReal = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M5.5 6v4.5M10.5 6v4.5M8 7v.1M8 9.5v.1" />
    </>
  );
export const IcAjustar = ({ tamanho = 16 }: P) =>
  svg(tamanho, <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />);
export const IcAbrirFora = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M9.5 2.5h4v4M13.5 2.5L7.5 8.5M11.5 9v3.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1H7" />);

// ---------- Maven ----------
export const IcObjetivo = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2.5v1.6M8 11.9v1.6M13.5 8h-1.6M4.1 8H2.5M11.9 4.1l-1.1 1.1M5.2 10.8l-1.1 1.1M11.9 11.9l-1.1-1.1M5.2 5.2L4.1 4.1" />
    </>,
    { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)" }
  );
export const IcPlugin = ({ tamanho = 16 }: P) =>
  svg(tamanho, <path d="M6 2.5h4v3h2.5v4H10v4H6v-4H3.5v-4H6z" />, { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)" });
export const IcDependencia = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
      <path d="M2.5 6.5h11M6.5 6.5v7" />
    </>,
    { ...traco, stroke: "var(--ij-ico-cinza, #9da0a8)", strokeWidth: 1.1 }
  );
export const IcBaixar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" />);
export const IcRemover = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3 8h10" />);
export const IcRaio = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M9 1.8L3.8 9h4l-1 5.2L12.2 7h-4z" />);
export const IcCommitGrafo = ({ cor = "var(--ij-ico-azul, #548af7)" }: { cor?: string }) => (
  <svg viewBox="0 0 16 20" width={16} height={20} aria-hidden="true" style={{ flex: "none" }}>
    <path d="M8 0v20" stroke={cor} strokeWidth="1.6" />
    <circle cx="8" cy="10" r="3.4" fill="var(--ij-editor, #1e1f22)" stroke={cor} strokeWidth="1.6" />
  </svg>
);
