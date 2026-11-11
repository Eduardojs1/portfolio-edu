type P = { tamanho?: number };

const traco = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const svg = (t: number, filhos: React.ReactNode, extra: object = traco) => (
  <svg viewBox="0 0 24 24" width={t} height={t} aria-hidden="true" style={{ flex: "none" }} {...extra}>
    {filhos}
  </svg>
);

export const IconeEnviar = ({ tamanho = 20 }: P) =>
  svg(tamanho, <path d="M5 12h13M13 6l6 6-6 6" />, { ...traco, strokeWidth: 2 });

export const IconeGuia = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  );

export const IconeRecomecar = ({ tamanho = 20 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </>
  );

export const IconeFechar = ({ tamanho = 20 }: P) => svg(tamanho, <path d="M6 6l12 12M18 6L6 18" />);

export const IconeEmail = ({ tamanho = 18 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </>
  );

export const IconeWhatsapp = ({ tamanho = 18 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2z" />
    </>,
    { ...traco, strokeWidth: 1.4 }
  );

export const IconeLinkedin = ({ tamanho = 18 }: P) =>
  svg(
    tamanho,
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13c0-1.7 1-2.6 2.3-2.6s2.2.8 2.2 2.6V16" />
    </>
  );

export const IconeGithub = ({ tamanho = 18 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true" fill="currentColor" style={{ flex: "none" }}>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  </svg>
);

export const IconeSeta = ({ tamanho = 16 }: P) => svg(tamanho, <path d="M7 17L17 7M9 7h8v8" />);

export const IconeArquivo = ({ tamanho = 18 }: P) =>
  svg(
    tamanho,
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M12 11v6M9.5 14.5L12 17l2.5-2.5" />
    </>
  );
