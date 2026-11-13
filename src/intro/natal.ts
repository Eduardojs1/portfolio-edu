// Decoração de Natal da mesa: gorro de Papai Noel, arvorezinha com enfeites e luzinhas,
// presentes e o pisca-pisca na parede. Tudo feito com primitivas, nada baixado.
import * as THREE from "three";

// A decoração aparece de 1º de novembro até o Dia de Reis (6 de janeiro)
export function epocaDeNatal(hoje = new Date()) {
  const m = hoje.getMonth();
  return m === 10 || m === 11 || (m === 0 && hoje.getDate() <= 6);
}

const feltro = () => new THREE.MeshPhysicalMaterial({ color: "#c4232c", roughness: 0.85, sheen: 0.8, sheenColor: new THREE.Color("#ff8a8a"), sheenRoughness: 0.5 });
const pelucia = () => new THREE.MeshPhysicalMaterial({ color: "#f8f4ee", roughness: 0.95, sheen: 1, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.35 });

// Textura de brilho redondo (para as luzinhas)
function texturaBrilho() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// ---------------- Gorro de Papai Noel (a ponta cai para o lado) ----------------
export function gorroNatal() {
  const grupo = new THREE.Group();
  const altura = 0.052;
  const geo = new THREE.ConeGeometry(0.0235, altura, 28, 12, true);
  geo.translate(0, altura / 2, 0);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const k = y / altura;
    pos.setX(i, pos.getX(i) + k * k * 0.022);
    pos.setY(i, y - k * k * k * 0.012);
  }
  geo.computeVertexNormals();
  const cone = new THREE.Mesh(geo, feltro());
  grupo.add(cone);
  const aba = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0062, 14, 40), pelucia());
  aba.rotation.x = Math.PI / 2;
  aba.position.y = 0.002;
  grupo.add(aba);
  const pompom = new THREE.Mesh(new THREE.SphereGeometry(0.0078, 20, 14), pelucia());
  pompom.position.set(0.022, altura - 0.012, 0);
  grupo.add(pompom);
  grupo.traverse((o) => (o.castShadow = true));
  return grupo;
}

// ---------------- Presente com fita e laço ----------------
export function presente(w: number, h: number, d: number, cor: string, fita: string) {
  const grupo = new THREE.Group();
  const papel = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.55 });
  const fitaMat = new THREE.MeshStandardMaterial({ color: fita, roughness: 0.35, metalness: 0.4 });
  const caixa = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), papel);
  caixa.position.y = h / 2;
  grupo.add(caixa);
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, h + 0.0012, d + 0.0012), fitaMat);
  f1.position.y = h / 2;
  grupo.add(f1);
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.0012, h + 0.0012, d * 0.16), fitaMat);
  f2.position.y = h / 2;
  grupo.add(f2);
  for (const lado of [1, -1]) {
    const laco = new THREE.Mesh(new THREE.TorusGeometry(w * 0.13, w * 0.035, 10, 24), fitaMat);
    laco.position.set(lado * w * 0.11, h + w * 0.08, 0);
    laco.rotation.set(0, 0, lado * 0.9);
    laco.scale.set(1, 0.75, 1);
    grupo.add(laco);
  }
  grupo.traverse((o) => {
    o.castShadow = true;
    o.receiveShadow = true;
  });
  return grupo;
}

// ---------------- Luzinhas (instanced) + brilho ----------------
function luzinhas(posicoes: THREE.Vector3[], cores: THREE.Color[], raio: number, brilhoTam: number, pai: THREE.Object3D) {
  const n = posicoes.length;
  const geo = new THREE.SphereGeometry(raio, 10, 8);
  geo.scale(1, 1.5, 1);
  const lamp = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false }), n);
  const m = new THREE.Matrix4();
  posicoes.forEach((p, i) => {
    m.makeTranslation(p.x, p.y, p.z);
    lamp.setMatrixAt(i, m);
    lamp.setColorAt(i, cores[i]);
  });
  pai.add(lamp);
  const tex = texturaBrilho();
  const halos = posicoes.map((p, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: cores[i], transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    s.position.copy(p);
    s.scale.setScalar(brilhoTam);
    pai.add(s);
    return s;
  });
  const tmp = new THREE.Color();
  // brilho de cada lâmpada (0..1): o desenho do "pisca" fica com quem chama
  const atualizar = (brilho: (i: number) => number) => {
    for (let i = 0; i < n; i++) {
      const b = brilho(i);
      lamp.setColorAt(i, tmp.copy(cores[i]).multiplyScalar(0.25 + 0.95 * b));
      (halos[i].material as THREE.SpriteMaterial).opacity = 0.12 + 0.55 * b;
    }
    lamp.instanceColor!.needsUpdate = true;
  };
  return atualizar;
}

const CORES_PISCA = ["#ff3b3b", "#ffd23b", "#38d36b", "#3b8bff", "#ff6ad5", "#ff9b3b"].map((c) => new THREE.Color(c));

// ---------------- Pisca-pisca pendurado na parede (em "barrigas" entre os preguinhos) ----------------
export function piscaPisca(pregos: THREE.Vector3[], barriga = 0.06, espaco = 0.042) {
  const grupo = new THREE.Group();
  const pontosFio: THREE.Vector3[] = [];
  for (let k = 0; k < pregos.length - 1; k++) {
    const a = pregos[k];
    const b = pregos[k + 1];
    for (let i = k === 0 ? 0 : 1; i <= 24; i++) {
      const t = i / 24;
      pontosFio.push(new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -barriga * 4 * t * (1 - t), 0)));
    }
  }
  const curva = new THREE.CatmullRomCurve3(pontosFio);
  grupo.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 240, 0.0011, 6), new THREE.MeshStandardMaterial({ color: "#1d3b25", roughness: 0.6 })));
  const total = curva.getLength();
  const n = Math.floor(total / espaco);
  const posicoes: THREE.Vector3[] = [];
  const cores: THREE.Color[] = [];
  for (let i = 0; i < n; i++) {
    const p = curva.getPointAt((i + 0.5) / n);
    p.y -= 0.009;
    posicoes.push(p);
    cores.push(CORES_PISCA[i % CORES_PISCA.length]);
  }
  const atualizar = luzinhas(posicoes, cores, 0.0042, 0.07, grupo);
  // Pisca em "onda" que corre pelo fio, com uma variação lenta
  const animar = (t: number) => atualizar((i) => Math.max(0, Math.sin(t * 2.6 - i * 0.7)) ** 1.5 * 0.85 + 0.15 * (0.5 + 0.5 * Math.sin(t * 0.7 + i)));
  return { grupo, animar };
}

// ---------------- Arvorezinha de Natal ----------------
export function arvoreNatal() {
  const grupo = new THREE.Group();
  // vaso e tronco
  const vaso = new THREE.Mesh(
    new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.032, 0), new THREE.Vector2(0.038, 0.034), new THREE.Vector2(0.034, 0.036), new THREE.Vector2(0, 0.032)], 32),
    new THREE.MeshStandardMaterial({ color: "#a3242b", roughness: 0.45 })
  );
  grupo.add(vaso);
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.009, 0.03, 12), new THREE.MeshStandardMaterial({ color: "#4a2f1d", roughness: 0.9 }));
  tronco.position.y = 0.045;
  grupo.add(tronco);
  // copa: andares de cone com a borda serrilhada
  const verde = new THREE.MeshStandardMaterial({ color: "#1f5c38", roughness: 0.82 });
  const andares: { y: number; r: number; h: number }[] = [
    { y: 0.05, r: 0.085, h: 0.1 },
    { y: 0.105, r: 0.07, h: 0.09 },
    { y: 0.157, r: 0.053, h: 0.08 },
    { y: 0.205, r: 0.035, h: 0.07 },
  ];
  for (const a of andares) {
    const geo = new THREE.ConeGeometry(a.r, a.h, 30, 3, true);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y < -a.h / 2 + 0.001) {
        // pontinhas para baixo/fora, alternadas (galhos)
        const ang = Math.atan2(pos.getZ(i), pos.getX(i));
        const ponta = Math.cos(ang * 15) > 0 ? 1 : 0;
        pos.setY(i, y - ponta * 0.008);
        pos.setX(i, pos.getX(i) * (1 + ponta * 0.08));
        pos.setZ(i, pos.getZ(i) * (1 + ponta * 0.08));
      }
    }
    geo.computeVertexNormals();
    const cone = new THREE.Mesh(geo, verde);
    cone.position.y = a.y + a.h / 2;
    grupo.add(cone);
  }
  // enfeites (bolinhas brilhantes)
  const coresBola = ["#d42a35", "#e8b84a", "#d9dde3", "#2f6bd4", "#d42a35", "#e8b84a"];
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const bola = new THREE.SphereGeometry(0.0072, 16, 12);
  andares.forEach((a, k) => {
    const quantas = [9, 7, 5, 3][k];
    for (let i = 0; i < quantas; i++) {
      const ang = (i / quantas) * Math.PI * 2 + k * 0.6 + r() * 0.3;
      const alt = 0.15 + r() * 0.45; // altura dentro do andar (0 = base)
      const raio = a.r * (1 - alt) * 0.98 + 0.004;
      const m = new THREE.Mesh(bola, new THREE.MeshStandardMaterial({ color: coresBola[(i + k) % coresBola.length], roughness: 0.18, metalness: 0.85 }));
      m.position.set(Math.cos(ang) * raio, a.y + alt * a.h - 0.004, Math.sin(ang) * raio);
      grupo.add(m);
    }
  });
  // luzinhas em espiral
  const posicoes: THREE.Vector3[] = [];
  const cores: THREE.Color[] = [];
  const quente = new THREE.Color("#ffd89a");
  for (let i = 0; i < 46; i++) {
    const u = i / 46;
    const y = 0.06 + u * 0.2;
    // raio da copa naquela altura (aproximado pelos andares)
    const a = andares.find((x) => y >= x.y && y <= x.y + x.h) ?? andares[andares.length - 1];
    const raio = a.r * (1 - (y - a.y) / a.h) + 0.005;
    const ang = u * Math.PI * 2 * 5.5;
    posicoes.push(new THREE.Vector3(Math.cos(ang) * raio, y, Math.sin(ang) * raio));
    cores.push(i % 3 === 0 ? new THREE.Color("#ff6a5c") : quente);
  }
  const atualizar = luzinhas(posicoes, cores, 0.0028, 0.035, grupo);
  // estrela no topo
  const forma = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const ang = Math.PI / 2 + (i / 10) * Math.PI * 2;
    const rr = i % 2 === 0 ? 0.022 : 0.009;
    if (i === 0) forma.moveTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
    else forma.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  forma.closePath();
  const estrela = new THREE.Mesh(
    new THREE.ExtrudeGeometry(forma, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 2 }),
    new THREE.MeshStandardMaterial({ color: "#ffd25a", emissive: "#ffb627", emissiveIntensity: 1.4, roughness: 0.3, metalness: 0.6 })
  );
  estrela.geometry.center();
  estrela.position.y = 0.29;
  grupo.add(estrela);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho(), color: "#ffcf6b", transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  halo.position.y = 0.29;
  halo.scale.setScalar(0.12);
  grupo.add(halo);
  const luz = new THREE.PointLight("#ffb46b", 0.55, 0.7, 2);
  luz.position.set(0, 0.17, 0.06);
  grupo.add(luz);

  grupo.traverse((o) => {
    if ((o as THREE.Mesh).isMesh && !(o as THREE.InstancedMesh).isInstancedMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const animar = (t: number) => {
    atualizar((i) => 0.55 + 0.45 * Math.sin(t * 3.1 + i * 1.7) * Math.sin(t * 1.3 + i * 0.4));
    estrela.rotation.y = Math.sin(t * 0.6) * 0.35;
    (halo.material as THREE.SpriteMaterial).opacity = 0.5 + Math.sin(t * 2) * 0.1;
  };
  return { grupo, animar };
}
