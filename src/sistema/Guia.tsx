import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { lerSinal, ouvirSinal } from "./eventos";

// O tour: post-its escritos à mão, um círculo de marca-texto em volta do que importa
// e uma setinha desenhada. O bilhete de boas-vindas é o LEIA-ME.txt (apps/bloco).

export type PassoTour = {
  alvo?: string; // seletor CSS do que circular
  texto: string;
  antes?: () => void; // prepara a tela (abre um app, por exemplo)
  acao?: { rotulo: string; fazer: () => void };
  esperar?: string; // sinal que, quando liga, avança sozinho
};

type Caixa = { top: number; left: number; width: number; height: number };

// Ruído suave para o traço não sair perfeito
const tremido = (a: number, semente: number) => Math.sin(a * 3 + semente) * 0.5 + Math.sin(a * 7 + semente * 2) * 0.25;

// Contorno à mão: elipse para coisas pequenas, retângulo para áreas grandes
function contorno(c: Caixa, semente: number) {
  const grande = c.width > 380 || c.height > 260;
  if (grande) {
    const p = 8;
    const x0 = c.left - p;
    const y0 = c.top - p;
    const x1 = c.left + c.width + p;
    const y1 = c.top + c.height + p;
    const j = (k: number) => tremido(k, semente) * 4;
    return `M${x0 - 10} ${y0 + j(1)} L${x1 + j(2)} ${y0 + j(3)} L${x1 + j(4)} ${y1 + j(5)} L${x0 + j(6)} ${y1 + j(7)} L${x0 + j(8)} ${y0 - 6}`;
  }
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;
  const rx = c.width / 2 + 14;
  const ry = c.height / 2 + 10;
  const pts: string[] = [];
  for (let a = -0.5; a <= Math.PI * 2 + 0.35; a += 0.12) {
    const r = 1 + tremido(a, semente) * 0.06;
    pts.push(`${(cx + Math.cos(a) * rx * r).toFixed(1)} ${(cy + Math.sin(a) * ry * r).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

// Seta curva do post-it até o alvo
function seta(nota: Caixa, alvo: Caixa) {
  const nc = { x: nota.left + nota.width / 2, y: nota.top + nota.height / 2 };
  const ac = { x: alvo.left + alvo.width / 2, y: alvo.top + alvo.height / 2 };
  // começa na borda do post-it virada para o alvo
  const sx = Math.max(nota.left - 4, Math.min(nota.left + nota.width + 4, ac.x));
  const sy = Math.max(nota.top - 4, Math.min(nota.top + nota.height + 4, ac.y));
  const inicio = { x: sx === ac.x && sy !== ac.y ? nc.x + (ac.x - nc.x) * 0.3 : sx, y: sy };
  // termina pouco antes do contorno do alvo
  const dx = inicio.x - ac.x;
  const dy = inicio.y - ac.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 70) return null;
  const raioAlvo = Math.min(alvo.width, alvo.height) / 2 + 22;
  const fim = { x: ac.x + (dx / dist) * Math.min(raioAlvo, dist * 0.6), y: ac.y + (dy / dist) * Math.min(raioAlvo, dist * 0.6) };
  const mx = (inicio.x + fim.x) / 2;
  const my = (inicio.y + fim.y) / 2;
  const curva = 0.22 * Math.hypot(fim.x - inicio.x, fim.y - inicio.y);
  const ctrl = { x: mx + (-(fim.y - inicio.y) / dist) * curva, y: my + ((fim.x - inicio.x) / dist) * curva };
  const ang = Math.atan2(fim.y - ctrl.y, fim.x - ctrl.x);
  const ponta = (desvio: number) => `${(fim.x - Math.cos(ang + desvio) * 14).toFixed(1)} ${(fim.y - Math.sin(ang + desvio) * 14).toFixed(1)}`;
  return {
    corpo: `M${inicio.x.toFixed(1)} ${inicio.y.toFixed(1)} Q${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${fim.x.toFixed(1)} ${fim.y.toFixed(1)}`,
    ponta: `M${ponta(0.5)} L${fim.x.toFixed(1)} ${fim.y.toFixed(1)} L${ponta(-0.5)}`,
  };
}

export function Tour({ passos, onFim }: { passos: PassoTour[]; onFim: () => void }) {
  const [i, setI] = useState(0);
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [nota, setNota] = useState<Caixa | null>(null);
  const cartao = useRef<HTMLDivElement>(null);
  const passo = passos[i];
  const ultimo = i === passos.length - 1;
  const celular = innerWidth <= 600;
  const giro = useMemo(() => ((i * 37) % 5) - 2, [i]); // cada post-it torto de um jeito

  const avancar = () => (ultimo ? onFim() : setI((n) => n + 1));

  useEffect(() => {
    passo.antes?.();
  }, [i]);

  // Avança sozinho quando o sinal liga durante o passo (ex.: o projeto subiu)
  useEffect(() => {
    if (!passo.esperar) return;
    const jaEstava = lerSinal(passo.esperar);
    return ouvirSinal(passo.esperar, (v) => {
      if (v && !jaEstava) window.setTimeout(() => setI((n) => (n === i ? n + 1 : n)), 900);
    });
  }, [i]);

  // Acompanha o alvo (as janelas podem mudar de lugar)
  useEffect(() => {
    const medir = () => {
      const el = passo.alvo ? document.querySelector<HTMLElement>(passo.alvo) : null;
      const r = el?.getBoundingClientRect();
      const nova = r && r.width > 0 && r.height > 0 ? { top: r.top, left: r.left, width: r.width, height: r.height } : null;
      setCaixa((c) =>
        c && nova && Math.abs(c.top - nova.top) < 1 && Math.abs(c.left - nova.left) < 1 && Math.abs(c.width - nova.width) < 1 && Math.abs(c.height - nova.height) < 1
          ? c
          : nova
      );
    };
    medir();
    const t = window.setInterval(medir, 150);
    addEventListener("resize", medir);
    return () => {
      window.clearInterval(t);
      removeEventListener("resize", medir);
    };
  }, [i, passo.alvo]);

  // Cola o post-it perto do alvo, sem sair da tela
  useLayoutEffect(() => {
    const c = cartao.current;
    if (!c) return;
    const M = 18;
    const W = c.offsetWidth;
    const H = c.offsetHeight;
    const vw = innerWidth;
    const vh = innerHeight - 48;
    if (celular) {
      const r = c.getBoundingClientRect();
      return setNota({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
    let top: number;
    let left: number;
    if (!caixa) {
      top = (vh - H) / 2;
      left = (vw - W) / 2;
    } else if (caixa.width > 380 || caixa.height > 260) {
      // área grande: o post-it fica dentro, no canto de baixo
      top = caixa.top + caixa.height - H - 40;
      left = caixa.left + caixa.width - W - 60;
    } else {
      const embaixo = caixa.top + caixa.height + M + 40;
      top = embaixo + H < vh ? embaixo : caixa.top - H - M - 40;
      left = caixa.left + caixa.width / 2 - W / 2 + 60;
    }
    top = Math.max(M, Math.min(vh - H - M, top));
    left = Math.max(M, Math.min(vw - W - M, left));
    setNota({ top, left, width: W, height: H });
  }, [caixa, i, celular]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFim();
      else if (e.key === "ArrowRight") avancar();
      else if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  });

  const P = 6;
  const flecha = caixa && nota && !celular ? seta(nota, caixa) : null;

  return (
    <>
      {caixa ? (
        <div className="tour-luz" style={{ top: caixa.top - P, left: caixa.left - P, width: caixa.width + P * 2, height: caixa.height + P * 2 }} aria-hidden="true" />
      ) : (
        <div className="tour-escuro" aria-hidden="true" />
      )}
      {caixa && (
        <svg className="tour-marcas" key={`m${i}`} aria-hidden="true">
          <path d={contorno(caixa, i + 1)} pathLength={1} />
          {flecha && (
            <>
              <path d={flecha.corpo} pathLength={1} className="tour-seta" />
              <path d={flecha.ponta} pathLength={1} className="tour-ponta" />
            </>
          )}
        </svg>
      )}
      <div
        ref={cartao}
        key={`n${i}`}
        className={`tour-postit${celular ? " embaixo" : ""}`}
        style={{ ...(nota && !celular ? { top: nota.top, left: nota.left } : {}), ["--giro" as string]: `${giro}deg` }}
        role="dialog"
        aria-live="polite"
        aria-label={`Tour, passo ${i + 1} de ${passos.length}`}
      >
        <span className="tour-fita" aria-hidden="true" />
        <button className="tour-x" onClick={onFim} aria-label="Sair do tour">
          ×
        </button>
        <p className="tour-num">
          {i + 1}/{passos.length}
        </p>
        <p className="tour-texto">{passo.texto}</p>
        <div className="tour-acoes">
          {i > 0 && <button onClick={() => setI(i - 1)}>← voltar</button>}
          {passo.acao && <button onClick={passo.acao.fazer}>{passo.acao.rotulo}</button>}
          <button className="forte" onClick={avancar}>
            {ultimo ? "fechar" : "próximo →"}
          </button>
        </div>
      </div>
    </>
  );
}
