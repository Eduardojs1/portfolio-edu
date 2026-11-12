// A mesa em 3D, feita só com primitivas do Three.js (nenhum modelo baixado):
// mesa de madeira envernizada, monitor num braço articulado com barra de luz,
// teclado gamer com RGB e cabo espiral, mouse no mousepad, luminária (que faz as
// sombras), caneca, celular, fone no suporte, livros com o pato de borracha,
// planta e painéis hexagonais na parede. O caminho da câmera é uma timeline do
// GSAP controlada pela rolagem (0 = sentado olhando a mesa, 1 = dentro da tela).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import gsap from "gsap";
import * as tx from "./texturas";

export type Cena = {
  progresso: (p: number) => void;
  ponteiro: (x: number, y: number) => void;
  redimensionar: () => void;
  destruir: () => void;
  pronto: Promise<void>;
};

const MESA_Y = 0.75; // altura do tampo
const TELA_W = 0.6;
const TELA_H = 0.3375; // 16:9
const PAINEL = { w: 0.62, h: 0.366, d: 0.022 };
const MONITOR = new THREE.Vector3(0, 1.135, -0.17); // centro do painel
const INCLINACAO = -0.05; // monitor levemente inclinado para trás

// Teclado TKL: larguras em "u" (negativo = espaço vazio) e as legendas de cada tecla
const LINHAS_TECLADO: number[][] = [
  [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.25, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.25, 1, 1, 1],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1, 1, 1],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -1.25, 1],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.25, 1, 1, 1],
];
const LEGENDAS: string[][] = [
  ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "PrtSc", "ScrLk", "Pause"],
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Back", "Ins", "Home", "PgUp"],
  ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Del", "End", "PgDn"],
  ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
  ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift", "↑"],
  ["Ctrl", "Win", "Alt", "", "Alt", "Fn", "Menu", "Ctrl", "←", "↓", "→"],
];

// Cilindro de a até b (braços do monitor e da luminária)
function segmento(a: THREE.Vector3, b: THREE.Vector3, raio: number, mat: THREE.Material) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, dir.length(), 20), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  m.castShadow = true;
  return m;
}

export function criarCena(canvas: HTMLCanvasElement, opcoes: { celular: boolean; tela: string }): Cena {
  const { celular } = opcoes;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, celular ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color("#0a0b0d");
  cena.fog = new THREE.Fog("#0a0b0d", 2.4, 6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environmentIntensity = 0.24;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 20);

  // Põe na cena e liga a sombra
  const add = <T extends THREE.Object3D>(o: T, faz = true, recebe = false, pai: THREE.Object3D = cena) => {
    o.traverse((f) => {
      f.castShadow = faz;
      f.receiveShadow = recebe;
    });
    pai.add(o);
    return o;
  };

  // ---------------- Materiais ----------------
  const madeira = new THREE.MeshPhysicalMaterial({
    map: tx.madeira(celular ? 1024 : 2048),
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.42,
  });
  const metalPreto = new THREE.MeshStandardMaterial({ color: "#17181b", roughness: 0.38, metalness: 0.78 });
  const plasticoPreto = new THREE.MeshStandardMaterial({ color: "#0d0e10", roughness: 0.5, metalness: 0.15 });
  const bezel = new THREE.MeshPhysicalMaterial({ color: "#0b0c0e", roughness: 0.32, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const laranja = new THREE.MeshStandardMaterial({ color: "#d9783a", roughness: 0.7 });
  const parede = new THREE.MeshStandardMaterial({ color: "#1a1b20", roughness: 0.96, bumpMap: tx.reboco(512), bumpScale: 1.6 });
  const chao = new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.9 });
  const sombraTex = tx.sombraContato();
  const sombraMat = new THREE.MeshBasicMaterial({ color: 0x000000, map: sombraTex, transparent: true, opacity: 0.4, depthWrite: false });
  const extras: { dispose: () => void }[] = [sombraTex];

  const sombra = (w: number, d: number, x: number, z: number, opacidade = 0.4) => {
    const mat = sombraMat.clone();
    mat.opacity = opacidade;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, MESA_Y + 0.0006, z);
    cena.add(m);
  };

  const brilho = (cor: string, w: number, h: number, pos: THREE.Vector3, opacidade: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tx.radial(cor), transparent: true, opacity: opacidade, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    );
    m.position.copy(pos);
    cena.add(m);
    return m;
  };

  // ---------------- Sala ----------------
  add(new THREE.Mesh(new THREE.PlaneGeometry(10, 5), parede), false, true).position.set(0, 1.6, -0.62);
  const piso = add(new THREE.Mesh(new THREE.PlaneGeometry(10, 10), chao), false, true);
  piso.rotation.x = -Math.PI / 2;
  brilho("rgba(242,140,70,1)", 2.2, 1.4, new THREE.Vector3(0, 1.12, -0.615), 0.5);
  brilho("rgba(200,90,255,1)", 1.6, 1.0, new THREE.Vector3(-1.0, 1.0, -0.615), 0.12);

  // Painéis hexagonais com luz (canto direito da parede)
  const hexCores = ["#f2a14a", "#ee6e4f", "#e0558f", "#a65de8", "#6a6ff0"];
  const R = 0.058;
  const passoX = Math.sqrt(3) * R * 1.07;
  const passoY = 1.5 * R * 1.07;
  const hexPos: [number, number][] = [
    [0, 0],
    [1, 0],
    [0.5, 1],
    [1.5, 1],
    [2, 0],
  ];
  const hexBrilhos: THREE.Mesh[] = [];
  hexPos.forEach(([hx, hy], i) => {
    const centro = new THREE.Vector3(0.56 + hx * passoX, 1.17 + hy * passoY, -0.612);
    const frente = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.014, 6), new THREE.MeshStandardMaterial({ color: "#16171b", roughness: 0.6 }));
    frente.rotation.x = Math.PI / 2;
    frente.position.copy(centro).add(new THREE.Vector3(0, 0, 0.008));
    cena.add(frente);
    const borda = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.005, R + 0.005, 0.01, 6), new THREE.MeshBasicMaterial({ color: hexCores[i], toneMapped: false }));
    borda.rotation.x = Math.PI / 2;
    borda.position.copy(centro);
    cena.add(borda);
    hexBrilhos.push(brilho(hexParaRgba(hexCores[i]), 0.42, 0.42, centro.clone().add(new THREE.Vector3(0, 0, -0.001)), 0.3));
  });

  // ---------------- Mesa ----------------
  add(new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.035, 0.75, 3, 0.008), madeira), false, true).position.set(0, MESA_Y - 0.0175, 0);
  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.3, 0.3]) add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.7, 0.045), metalPreto)).position.set(x, 0.365, z);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.04, 0.66), metalPreto)).position.set(x, 0.69, 0);
    add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.7), metalPreto)).position.set(x, 0.0125, 0);
  }
  add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.025), metalPreto)).position.set(0, 0.68, -0.3);

  // ---------------- Monitor ----------------
  const monitor = new THREE.Group();
  monitor.position.copy(MONITOR);
  monitor.rotation.x = INCLINACAO;
  cena.add(monitor);
  add(new THREE.Mesh(new RoundedBoxGeometry(PAINEL.w, PAINEL.h, PAINEL.d, 3, 0.006), bezel), true, false, monitor);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.24, 0.04, 3, 0.012), plasticoPreto), true, false, monitor).position.set(0, -0.01, -0.028);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), metalPreto), true, false, monitor).position.set(0, -0.005, -0.057);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.006, 0.004), new THREE.MeshBasicMaterial({ color: "#ff9a52", toneMapped: false }));
  led.position.set(0, 0.105, -0.049);
  monitor.add(led);

  const bordaCima = 0.009;
  const queixo = PAINEL.h - TELA_H - bordaCima; // a borda de baixo é maior
  const telaMat = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(TELA_W, TELA_H), telaMat);
  tela.position.set(0, (queixo - bordaCima) / 2, PAINEL.d / 2 + 0.0004);
  monitor.add(tela);
  const reflexo = new THREE.Mesh(
    new THREE.PlaneGeometry(TELA_W, TELA_H),
    new THREE.MeshBasicMaterial({ map: tx.reflexoTela(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  reflexo.position.copy(tela.position).add(new THREE.Vector3(0, 0, 0.0006));
  monitor.add(reflexo);
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.015), new THREE.MeshBasicMaterial({ map: tx.texto("ED", "#6f737a"), transparent: true }));
  logo.position.set(0, -PAINEL.h / 2 + queixo / 2, PAINEL.d / 2 + 0.0006);
  monitor.add(logo);

  // Barra de luz em cima do monitor
  const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.42, 24), metalPreto);
  barra.rotation.z = Math.PI / 2;
  barra.position.set(0, PAINEL.h / 2 + 0.012, 0.016);
  add(barra, true, false, monitor);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.03), metalPreto), true, false, monitor).position.set(0, PAINEL.h / 2 + 0.006, -0.004);
  const faixaLuz = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.002, 0.007), new THREE.MeshBasicMaterial({ color: "#fff1d8", toneMapped: false }));
  faixaLuz.position.set(0, PAINEL.h / 2 + 0.0035, 0.018);
  monitor.add(faixaLuz);

  // Post-it na borda direita
  const postItMat = new THREE.MeshStandardMaterial({ map: tx.postIt(), roughness: 0.9 });
  const postIt = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), postItMat);
  // a letra de mão (Caveat) vem do Google Fonts: quando chegar, redesenha o post-it
  document.fonts?.load("600 50px Caveat").then(() => {
    postItMat.map?.dispose();
    postItMat.map = tx.postIt();
    postItMat.needsUpdate = true;
  });
  postIt.position.set(PAINEL.w / 2 + 0.014, -0.11, PAINEL.d / 2 + 0.0012);
  postIt.rotation.z = -0.1;
  monitor.add(postIt);

  // Braço articulado
  const base = new THREE.Vector3(0.3, MESA_Y, -0.33);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.014, 0.09, 2, 0.004), metalPreto)).position.set(base.x, MESA_Y + 0.007, base.z);
  const topoColuna = new THREE.Vector3(base.x, 1.08, base.z);
  cena.add(segmento(new THREE.Vector3(base.x, MESA_Y + 0.01, base.z), topoColuna, 0.017, metalPreto));
  const cotovelo = new THREE.Vector3(0.13, 1.1, -0.29);
  const cabeca = new THREE.Vector3(0, MONITOR.y - 0.005, MONITOR.z - 0.07);
  cena.add(segmento(topoColuna, cotovelo, 0.015, metalPreto));
  cena.add(segmento(cotovelo, cabeca, 0.014, metalPreto));
  for (const p of [topoColuna, cotovelo, cabeca]) add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 20, 14), metalPreto)).position.copy(p);
  sombra(0.14, 0.16, base.x, base.z);

  // ---------------- Teclado gamer (TKL) ----------------
  const teclado = new THREE.Group();
  teclado.position.set(-0.05, MESA_Y, 0.135);
  teclado.rotation.y = 0.02;
  cena.add(teclado);
  const U = 0.0186;
  const corpo = new THREE.Mesh(new RoundedBoxGeometry(0.362, 0.026, 0.138, 3, 0.006), new THREE.MeshStandardMaterial({ color: "#121316", roughness: 0.35, metalness: 0.6 }));
  corpo.position.y = 0.013;
  corpo.rotation.x = 0.05;
  add(corpo, true, true, teclado);

  const posicoes: { x: number; z: number; w: number; cor: string; legenda: string }[] = [];
  LINHAS_TECLADO.forEach((linha, r) => {
    let x = 0;
    let k = 0;
    const z = (r === 0 ? 0 : r + 0.5) * U;
    linha.forEach((w) => {
      if (w < 0) {
        x += -w;
        return;
      }
      const legenda = LEGENDAS[r][k++] ?? "";
      const destaque = legenda === "Esc" || legenda === "Enter";
      const modificador = w > 1.2 || r === 0;
      posicoes.push({ x: x + w / 2, z, w, cor: destaque ? "#e07b39" : modificador ? "#2a2b31" : "#1b1c20", legenda });
      x += w;
    });
  });
  const larguraTotal = 18.25 * U;
  const profundidade = 6.5 * U;
  const teclas = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.18), new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05 }), posicoes.length);
  const luzes = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), posicoes.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, 0, 0));
  const qLuz = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05 - Math.PI / 2, 0, 0));
  posicoes.forEach((p, i) => {
    const px = p.x * U - larguraTotal / 2;
    const pz = p.z - profundidade / 2 + U / 2;
    const alt = -pz * Math.tan(0.05);
    m4.compose(new THREE.Vector3(px, 0.0325 + alt, pz), q, new THREE.Vector3(p.w * U - 0.0026, 0.0105, U - 0.0026));
    teclas.setMatrixAt(i, m4);
    teclas.setColorAt(i, new THREE.Color(p.cor));
    m4.compose(new THREE.Vector3(px, 0.0262 + alt, pz), qLuz, new THREE.Vector3(p.w * U + 0.0012, U + 0.0012, 1));
    luzes.setMatrixAt(i, m4);
    luzes.setColorAt(i, new THREE.Color("#ff7a3d"));
  });
  teclas.castShadow = true;
  teclado.add(luzes, teclas);

  // Legendas: um plano por cima das teclas, com a mesma inclinação
  const PX = 4000; // pixels por metro
  const legTex = tx.legendas(
    posicoes.map((p) => ({ cx: p.x * U * PX, cy: (p.z + U / 2) * PX, texto: p.legenda })),
    Math.round(larguraTotal * PX),
    Math.round(profundidade * PX)
  );
  const legendas = new THREE.Mesh(new THREE.PlaneGeometry(larguraTotal, profundidade), new THREE.MeshBasicMaterial({ map: legTex, transparent: true, depthWrite: false }));
  legendas.rotation.x = -Math.PI / 2 + 0.05;
  legendas.position.y = 0.0325 + 0.0105 / 2 + 0.0004;
  teclado.add(legendas);

  const brilhoTeclado = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.26),
    new THREE.MeshBasicMaterial({ map: tx.radial("rgba(255,255,255,1)"), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  brilhoTeclado.rotation.x = -Math.PI / 2;
  brilhoTeclado.position.set(-0.05, MESA_Y + 0.0012, 0.135);
  cena.add(brilhoTeclado);
  sombra(0.42, 0.2, -0.05, 0.14, 0.45);

  // Cabo espiral do teclado até o fundo da mesa
  const caminhoCabo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, MESA_Y + 0.016, 0.068),
    new THREE.Vector3(-0.18, MESA_Y + 0.006, 0.03),
    new THREE.Vector3(-0.165, MESA_Y + 0.006, -0.06),
    new THREE.Vector3(-0.14, MESA_Y + 0.006, -0.16),
    new THREE.Vector3(-0.1, MESA_Y + 0.004, -0.3),
    new THREE.Vector3(-0.09, MESA_Y + 0.001, -0.375),
    new THREE.Vector3(-0.09, MESA_Y - 0.08, -0.39),
  ]);
  const pontosCabo: THREE.Vector3[] = [];
  const cimaMundo = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= 700; i++) {
    const t = i / 700;
    const p = caminhoCabo.getPoint(t);
    if (t > 0.1 && t < 0.46) {
      const k = (t - 0.1) / 0.36;
      const tang = caminhoCabo.getTangent(t);
      const lado = new THREE.Vector3().crossVectors(tang, cimaMundo).normalize();
      const cima = new THREE.Vector3().crossVectors(lado, tang).normalize();
      const raio = 0.0062 * Math.sin((Math.min(1, k * 7, (1 - k) * 7) * Math.PI) / 2);
      const ang = k * Math.PI * 2 * 18;
      p.addScaledVector(lado, Math.cos(ang) * raio).addScaledVector(cima, Math.sin(ang) * raio + raio);
    }
    pontosCabo.push(p);
  }
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pontosCabo), 1100, 0.0021, 6), new THREE.MeshStandardMaterial({ color: "#1d1e22", roughness: 0.45 })));
  const conector = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.022, 20), new THREE.MeshStandardMaterial({ color: "#d9783a", roughness: 0.3, metalness: 0.7 }));
  conector.position.copy(caminhoCabo.getPoint(0.5));
  conector.quaternion.setFromUnitVectors(cimaMundo, caminhoCabo.getTangent(0.5));
  add(conector);

  // ---------------- Mousepad e mouse ----------------
  const pad = new THREE.Group();
  pad.position.set(0.34, MESA_Y, 0.15);
  cena.add(pad);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.346, 0.0026, 0.276, 2, 0.0012), laranja), false, true, pad).position.y = 0.0013;
  add(new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.0032, 0.27, 2, 0.0015), new THREE.MeshStandardMaterial({ map: tx.mousepad(), roughness: 0.95 })), false, true, pad).position.y = 0.0016;

  const mouse = new THREE.Group();
  mouse.position.set(0.35, MESA_Y + 0.0034, 0.165);
  mouse.rotation.y = -0.14;
  cena.add(mouse);
  const casca = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({ color: "#0b0b0d", roughness: 0.35, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.35 })
  );
  casca.scale.set(0.031, 0.022, 0.06);
  add(casca, true, false, mouse);
  const saia = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), plasticoPreto);
  saia.scale.set(0.031, 0.003, 0.06);
  saia.position.y = 0.0015;
  add(saia, true, false, mouse);
  const rodinha = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 20), new THREE.MeshStandardMaterial({ color: "#2a2b30", roughness: 0.8 }));
  rodinha.rotation.z = Math.PI / 2;
  rodinha.position.set(0, 0.0195, -0.024);
  mouse.add(rodinha);
  const divisao = new THREE.Mesh(new THREE.BoxGeometry(0.0008, 0.003, 0.03), new THREE.MeshBasicMaterial({ color: "#000" }));
  divisao.position.set(0, 0.0205, -0.038);
  divisao.rotation.x = 0.35;
  mouse.add(divisao);
  // dois botões laterais, do lado do polegar
  for (const z of [-0.012, 0.004]) {
    const lateral = new THREE.Mesh(new RoundedBoxGeometry(0.003, 0.005, 0.014, 2, 0.001), plasticoPreto);
    lateral.position.set(-0.0288, 0.0105, z);
    mouse.add(lateral);
  }
  const logoMouse = new THREE.Mesh(new THREE.CircleGeometry(0.0042, 24), new THREE.MeshBasicMaterial({ color: "#ff8a3d", toneMapped: false }));
  logoMouse.rotation.x = -Math.PI / 2 + 0.75;
  logoMouse.position.set(0, 0.0175, 0.028);
  mouse.add(logoMouse);
  sombra(0.09, 0.14, 0.35, 0.17, 0.55);

  // ---------------- Caneca ----------------
  const caneca = new THREE.Group();
  caneca.position.set(-0.46, MESA_Y, 0.06);
  cena.add(caneca);
  const perfilCaneca = [
    [0, 0],
    [0.039, 0],
    [0.041, 0.003],
    [0.041, 0.096],
    [0.037, 0.096],
    [0.037, 0.008],
    [0, 0.008],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const ceramica = new THREE.MeshPhysicalMaterial({ color: "#ece8e0", roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.2 });
  add(new THREE.Mesh(new THREE.LatheGeometry(perfilCaneca, 56), ceramica), true, false, caneca);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0055, 12, 32, Math.PI), ceramica);
  alca.rotation.z = -Math.PI / 2;
  alca.position.set(0.04, 0.05, 0);
  add(alca, true, false, caneca);
  const estampa = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0414, 0.0414, 0.05, 32, 1, true, -0.62, 1.24),
    new THREE.MeshStandardMaterial({ map: tx.estampaCaneca(), transparent: true, roughness: 0.35 })
  );
  estampa.position.y = 0.052;
  caneca.add(estampa);
  const cafe = new THREE.Mesh(new THREE.CircleGeometry(0.0368, 32), new THREE.MeshStandardMaterial({ color: "#2b160b", roughness: 0.12 }));
  cafe.rotation.x = -Math.PI / 2;
  cafe.position.y = 0.082;
  caneca.add(cafe);
  const vapores: THREE.Mesh[] = [];
  const texVapor = tx.radial("rgba(255,255,255,0.9)");
  for (let i = 0; i < 3; i++) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.09), new THREE.MeshBasicMaterial({ map: texVapor, transparent: true, opacity: 0, depthWrite: false }));
    v.position.set((i - 1) * 0.012, 0.13, 0);
    caneca.add(v);
    vapores.push(v);
  }
  sombra(0.11, 0.11, -0.46, 0.06);

  // ---------------- Celular ----------------
  const celularMesa = new THREE.Group();
  celularMesa.position.set(-0.33, MESA_Y, 0.19);
  celularMesa.rotation.y = 0.32;
  cena.add(celularMesa);
  add(new THREE.Mesh(new RoundedBoxGeometry(0.074, 0.0085, 0.154, 3, 0.0045), bezel), true, false, celularMesa).position.y = 0.00425;
  const telaCel = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.146), new THREE.MeshBasicMaterial({ map: tx.telaCelular(), toneMapped: false }));
  telaCel.rotation.x = -Math.PI / 2;
  telaCel.position.y = 0.0087;
  celularMesa.add(telaCel);
  sombra(0.1, 0.18, -0.33, 0.19, 0.45);

  // ---------------- Planta ----------------
  const planta = new THREE.Group();
  planta.position.set(-0.7, MESA_Y, -0.08);
  cena.add(planta);
  add(
    new THREE.Mesh(
      new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.045, 0), new THREE.Vector2(0.055, 0.08), new THREE.Vector2(0.05, 0.08), new THREE.Vector2(0, 0.072)], 32),
      new THREE.MeshStandardMaterial({ color: "#3a3b3f", roughness: 0.85 })
    ),
    true,
    false,
    planta
  );
  const terra = new THREE.Mesh(new THREE.CircleGeometry(0.049, 24), new THREE.MeshStandardMaterial({ color: "#2a1d14", roughness: 1 }));
  terra.rotation.x = -Math.PI / 2;
  terra.position.y = 0.074;
  planta.add(terra);
  const folhas = [new THREE.MeshStandardMaterial({ color: "#3f7d4a", roughness: 0.55 }), new THREE.MeshStandardMaterial({ color: "#4f9158", roughness: 0.55 })];
  for (let i = 0; i < 14; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), folhas[i % 2]);
    const ang = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
    const camada = i % 3 === 0 ? 0.3 : i % 3 === 1 ? 0.55 : 0.8;
    f.scale.set(0.011, 0.048 + camada * 0.012, 0.021);
    f.position.set(Math.cos(ang) * 0.04 * camada, 0.105 + camada * 0.018, Math.sin(ang) * 0.04 * camada);
    f.rotation.set(Math.sin(ang) * (0.4 + camada), 0, -Math.cos(ang) * (0.4 + camada));
    add(f, true, false, planta);
  }
  sombra(0.14, 0.14, -0.7, -0.08);

  // ---------------- Luminária (a luz principal, com sombra) ----------------
  const baseLum = new THREE.Vector3(-0.56, MESA_Y, -0.27);
  const cotoveloLum = new THREE.Vector3(-0.61, 1.1, -0.32);
  const cabecaLum = new THREE.Vector3(-0.43, 1.2, -0.12);
  const alvoLum = new THREE.Vector3(-0.14, MESA_Y, 0.12);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.066, 0.018, 40), metalPreto)).position.set(baseLum.x, MESA_Y + 0.009, baseLum.z);
  cena.add(segmento(baseLum.clone().setY(MESA_Y + 0.015), cotoveloLum, 0.0075, metalPreto));
  cena.add(segmento(cotoveloLum, cabecaLum, 0.0075, metalPreto));
  for (const p of [baseLum.clone().setY(MESA_Y + 0.02), cotoveloLum, cabecaLum]) add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), metalPreto)).position.copy(p);
  const dirLum = new THREE.Vector3().subVectors(alvoLum, cabecaLum).normalize();
  const geoCupula = new THREE.CylinderGeometry(0.022, 0.062, 0.095, 40, 1, true);
  const cupula = new THREE.Mesh(geoCupula, new THREE.MeshStandardMaterial({ color: "#1b1c20", roughness: 0.4, metalness: 0.6, side: THREE.FrontSide }));
  const cupulaDentro = new THREE.Mesh(geoCupula, new THREE.MeshBasicMaterial({ color: "#ffd9a0", side: THREE.BackSide, toneMapped: false }));
  for (const c of [cupula, cupulaDentro]) {
    c.position.copy(cabecaLum).addScaledVector(dirLum, 0.045);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dirLum);
  }
  add(cupula);
  cena.add(cupulaDentro);
  const lampadaPos = cabecaLum.clone().addScaledVector(dirLum, 0.06);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.017, 20, 14), new THREE.MeshBasicMaterial({ color: "#fff3dc", toneMapped: false }));
  bulbo.position.copy(lampadaPos);
  cena.add(bulbo);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tx.radial("rgba(255,200,130,1)"), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
  );
  halo.scale.set(0.28, 0.28, 1);
  halo.position.copy(lampadaPos);
  cena.add(halo);
  const lampada = new THREE.SpotLight("#ffc483", 3.2, 2.6, 0.78, 0.6, 1.4);
  lampada.position.copy(lampadaPos);
  lampada.target.position.copy(alvoLum);
  lampada.castShadow = true;
  lampada.shadow.mapSize.set(celular ? 1024 : 2048, celular ? 1024 : 2048);
  lampada.shadow.camera.near = 0.05;
  lampada.shadow.camera.far = 2.4;
  lampada.shadow.bias = -0.0004;
  lampada.shadow.normalBias = 0.012;
  cena.add(lampada, lampada.target);
  sombra(0.15, 0.15, baseLum.x, baseLum.z);

  // ---------------- Fone no suporte ----------------
  const suporte = new THREE.Group();
  suporte.position.set(0.62, MESA_Y, -0.17);
  suporte.rotation.y = -0.45;
  cena.add(suporte);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.012, 40), metalPreto), true, true, suporte).position.y = 0.006;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.25, 16), metalPreto), true, false, suporte).position.y = 0.137;
  add(new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.012, 0.03, 2, 0.005), metalPreto), true, false, suporte).position.y = 0.266;
  const fone = new THREE.Group();
  fone.position.y = 0.272;
  suporte.add(fone);
  const couro = new THREE.MeshStandardMaterial({ color: "#151619", roughness: 0.55 });
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.011, 14, 56, Math.PI), couro);
  arco.position.y = -0.076;
  add(arco, true, false, fone);
  for (const lado of [1, -1]) {
    const concha = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 40), couro);
    concha.rotation.z = Math.PI / 2;
    concha.position.set(lado * 0.088, -0.118, 0);
    add(concha, true, false, fone);
    const almofada = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.012, 12, 32), new THREE.MeshStandardMaterial({ color: "#232428", roughness: 0.9 }));
    almofada.rotation.y = Math.PI / 2;
    almofada.position.set(lado * 0.068, -0.118, 0);
    add(almofada, true, false, fone);
    const anel = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0022, 8, 40), new THREE.MeshBasicMaterial({ color: "#ff7a3d", toneMapped: false }));
    anel.rotation.y = Math.PI / 2;
    anel.position.set(lado * 0.1035, -0.118, 0);
    fone.add(anel);
  }
  sombra(0.14, 0.14, 0.62, -0.17);

  // ---------------- Livros e o pato de borracha ----------------
  const livros = new THREE.Group();
  livros.position.set(-0.27, MESA_Y, -0.3);
  livros.rotation.y = 0.18;
  cena.add(livros);
  const paginas = new THREE.MeshStandardMaterial({ color: "#e6dec9", roughness: 0.9 });
  let alturaPilha = 0;
  for (const [w, h, d, cor, giro] of [
    [0.2, 0.026, 0.14, "#2f4a6b", 0],
    [0.18, 0.022, 0.13, "#8a3b2f", 0.08],
    [0.19, 0.03, 0.135, "#c9a227", -0.05],
  ] as const) {
    const capa = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.6 });
    const livro = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [paginas, paginas, capa, capa, capa, paginas]);
    livro.position.y = alturaPilha + h / 2;
    livro.rotation.y = giro;
    add(livro, true, true, livros);
    alturaPilha += h;
  }
  const pato = new THREE.Group();
  pato.position.set(0.01, alturaPilha, 0.005);
  pato.rotation.y = 0.5;
  livros.add(pato);
  const amarelo = new THREE.MeshStandardMaterial({ color: "#f6c933", roughness: 0.35 });
  const corpoPato = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), amarelo);
  corpoPato.scale.set(0.026, 0.02, 0.032);
  corpoPato.position.y = 0.018;
  add(corpoPato, true, false, pato);
  const cabecaPato = new THREE.Mesh(new THREE.SphereGeometry(0.0165, 20, 14), amarelo);
  cabecaPato.position.set(0, 0.042, 0.016);
  add(cabecaPato, true, false, pato);
  const bico = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshStandardMaterial({ color: "#f08a2c", roughness: 0.4 }));
  bico.scale.set(0.009, 0.004, 0.009);
  bico.position.set(0, 0.039, 0.033);
  pato.add(bico);
  for (const lado of [1, -1]) {
    const olho = new THREE.Mesh(new THREE.SphereGeometry(0.0026, 10, 8), new THREE.MeshBasicMaterial({ color: "#111" }));
    olho.position.set(lado * 0.0075, 0.047, 0.028);
    pato.add(olho);
  }
  sombra(0.24, 0.18, -0.27, -0.3);

  // ---------------- Luzes ----------------
  RectAreaLightUniformsLib.init();
  const luzTela = new THREE.RectAreaLight("#c9d6ff", 5, TELA_W, TELA_H);
  luzTela.position.set(0, 0, PAINEL.d / 2 + 0.01);
  luzTela.rotation.y = Math.PI; // a luz sai pelo -z dela; virada, ilumina a mesa
  luzTela.intensity = 0;
  monitor.add(luzTela);
  const luzBarra = new THREE.RectAreaLight("#ffeedd", 3.2, 0.4, 0.03);
  luzBarra.position.set(0, PAINEL.h / 2 + 0.002, 0.02);
  luzBarra.rotation.x = -Math.PI / 2 - 0.55; // para baixo e para a frente
  monitor.add(luzBarra);
  cena.add(new THREE.HemisphereLight("#8494c4", "#24180f", 0.42));
  const luzFundo = new THREE.PointLight("#ff8a45", 1.4, 1.4, 1.5);
  luzFundo.position.set(0, 1.15, -0.45);
  cena.add(luzFundo);
  const luzRgb = new THREE.PointLight("#ff7a3d", 0.55, 0.5, 2);
  luzRgb.position.set(-0.05, MESA_Y + 0.06, 0.15);
  cena.add(luzRgb);
  const luzDireita = new THREE.PointLight("#8a94ff", 0.9, 2.2, 1.6);
  luzDireita.position.set(1.0, 1.35, 0.5);
  cena.add(luzDireita);

  // ---------------- Tela (textura com o desktop) ----------------
  let resolverPronto: () => void;
  const pronto = new Promise<void>((r) => (resolverPronto = r));
  let texturaTela: THREE.Texture | null = null;
  let ligada = 0; // 0..1, a tela "acende" quando a textura chega
  let carregouEm = 0;
  new THREE.TextureLoader().load(
    opcoes.tela,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texturaTela = t;
      carregouEm = performance.now();
      telaMat.map = t;
      telaMat.needsUpdate = true;
      resolverPronto();
    },
    undefined,
    () => {
      telaMat.color.set("#1e1f22");
      ligada = 1;
      resolverPronto();
    }
  );

  // ---------------- Câmera ----------------
  const centroTela = new THREE.Vector3();
  const normalTela = new THREE.Vector3();
  const cimaTela = new THREE.Vector3();
  monitor.updateMatrixWorld(true);
  tela.getWorldPosition(centroTela);
  normalTela.set(0, 0, 1).applyQuaternion(tela.getWorldQuaternion(new THREE.Quaternion()));
  cimaTela.set(0, 1, 0).applyQuaternion(tela.getWorldQuaternion(new THREE.Quaternion()));

  const estado = { x: 0, y: 0, z: 0, ax: 0, ay: 0, az: 0, ux: 0, uy: 1, uz: 0 };
  let linha: gsap.core.Timeline | null = null;
  let progressoAtual = 0;
  const parallax = { x: 0, y: 0, ax: 0, ay: 0 };

  function montarCaminho() {
    const aspecto = camera.aspect;
    const t = THREE.MathUtils.clamp((1.6 - aspecto) / 1.0, 0, 1); // 0 = paisagem, 1 = retrato
    camera.fov = THREE.MathUtils.lerp(38, 50, t);
    camera.updateProjectionMatrix();
    const inicio = new THREE.Vector3(0, THREE.MathUtils.lerp(1.36, 1.5, t), THREE.MathUtils.lerp(1.15, 2.05, t));
    const alvoInicio = new THREE.Vector3(0, THREE.MathUtils.lerp(0.98, 0.96, t), THREE.MathUtils.lerp(-0.06, -0.02, t));
    const meio = centroTela.clone().addScaledVector(normalTela, 0.72).add(new THREE.Vector3(0, 0.05, 0));
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dFim = (Math.min(TELA_H / 2, TELA_W / 2 / aspecto) / tan) * 0.965;
    const fim = centroTela.clone().addScaledVector(normalTela, dFim);

    Object.assign(estado, { x: inicio.x, y: inicio.y, z: inicio.z, ax: alvoInicio.x, ay: alvoInicio.y, az: alvoInicio.z, ux: 0, uy: 1, uz: 0 });
    linha?.kill();
    linha = gsap
      .timeline({ paused: true })
      .to(estado, { x: meio.x, y: meio.y, z: meio.z, ax: centroTela.x, ay: centroTela.y, az: centroTela.z, duration: 0.5, ease: "power2.inOut" })
      .to(estado, { x: fim.x, y: fim.y, z: fim.z, ux: cimaTela.x, uy: cimaTela.y, uz: cimaTela.z, duration: 0.4, ease: "power2.in" })
      .to({}, { duration: 0.1 });
    linha.progress(progressoAtual);
  }

  function redimensionar() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    montarCaminho();
  }
  redimensionar();

  // ---------------- Animação ----------------
  const cor = new THREE.Color();
  const media = new THREE.Color();
  const comeco = performance.now();
  let raf = 0;
  const desenhar = () => {
    raf = requestAnimationFrame(desenhar);
    const t = (performance.now() - comeco) / 1000;
    if (texturaTela && ligada < 1) ligada = Math.min(1, (performance.now() - carregouEm) / 700); // a tela "acende"

    // RGB do teclado: uma onda de cor passando da esquerda para a direita
    media.setRGB(0, 0, 0);
    posicoes.forEach((p, i) => {
      cor.setHSL(((p.x / 18.25) * 0.5 - t * 0.08 + 1) % 1, 0.9, 0.55);
      luzes.setColorAt(i, cor);
      media.add(cor);
    });
    luzes.instanceColor!.needsUpdate = true;
    media.multiplyScalar(1 / posicoes.length);
    luzRgb.color.copy(media);
    (brilhoTeclado.material as THREE.MeshBasicMaterial).color.copy(media);

    // Painéis da parede "respirando"
    hexBrilhos.forEach((h, i) => ((h.material as THREE.MeshBasicMaterial).opacity = 0.24 + Math.sin(t * 0.9 + i * 1.3) * 0.07));

    // Vapor do café
    vapores.forEach((v, i) => {
      const fase = (t * 0.35 + i / 3) % 1;
      v.position.y = 0.11 + fase * 0.12;
      v.position.x = (i - 1) * 0.012 + Math.sin(t * 1.3 + i) * 0.006;
      (v.material as THREE.MeshBasicMaterial).opacity = Math.sin(fase * Math.PI) * 0.09;
      v.quaternion.copy(camera.quaternion);
    });

    // Tela acendendo e iluminando a mesa; o reflexo do vidro some ao chegar perto
    telaMat.color.setScalar(texturaTela ? ligada : 0.12);
    luzTela.intensity = 5 * ligada;
    (reflexo.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - progressoAtual / 0.55);

    // Câmera: timeline + um pouco de parallax com o mouse (some ao entrar na tela)
    parallax.ax += (parallax.x - parallax.ax) * 0.06;
    parallax.ay += (parallax.y - parallax.ay) * 0.06;
    const forca = Math.max(0, 1 - progressoAtual * 1.8);
    camera.position.set(estado.x + parallax.ax * 0.06 * forca, estado.y + parallax.ay * 0.035 * forca, estado.z);
    camera.up.set(estado.ux, estado.uy, estado.uz);
    camera.lookAt(estado.ax, estado.ay, estado.az);
    renderer.render(cena, camera);
  };
  desenhar();

  return {
    pronto,
    progresso(p) {
      progressoAtual = p;
      linha?.progress(p);
    },
    ponteiro(x, y) {
      parallax.x = x;
      parallax.y = y;
    },
    redimensionar,
    destruir() {
      cancelAnimationFrame(raf);
      linha?.kill();
      cena.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mt) => {
          const comMapa = mt as THREE.MeshStandardMaterial;
          comMapa.map?.dispose();
          comMapa.bumpMap?.dispose();
          mt.dispose();
        });
      });
      extras.forEach((d) => d.dispose());
      texturaTela?.dispose();
      cena.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}

function hexParaRgba(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},1)`;
}
