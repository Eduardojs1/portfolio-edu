import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { ouvir } from "../../sistema/eventos";
import { linkEmbed, musicas, playlist, playlistsSpotify, type Musica } from "../../dados/musicas";
import { faixasTarcisio } from "../../dados/tarcisio";
import { perfil } from "../../dados/perfil";
import { useT } from "../../i18n";
import { IcFecharJanela, IcMaximizarJanela, IcMinimizarJanela, IcRestaurarJanela } from "../intellij/icones";
import { Lofi } from "./lofi";
import { carregarSpotify, type ControleSpotify } from "./embed";

const tempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const total = musicas.reduce((s, m) => s + m.duracao, 0);
const totalTarcisio = faixasTarcisio.reduce((s, f) => s + f.duracao, 0);
const uriFaixa = (i: number) => `spotify:track:${faixasTarcisio[i].id}`;

// Capas geradas (cores por faixa)
const cores = ["#e0674a", "#3574f0", "#9775f8", "#1ed760", "#f2b45a", "#c77dbb", "#2aacb8", "#cf8e6d"];
const corDe = (m: Musica) => cores[musicas.indexOf(m) % cores.length];

const ic = (d: React.ReactNode, t = 16, extra: object = {}) => (
  <svg viewBox="0 0 16 16" width={t} height={t} aria-hidden="true" fill="currentColor" {...extra}>
    {d}
  </svg>
);
const IcPlay = ({ t = 16 }: { t?: number }) => ic(<path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z" />, t);
const IcPause = ({ t = 16 }: { t?: number }) => ic(<path d="M3.5 2h3v12h-3zM9.5 2h3v12h-3z" />, t);
const IcAnterior = () => ic(<path d="M3 2h1.6v12H3zM13.4 2.4v11.2a.5.5 0 0 1-.8.4L5.4 8.4a.5.5 0 0 1 0-.8l7.2-5.6a.5.5 0 0 1 .8.4z" />);
const IcProxima = () => ic(<path d="M13 2h-1.6v12H13zM2.6 2.4v11.2a.5.5 0 0 0 .8.4l7.2-5.6a.5.5 0 0 0 0-.8L3.4 2a.5.5 0 0 0-.8.4z" />);
const IcAleatorio = () =>
  ic(<path d="M11.5 2.5l2.5 2.5-2.5 2.5M2 5h3c3 0 4 6 7 6h2M11.5 8.5L14 11l-2.5 2.5M2 11h3c1 0 1.8-.7 2.4-1.6M14 5h-2c-1 0-1.8.7-2.4 1.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />);
const IcRepetir = () =>
  ic(<path d="M2.5 7V6a2 2 0 0 1 2-2h8.5l-2-2M13.5 9v1a2 2 0 0 1-2 2H3l2 2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />);
const IcCoracao = ({ cheio }: { cheio: boolean }) =>
  ic(<path d="M8 13.5S2 10 2 5.8A3 3 0 0 1 8 4.4a3 3 0 0 1 6 1.4C14 10 8 13.5 8 13.5z" fill={cheio ? "#1ed760" : "none"} stroke={cheio ? "#1ed760" : "currentColor"} strokeWidth="1.3" strokeLinejoin="round" />);
const IcVolume = ({ mudo }: { mudo: boolean }) =>
  ic(
    <>
      <path d="M2 6h2.6L8 3v10L4.6 10H2z" />
      {mudo ? <path d="M10.5 6l4 4M14.5 6l-4 4" stroke="currentColor" strokeWidth="1.3" /> : <path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.4 3.8a6 6 0 0 1 0 8.4" fill="none" stroke="currentColor" strokeWidth="1.3" />}
    </>
  );
const IcCasa = () => ic(<path d="M2 7.5L8 2.5l6 5V14h-4.2v-4H6.2v4H2z" />, 22);
const IcBusca = () => ic(<path d="M7 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM13.5 13.5l-3.3-3.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />, 18);
const IcBiblioteca = () => ic(<path d="M2.5 2v12M6 2v12M9.5 2.5l4 11.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />, 20);
const IcRelogio = () => ic(<path d="M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2zM8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />);
const IcSeta = ({ esq }: { esq?: boolean }) => ic(<path d={esq ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />);

function Equalizador() {
  return (
    <span className="sp-eq" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function Capa({ cor, texto, tamanho, semCodigo }: { cor: string; texto?: string; tamanho: number; semCodigo?: boolean }) {
  return (
    <span
      className={`sp-capa${semCodigo ? " sem-codigo" : ""}`}
      style={{ width: tamanho, height: tamanho, fontSize: Math.max(8, tamanho * 0.12), background: `linear-gradient(135deg, ${cor}, #1b1b1f 85%)` }}
      aria-hidden="true"
    >
      {texto && <span>{texto}</span>}
    </span>
  );
}

type Lista = "playlist" | "curtidas" | `ext:${string}`;
type Fonte = "lofi" | "spotify";
type EstadoSpotify = { indice: number | null; tocando: boolean; pos: number; dur: number; pronto: boolean; erro: boolean };

export function Spotify({ janela }: { janela: ControleJanela }) {
  const { celular, mudo } = useSistema();
  const t = useT();
  const en = t.idioma === "en";
  const tarcisio = playlistsSpotify[0];

  // ---------------- Lo-fi (gerado no navegador) ----------------
  const motor = useRef<Lofi | null>(null);
  const [atual, setAtual] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const [pos, setPos] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [semSom, setSemSom] = useState(false);
  const [curtidas, setCurtidas] = useState<Set<string>>(() => new Set(["build", "tomcat"]));
  // Abre na playlist do Spotify de verdade (Tarcísio); o lo-fi fica em "Músicas pra codar"
  const [lista, setLista] = useState<Lista>(tarcisio ? `ext:${tarcisio.id}` : "playlist");
  const [aleatorio, setAleatorio] = useState(false);
  const [repetir, setRepetir] = useState(false);
  const [fonte, setFonte] = useState<Fonte>(tarcisio ? "spotify" : "lofi"); // o que a barra de baixo controla

  // ---------------- Spotify (player oficial embutido) ----------------
  const ctrl = useRef<ControleSpotify | null>(null);
  const hospedeiro = useRef<HTMLDivElement>(null);
  const [sp, setSp] = useState<EstadoSpotify>({ indice: null, tocando: false, pos: 0, dur: 0, pronto: false, erro: false });
  const spAtual = useRef(sp);
  spAtual.current = sp;
  const modoFaixa = useRef(false); // true quando fomos nós que carregamos uma faixa (aí o fim dela é com a gente)
  const fimTratado = useRef(false);

  const faixas = useMemo(() => (lista === "curtidas" ? musicas.filter((m) => curtidas.has(m.id)) : musicas), [lista, curtidas]);
  const musica = atual !== null ? musicas[atual] : null;
  const externa = playlistsSpotify.find((p) => `ext:${p.id}` === lista);

  const pararLofi = useCallback(() => {
    if (motor.current?.tocando) motor.current.pausar();
    setTocando(false);
  }, []);
  const pausarSpotify = useCallback(() => {
    if (spAtual.current.tocando) ctrl.current?.pause();
  }, []);

  const tocarIndice = useCallback(
    (i: number, aPartirDe = 0) => {
      pausarSpotify();
      if (!motor.current) motor.current = new Lofi();
      motor.current.tocar(musicas[i], aPartirDe);
      setAtual(i);
      setTocando(true);
      setPos(aPartirDe);
      setFonte("lofi");
    },
    [pausarSpotify]
  );

  const tocarSpotify = useCallback(
    (i: number) => {
      const c = ctrl.current;
      if (!c) return;
      pararLofi();
      modoFaixa.current = true;
      fimTratado.current = false;
      setSp((s) => ({ ...s, indice: i, pos: 0, dur: faixasTarcisio[i].duracao, tocando: true }));
      setFonte("spotify");
      c.loadUri(uriFaixa(i));
      c.play();
      window.setTimeout(() => c.play(), 600); // garante o play depois que a faixa carrega
    },
    [pararLofi]
  );

  const vizinha = (base: number, passo: number, total: number) =>
    aleatorio && passo > 0 ? Math.floor(Math.random() * total) : (base + passo + total) % total;

  const proxima = useCallback(
    (passo = 1) => tocarIndice(aleatorio && passo > 0 ? Math.floor(Math.random() * musicas.length) : ((atual ?? 0) + passo + musicas.length) % musicas.length),
    [atual, aleatorio, tocarIndice]
  );

  const alternar = () => {
    if (atual === null) return tocarIndice(lista === "curtidas" && faixas[0] ? musicas.indexOf(faixas[0]) : 0);
    if (tocando) pararLofi();
    else {
      pausarSpotify();
      motor.current?.continuar();
      setTocando(true);
      setFonte("lofi");
    }
  };

  const alternarSpotify = () => {
    if (!ctrl.current) return;
    if (sp.indice === null && !sp.tocando) return tocarSpotify(0);
    if (!sp.tocando) pararLofi();
    ctrl.current.togglePlay();
  };

  // Fim da faixa do lo-fi: repete ou vai para a próxima
  useEffect(() => {
    if (motor.current) motor.current.onFim = () => (repetir && atual !== null ? tocarIndice(atual) : proxima(1));
  }, [proxima, atual, repetir, tocarIndice]);

  // Fim da faixa do Spotify (quando fomos nós que escolhemos a faixa)
  const fimSpotify = useRef(() => {});
  fimSpotify.current = () => {
    const i = spAtual.current.indice;
    if (i === null) return;
    tocarSpotify(repetir ? i : vizinha(i, 1, faixasTarcisio.length));
  };

  // Tempo da faixa do lo-fi
  useEffect(() => {
    if (!tocando) return;
    const id = window.setInterval(() => setPos(motor.current?.tempo ?? 0), 250);
    return () => window.clearInterval(id);
  }, [tocando]);

  // Volume do lo-fi (e o mudo da barra de tarefas)
  useEffect(() => {
    motor.current?.definirVolume(volume, semSom || mudo);
  }, [volume, semSom, mudo, atual]);

  // Mudo na barra de tarefas: o player do Spotify não tem volume, então pausa
  useEffect(() => {
    if (mudo) pausarSpotify();
  }, [mudo, pausarSpotify]);

  // Monta o player do Spotify (fica montado mesmo mudando de lista, para a música não parar)
  useEffect(() => {
    if (!tarcisio) return;
    let vivo = true;
    let controle: ControleSpotify | null = null;
    carregarSpotify()
      .then((api) => {
        const casa = hospedeiro.current;
        if (!vivo || !casa) return;
        const el = document.createElement("div");
        casa.appendChild(el);
        api.createController(el, { uri: linkEmbed(tarcisio.link).replace(/^.*\/embed\/(\w+)\/(\w+).*$/, "spotify:$1:$2"), width: "100%", height: 152 }, (c) => {
          if (!vivo) return c.destroy();
          controle = c;
          ctrl.current = c;
          setSp((s) => ({ ...s, pronto: true }));
          c.addListener("playback_update", (e) => {
            const d = e.data as { isPaused: boolean; isBuffering: boolean; duration: number; position: number };
            const p = (d.position || 0) / 1000;
            const dur = (d.duration || 0) / 1000;
            setSp((s) => ({ ...s, tocando: !d.isPaused, pos: p, dur: dur || s.dur }));
            if (!d.isPaused) {
              if (motor.current?.tocando) {
                motor.current.pausar();
                setTocando(false);
              }
              setFonte("spotify");
            }
            if (modoFaixa.current && d.isPaused && dur > 0 && p >= dur - 0.8 && !fimTratado.current) {
              fimTratado.current = true;
              fimSpotify.current();
            }
          });
          c.addListener("playback_started", (e) => {
            const uri = (e.data as { playingURI?: string }).playingURI;
            const i = uri ? faixasTarcisio.findIndex((f) => `spotify:track:${f.id}` === uri) : -1;
            fimTratado.current = false;
            if (i >= 0) setSp((s) => ({ ...s, indice: i }));
            setFonte("spotify");
          });
        });
      })
      .catch(() => vivo && setSp((s) => ({ ...s, erro: true })));
    return () => {
      vivo = false;
      controle?.destroy();
      ctrl.current = null;
      if (hospedeiro.current) hospedeiro.current.innerHTML = "";
    };
  }, []);

  // Fechou a janela: desliga o som do lo-fi
  useEffect(() => () => motor.current?.fechar(), []);

  // "Tocar" do tour e do menu Iniciar: mostra o lo-fi e já toca
  useEffect(
    () =>
      ouvir("spotify:tocar", () => {
        setLista("playlist");
        tocarIndice(0);
      }),
    [tocarIndice]
  );

  const curtir = (id: string) =>
    setCurtidas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const nomePlaylist = en ? playlist.nomeEn : playlist.nome;
  const titulo = lista === "curtidas" ? t("Músicas Curtidas", "Liked Songs") : nomePlaylist;

  // ---------------- Barra de baixo: controla o que estiver tocando ----------------
  const emSpotify = fonte === "spotify" && !!tarcisio;
  const faixaSp = sp.indice !== null ? faixasTarcisio[sp.indice] : null;
  const barra = emSpotify
    ? {
        titulo: faixaSp?.titulo ?? (sp.tocando ? tarcisio.nome : null),
        artista: faixaSp?.artista ?? "Spotify",
        tocando: sp.tocando,
        pos: sp.pos,
        dur: sp.dur || faixaSp?.duracao || 0,
      }
    : { titulo: musica?.titulo ?? null, artista: musica?.artista ?? "", tocando, pos, dur: musica?.duracao ?? 0 };

  const playBarra = () => (emSpotify ? alternarSpotify() : alternar());
  const pularBarra = (passo: number) => {
    if (emSpotify) {
      if (passo < 0 && sp.pos > 3) return ctrl.current?.seek(0);
      return tocarSpotify(vizinha(sp.indice ?? 0, passo, faixasTarcisio.length));
    }
    if (passo < 0 && pos > 3 && atual !== null) return tocarIndice(atual, 0);
    proxima(passo);
  };
  const buscarBarra = (v: number) => {
    if (emSpotify) {
      ctrl.current?.seek(v);
      setSp((s) => ({ ...s, pos: v }));
    } else if (atual !== null) tocarIndice(atual, v);
  };

  // Abrir uma playlist do Spotify de verdade pausa o lo-fi, para não tocar os dois juntos
  const abrirLista = (l: Lista) => setLista(l);

  const linhaTarcisio = (f: (typeof faixasTarcisio)[number], i: number) => {
    const esta = sp.indice === i;
    return (
      <tr key={f.id} className={esta ? "atual" : ""} onDoubleClick={() => tocarSpotify(i)}>
        <td className="sp-num">
          <span className="sp-num-texto">{esta && sp.tocando ? <Equalizador /> : i + 1}</span>
          <button
            className="sp-num-play"
            onClick={() => (esta ? alternarSpotify() : tocarSpotify(i))}
            aria-label={`${t("Tocar", "Play")} ${f.titulo}`}
            disabled={!sp.pronto}
          >
            {esta && sp.tocando ? <IcPause t={13} /> : <IcPlay t={13} />}
          </button>
        </td>
        <td>
          <span className="sp-titulo">
            <span>
              <strong>{f.titulo}</strong>
              <small>{f.artista}</small>
            </span>
          </span>
        </td>
        <td className="sp-dur sp-fraco">{tempo(f.duracao)}</td>
      </tr>
    );
  };

  return (
    <div className={`sp${celular ? " celular" : ""}`}>
      <header className="sp-topo" data-arrastar>
        {!celular && (
          <span className="sp-navegacao">
            <button aria-label={t("Voltar", "Back")} onClick={() => setLista("playlist")}>
              <IcSeta esq />
            </button>
            <button aria-label={t("Avançar", "Forward")} disabled>
              <IcSeta />
            </button>
          </span>
        )}
        <span className="espaco" />
        <button className="sp-casa" aria-label={t("Início", "Home")} title={t("Início", "Home")} onClick={() => setLista(tarcisio ? `ext:${tarcisio.id}` : "playlist")}>
          <IcCasa />
        </button>
        <label className="sp-busca">
          <IcBusca />
          <input placeholder={t("O que você quer ouvir?", "What do you want to play?")} aria-label={t("Buscar", "Search")} />
        </label>
        <span className="espaco" />
        <span className="sp-avatar" title={perfil.linha1}>
          {perfil.nome[0]}
        </span>
        {!celular && (
          <span className="sp-janela" data-nao-arrastar>
            <button onClick={janela.minimizar} aria-label={t("Minimizar", "Minimize")}>
              <IcMinimizarJanela />
            </button>
            <button onClick={janela.alternarMaximizar} aria-label={janela.maximizada ? t("Restaurar", "Restore") : t("Maximizar", "Maximize")}>
              {janela.maximizada ? <IcRestaurarJanela /> : <IcMaximizarJanela />}
            </button>
            <button className="fechar" onClick={janela.fechar} aria-label={t("Fechar", "Close")}>
              <IcFecharJanela />
            </button>
          </span>
        )}
      </header>

      <div className="sp-meio">
        {!celular && (
          <aside className="sp-lateral" aria-label={t("Sua Biblioteca", "Your Library")}>
            <div className="sp-lateral-topo">
              <span className="sp-lateral-titulo">
                <IcBiblioteca /> {t("Sua Biblioteca", "Your Library")}
              </span>
              <span className="sp-mais">+</span>
            </div>
            <div className="sp-filtros">
              <span className="ativo">Playlists</span>
              <span>{t("Artistas", "Artists")}</span>
              <span>{t("Álbuns", "Albums")}</span>
            </div>
            <ul className="sp-bibliotecas">
              <li>
                <button className={lista === "curtidas" ? "ativo" : ""} onClick={() => abrirLista("curtidas")}>
                  <span className="sp-capa sp-capa-curtidas" style={{ width: 48, height: 48 }}>
                    ♥
                  </span>
                  <span>
                    <strong>{t("Músicas Curtidas", "Liked Songs")}</strong>
                    <small>
                      Playlist · {curtidas.size} {t("músicas", "songs")}
                    </small>
                  </span>
                </button>
              </li>
              <li>
                <button className={lista === "playlist" ? "ativo" : ""} onClick={() => abrirLista("playlist")}>
                  <Capa cor="#e0674a" tamanho={48} texto="lo-fi" />
                  <span>
                    <strong className={!emSpotify && atual !== null ? "verde" : ""}>{nomePlaylist}</strong>
                    <small>Playlist · {playlist.dono}</small>
                  </span>
                </button>
              </li>
              {playlistsSpotify.map((p) => (
                <li key={p.id}>
                  <button className={lista === `ext:${p.id}` ? "ativo" : ""} onClick={() => abrirLista(`ext:${p.id}`)}>
                    <Capa cor={p.cor} tamanho={48} texto={p.capa} semCodigo />
                    <span>
                      <strong className={emSpotify && sp.tocando ? "verde" : ""}>{p.curto}</strong>
                      <small>Playlist · Spotify</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <main className="sp-principal">
          {celular && (
            <div className="sp-chips">
              {playlistsSpotify.map((p) => (
                <button key={p.id} className={lista === `ext:${p.id}` ? "ativo" : ""} onClick={() => abrirLista(`ext:${p.id}`)}>
                  {p.curto}
                </button>
              ))}
              <button className={lista === "playlist" ? "ativo" : ""} onClick={() => abrirLista("playlist")}>
                {t("Pra codar", "For coding")}
              </button>
              <button className={lista === "curtidas" ? "ativo" : ""} onClick={() => abrirLista("curtidas")}>
                {t("Curtidas", "Liked")}
              </button>
            </div>
          )}

          {/* Página do Tarcísio: fica sempre montada (escondida quando não é a da vez) para a música não parar */}
          {tarcisio && (
            <div className={externa ? "" : "sp-oculta"} aria-hidden={!externa}>
              <div className="sp-cabecalho" style={{ ["--sp-cor" as string]: tarcisio.cor }}>
                <Capa cor={tarcisio.cor} tamanho={celular ? 130 : 180} texto={tarcisio.capa} semCodigo />
                <div className="sp-cabecalho-texto">
                  <span className="sp-tipo">Playlist</span>
                  <h1>{tarcisio.curto}</h1>
                  <p className="sp-descricao">{en ? tarcisio.descricaoEn : tarcisio.descricao}</p>
                  <p className="sp-meta">
                    <strong>Spotify</strong> · {faixasTarcisio.length} {t("músicas", "songs")}, {Math.floor(totalTarcisio / 3600)} h{" "}
                    {Math.floor((totalTarcisio % 3600) / 60)} min
                  </p>
                </div>
              </div>

              <div className="sp-acoes">
                <button className="sp-play-grande" onClick={alternarSpotify} aria-label={emSpotify && sp.tocando ? t("Pausar", "Pause") : t("Tocar", "Play")} disabled={!sp.pronto}>
                  {emSpotify && sp.tocando ? <IcPause t={22} /> : <IcPlay t={22} />}
                </button>
                <button className={`sp-icone${aleatorio ? " ligado" : ""}`} onClick={() => setAleatorio((v) => !v)} aria-label={t("Aleatório", "Shuffle")} title={t("Aleatório", "Shuffle")}>
                  <IcAleatorio />
                </button>
                <a className="sp-abrir" href={tarcisio.link} target="_blank" rel="noopener">
                  {t("Abrir no Spotify", "Open in Spotify")} ↗
                </a>
              </div>

              <div className="sp-embed-area">
                <div className="sp-embed-casa" ref={hospedeiro} />
                {sp.erro && (
                  <iframe
                    className="sp-embed sp-embed-alto"
                    title={`${tarcisio.nome} ${t("no Spotify", "on Spotify")}`}
                    src={`${linkEmbed(tarcisio.link)}?utm_source=generator&theme=0`}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                )}
              </div>

              {!sp.erro && (
                <table className="sp-faixas sp-faixas-spotify">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t("Título", "Title")}</th>
                      <th className="sp-dur" aria-label={t("Duração", "Duration")}>
                        <IcRelogio />
                      </th>
                    </tr>
                  </thead>
                  <tbody>{faixasTarcisio.map(linhaTarcisio)}</tbody>
                </table>
              )}
              <p className="sp-nota">
                {t(
                  "Toca pelo player oficial do Spotify: sem login, uma prévia de 30 segundos de cada música; logado no Spotify neste navegador, a música inteira.",
                  "Plays through Spotify's official player: without logging in you get a 30-second preview of each song; logged in to Spotify in this browser, the full song."
                )}
              </p>
            </div>
          )}

          {!externa && (
            <>
              <div className="sp-cabecalho" style={{ ["--sp-cor" as string]: lista === "curtidas" ? "#5038a0" : "#a3472f" }}>
                {lista === "curtidas" ? (
                  <span className="sp-capa sp-capa-curtidas sp-capa-grande">♥</span>
                ) : (
                  <Capa cor="#e0674a" tamanho={celular ? 130 : 180} texto="lo-fi pra codar" />
                )}
                <div className="sp-cabecalho-texto">
                  <span className="sp-tipo">{t("Playlist pública", "Public Playlist")}</span>
                  <h1>{titulo}</h1>
                  {lista === "playlist" && <p className="sp-descricao">{en ? playlist.descricaoEn : playlist.descricao}</p>}
                  <p className="sp-meta">
                    <strong>{playlist.dono}</strong> · {faixas.length} {t("músicas", "songs")}
                    {lista === "playlist" ? `, ${Math.floor(total / 60)} min ${total % 60} s` : ""}
                  </p>
                </div>
              </div>

              <div className="sp-acoes">
                <button className="sp-play-grande" onClick={alternar} aria-label={!emSpotify && tocando ? t("Pausar", "Pause") : t("Tocar", "Play")}>
                  {!emSpotify && tocando ? <IcPause t={22} /> : <IcPlay t={22} />}
                </button>
                <button className={`sp-icone${aleatorio ? " ligado" : ""}`} onClick={() => setAleatorio((v) => !v)} aria-label={t("Aleatório", "Shuffle")} title={t("Aleatório", "Shuffle")}>
                  <IcAleatorio />
                </button>
              </div>

              <table className="sp-faixas">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("Título", "Title")}</th>
                    {!celular && <th>{t("Álbum", "Album")}</th>}
                    {!celular && <th>{t("Adicionada em", "Date added")}</th>}
                    <th className="sp-dur" aria-label={t("Duração", "Duration")}>
                      <IcRelogio />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {faixas.map((m, i) => {
                    const indice = musicas.indexOf(m);
                    const esta = !emSpotify && atual === indice;
                    return (
                      <tr key={m.id} className={esta ? "atual" : ""} onDoubleClick={() => tocarIndice(indice)}>
                        <td className="sp-num">
                          <span className="sp-num-texto">{esta && tocando ? <Equalizador /> : i + 1}</span>
                          <button className="sp-num-play" onClick={() => (esta ? alternar() : tocarIndice(indice))} aria-label={`${t("Tocar", "Play")} ${m.titulo}`}>
                            {esta && tocando ? <IcPause t={13} /> : <IcPlay t={13} />}
                          </button>
                        </td>
                        <td>
                          <span className="sp-titulo">
                            <Capa cor={corDe(m)} tamanho={40} />
                            <span>
                              <strong>{m.titulo}</strong>
                              <small>{m.artista}</small>
                            </span>
                          </span>
                        </td>
                        {!celular && <td className="sp-fraco">{m.album}</td>}
                        {!celular && <td className="sp-fraco">{en ? m.adicionada.replace("há ", "").replace("dias", "days ago").replace("semanas", "weeks ago").replace("semana", "week ago").replace("mês", "month ago") : m.adicionada}</td>}
                        <td className="sp-dur sp-fraco">
                          <button className={`sp-curtir${curtidas.has(m.id) ? " ligado" : ""}`} onClick={() => curtir(m.id)} aria-label={t("Curtir", "Like")}>
                            <IcCoracao cheio={curtidas.has(m.id)} />
                          </button>
                          {tempo(m.duracao)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {lista === "curtidas" && faixas.length === 0 && (
                <p className="sp-vazio">{t("Curta uma música no coração ♡ e ela aparece aqui.", "Like a song with the heart ♡ and it shows up here.")}</p>
              )}
              <p className="sp-nota">
                {t(
                  "As músicas são geradas no navegador (Web Audio). Dá o play e deixa rodando enquanto vê o código. 🎧",
                  "These songs are generated in the browser (Web Audio). Hit play and leave it on while you look at the code. 🎧"
                )}
              </p>
            </>
          )}
        </main>
      </div>

      <footer className="sp-player">
        <div className="sp-agora">
          {barra.titulo ? (
            <>
              {emSpotify ? <Capa cor={tarcisio.cor} tamanho={celular ? 40 : 56} texto={tarcisio.capa} semCodigo /> : <Capa cor={corDe(musica!)} tamanho={celular ? 40 : 56} />}
              <span className="sp-agora-texto">
                <strong>{barra.titulo}</strong>
                <small>{barra.artista}</small>
              </span>
              {!celular && !emSpotify && musica && (
                <button className={`sp-curtir${curtidas.has(musica.id) ? " ligado" : ""}`} onClick={() => curtir(musica.id)} aria-label={t("Curtir", "Like")}>
                  <IcCoracao cheio={curtidas.has(musica.id)} />
                </button>
              )}
            </>
          ) : (
            <span className="sp-fraco">{t("Escolha uma música", "Pick a song")}</span>
          )}
        </div>

        <div className="sp-controles">
          <div className="sp-botoes">
            {!celular && (
              <button className={`sp-icone${aleatorio ? " ligado" : ""}`} onClick={() => setAleatorio((v) => !v)} aria-label={t("Aleatório", "Shuffle")} title={t("Aleatório", "Shuffle")}>
                <IcAleatorio />
              </button>
            )}
            <button className="sp-icone" onClick={() => pularBarra(-1)} aria-label={t("Anterior", "Previous")} title={t("Anterior", "Previous")}>
              <IcAnterior />
            </button>
            <button className="sp-play" onClick={playBarra} aria-label={barra.tocando ? t("Pausar", "Pause") : t("Tocar", "Play")}>
              {barra.tocando ? <IcPause t={14} /> : <IcPlay t={14} />}
            </button>
            <button className="sp-icone" onClick={() => pularBarra(1)} aria-label={t("Próxima", "Next")} title={t("Próxima", "Next")}>
              <IcProxima />
            </button>
            {!celular && (
              <button className={`sp-icone${repetir ? " ligado" : ""}`} onClick={() => setRepetir((v) => !v)} aria-label={t("Repetir", "Repeat")} title={t("Repetir", "Repeat")} aria-pressed={repetir}>
                <IcRepetir />
              </button>
            )}
          </div>
          <div className="sp-progresso">
            <span>{tempo(barra.pos)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(barra.dur))}
              step={1}
              value={Math.min(Math.floor(barra.pos), Math.floor(barra.dur))}
              onChange={(e) => buscarBarra(Number(e.target.value))}
              disabled={!barra.titulo}
              aria-label={t("Posição", "Position")}
              style={{ ["--p" as string]: `${barra.dur ? Math.min(100, (barra.pos / barra.dur) * 100) : 0}%` }}
            />
            <span>{tempo(barra.dur)}</span>
          </div>
        </div>

        {!celular && (
          <div
            className={`sp-volume${emSpotify ? " desligado" : ""}`}
            title={emSpotify ? t("O player do Spotify usa o volume do computador.", "The Spotify player uses your computer's volume.") : undefined}
          >
            <button className="sp-icone" onClick={() => setSemSom((v) => !v)} aria-label={semSom ? t("Ativar som", "Unmute") : t("Silenciar", "Mute")} disabled={emSpotify}>
              <IcVolume mudo={!emSpotify && (semSom || mudo || volume === 0)} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={emSpotify ? 1 : semSom ? 0 : volume}
              disabled={emSpotify}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setSemSom(false);
              }}
              aria-label="Volume"
              style={{ ["--p" as string]: `${(emSpotify ? 1 : semSom ? 0 : volume) * 100}%` }}
            />
          </div>
        )}
      </footer>
    </div>
  );
}
