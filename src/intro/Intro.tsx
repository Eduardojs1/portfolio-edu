import { useEffect, useRef, useState } from "react";
import { criarCena, type Cena } from "./cena";
import { perfil } from "../dados/perfil";
import { useT } from "../i18n";
import { TrocaIdioma } from "../TrocaIdioma";
import { TelaBoot, tempoDeBoot } from "./TelaBoot";

// Matriz de perspectiva (CSS matrix3d) que leva o retângulo 0,0–w,h para 4 cantos quaisquer
function adj(m: number[]) {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}
function mult(a: number[], b: number[]) {
  const c = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) c[3 * i + j] += a[3 * i + k] * b[3 * k + j];
  return c;
}
function base(p: number[]) {
  const m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1];
  const a = adj(m);
  const v = [a[0] * p[6] + a[1] * p[7] + a[2], a[3] * p[6] + a[4] * p[7] + a[5], a[6] * p[6] + a[7] * p[7] + a[8]];
  return mult(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}
function matrix3d(w: number, h: number, cantos: number[]) {
  const m = mult(base(cantos), adj(base([0, 0, w, 0, 0, h, w, h])));
  for (let i = 0; i < 9; i++) m[i] /= m[8];
  return `matrix3d(${m[0]},${m[3]},0,${m[6]},${m[1]},${m[4]},0,${m[7]},0,0,1,0,${m[2]},${m[5]},0,${m[8]})`;
}
const suave = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

type Props = {
  voltando: boolean; // veio do "Desligar": começa dentro da tela e sai para a mesa
  onQuaseLa: () => void; // perto da tela: hora de montar o desktop por baixo
  onEntrar: () => void;
};

// A rolagem (roda do mouse, toque ou setas) move a câmera da cadeira até dentro do monitor.
// No fim, a cena some e o desktop de verdade, que já está por baixo, aparece.
export function Intro({ voltando, onQuaseLa, onEntrar }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const dicasRef = useRef<HTMLDivElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const pularRef = useRef<() => void>(() => {});
  const desktopRef = useRef<HTMLElement | null>(null);
  const t = useT();
  const [carregado, setCarregado] = useState(false);
  const celular = matchMedia("(max-width: 900px)").matches;
  const toque = matchMedia("(hover: none)").matches;

  useEffect(() => {
    // A cena 3D é pesada de montar (o navegador trava um instante): espera o logo de boot
    // aparecer primeiro (a roda de bolinhas gira no compositor e não para durante a montagem).
    const montar = () => {
    const canvas = canvasRef.current!;
    let cena: Cena | undefined;
    let apareceuEm = 0; // quando o desktop entrou no monitor (para surgir suave)
    try {
      cena = criarCena(canvas, {
        celular,
        tela: "/img/tela.webp",
        // O desktop de verdade (já montado por baixo) vai para dentro do monitor e cresce até
        // ocupar a tela inteira: no fim, é ele mesmo que fica, sem troca de imagem.
        aoQuadro: (cantos, p) => {
          let el = desktopRef.current;
          if (!el || !el.isConnected) {
            el = desktopRef.current = document.querySelector<HTMLElement>(".desktop");
            apareceuEm = performance.now();
          }
          if (!el) return;
          const W = el.offsetWidth;
          const H = el.offsetHeight;
          const k = suave((p - 0.84) / 0.145);
          const alvo = [0, 0, W, 0, 0, H, W, H];
          const c = cantos.map((v, i) => v + (alvo[i] - v) * k);
          const surgir = Math.min(1, (performance.now() - apareceuEm) / 420);
          el.style.transformOrigin = "0 0";
          el.style.transform = matrix3d(W, H, c);
          el.style.zIndex = "2001";
          el.style.pointerEvents = "none";
          el.style.opacity = String(surgir);
          el.style.willChange = "transform";
          cena?.telaViva(surgir >= 1);
          if (raizRef.current) raizRef.current.style.opacity = "1";
        },
      });
    } catch {
      // Sem WebGL: vai direto para o desktop
      onQuaseLa();
      onEntrar();
      return;
    }
    let vivo = true;
    cena.pronto.then(() => vivo && setCarregado(true));

    // ?camera=0.5 no endereço deixa a câmera parada num ponto do caminho (para testar)
    const fixa = Number(new URLSearchParams(location.search).get("camera"));
    let atual = voltando ? 1 : Number.isFinite(fixa) && fixa > 0 ? Math.min(0.95, fixa) : 0;
    let alvo = atual === 1 ? 0 : atual;
    let velocidade = voltando ? 1.6 : 3.2;
    let avisou = false;
    // Parou de rolar já perto da tela: a câmera termina de entrar sozinha, devagar
    let timerFim = 0;
    const completar = () => {
      window.clearTimeout(timerFim);
      timerFim = window.setTimeout(() => {
        if (alvo > 0.5 && alvo < 1) {
          alvo = 1;
          velocidade = 2.1;
        }
      }, 260);
    };
    let entrou = false;

    const ajustar = (d: number) => {
      alvo = Math.min(1, Math.max(0, alvo + d));
      velocidade = 3.2;
      if (d > 0) completar();
    };
    const pular = () => {
      alvo = 1;
      velocidade = 2.4;
    };
    pularRef.current = pular;

    const roda = (e: WheelEvent) => {
      e.preventDefault();
      const fator = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
      ajustar((e.deltaY * fator) / 1700);
    };
    let toqueY: number | null = null;
    const toqueInicio = (e: TouchEvent) => (toqueY = e.touches[0].clientY);
    const toqueMove = (e: TouchEvent) => {
      if (toqueY === null) return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      ajustar((toqueY - y) / (innerHeight * 1.3));
      toqueY = y;
    };
    const toqueFim = () => (toqueY = null);
    const tecla = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        ajustar(0.14);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        ajustar(-0.14);
      } else if (e.key === "Enter") pular();
    };
    const mover = (e: PointerEvent) => cena.ponteiro((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));

    addEventListener("wheel", roda, { passive: false });
    addEventListener("touchstart", toqueInicio, { passive: true });
    addEventListener("touchmove", toqueMove, { passive: false });
    addEventListener("touchend", toqueFim);
    addEventListener("keydown", tecla);
    addEventListener("pointermove", mover);
    const ro = new ResizeObserver(() => cena.redimensionar());
    ro.observe(canvas);

    let ultimo = performance.now();
    let raf = 0;
    const passo = () => {
      raf = requestAnimationFrame(passo);
      const agora = performance.now();
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      atual += (alvo - atual) * (1 - Math.exp(-dt * velocidade));
      if (Math.abs(alvo - atual) < 0.0004) atual = alvo;
      cena.progresso(atual);

      if (dicasRef.current) dicasRef.current.style.opacity = String(Math.max(0, 1 - atual * 5));
      if (barraRef.current) barraRef.current.style.transform = `scaleX(${atual})`;
      // Perto do fim, a cena some e revela o desktop
      // (o fim da entrada é o próprio desktop crescendo dentro do monitor; ver aoQuadro)

      if (atual > 0.5 && !avisou) {
        avisou = true;
        onQuaseLa();
      }
      if (atual >= 0.985 && alvo >= 1 && !entrou) {
        entrou = true;
        onEntrar();
      }
    };
    passo();

    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      removeEventListener("wheel", roda);
      removeEventListener("touchstart", toqueInicio);
      removeEventListener("touchmove", toqueMove);
      removeEventListener("touchend", toqueFim);
      removeEventListener("keydown", tecla);
      removeEventListener("pointermove", mover);
      ro.disconnect();
      cena.destruir();
      window.clearTimeout(timerFim);
      const el = desktopRef.current;
      if (el) {
        for (const prop of ["transform", "transformOrigin", "zIndex", "pointerEvents", "opacity", "willChange"] as const) el.style[prop] = "";
      }
    };
    };
    let limpar: (() => void) | undefined;
    const timer = window.setTimeout(() => (limpar = montar() ?? undefined), voltando ? 0 : Math.max(0, 380 - tempoDeBoot()));
    return () => {
      window.clearTimeout(timer);
      limpar?.();
    };
  }, []);

  return (
    <div className="intro" ref={raizRef} style={voltando ? { opacity: 0 } : undefined}>
      <canvas ref={canvasRef} className="intro-canvas" aria-label={t("Uma mesa com computador, teclado e mouse, em 3D", "A desk with a computer, keyboard and mouse, in 3D")} role="img" />

      <div className="intro-ui" ref={dicasRef}>
        <div className="intro-marca">
          <span>
            <strong>{perfil.linha1}</strong>
            <small>{perfil.linha2}</small>
          </span>
        </div>
        <div className="intro-dica">
          <span className={toque ? "intro-dedo" : "intro-mouse"} aria-hidden="true">
            <i />
          </span>
          <span>{toque ? t("Deslize para cima para entrar", "Swipe up to go in") : t("Role para entrar", "Scroll to go in")}</span>
        </div>
      </div>

      <div className="intro-topo-dir">
        <TrocaIdioma className="intro-idioma" />
        <button className="intro-pular" onClick={() => pularRef.current()}>
          {t("Entrar direto →", "Skip intro →")}
        </button>
      </div>
      <div className="intro-progresso" aria-hidden="true">
        <div ref={barraRef} />
      </div>
      {!voltando && <TelaBoot pronto={carregado} />}
    </div>
  );
}
