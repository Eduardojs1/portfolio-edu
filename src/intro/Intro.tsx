import { useEffect, useRef, useState } from "react";
import { criarCena, type Cena } from "./cena";
import { LogoED } from "../sistema/icones";
import { perfil } from "../dados/perfil";

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
  const [carregado, setCarregado] = useState(false);
  const celular = matchMedia("(max-width: 900px)").matches;
  const toque = matchMedia("(hover: none)").matches;

  useEffect(() => {
    const canvas = canvasRef.current!;
    let cena: Cena;
    try {
      cena = criarCena(canvas, { celular, tela: "/img/tela.webp" });
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
    let entrou = false;

    const ajustar = (d: number) => {
      alvo = Math.min(1, Math.max(0, alvo + d));
      velocidade = 3.2;
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
      const fade = Math.min(1, Math.max(0, (atual - 0.86) / 0.12));
      if (raizRef.current) raizRef.current.style.opacity = String(1 - fade);

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
    };
  }, []);

  return (
    <div className="intro" ref={raizRef} style={voltando ? { opacity: 0 } : undefined}>
      <canvas ref={canvasRef} className="intro-canvas" aria-label="Uma mesa com computador, teclado e mouse, em 3D" role="img" />

      <div className="intro-ui" ref={dicasRef}>
        <div className="intro-marca">
          <LogoED tamanho={celular ? 30 : 36} />
          <span>
            <strong>{perfil.linha1}</strong>
            <small>{perfil.linha2}</small>
          </span>
        </div>
        <div className="intro-chamada">
          <p className="intro-titulo">Puxa uma cadeira.</p>
          <p className="intro-sub">Essa é a minha mesa. O portfólio está no computador.</p>
          <p className="intro-sub intro-calma">Não é de TI? Deixei um bilhete lá dentro explicando tudo.</p>
        </div>
        <div className="intro-dica">
          <span className={toque ? "intro-dedo" : "intro-mouse"} aria-hidden="true">
            <i />
          </span>
          <span>{toque ? "Deslize para cima para entrar" : "Role para entrar"}</span>
        </div>
      </div>

      <button className="intro-pular" onClick={() => pularRef.current()}>
        Entrar direto →
      </button>
      <div className="intro-progresso" aria-hidden="true">
        <div ref={barraRef} />
      </div>
      <div className={`intro-carregando${carregado ? " pronto" : ""}`} aria-hidden={carregado}>
        <span>Ligando o PC…</span>
      </div>
    </div>
  );
}
