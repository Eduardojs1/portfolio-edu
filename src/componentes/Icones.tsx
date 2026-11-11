import type { TipoArquivo } from "../dados/arquivos";

type P = { tamanho?: number };

export function IconeArquivo({ tipo, tamanho = 16 }: { tipo: TipoArquivo } & P) {
  const s = { width: tamanho, height: tamanho, flex: "none" } as const;
  const texto = (t: string, cor: string, fundo?: string, fs = 7) => (
    <svg viewBox="0 0 16 16" style={s} aria-hidden="true">
      {fundo && <rect x="1" y="2" width="14" height="12" rx="2.5" fill={fundo} />}
      <text
        x="8"
        y="10.6"
        textAnchor="middle"
        fontSize={fs}
        fontWeight="700"
        fontFamily="JetBrains Mono, monospace"
        fill={cor}
      >
        {t}
      </text>
    </svg>
  );
  switch (tipo) {
    case "tsx":
      return (
        <svg viewBox="0 0 16 16" style={s} aria-hidden="true">
          <g fill="none" stroke="#56a8f5" strokeWidth="1">
            <ellipse cx="8" cy="8" rx="7" ry="2.7" />
            <ellipse cx="8" cy="8" rx="7" ry="2.7" transform="rotate(60 8 8)" />
            <ellipse cx="8" cy="8" rx="7" ry="2.7" transform="rotate(120 8 8)" />
          </g>
          <circle cx="8" cy="8" r="1.4" fill="#56a8f5" />
        </svg>
      );
    case "html":
      return texto("<>", "#fff", "#e0743b", 6.5);
    case "js":
      return texto("JS", "#2b2d30", "#e8c547");
    case "json":
      return texto("{}", "#e8c547", undefined, 9);
    case "css":
      return texto("#", "#fff", "#3d7ef5", 8);
    case "md":
      return texto("M↓", "#8fa3c4", undefined, 7.5);
    case "pdf":
      return texto("PDF", "#fff", "#db5c5c", 5);
  }
}

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const svg = (t: number, filhos: React.ReactNode, extra: object = traco) => (
  <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" style={{ flex: "none" }} {...extra}>
    {filhos}
  </svg>
);

export const IconePasta = ({ tamanho = 16, fonte = false }: P & { fonte?: boolean }) =>
  svg(
    tamanho,
    <path
      d="M1.5 4a1 1 0 0 1 1-1h3.6l1.5 1.5h5.9a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"
      fill={fonte ? "rgba(84,138,247,.25)" : "none"}
      stroke={fonte ? "#548af7" : "#9da0a8"}
    />,
    { ...traco, strokeWidth: 1.1 }
  );

export const IconeProjeto = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M1.5 4a1 1 0 0 1 1-1h3.6l1.5 1.5h5.9a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeSeta = ({ tamanho = 16, aberta = true }: P & { aberta?: boolean }) =>
  svg(tamanho, <path d={aberta ? "M5 6.5l3 3 3-3" : "M6.5 5l3 3-3 3"} />, { ...traco, strokeWidth: 1.3 });

export const IconeBusca = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M13.5 13.5l-3.3-3.3" />
    </>
  );

export const IconeTerminal = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
      <path d="M4.5 6l2 2-2 2M8.5 10.5h3" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeExecutar = ({ tamanho = 20, cheio = false }: P & { cheio?: boolean }) =>
  svg(
    tamanho,
    <path d="M4.5 2.8v10.4a.5.5 0 0 0 .76.43l8.3-5.2a.5.5 0 0 0 0-.86l-8.3-5.2a.5.5 0 0 0-.76.43z" />,
    cheio ? { fill: "#5fb865" } : { ...traco, strokeWidth: 1.2 }
  );

export const IconeReexecutar = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
      <path d="M12 1.8v2.8H9.2" />
    </>,
    { ...traco, stroke: "#5fb865" }
  );

export const IconeParar = ({ tamanho = 16, ativo = true }: P & { ativo?: boolean }) =>
  svg(tamanho, <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" />, { fill: ativo ? "#db5c5c" : "#5a5d63" });

export const IconeSino = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M4 11V7.2a4 4 0 0 1 8 0V11l1.2 1.5H2.8z" />
      <path d="M6.5 14a1.6 1.6 0 0 0 3 0" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeInfo = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="8" cy="8" r="6.5" fill="#3574f0" stroke="none" />
      <path d="M8 7.2v4M8 4.8v.1" stroke="#fff" strokeWidth="1.6" />
    </>,
    { fill: "none", strokeLinecap: "round" }
  );

export const IconeCheck = ({ tamanho = 16 }: P) =>
  svg(tamanho, <path d="M3.5 8.5l3 3 6-7" />, { ...traco, stroke: "#5fb865", strokeWidth: 1.6 });

export const IconeRecolher = ({ tamanho = 16 }: P) =>
  svg(tamanho, <path d="M4 6.5l4-3 4 3M4 12.5l4-3 4 3" />);

export const IconeMinimizar = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M3.5 8h9" />);

export const IconeEmail = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
      <path d="M2 4l6 4.5L14 4" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeWhatsapp = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M2.5 13.5l.9-2.7A5.6 5.6 0 1 1 5.3 12.6z" />
      <path d="M6 6.2c0 2.1 1.7 3.8 3.8 3.8l.7-1-1.4-.7-.7.5a2.8 2.8 0 0 1-1.2-1.2l.5-.7-.7-1.4z" />
    </>,
    { ...traco, strokeWidth: 1.1 }
  );

export const IconeGithub = ({ tamanho = 20 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true" fill="currentColor" style={{ flex: "none" }}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

export const IconeLinkedin = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
      <path d="M5 7v4.5M5 4.8v.1M7.7 11.5V7M7.7 9c0-1.3.8-2 1.8-2s1.7.6 1.7 2v2.5" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeRamo = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <circle cx="4.5" cy="3.5" r="1.5" />
      <circle cx="4.5" cy="12.5" r="1.5" />
      <circle cx="11.5" cy="5" r="1.5" />
      <path d="M4.5 5v6M11.5 6.5c0 3-4 2.5-6.6 4.9" />
    </>,
    { ...traco, strokeWidth: 1.2 }
  );

export const IconeMenu = ({ tamanho = 20 }: P) => svg(tamanho, <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />);

export const IconeFechar = ({ tamanho = 14 }: P) => svg(tamanho, <path d="M4 4l8 8M12 4l-8 8" />);

export const IconeAplicacao = ({ tamanho = 16 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="#9da0a8" strokeWidth="1.1" />
      <path d="M1.5 5.5h13" stroke="#9da0a8" strokeWidth="1.1" />
      <path d="M6.5 7.5v4l3.5-2z" fill="#5fb865" />
    </>,
    {}
  );
