// Texturas da mesa 3D, desenhadas em canvas na hora (nada de imagem para baixar)
import * as THREE from "three";

function tela(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

function textura(c: HTMLCanvasElement, cor = true) {
  const t = new THREE.CanvasTexture(c);
  if (cor) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Aleatório com semente: a textura sai igual toda vez
function aleatorio(semente: number) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Madeira escura envernizada: faixas de cor, veios longos e ondulados, poros e dois nós
export function madeira(largura: number) {
  const W = largura;
  const H = Math.round(largura / 2);
  const { c, g } = tela(W, H);
  const r = aleatorio(42);
  g.fillStyle = "#4f311d";
  g.fillRect(0, 0, W, H);

  g.filter = `blur(${Math.round(W / 140)}px)`;
  for (let i = 0; i < 30; i++) {
    const y = r() * H;
    g.fillStyle = r() < 0.5 ? `rgba(120,76,44,${0.1 + r() * 0.14})` : `rgba(32,16,7,${0.1 + r() * 0.16})`;
    g.fillRect(0, y, W, (0.02 + r() * 0.09) * H);
  }
  g.filter = "none";

  const escala = W / 2048;
  for (let i = 0; i < 1100; i++) {
    const y0 = r() * H;
    const amp = (1 + r() * 6) * escala;
    const freq = (0.0012 + r() * 0.005) / escala;
    const fase = r() * 10;
    const escuro = r() < 0.68;
    g.strokeStyle = escuro ? `rgba(26,13,5,${0.05 + r() * 0.17})` : `rgba(160,108,66,${0.04 + r() * 0.1})`;
    g.lineWidth = (0.5 + r() * 2.2) * escala;
    g.beginPath();
    const x0 = -r() * W * 0.2;
    const fim = x0 + W * (0.5 + r() * 0.9);
    for (let x = x0; x <= fim; x += 10 * escala) g.lineTo(x, y0 + Math.sin(x * freq + fase) * amp + Math.sin(x * freq * 3.3 + fase) * amp * 0.3);
    g.stroke();
  }
  for (let i = 0; i < 5000 * escala; i++) {
    g.fillStyle = `rgba(18,9,3,${0.12 + r() * 0.25})`;
    g.fillRect(r() * W, r() * H, (2 + r() * 7) * escala, Math.max(1, escala));
  }
  for (let k = 0; k < 2; k++) {
    const cx = (0.15 + r() * 0.7) * W;
    const cy = (0.2 + r() * 0.6) * H;
    for (let a = 0; a < 10; a++) {
      g.strokeStyle = `rgba(28,14,5,${0.2 - a * 0.016})`;
      g.lineWidth = 2 * escala;
      g.beginPath();
      g.ellipse(cx, cy, (5 + a * 8) * escala, (2.5 + a * 2.4) * escala, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  return textura(c);
}

// Reboco: manchinhas cinza para dar relevo na parede (vai como bumpMap)
export function reboco(t: number) {
  const { c, g } = tela(t, t);
  const r = aleatorio(7);
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, 0, t, t);
  for (let i = 0; i < t * 9; i++) {
    const v = 95 + Math.round(r() * 70);
    g.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`;
    const s = 1 + r() * 4;
    g.fillRect(r() * t, r() * t, s, s);
  }
  g.filter = "blur(1px)";
  g.drawImage(c, 0, 0);
  g.filter = "none";
  const tex = textura(c, false);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
}

// Mousepad: trama de tecido, linhas de "mapa topográfico" bem discretas e o ED laranja
export function mousepad() {
  const W = 1024;
  const H = 812;
  const { c, g } = tela(W, H);
  const r = aleatorio(3);
  g.fillStyle = "#111215";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.025)";
  g.lineWidth = 1;
  for (let x = 0; x < W; x += 3) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let y = 0; y < H; y += 3) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  // curvas de nível
  for (const [cx, cy, n] of [
    [W * 0.28, H * 0.35, 16],
    [W * 0.8, H * 0.78, 12],
  ] as const) {
    for (let k = 1; k <= n; k++) {
      g.strokeStyle = `rgba(255,255,255,${0.045 - k * 0.0018})`;
      g.lineWidth = 2;
      g.beginPath();
      const raio = k * 26;
      for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
        const ondula = 1 + Math.sin(a * 3 + k * 0.7) * 0.08 + Math.sin(a * 5 + k) * 0.05 + (r() - 0.5) * 0.01;
        g.lineTo(cx + Math.cos(a) * raio * ondula * 1.25, cy + Math.sin(a) * raio * ondula);
      }
      g.stroke();
    }
  }
  g.fillStyle = "#d9783a";
  g.font = "800 46px Inter, Segoe UI, sans-serif";
  g.textAlign = "right";
  g.fillText("ED", W - 56, H - 50);
  return textura(c);
}

// Legendas do teclado: um plano transparente com cada letra no lugar da tecla
export function legendas(teclas: { cx: number; cy: number; texto: string }[], largura: number, altura: number) {
  const { c, g } = tela(largura, altura);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (const t of teclas) {
    if (!t.texto) continue;
    const curta = t.texto.length <= 2;
    g.fillStyle = curta ? "rgba(232,234,240,0.95)" : "rgba(210,213,220,0.85)";
    g.font = `${curta ? 600 : 500} ${curta ? 24 : 14}px Inter, Segoe UI, sans-serif`;
    g.fillText(t.texto, t.cx, t.cy);
  }
  return textura(c);
}

// Estampa da caneca
export function estampaCaneca() {
  const { c, g } = tela(512, 256);
  g.textAlign = "center";
  g.fillStyle = "#d9783a";
  g.font = "800 112px JetBrains Mono, Consolas, monospace";
  g.fillText("</>", 256, 128);
  g.fillStyle = "#3b3c42";
  g.font = "700 40px Inter, Segoe UI, sans-serif";
  g.fillText("café", 256, 196);
  return textura(c);
}

// Tela do celular: hora e uma notificação
export function telaCelular() {
  const { c, g } = tela(300, 640);
  const fundo = g.createLinearGradient(0, 0, 300, 640);
  fundo.addColorStop(0, "#2a2f45");
  fundo.addColorStop(1, "#0d0f15");
  g.fillStyle = fundo;
  g.fillRect(0, 0, 300, 640);
  const agora = new Date();
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.font = "300 78px Inter, Segoe UI, sans-serif";
  g.fillText(agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), 150, 150);
  g.font = "400 18px Inter, Segoe UI, sans-serif";
  g.fillStyle = "rgba(255,255,255,0.75)";
  g.fillText(agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }), 150, 186);
  // notificação
  g.fillStyle = "rgba(255,255,255,0.14)";
  g.beginPath();
  g.roundRect(18, 236, 264, 84, 18);
  g.fill();
  g.textAlign = "left";
  g.fillStyle = "#25d366";
  g.beginPath();
  g.arc(48, 268, 13, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "600 17px Inter, Segoe UI, sans-serif";
  g.fillText("Recrutador", 72, 266);
  g.font = "400 15px Inter, Segoe UI, sans-serif";
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillText("Vi seu portfólio. Bora conversar?", 34, 302);
  return textura(c);
}

// Post-it escrito à mão
export function postIt() {
  const { c, g } = tela(256, 256);
  const fundo = g.createLinearGradient(0, 0, 0, 256);
  fundo.addColorStop(0, "#fbe17a");
  fundo.addColorStop(1, "#f2cd4f");
  g.fillStyle = fundo;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(0,0,0,0.06)";
  g.fillRect(0, 0, 256, 34);
  g.fillStyle = "#2a2a2a";
  g.font = '600 50px Caveat, "Segoe Print", "Comic Sans MS", cursive';
  g.save();
  g.translate(128, 128);
  g.rotate(-0.06);
  g.textAlign = "center";
  g.fillText("git push", 0, -8);
  g.font = '500 36px Caveat, "Segoe Print", "Comic Sans MS", cursive';
  g.fillText("não esquece!", 0, 40);
  g.restore();
  return textura(c);
}

// Brilho de vidro na tela (faixa diagonal bem leve)
export function reflexoTela() {
  const { c, g } = tela(512, 288);
  const grad = g.createLinearGradient(0, 0, 512, 288);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.28, "rgba(255,255,255,0.07)");
  grad.addColorStop(0.4, "rgba(255,255,255,0)");
  grad.addColorStop(0.62, "rgba(255,255,255,0.03)");
  grad.addColorStop(0.7, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 288);
  return textura(c);
}

export function radial(cor: string) {
  const { c, g } = tela(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, cor);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return textura(c);
}

// Sombra de contato: retângulo bem borrado
export function sombraContato() {
  const { c, g } = tela(128, 128);
  g.filter = "blur(14px)";
  g.fillStyle = "#000";
  g.fillRect(26, 26, 76, 76);
  return new THREE.CanvasTexture(c);
}

export function texto(conteudo: string, cor: string) {
  const { c, g } = tela(256, 128);
  g.fillStyle = cor;
  g.font = "800 72px Inter, Segoe UI, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(conteudo, 128, 68);
  return textura(c);
}
