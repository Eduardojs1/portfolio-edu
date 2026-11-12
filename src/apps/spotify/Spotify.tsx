import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { ouvir } from "../../sistema/eventos";
import { musicas, playlist, type Musica } from "../../dados/musicas";
import { perfil } from "../../dados/perfil";
import { IcFecharJanela, IcMaximizarJanela, IcMinimizarJanela, IcRestaurarJanela } from "../intellij/icones";
import { Lofi } from "./lofi";

const tempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const total = musicas.reduce((s, m) => s + m.duracao, 0);

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
    <span className="sp-eq" aria-label="tocando">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function Capa({ cor, texto, tamanho }: { cor: string; texto?: string; tamanho: number }) {
  return (
    <span
      className="sp-capa"
      style={{ width: tamanho, height: tamanho, fontSize: Math.max(8, tamanho * 0.12), background: `linear-gradient(135deg, ${cor}, #1b1b1f 85%)` }}
      aria-hidden="true"
    >
      {texto && <span>{texto}</span>}
    </span>
  );
}

type Lista = "playlist" | "curtidas";

export function Spotify({ janela }: { janela: ControleJanela }) {
  const { celular, mudo } = useSistema();
  const motor = useRef<Lofi | null>(null);
  const [atual, setAtual] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const [pos, setPos] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [semSom, setSemSom] = useState(false);
  const [curtidas, setCurtidas] = useState<Set<string>>(() => new Set(["build", "tomcat"]));
  const [lista, setLista] = useState<Lista>("playlist");
  const [aleatorio, setAleatorio] = useState(false);

  const faixas = useMemo(() => (lista === "curtidas" ? musicas.filter((m) => curtidas.has(m.id)) : musicas), [lista, curtidas]);
  const musica = atual !== null ? musicas[atual] : null;

  const tocarIndice = useCallback((i: number, aPartirDe = 0) => {
    if (!motor.current) motor.current = new Lofi();
    motor.current.tocar(musicas[i], aPartirDe);
    setAtual(i);
    setTocando(true);
    setPos(aPartirDe);
  }, []);

  const proxima = useCallback(
    (passo = 1) => {
      const base = atual ?? 0;
      const i = aleatorio && passo > 0 ? Math.floor(Math.random() * musicas.length) : (base + passo + musicas.length) % musicas.length;
      tocarIndice(i);
    },
    [atual, aleatorio, tocarIndice]
  );

  const alternar = () => {
    if (atual === null) return tocarIndice(lista === "curtidas" && faixas[0] ? musicas.indexOf(faixas[0]) : 0);
    if (tocando) {
      motor.current?.pausar();
      setTocando(false);
    } else {
      motor.current?.continuar();
      setTocando(true);
    }
  };

  // Fim da faixa: vai para a próxima
  useEffect(() => {
    if (motor.current) motor.current.onFim = () => proxima(1);
  }, [proxima, atual]);

  // Tempo da faixa
  useEffect(() => {
    if (!tocando) return;
    const t = window.setInterval(() => setPos(motor.current?.tempo ?? 0), 250);
    return () => window.clearInterval(t);
  }, [tocando]);

  // Volume (e o mudo da barra de tarefas)
  useEffect(() => {
    motor.current?.definirVolume(volume, semSom || mudo);
  }, [volume, semSom, mudo, atual]);

  // Fechou a janela: desliga o som
  useEffect(() => () => motor.current?.fechar(), []);

  // Pedido do menu Iniciar: "Músicas pra codar"
  useEffect(() => ouvir("spotify:tocar", () => tocarIndice(0)), [tocarIndice]);

  const curtir = (id: string) =>
    setCurtidas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const titulo = lista === "curtidas" ? "Músicas Curtidas" : playlist.nome;

  return (
    <div className={`sp${celular ? " celular" : ""}`}>
      <header className="sp-topo" data-arrastar>
        {!celular && (
          <span className="sp-navegacao">
            <button aria-label="Voltar" onClick={() => setLista("playlist")}>
              <IcSeta esq />
            </button>
            <button aria-label="Avançar" disabled>
              <IcSeta />
            </button>
          </span>
        )}
        <span className="espaco" />
        <button className="sp-casa" aria-label="Início" title="Início" onClick={() => setLista("playlist")}>
          <IcCasa />
        </button>
        <label className="sp-busca">
          <IcBusca />
          <input placeholder="O que você quer ouvir?" aria-label="Buscar" />
        </label>
        <span className="espaco" />
        <span className="sp-avatar" title={perfil.nome}>
          {perfil.nome[0]}
        </span>
        {!celular && (
          <span className="sp-janela" data-nao-arrastar>
            <button onClick={janela.minimizar} aria-label="Minimizar">
              <IcMinimizarJanela />
            </button>
            <button onClick={janela.alternarMaximizar} aria-label={janela.maximizada ? "Restaurar" : "Maximizar"}>
              {janela.maximizada ? <IcRestaurarJanela /> : <IcMaximizarJanela />}
            </button>
            <button className="fechar" onClick={janela.fechar} aria-label="Fechar">
              <IcFecharJanela />
            </button>
          </span>
        )}
      </header>

      <div className="sp-meio">
        {!celular && (
          <aside className="sp-lateral" aria-label="Sua Biblioteca">
            <div className="sp-lateral-topo">
              <span className="sp-lateral-titulo">
                <IcBiblioteca /> Sua Biblioteca
              </span>
              <span className="sp-mais">+</span>
            </div>
            <div className="sp-filtros">
              <span className="ativo">Playlists</span>
              <span>Artistas</span>
              <span>Álbuns</span>
            </div>
            <ul className="sp-bibliotecas">
              <li>
                <button className={lista === "curtidas" ? "ativo" : ""} onClick={() => setLista("curtidas")}>
                  <span className="sp-capa sp-capa-curtidas" style={{ width: 48, height: 48 }}>
                    ♥
                  </span>
                  <span>
                    <strong>Músicas Curtidas</strong>
                    <small>Playlist · {curtidas.size} músicas</small>
                  </span>
                </button>
              </li>
              <li>
                <button className={lista === "playlist" ? "ativo" : ""} onClick={() => setLista("playlist")}>
                  <Capa cor="#e0674a" tamanho={48} texto="lo-fi" />
                  <span>
                    <strong className={atual !== null ? "verde" : ""}>{playlist.nome}</strong>
                    <small>Playlist · {playlist.dono}</small>
                  </span>
                </button>
              </li>
            </ul>
          </aside>
        )}

        <main className="sp-principal">
          <div className="sp-cabecalho" style={{ ["--sp-cor" as string]: lista === "curtidas" ? "#5038a0" : "#a3472f" }}>
            {lista === "curtidas" ? (
              <span className="sp-capa sp-capa-curtidas sp-capa-grande">♥</span>
            ) : (
              <Capa cor="#e0674a" tamanho={celular ? 130 : 180} texto="lo-fi pra codar" />
            )}
            <div className="sp-cabecalho-texto">
              <span className="sp-tipo">Playlist pública</span>
              <h1>{titulo}</h1>
              {lista === "playlist" && <p className="sp-descricao">{playlist.descricao}</p>}
              <p className="sp-meta">
                <strong>{playlist.dono}</strong> · {faixas.length} músicas{lista === "playlist" ? `, ${Math.floor(total / 60)} min ${total % 60} s` : ""}
              </p>
            </div>
          </div>

          <div className="sp-acoes">
            <button className="sp-play-grande" onClick={alternar} aria-label={tocando ? "Pausar" : "Tocar"}>
              {tocando ? <IcPause t={22} /> : <IcPlay t={22} />}
            </button>
            <button className={`sp-icone${aleatorio ? " ligado" : ""}`} onClick={() => setAleatorio((v) => !v)} aria-label="Aleatório" title="Aleatório">
              <IcAleatorio />
            </button>
            <span className="sp-icone">•••</span>
          </div>

          <table className="sp-faixas">
            <thead>
              <tr>
                <th>#</th>
                <th>Título</th>
                {!celular && <th>Álbum</th>}
                {!celular && <th>Adicionada em</th>}
                <th className="sp-dur" aria-label="Duração">
                  <IcRelogio />
                </th>
              </tr>
            </thead>
            <tbody>
              {faixas.map((m, i) => {
                const indice = musicas.indexOf(m);
                const esta = atual === indice;
                return (
                  <tr key={m.id} className={esta ? "atual" : ""} onDoubleClick={() => tocarIndice(indice)}>
                    <td className="sp-num">
                      <span className="sp-num-texto">{esta && tocando ? <Equalizador /> : i + 1}</span>
                      <button className="sp-num-play" onClick={() => (esta ? alternar() : tocarIndice(indice))} aria-label={`Tocar ${m.titulo}`}>
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
                    {!celular && <td className="sp-fraco">{m.adicionada}</td>}
                    <td className="sp-dur sp-fraco">
                      <button className={`sp-curtir${curtidas.has(m.id) ? " ligado" : ""}`} onClick={() => curtir(m.id)} aria-label="Curtir">
                        <IcCoracao cheio={curtidas.has(m.id)} />
                      </button>
                      {tempo(m.duracao)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lista === "curtidas" && faixas.length === 0 && <p className="sp-vazio">Curta uma música no coração ♡ e ela aparece aqui.</p>}
          <p className="sp-nota">
            As músicas são geradas no navegador (Web Audio). Dá o play e deixa rodando enquanto vê o código. 🎧
          </p>
        </main>
      </div>

      <footer className="sp-player">
        <div className="sp-agora">
          {musica ? (
            <>
              <Capa cor={corDe(musica)} tamanho={celular ? 40 : 56} />
              <span className="sp-agora-texto">
                <strong>{musica.titulo}</strong>
                <small>{musica.artista}</small>
              </span>
              {!celular && (
                <button className={`sp-curtir${curtidas.has(musica.id) ? " ligado" : ""}`} onClick={() => curtir(musica.id)} aria-label="Curtir">
                  <IcCoracao cheio={curtidas.has(musica.id)} />
                </button>
              )}
            </>
          ) : (
            <span className="sp-fraco">Escolha uma música</span>
          )}
        </div>

        <div className="sp-controles">
          <div className="sp-botoes">
            {!celular && (
              <button className={`sp-icone${aleatorio ? " ligado" : ""}`} onClick={() => setAleatorio((v) => !v)} aria-label="Aleatório">
                <IcAleatorio />
              </button>
            )}
            <button className="sp-icone" onClick={() => proxima(-1)} aria-label="Anterior">
              <IcAnterior />
            </button>
            <button className="sp-play" onClick={alternar} aria-label={tocando ? "Pausar" : "Tocar"}>
              {tocando ? <IcPause t={14} /> : <IcPlay t={14} />}
            </button>
            <button className="sp-icone" onClick={() => proxima(1)} aria-label="Próxima">
              <IcProxima />
            </button>
            {!celular && (
              <span className="sp-icone">
                <IcRepetir />
              </span>
            )}
          </div>
          <div className="sp-progresso">
            <span>{tempo(pos)}</span>
            <input
              type="range"
              min={0}
              max={musica?.duracao ?? 1}
              step={1}
              value={Math.min(pos, musica?.duracao ?? 0)}
              onChange={(e) => atual !== null && tocarIndice(atual, Number(e.target.value))}
              aria-label="Posição"
              style={{ ["--p" as string]: `${musica ? (pos / musica.duracao) * 100 : 0}%` }}
            />
            <span>{tempo(musica?.duracao ?? 0)}</span>
          </div>
        </div>

        {!celular && (
          <div className="sp-volume">
            <button className="sp-icone" onClick={() => setSemSom((v) => !v)} aria-label={semSom ? "Ativar som" : "Silenciar"}>
              <IcVolume mudo={semSom || mudo || volume === 0} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={semSom ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setSemSom(false);
              }}
              aria-label="Volume"
              style={{ ["--p" as string]: `${(semSom ? 0 : volume) * 100}%` }}
            />
          </div>
        )}
      </footer>
    </div>
  );
}
