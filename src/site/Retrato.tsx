import { useEffect, useRef } from "react";
import { reduzMovimento } from "../util";
import { perfil } from "../dados/perfil";
import { useT } from "../i18n";

// Retrato feito de partículas: cada ponto sai de um pixel claro da foto.
// Elas se montam quando o retrato aparece, fogem do mouse e voltam.
// Um clique (ou toque) espalha tudo de novo.

const FOTO = "/img/eduardo.webp";
const AMOSTRA = 240; // a foto é lida nesta resolução
const NIVEIS = 5; // tons de cinza (um fillStyle por tom, mais rápido de desenhar)

export function Retrato() {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const parado = reduzMovimento();
    const celular = matchMedia("(max-width: 900px)").matches;
    const maximo = celular ? 5000 : 11000;

    let n = 0;
    let alvoX = new Float32Array(0); // 0..1
    let alvoY = new Float32Array(0);
    let x = new Float32Array(0);
    let y = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let fase = new Float32Array(0);
    let grupos: number[][] = []; // índices por tom; o último grupo é o laranja

    let L = 0; // lado do canvas em pixels de tela
    let dpr = 1;
    const mouse = { x: -1e5, y: -1e5 };
    let raf = 0;
    let visivel = true;
    let pronto = false;

    const cores = [
      ...Array.from({ length: NIVEIS }, (_, i) => `rgba(226, 229, 235, ${0.35 + (0.65 * (i + 1)) / NIVEIS})`),
      "rgba(242, 160, 90, 0.95)",
    ];

    function espalhar(forca: number) {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const v = (0.4 + Math.random()) * forca * L;
        vx[i] += Math.cos(ang) * v;
        vy[i] += Math.sin(ang) * v;
      }
    }

    function medir() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      const lado = canvas!.clientWidth;
      const novo = Math.round(lado * dpr);
      if (novo === L || novo === 0) return;
      const escala = L ? novo / L : 1;
      L = novo;
      canvas!.width = L;
      canvas!.height = L;
      for (let i = 0; i < n; i++) {
        x[i] *= escala;
        y[i] *= escala;
      }
      if (!loopAtivo()) desenhar(performance.now());
    }

    function amostrar(img: HTMLImageElement) {
      const c = document.createElement("canvas");
      c.width = c.height = AMOSTRA;
      const g = c.getContext("2d", { willReadFrequently: true })!;
      g.drawImage(img, 0, 0, AMOSTRA, AMOSTRA);
      const px = g.getImageData(0, 0, AMOSTRA, AMOSTRA).data;

      // candidatos: pixels claros, apagando nas bordas como na foto do Sobre
      const cand: number[] = [];
      let soma = 0;
      for (let j = 0; j < AMOSTRA; j++) {
        for (let i = 0; i < AMOSTRA; i++) {
          const k = (j * AMOSTRA + i) * 4;
          let b = (px[k] * 0.3 + px[k + 1] * 0.59 + px[k + 2] * 0.11) / 255;
          // mais contraste: some o cinza escuro, destaca pele e traços claros
          b = Math.pow(Math.max(0, Math.min(1, (b - 0.1) / 0.55)), 1.35);
          const dx = (i / AMOSTRA - 0.5) / 0.75;
          const dy = (j / AMOSTRA - 0.45) / 0.75;
          const r = Math.hypot(dx, dy);
          b *= Math.max(0, Math.min(1, (1 - r) / 0.3));
          if (b > 0.06) {
            cand.push(i, j, b);
            soma += b;
          }
        }
      }
      const prob = maximo / Math.max(1, soma); // chance de cada pixel virar partícula (vezes o brilho)

      const ax: number[] = [];
      const ay: number[] = [];
      const brilho: number[] = [];
      for (let k = 0; k < cand.length; k += 3) {
        if (Math.random() < cand[k + 2] * prob) {
          ax.push((cand[k] + Math.random()) / AMOSTRA);
          ay.push((cand[k + 1] + Math.random()) / AMOSTRA);
          brilho.push(cand[k + 2]);
        }
      }

      n = ax.length;
      alvoX = Float32Array.from(ax);
      alvoY = Float32Array.from(ay);
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      fase = new Float32Array(n);
      grupos = Array.from({ length: NIVEIS + 1 }, () => []);
      for (let i = 0; i < n; i++) {
        fase[i] = Math.random() * Math.PI * 2;
        const tom = Math.random() < 0.05 ? NIVEIS : Math.min(NIVEIS - 1, Math.floor(brilho[i] * NIVEIS));
        grupos[tom].push(i);
      }
    }

    function posicionarInicio() {
      for (let i = 0; i < n; i++) {
        if (parado) {
          x[i] = alvoX[i] * L;
          y[i] = alvoY[i] * L;
        } else {
          // nascem embaixo, espalhadas, e sobem até o lugar
          x[i] = (0.5 + (Math.random() - 0.5) * 1.6) * L;
          y[i] = (1.05 + Math.random() * 0.5) * L;
        }
      }
    }

    let ultimoMovimento = performance.now();
    const loopAtivo = () => raf !== 0;

    function passo(t: number) {
      const raio = 70 * dpr;
      const raio2 = raio * raio;
      const tremor = 0.6 * dpr;
      let energia = 0;
      for (let i = 0; i < n; i++) {
        const tx = alvoX[i] * L + Math.sin(t * 0.0013 + fase[i]) * tremor;
        const ty = alvoY[i] * L + Math.cos(t * 0.0011 + fase[i]) * tremor;
        vx[i] += (tx - x[i]) * 0.045;
        vy[i] += (ty - y[i]) * 0.045;
        const dx = x[i] - mouse.x;
        const dy = y[i] - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < raio2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / raio) * 5 * dpr;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
        }
        vx[i] *= 0.84;
        vy[i] *= 0.84;
        x[i] += vx[i];
        y[i] += vy[i];
        energia += Math.abs(vx[i]) + Math.abs(vy[i]);
      }
      return energia / Math.max(1, n);
    }

    function desenhar(t: number) {
      ctx!.clearRect(0, 0, L, L);
      const tam = Math.max(1, (L / AMOSTRA) * 0.85);
      for (let gI = 0; gI < grupos.length; gI++) {
        ctx!.fillStyle = cores[gI];
        const grupo = grupos[gI];
        for (let k = 0; k < grupo.length; k++) {
          const i = grupo[k];
          ctx!.fillRect(x[i], y[i], tam, tam);
        }
      }
      void t;
    }

    function quadro(t: number) {
      raf = 0;
      if (!pronto || !visivel) return;
      const energia = passo(t);
      desenhar(t);
      // Parado e sem mouse por perto: dorme até alguém mexer
      if (energia < 0.05 * dpr && t - ultimoMovimento > 2500) return;
      raf = requestAnimationFrame(quadro);
    }

    function acordar() {
      ultimoMovimento = performance.now();
      if (!raf && pronto && visivel && !parado) raf = requestAnimationFrame(quadro);
    }

    const aoMover = (e: PointerEvent) => {
      if (parado) return;
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
      acordar();
    };
    const aoSair = () => {
      mouse.x = mouse.y = -1e5;
      acordar();
    };
    const aoClicar = () => {
      if (parado) return;
      espalhar(0.05);
      acordar();
    };

    canvas.addEventListener("pointermove", aoMover);
    canvas.addEventListener("pointerdown", aoMover);
    canvas.addEventListener("pointerleave", aoSair);
    canvas.addEventListener("click", aoClicar);

    const ro = new ResizeObserver(medir);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) acordar();
    });
    io.observe(canvas);

    const img = new Image();
    img.decoding = "async";
    img.src = FOTO;
    img.onload = () => {
      amostrar(img);
      medir();
      posicionarInicio();
      pronto = true;
      if (parado) desenhar(0);
      else acordar();
    };

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", aoMover);
      canvas.removeEventListener("pointerdown", aoMover);
      canvas.removeEventListener("pointerleave", aoSair);
      canvas.removeEventListener("click", aoClicar);
    };
  }, []);

  return (
    <figure className="retrato">
      <canvas ref={canvasRef} role="img" aria-label={`Retrato do ${perfil.nome} feito de partículas`} />
      <figcaption className="retrato-dica" aria-hidden="true">
        <span className="so-mouse">{t("passe o mouse · clique para espalhar", "hover · click to scatter")}</span>
        <span className="so-toque">{t("toque no retrato", "tap the portrait")}</span>
      </figcaption>
    </figure>
  );
}
