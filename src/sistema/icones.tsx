import { useId } from "react";

// Ícones dos apps e da barra de tarefas. Desenhados aqui, no estilo de cada programa.
type P = { tamanho?: number };

export function IconeIntelliJ({ tamanho = 24 }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fc801d" />
          <stop offset="0.5" stopColor="#fe2857" />
          <stop offset="1" stopColor="#087cfa" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${id})`} />
      <rect x="11" y="11" width="42" height="42" rx="3" fill="#000" />
      <text x="17" y="38" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="800" fontSize="19" fill="#fff">
        IJ
      </text>
      <rect x="17" y="44" width="15" height="3.4" fill="#fff" />
    </svg>
  );
}

export function IconeDataGrip({ tamanho = 24 }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#22d88f" />
          <stop offset="0.55" stopColor="#9775f8" />
          <stop offset="1" stopColor="#ff59e6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${id})`} />
      <rect x="11" y="11" width="42" height="42" rx="3" fill="#000" />
      <text x="16" y="38" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="800" fontSize="18" fill="#fff">
        DG
      </text>
      <rect x="17" y="44" width="15" height="3.4" fill="#fff" />
    </svg>
  );
}

export function IconeSpotify({ tamanho = 24 }: P) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#1ed760" />
      <g fill="none" stroke="#121212" strokeLinecap="round">
        <path d="M16 24.5c10.5-3.4 22.6-2.6 32.5 2.6" strokeWidth="5" />
        <path d="M18 33.5c8.8-2.6 18.6-1.8 26.6 2.3" strokeWidth="4.2" />
        <path d="M20 41.6c7-1.9 14.6-1.3 20.8 1.8" strokeWidth="3.6" />
      </g>
    </svg>
  );
}

// Navegador: um globo (genérico, para o portfólio em modo site comum)
export function IconeNavegador({ tamanho = 24 }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4fa3ff" />
          <stop offset="1" stopColor="#2f5fd6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill={`url(#${id})`} />
      <g fill="none" stroke="#fff" strokeWidth="3" opacity="0.92">
        <circle cx="32" cy="32" r="18" />
        <path d="M14 32h36M32 14c-7 6-7 30 0 36M32 14c7 6 7 30 0 36" />
      </g>
      <circle cx="47" cy="47" r="9" fill="#f2b45a" stroke="#1e1f22" strokeWidth="2.5" />
      <text x="47" y="51" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="800" fontSize="10" fill="#1e1f22">
        ED
      </text>
    </svg>
  );
}

// Bloco de notas: folha com linhas e a espiral em cima
export function IconeBloco({ tamanho = 24 }: P) {
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <rect x="12" y="9" width="40" height="49" rx="5" fill="#f4f6f9" />
      <rect x="12" y="9" width="40" height="11" rx="5" fill="#3d8bfd" />
      <rect x="12" y="15" width="40" height="5" fill="#3d8bfd" />
      {[20, 28, 36, 44].map((x) => (
        <rect key={x} x={x - 1.5} y="5" width="3" height="10" rx="1.5" fill="#9aa3b2" />
      ))}
      {[29, 36, 43, 50].map((y) => (
        <rect key={y} x="19" y={y} width={y === 50 ? 16 : 26} height="2.6" rx="1.3" fill="#b9c1ce" />
      ))}
    </svg>
  );
}

// Guia: o "?" de ajuda
export function IconeGuia({ tamanho = 24 }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#f08a3c" />
        </linearGradient>
      </defs>
      <path d="M8 14a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H30l-12 11v-11h-2a8 8 0 0 1-8-8z" fill={`url(#${id})`} />
      <text x="32" y="38" textAnchor="middle" fontFamily="Inter, Segoe UI, sans-serif" fontWeight="900" fontSize="28" fill="#1e1f22">
        ?
      </text>
    </svg>
  );
}

// "</>": o logo do portfólio (ícone de código), usado no site, no botão Iniciar e no avatar
export function LogoDev({ tamanho = 24 }: P) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" width={tamanho} height={tamanho} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2b45a" />
          <stop offset="1" stopColor="#e0674a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <g fill="none" stroke="#1e1f22" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 21 12.5 32 23 43" />
        <path d="M41 21 51.5 32 41 43" />
        <path d="M35.5 16.5 28.5 47.5" strokeWidth="4.4" />
      </g>
    </svg>
  );
}

export function IconeLixeira({ tamanho = 40 }: P) {
  return (
    <svg viewBox="0 0 48 48" width={tamanho} height={tamanho} aria-hidden="true">
      <path d="M12 14h24l-2.2 27a3 3 0 0 1-3 2.8H17.2a3 3 0 0 1-3-2.8z" fill="#c8d3e6" opacity="0.92" />
      <path d="M12 14h24l-.4 5H12.4z" fill="#9fb0cc" />
      <rect x="9" y="10" width="30" height="5" rx="2" fill="#e3e9f3" />
      <rect x="19" y="6.5" width="10" height="4" rx="1.5" fill="#e3e9f3" />
      <path d="M19 21v16M24 21v16M29 21v16" stroke="#8193b3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const traco = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconeLupa = ({ tamanho = 20 }: P) => (
  <svg viewBox="0 0 20 20" width={tamanho} height={tamanho} aria-hidden="true" {...traco}>
    <circle cx="8.5" cy="8.5" r="5.5" />
    <path d="M17 17l-4.5-4.5" />
  </svg>
);

export const IconeWifi = ({ tamanho = 16 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco} strokeWidth={1.3}>
    <path d="M1.5 6.2a9.5 9.5 0 0 1 13 0M3.8 8.6a6.2 6.2 0 0 1 8.4 0M6.1 11a3 3 0 0 1 3.8 0" />
    <circle cx="8" cy="13.2" r=".6" fill="currentColor" />
  </svg>
);

export const IconeSom = ({ tamanho = 16, mudo = false }: P & { mudo?: boolean }) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco} strokeWidth={1.3}>
    <path d="M2 6h2.6L8 3v10L4.6 10H2z" />
    {mudo ? <path d="M10.5 6l4 4M14.5 6l-4 4" /> : <path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.8a6 6 0 0 1 0 8.4" />}
  </svg>
);

export const IconeBateria = ({ tamanho = 16 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco} strokeWidth={1.2}>
    <rect x="1.5" y="4.5" width="11.5" height="7" rx="1.6" />
    <path d="M14.5 6.8v2.4" />
    <rect x="3" y="6" width="7" height="4" rx=".6" fill="currentColor" stroke="none" />
  </svg>
);

export const IconeSetaCima = ({ tamanho = 16 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco}>
    <path d="M4.5 9.5L8 6l3.5 3.5" />
  </svg>
);

export const IconeDesligar = ({ tamanho = 16 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco}>
    <path d="M8 2v6" />
    <path d="M4.6 4.2a5.2 5.2 0 1 0 6.8 0" />
  </svg>
);

export const IconeReiniciar = ({ tamanho = 16 }: P) => (
  <svg viewBox="0 0 16 16" width={tamanho} height={tamanho} aria-hidden="true" {...traco}>
    <path d="M13 8a5 5 0 1 1-1.5-3.6" />
    <path d="M12 2v3h-3" />
  </svg>
);

// Ícones de atalhos no menu Iniciar
export const IconeGithubApp = ({ tamanho = 24 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#24292f" />
    <path
      fill="#fff"
      d="M12 4.6a7.4 7.4 0 0 0-2.34 14.42c.37.07.5-.16.5-.36v-1.26c-2.06.45-2.5-.99-2.5-.99-.34-.86-.82-1.09-.82-1.09-.67-.46.05-.45.05-.45.74.05 1.13.76 1.13.76.66 1.13 1.73.8 2.15.61.07-.48.26-.8.47-.99-1.64-.19-3.37-.82-3.37-3.65 0-.81.29-1.47.76-1.98-.07-.19-.33-.94.07-1.95 0 0 .62-.2 2.03.76a7 7 0 0 1 3.7 0c1.41-.96 2.03-.76 2.03-.76.4 1.01.15 1.76.07 1.95.47.51.76 1.17.76 1.98 0 2.84-1.73 3.46-3.38 3.64.27.23.5.68.5 1.37v2.03c0 .2.13.43.51.36A7.4 7.4 0 0 0 12 4.6z"
    />
  </svg>
);

export const IconeLinkedinApp = ({ tamanho = 24 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#0a66c2" />
    <path fill="#fff" d="M7 10h2.3v7.3H7zm1.15-3.6a1.33 1.33 0 1 1 0 2.66 1.33 1.33 0 0 1 0-2.66zM11 10h2.2v1c.3-.6 1.1-1.2 2.3-1.2 2.4 0 2.8 1.6 2.8 3.6v3.9H16v-3.4c0-.8 0-1.9-1.2-1.9s-1.4.9-1.4 1.8v3.5H11z" />
  </svg>
);

export const IconeWhatsappApp = ({ tamanho = 24 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#25d366" />
    <path
      fill="none"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinejoin="round"
      d="M6 18l.9-2.9a6.4 6.4 0 1 1 2.3 2.2z"
    />
    <path fill="#fff" d="M9.6 8.9c.2-.4.4-.4.6-.4h.4c.1 0 .3 0 .4.3l.6 1.4c0 .1.1.3 0 .4l-.3.5-.3.3c-.1.1-.2.2-.1.4.4.8 1.1 1.5 1.9 1.9.2.1.3.1.4-.1l.6-.7c.1-.2.3-.2.4-.1l1.3.6c.2.1.3.2.3.3 0 .4-.1.9-.5 1.2-.5.4-1.2.5-1.9.3a7.6 7.6 0 0 1-3.9-3.4c-.5-.9-.4-2.2.1-2.9z" />
  </svg>
);

export const IconeEmailApp = ({ tamanho = 24 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#3574f0" />
    <rect x="5" y="7" width="14" height="10" rx="1.6" fill="none" stroke="#fff" strokeWidth="1.5" />
    <path d="M5.6 7.8L12 12.4l6.4-4.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconeSiteApp = ({ tamanho = 24 }: P) => (
  <svg viewBox="0 0 24 24" width={tamanho} height={tamanho} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#2b2d30" />
    <circle cx="12" cy="12" r="6.5" fill="none" stroke="#f2b45a" strokeWidth="1.4" />
    <path d="M5.5 12h13M12 5.5c2 2 2 11 0 13M12 5.5c-2 2-2 11 0 13" fill="none" stroke="#f2b45a" strokeWidth="1.2" />
  </svg>
);
