import type { ReactNode } from "react";
import { limitar } from "../util";

export type Geometria = { x: number; y: number; w: number; h: number };

export type EstadoJanela = Geometria & {
  aberta: boolean;
  minimizada: boolean;
  maximizada: boolean;
  z: number;
};

type Props = {
  nome: string;
  estado: EstadoJanela;
  focada: boolean;
  celular: boolean;
  minimo: { w: number; h: number };
  onFocar: () => void;
  onMudar: (m: Partial<EstadoJanela>) => void;
  onAlternarMaximizar: () => void;
  children: ReactNode;
};

const BARRA = 48; // altura da barra de tarefas
const bordas = ["n", "s", "l", "o", "nl", "no", "sl", "so"] as const;
type Borda = (typeof bordas)[number];

// Moldura de uma janela do desktop: arrastar pela barra de título (qualquer área com
// data-arrastar), redimensionar pelas bordas, duplo clique para maximizar.
export function Janela({ nome, estado, focada, celular, minimo, onFocar, onMudar, onAlternarMaximizar, children }: Props) {
  const max = estado.maximizada || celular;

  const aoPressionar = (e: React.PointerEvent<HTMLElement>) => {
    onFocar();
    if (celular || e.button !== 0) return;
    const alvo = e.target as HTMLElement;
    if (!alvo.closest("[data-arrastar]")) return;
    if (alvo.closest("button, input, textarea, select, a, [data-nao-arrastar]")) return;
    e.preventDefault();

    const inicio = { x: e.clientX, y: e.clientY, jx: estado.x, jy: estado.y };
    let restaurada = !estado.maximizada;
    const mover = (ev: PointerEvent) => {
      const dx = ev.clientX - inicio.x;
      const dy = ev.clientY - inicio.y;
      if (!restaurada) {
        // Arrastar uma janela maximizada: ela volta ao tamanho normal embaixo do cursor
        if (Math.hypot(dx, dy) < 8) return;
        restaurada = true;
        const proporcao = ev.clientX / innerWidth;
        inicio.jx = ev.clientX - estado.w * proporcao;
        inicio.jy = 0;
        inicio.x = ev.clientX;
        inicio.y = ev.clientY;
        onMudar({ maximizada: false, x: inicio.jx, y: 0 });
        return;
      }
      onMudar({
        x: limitar(inicio.jx + dx, 120 - estado.w, innerWidth - 120),
        y: limitar(inicio.jy + dy, 0, innerHeight - BARRA - 36),
      });
    };
    const soltar = () => {
      removeEventListener("pointermove", mover);
      removeEventListener("pointerup", soltar);
      document.body.classList.remove("arrastando");
    };
    document.body.classList.add("arrastando");
    addEventListener("pointermove", mover);
    addEventListener("pointerup", soltar);
  };

  const aoDuploClique = (e: React.MouseEvent<HTMLElement>) => {
    const alvo = e.target as HTMLElement;
    if (celular || !alvo.closest("[data-arrastar]") || alvo.closest("button, input, a, [data-nao-arrastar]")) return;
    onAlternarMaximizar();
  };

  const redimensionar = (borda: Borda) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocar();
    const ini = { x: e.clientX, y: e.clientY, g: { x: estado.x, y: estado.y, w: estado.w, h: estado.h } };
    const mover = (ev: PointerEvent) => {
      const dx = ev.clientX - ini.x;
      const dy = ev.clientY - ini.y;
      const g = { ...ini.g };
      if (borda.includes("l")) g.w = Math.max(minimo.w, ini.g.w + dx);
      if (borda.includes("s")) g.h = Math.max(minimo.h, ini.g.h + dy);
      if (borda.includes("o")) {
        g.w = Math.max(minimo.w, ini.g.w - dx);
        g.x = ini.g.x + ini.g.w - g.w;
      }
      if (borda.includes("n")) {
        g.h = Math.max(minimo.h, ini.g.h - dy);
        g.y = Math.max(0, ini.g.y + ini.g.h - g.h);
      }
      onMudar(g);
    };
    const soltar = () => {
      removeEventListener("pointermove", mover);
      removeEventListener("pointerup", soltar);
      document.body.classList.remove("arrastando");
    };
    document.body.classList.add("arrastando");
    addEventListener("pointermove", mover);
    addEventListener("pointerup", soltar);
  };

  return (
    <section
      className={`janela${max ? " max" : ""}${focada ? " focada" : ""}${estado.minimizada ? " minimizada" : ""}`}
      style={{ zIndex: estado.z, ...(max ? {} : { left: estado.x, top: estado.y, width: estado.w, height: estado.h }) }}
      aria-label={nome}
      aria-hidden={estado.minimizada || undefined}
      inert={estado.minimizada || undefined}
      onPointerDown={aoPressionar}
      onDoubleClick={aoDuploClique}
    >
      {children}
      {!max &&
        bordas.map((b) => <div key={b} className={`borda borda-${b}`} onPointerDown={redimensionar(b)} aria-hidden="true" />)}
    </section>
  );
}
