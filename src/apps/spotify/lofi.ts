// Lo-fi gerado na hora com Web Audio: bateria boom-bap com swing, acordes de piano
// elétrico, baixo, umas notas soltas e chiado de vinil. Nada de arquivo de áudio.
import type { Musica } from "../../dados/musicas";

const NOTAS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const TIPOS: Record<string, number[]> = {
  maj9: [0, 4, 7, 11, 14],
  maj7: [0, 4, 7, 11],
  m9: [0, 3, 7, 10, 14],
  m7: [0, 3, 7, 10],
  "9": [0, 4, 7, 10, 14],
  "7": [0, 4, 7, 10],
  m: [0, 3, 7],
  "": [0, 4, 7],
};

function acorde(nome: string) {
  const m = /^([A-G])(#|b)?(maj9|maj7|m9|m7|9|7|m)?$/.exec(nome) ?? ["", "C", "", ""];
  const raiz = 48 + NOTAS[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  const notas = TIPOS[m[3] ?? ""].map((i) => raiz + i).map((n) => (n > 71 ? n - 12 : n < 52 ? n + 12 : n));
  return { raiz, notas: [...new Set(notas)].sort((a, b) => a - b) };
}

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

function aleatorio(semente: string) {
  let h = 2166136261;
  for (const c of semente) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Lofi {
  private ctx: AudioContext | null = null;
  private mestre!: GainNode;
  private saida!: AudioNode; // entrada da cadeia final (filtro quente → compressor → volume)
  private sala!: ConvolverNode;
  private ruido!: AudioBuffer;
  private chiado: AudioBufferSourceNode | null = null;
  private faixaBus: GainNode | null = null;
  private faixa: Musica | null = null;
  private inicio = 0; // ctx.currentTime em que o passo 0 tocaria
  private passo = 0;
  private proximo = 0;
  private timer: number | undefined;
  private rnd: () => number = Math.random;
  private volume = 0.8;
  private mudo = false;
  onFim: (() => void) | null = null;

  private preparar() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;

    const quente = ctx.createBiquadFilter();
    quente.type = "lowpass";
    quente.frequency.value = 5200;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.mestre = ctx.createGain();
    this.mestre.gain.value = this.volume;
    quente.connect(comp).connect(this.mestre).connect(ctx.destination);

    // Ruído (bateria e vinil)
    this.ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // "Sala": reverb curtinho feito de ruído que some
    this.sala = ctx.createConvolver();
    const ir = ctx.createBuffer(2, ctx.sampleRate * 1.8, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const canal = ir.getChannelData(c);
      for (let i = 0; i < canal.length; i++) canal[i] = (Math.random() * 2 - 1) * (1 - i / canal.length) ** 3;
    }
    this.sala.buffer = ir;
    const molhado = ctx.createGain();
    molhado.gain.value = 0.32;
    this.sala.connect(molhado).connect(quente);
    this.saida = quente;
    return ctx;
  }

  get tempo() {
    if (!this.ctx || !this.faixa) return 0;
    return Math.max(0, Math.min(this.faixa.duracao, this.ctx.currentTime - this.inicio));
  }

  get tocando() {
    return !!this.ctx && this.ctx.state === "running" && !!this.faixa && this.timer !== undefined;
  }

  definirVolume(v: number, mudo = this.mudo) {
    this.volume = v;
    this.mudo = mudo;
    if (this.ctx) this.mestre.gain.setTargetAtTime(mudo ? 0 : v, this.ctx.currentTime, 0.05);
  }

  tocar(faixa: Musica, aPartirDe = 0) {
    const ctx = this.preparar();
    void ctx.resume();
    this.pararAgenda(true);
    this.faixa = faixa;
    this.rnd = aleatorio(faixa.id);
    this.faixaBus = ctx.createGain();
    this.faixaBus.gain.value = 1;
    this.faixaBus.connect(this.saida);
    const dur = 60 / faixa.bpm / 4;
    this.passo = Math.floor(aPartirDe / dur);
    this.inicio = ctx.currentTime + 0.06 - aPartirDe;
    this.proximo = this.inicio + this.passo * dur;
    this.iniciarChiado();
    this.timer = window.setInterval(() => this.agendar(), 25);
    this.agendar();
  }

  pausar() {
    void this.ctx?.suspend();
  }

  continuar() {
    void this.ctx?.resume();
  }

  parar() {
    this.pararAgenda(true);
    this.faixa = null;
  }

  private pararAgenda(fade: boolean) {
    window.clearInterval(this.timer);
    this.timer = undefined;
    if (this.faixaBus && this.ctx) {
      const bus = this.faixaBus;
      if (fade) bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      window.setTimeout(() => bus.disconnect(), 400);
    }
    this.faixaBus = null;
    this.chiado?.stop();
    this.chiado = null;
  }

  private iniciarChiado() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.ruido;
    src.loop = true;
    const banda = ctx.createBiquadFilter();
    banda.type = "bandpass";
    banda.frequency.value = 2400;
    banda.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.value = 0.012;
    src.connect(banda).connect(g).connect(this.faixaBus!);
    src.start();
    this.chiado = src;
  }

  private agendar() {
    const ctx = this.ctx;
    const faixa = this.faixa;
    if (!ctx || !faixa) return;
    const dur = 60 / faixa.bpm / 4;
    if (ctx.currentTime - this.inicio >= faixa.duracao) {
      this.pararAgenda(true);
      this.onFim?.();
      return;
    }
    while (this.proximo < ctx.currentTime + 0.12) {
      this.tocarPasso(this.passo, this.proximo, dur);
      this.passo++;
      this.proximo = this.inicio + this.passo * dur;
    }
  }

  private tocarPasso(passo: number, t: number, dur: number) {
    const faixa = this.faixa!;
    const p = passo % 16;
    const compasso = Math.floor(passo / 16);
    const { raiz, notas } = acorde(faixa.acordes[compasso % faixa.acordes.length]);
    const swing = p % 4 === 2 ? dur * 0.28 : 0;
    const quando = t + swing;
    const r = this.rnd;

    // Bateria (entra no segundo compasso, como intro)
    if (compasso > 0) {
      if (p === 0 || p === 10 || (p === 7 && r() < 0.35)) this.bumbo(quando);
      if (p === 4 || p === 12) this.caixa(quando);
      if (p % 2 === 0) this.chimbal(quando, p % 4 === 2 ? 0.05 : 0.08);
      if (p === 15 && r() < 0.3) this.chimbal(quando, 0.04);
    }
    // Acordes: no começo do compasso e uma batida atrasada
    if (p === 0) this.acordes(quando, notas, dur * 10);
    if (p === 10 && r() < 0.6) this.acordes(quando, notas, dur * 6, 0.6);
    // Baixo
    if (compasso > 0 && (p === 0 || p === 10)) this.baixo(quando, raiz - 12, dur * (p === 0 ? 8 : 5));
    // Notas soltas da escala
    if (compasso > 1 && (p === 6 || p === 14 || p === 3) && r() < 0.42) {
      const n = notas[Math.floor(r() * notas.length)] + 12;
      this.nota(quando, n);
    }
  }

  private envelope(g: GainNode, t: number, pico: number, ataque: number, duracao: number, solta = 0.5) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + ataque);
    g.gain.setTargetAtTime(pico * 0.55, t + ataque, duracao * 0.3);
    g.gain.setTargetAtTime(0.0001, t + duracao, solta / 4);
  }

  private bumbo(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.85, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    o.connect(g).connect(this.faixaBus!);
    o.start(t);
    o.stop(t + 0.4);
  }

  private caixa(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.ruido;
    const hp = ctx.createBiquadFilter();
    hp.type = "bandpass";
    hp.frequency.value = 1800;
    hp.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(hp).connect(g).connect(this.faixaBus!);
    g.connect(this.sala);
    src.start(t, Math.random());
    src.stop(t + 0.22);
  }

  private chimbal(t: number, volume: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.ruido;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(g).connect(this.faixaBus!);
    src.start(t, Math.random());
    src.stop(t + 0.06);
  }

  private acordes(t: number, notas: number[], duracao: number, forca = 1) {
    const ctx = this.ctx!;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 1500;
    const g = ctx.createGain();
    this.envelope(g, t, 0.07 * forca, 0.025, duracao, 1.2);
    filtro.connect(g);
    g.connect(this.faixaBus!);
    g.connect(this.sala);
    notas.forEach((n, i) => {
      for (const [tipo, desafino] of [["triangle", -5], ["sine", 6]] as const) {
        const o = ctx.createOscillator();
        o.type = tipo;
        o.frequency.value = freq(n);
        o.detune.value = desafino + Math.sin(t * 0.7) * 6; // "fita" levemente desafinada
        o.connect(filtro);
        o.start(t + i * 0.012); // dedilhado bem leve
        o.stop(t + duracao + 1.4);
      }
    });
  }

  private baixo(t: number, n: number, duracao: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = freq(n);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 320;
    const g = ctx.createGain();
    this.envelope(g, t, 0.32, 0.02, duracao, 0.3);
    o.connect(lp).connect(g).connect(this.faixaBus!);
    o.start(t);
    o.stop(t + duracao + 0.4);
  }

  private nota(t: number, n: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.055, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    for (const tipo of ["sine", "triangle"] as const) {
      const o = ctx.createOscillator();
      o.type = tipo;
      o.frequency.value = freq(n);
      o.connect(g);
      o.start(t);
      o.stop(t + 1.2);
    }
    g.connect(this.faixaBus!);
    g.connect(this.sala);
  }

  fechar() {
    this.parar();
    void this.ctx?.close();
    this.ctx = null;
  }
}
