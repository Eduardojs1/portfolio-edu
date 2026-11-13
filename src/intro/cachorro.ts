// Um filhote vira-lata caramelo, sentado na mesa: estilo bichinho 3D (cabeça grande,
// corpo arredondado, orelhas caídas, olhos brilhantes), pelo com brilho macio (sheen).
// Abana o rabo, respira, pisca, mexe as orelhas e acompanha o mouse com a cabeça.
import * as THREE from "three";
import { gorroNatal } from "./natal";

type Animar = (t: number, dt: number, ponteiro: { x: number; y: number } | null, camera: THREE.Camera) => void;

// Ruído suave para o pelo (bumpMap bem leve)
function texturaPelo() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 128, 128);
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 1800; i++) {
    const v = 100 + Math.round(r() * 70);
    g.strokeStyle = `rgba(${v},${v},${v},0.5)`;
    g.lineWidth = 1;
    const x = r() * 128;
    const y = r() * 128;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 2, y + 2 + r() * 3);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4);
  return t;
}

// Esfera "esculpida": cada vértice passa por uma função (para formas orgânicas, sem emendas)
function esculpir(seg: number, fn: (v: THREE.Vector3) => void) {
  const geo = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75));
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    fn(v);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

// Tubo que afina na ponta (rabo)
function tuboAfinando(curva: THREE.Curve<THREE.Vector3>, raio: number, fim: number) {
  const seg = 28;
  const lados = 14;
  const geo = new THREE.TubeGeometry(curva, seg, raio, lados, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const centro = new THREE.Vector3();
  const v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    curva.getPointAt(u, centro);
    const k = 1 - (1 - fim) * Math.pow(u, 1.2);
    for (let j = 0; j <= lados; j++) {
      const idx = i * (lados + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(centro).multiplyScalar(k).add(centro);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

export function criarCachorro(comGorro = false): { grupo: THREE.Group; animar: Animar } {
  const grupo = new THREE.Group();
  const pelo = texturaPelo();
  const fofo = (cor: string, brilho: string) =>
    new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.8, sheen: 0.55, sheenColor: new THREE.Color(brilho), sheenRoughness: 0.5, bumpMap: pelo, bumpScale: 0.18 });
  const caramelo = fofo("#c97b37", "#f0b07a");
  const claro = fofo("#f3e1c7", "#fff1dc");
  const orelhaMat = fofo("#a96330", "#e8a874");
  const nariz = new THREE.MeshPhysicalMaterial({ color: "#2a1d1a", roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const olho = new THREE.MeshPhysicalMaterial({ color: "#1a120e", roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02 });
  const branco = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const boca = new THREE.MeshStandardMaterial({ color: "#3a2420", roughness: 0.6 });
  const lingua = new THREE.MeshStandardMaterial({ color: "#ee8c93", roughness: 0.4 });
  const bochecha = new THREE.MeshBasicMaterial({ color: "#ff9a86", transparent: true, opacity: 0.32, depthWrite: false });
  const coleira = new THREE.MeshStandardMaterial({ color: "#d1452f", roughness: 0.5 });
  const ouro = new THREE.MeshStandardMaterial({ color: "#e9c063", roughness: 0.25, metalness: 0.9 });

  const esfera = new THREE.SphereGeometry(1, 32, 24);
  const bola = (mat: THREE.Material, pos: [number, number, number], esc: [number, number, number], rot: [number, number, number] = [0, 0, 0], pai: THREE.Object3D = grupo) => {
    const m = new THREE.Mesh(esfera, mat);
    m.position.set(...pos);
    m.scale.set(...esc);
    m.rotation.set(...rot);
    pai.add(m);
    return m;
  };
  const membro = (mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, raio: number, pai: THREE.Object3D = grupo) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(raio, Math.max(0.001, d.length() - raio * 2), 10, 20), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    pai.add(m);
    return m;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------- Corpo sentado: uma peça só, em forma de pera ----------------
  const corpo = new THREE.Mesh(
    esculpir(56, (v) => {
      const largura = 1 + 0.3 * Math.max(0, -v.y) - 0.14 * Math.max(0, v.y); // quadril largo embaixo
      v.x *= largura;
      v.z *= largura;
      v.z += 0.2 * Math.max(0, v.y); // peito para a frente
      if (v.y < -0.72) v.y = -0.72 + (v.y + 0.72) * 0.25; // base achatada
      v.set(v.x * 0.04, v.y * 0.047, v.z * 0.041);
    }),
    caramelo
  );
  corpo.position.set(0, 0.046, -0.004);
  grupo.add(corpo);
  const peito = bola(claro, [0, 0.062, 0.03], [0.018, 0.024, 0.009], [0.28, 0, 0]);
  // Patas de trás (o "joelho" redondo de quem está sentado) e os pezinhos
  for (const lado of [1, -1]) {
    bola(caramelo, [lado * 0.031, 0.026, -0.006], [0.018, 0.021, 0.026]);
    bola(claro, [lado * 0.033, 0.0065, 0.022], [0.0125, 0.0068, 0.017]);
    // Patas da frente: curtinhas e fofas
    membro(caramelo, V(lado * 0.0165, 0.052, 0.024), V(lado * 0.018, 0.012, 0.031), 0.0112);
    bola(claro, [lado * 0.0182, 0.0072, 0.0365], [0.0128, 0.0078, 0.0145]);
  }

  // Coleira com plaquinha
  const anel = new THREE.Mesh(new THREE.TorusGeometry(0.0255, 0.0032, 12, 40), coleira);
  anel.position.set(0, 0.084, 0.008);
  anel.rotation.x = Math.PI / 2 - 0.22;
  grupo.add(anel);
  const plaquinha = new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.0014, 24), ouro);
  plaquinha.position.set(0, 0.0745, 0.0335);
  plaquinha.rotation.x = Math.PI / 2 - 0.25;
  grupo.add(plaquinha);

  // ---------------- Cabeça grande (gira para olhar o mouse) ----------------
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0.098, 0.006);
  cabeca.rotation.order = "YXZ";
  grupo.add(cabeca);
  // crânio levemente achatado, mais largo nas bochechas
  cabeca.add(
    (() => {
      const m = new THREE.Mesh(
        esculpir(56, (v) => {
          const bochechas = 1 + 0.1 * Math.max(0, -v.y) * (1 - Math.abs(v.z));
          v.set(v.x * 0.039 * bochechas, v.y * 0.035, v.z * 0.036);
        }),
        caramelo
      );
      m.position.y = 0.018;
      return m;
    })()
  );
  // focinho claro e "bochechas" do focinho
  bola(claro, [0, 0.0085, 0.031], [0.0178, 0.0125, 0.0135], [0, 0, 0], cabeca);
  for (const lado of [1, -1]) bola(claro, [lado * 0.0095, 0.0075, 0.029], [0.0102, 0.0094, 0.01], [0, 0, 0], cabeca);
  // ponte caramelo entre os olhos, descendo até o focinho
  bola(caramelo, [0, 0.0175, 0.029], [0.011, 0.009, 0.0125], [-0.25, 0, 0], cabeca);
  bola(nariz, [0, 0.0145, 0.0442], [0.0072, 0.0052, 0.0052], [0.15, 0, 0], cabeca);
  // boquinha sorrindo (um arco) e a pontinha da língua
  const sorriso = new THREE.Mesh(new THREE.TorusGeometry(0.0055, 0.00085, 8, 24, Math.PI), boca);
  sorriso.position.set(0, 0.0058, 0.0428);
  sorriso.rotation.set(-0.35, 0, Math.PI);
  cabeca.add(sorriso);
  bola(lingua, [0, 0.0012, 0.0405], [0.0042, 0.0022, 0.0045], [0.4, 0, 0], cabeca);
  // olhos grandes e brilhantes, com dois pontinhos de luz
  const olhos: THREE.Object3D[] = [];
  for (const lado of [1, -1]) {
    const o = new THREE.Group();
    o.position.set(lado * 0.0158, 0.0225, 0.0298);
    o.rotation.y = lado * 0.32;
    cabeca.add(o);
    bola(olho, [0, 0, 0], [0.0072, 0.0078, 0.0048], [0, 0, 0], o);
    bola(branco, [lado * -0.0018, 0.0028, 0.0042], [0.0021, 0.0021, 0.0008], [0, 0, 0], o);
    bola(branco, [lado * 0.0018, -0.0022, 0.0044], [0.0009, 0.0009, 0.0005], [0, 0, 0], o);
    olhos.push(o);
    bola(claro, [lado * 0.0135, 0.0345, 0.0265], [0.0045, 0.0022, 0.0028], [0, 0, lado * 0.25], cabeca); // "sobrancelha" clara
    bola(bochecha, [lado * 0.0255, 0.0098, 0.0232], [0.0062, 0.0042, 0.002], [0, lado * 0.85, 0], cabeca); // rubor
  }
  // orelhas caídas e arredondadas (mexem um pouco)
  const orelhas: THREE.Group[] = [];
  for (const lado of [1, -1]) {
    const base = new THREE.Group();
    base.position.set(lado * 0.031, 0.04, -0.002);
    base.rotation.set(0.1, 0, lado * 0.42);
    cabeca.add(base);
    const orelha = new THREE.Mesh(
      esculpir(32, (v) => {
        const afina = 1 - 0.25 * Math.max(0, v.y); // mais estreita em cima
        v.set(v.x * 0.0115 * afina, v.y * 0.024, v.z * 0.0058);
      }),
      orelhaMat
    );
    orelha.position.y = -0.018;
    base.add(orelha);
    orelhas.push(base);
  }

  // gorro de Papai Noel (é Natal!)
  if (comGorro) {
    const gorro = gorroNatal();
    gorro.scale.setScalar(1.22);
    gorro.position.set(0.004, 0.045, -0.006);
    gorro.rotation.set(-0.18, 0, -0.22);
    cabeca.add(gorro);
  }

  // ---------------- Rabo enrolado (bem de vira-lata) ----------------
  const rabo = new THREE.Group();
  rabo.position.set(0, 0.022, -0.044);
  grupo.add(rabo);
  const curva = new THREE.CatmullRomCurve3([V(0, 0, 0), V(0, 0.012, -0.018), V(0, 0.034, -0.024), V(0, 0.05, -0.013), V(0, 0.054, 0.003)]);
  rabo.add(new THREE.Mesh(tuboAfinando(curva, 0.0082, 0.5), caramelo));
  const pontaRabo = new THREE.Mesh(esfera, claro);
  pontaRabo.position.copy(curva.getPointAt(1));
  pontaRabo.scale.setScalar(0.0045);
  rabo.add(pontaRabo);

  grupo.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });

  // ---------------- Animação ----------------
  const olhar = { yaw: 0, pitch: 0 };
  const ndc = new THREE.Vector3();
  const escCorpo = corpo.scale.clone();
  const escPeito = peito.scale.clone();
  const animar: Animar = (t, dt, ponteiro, camera) => {
    // Rabo abanando (com uma pausinha de vez em quando)
    const pausa = Math.sin(t * 0.45) > 0.88 ? 0.25 : 1;
    rabo.rotation.y = Math.sin(t * 10.5) * 0.45 * pausa;
    rabo.rotation.z = Math.sin(t * 10.5 + 0.6) * 0.07 * pausa;

    // Respiração
    const resp = 1 + Math.sin(t * 2.4) * 0.018;
    corpo.scale.set(escCorpo.x * resp, escCorpo.y, escCorpo.z * resp);
    peito.scale.set(escPeito.x * resp, escPeito.y, escPeito.z * resp);

    // Cabeça segue o mouse (ou passeia o olhar quando não tem mouse)
    let yaw: number;
    let pitch: number;
    if (ponteiro) {
      cabeca.getWorldPosition(ndc);
      ndc.project(camera);
      yaw = THREE.MathUtils.clamp((ponteiro.x - ndc.x) * 1.2, -0.85, 0.85);
      pitch = THREE.MathUtils.clamp(-(ponteiro.y - ndc.y) * 0.9, -0.4, 0.35);
    } else {
      yaw = Math.sin(t * 0.35) * 0.45;
      pitch = Math.sin(t * 0.23) * 0.1;
    }
    const k = 1 - Math.exp(-dt * 6);
    olhar.yaw += (yaw - olhar.yaw) * k;
    olhar.pitch += (pitch - olhar.pitch) * k;
    cabeca.rotation.y = olhar.yaw;
    cabeca.rotation.x = olhar.pitch;
    cabeca.rotation.z = Math.sin(t * 0.7) * 0.06 + (Math.sin(t * 0.13) > 0.93 ? 0.2 : 0); // a inclinadinha de cachorro curioso

    // Piscar
    const piscando = t % 4.1 < 0.11;
    for (const o of olhos) o.scale.y = piscando ? 0.12 : 1;

    // Orelhas balançando de leve, e uma mexida de vez em quando
    const mexe = t % 5.3 < 0.2 ? Math.sin(((t % 5.3) / 0.2) * Math.PI) * 0.3 : 0;
    const balanco = Math.sin(t * 2.1) * 0.03;
    orelhas[0].rotation.z = 0.42 + balanco + mexe;
    orelhas[1].rotation.z = -0.42 - balanco;
  };

  return { grupo, animar };
}
