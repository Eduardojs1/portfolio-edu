import { useEffect, useRef, useState } from "react";
import { projetos } from "../../dados/projetos";
import { estudando, stack } from "../../dados/stack";
import { perfil } from "../../dados/perfil";
import type { Sessao } from "./execucao";
import { fases } from "./execucao";
import { acharArquivo } from "./projeto";
import {
  IcAdicionar,
  IcArquivo,
  IcBaixar,
  IcBanco,
  IcCommitGrafo,
  IcDependencia,
  IcExecutar,
  IcExpandir,
  IcFechar,
  IcObjetivo,
  IcParar,
  IcPlugin,
  IcRaio,
  IcRecarregar,
  IcRecolher,
  IcReexecutar,
  IcRemover,
  IcSeta,
  IcSpringBoot,
} from "./icones";

// ---------------------------------------------------------------------------
// Run: abas das execuções e o console
// ---------------------------------------------------------------------------
type PropsRun = {
  sessoes: Sessao[];
  ativa: number | null;
  onAtivar: (id: number) => void;
  onFecharSessao: (id: number) => void;
  onParar: (id: number) => void;
  onReexecutar: (s: Sessao) => void;
  onLink: (destino: string) => void;
};

export function JanelaRun({ sessoes, ativa, onAtivar, onFecharSessao, onParar, onReexecutar, onLink }: PropsRun) {
  const sessao = sessoes.find((s) => s.id === ativa) ?? sessoes[sessoes.length - 1];
  const corpo = useRef<HTMLDivElement>(null);
  const mostradas = sessao?.mostradas ?? 0;

  useEffect(() => {
    const c = corpo.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [mostradas, sessao?.id]);

  if (!sessao) return <div className="tw-vazio">Nada rodando. Aperte Shift+F10 para rodar o PortfolioApplication.</div>;

  return (
    <div className="tw-run">
      <div className="tw-abas">
        {sessoes.map((s) => (
          <span key={s.id} className={`tw-aba${s.id === sessao.id ? " ativa" : ""}`}>
            <button onClick={() => onAtivar(s.id)}>
              {s.tipo === "maven" ? <IcArquivo tipo="maven" tamanho={14} /> : <IcSpringBoot tamanho={14} />}
              {s.titulo}
              {s.rodando && !s.terminou && <span className="tw-girando" aria-label="rodando" />}
            </button>
            <button className="tw-aba-fechar" onClick={() => onFecharSessao(s.id)} aria-label={`Fechar ${s.titulo}`}>
              <IcFechar tamanho={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="tw-run-corpo">
        <div className="tw-run-botoes">
          <button onClick={() => onReexecutar(sessao)} title="Rerun" aria-label="Rodar de novo">
            <IcReexecutar />
          </button>
          <button onClick={() => onParar(sessao.id)} disabled={!sessao.rodando} title="Stop" aria-label="Parar">
            <IcParar ativo={sessao.rodando} />
          </button>
        </div>
        <div className="tw-console" ref={corpo} role="log">
          {sessao.linhas.slice(0, sessao.mostradas).map((l, i) => (
            <p key={i} className="tw-console-linha">
              {l.pecas.map((p, j) =>
                l.link && p.c === "c-link" ? (
                  <a
                    key={j}
                    href="#"
                    className="c-link"
                    onClick={(e) => {
                      e.preventDefault();
                      onLink(l.link!);
                    }}
                  >
                    {p.t}
                  </a>
                ) : (
                  <span key={j} className={p.c}>
                    {p.t}
                  </span>
                )
              )}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Maven (direita)
// ---------------------------------------------------------------------------
type ItemArvore = { id: string; rotulo: string; icone: React.ReactNode; filhos?: ItemArvore[]; acao?: () => void; dica?: string };

function MiniArvore({ itens, abertos, alternar, nivel = 0, sel, setSel }: {
  itens: ItemArvore[];
  abertos: Set<string>;
  alternar: (id: string) => void;
  nivel?: number;
  sel: string | null;
  setSel: (id: string) => void;
}) {
  return (
    <>
      {itens.map((it) => {
        const aberto = abertos.has(it.id);
        return (
          <li key={it.id} role="none">
            <button
              role="treeitem"
              className={`ij-no${sel === it.id ? " sel" : ""}`}
              style={{ paddingLeft: 6 + nivel * 18 }}
              onClick={() => {
                setSel(it.id);
                if (it.filhos) alternar(it.id);
              }}
              onDoubleClick={it.acao}
              title={it.acao ? "Duplo clique para rodar" : undefined}
            >
              <span className="ij-no-seta">{it.filhos && <IcSeta aberta={aberto} />}</span>
              {it.icone}
              <span className="ij-no-nome">{it.rotulo}</span>
              {it.dica && <span className="ij-no-dica">{it.dica}</span>}
            </button>
            {it.filhos && aberto && (
              <ul role="group">
                <MiniArvore itens={it.filhos} abertos={abertos} alternar={alternar} nivel={nivel + 1} sel={sel} setSel={setSel} />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}

function useAbertos(iniciais: string[]) {
  const [abertos, setAbertos] = useState(() => new Set(iniciais));
  const alternar = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  return { abertos, alternar, setAbertos };
}

const dependencias = [
  "org.springframework.boot:spring-boot-starter-web",
  "org.springframework.boot:spring-boot-starter-thymeleaf",
  "org.springframework.boot:spring-boot-starter-data-jdbc",
  "org.flywaydb:flyway-database-postgresql",
  "org.postgresql:postgresql (runtime)",
  "org.springframework.boot:spring-boot-devtools (runtime)",
  "org.springframework.boot:spring-boot-starter-test (test)",
];

export function JanelaMaven({ onObjetivo, onRodar }: { onObjetivo: (o: string) => void; onRodar: () => void }) {
  const { abertos, alternar, setAbertos } = useAbertos(["m", "m/ciclo"]);
  const [sel, setSel] = useState<string | null>(null);
  const itens: ItemArvore[] = [
    { id: "perfis", rotulo: "Profiles", icone: <IcObjetivo />, filhos: [{ id: "perfis/dev", rotulo: "dev", icone: <input type="checkbox" defaultChecked aria-label="dev" /> }] },
    {
      id: "m",
      rotulo: "portfolio",
      icone: <IcArquivo tipo="maven" />,
      filhos: [
        {
          id: "m/ciclo",
          rotulo: "Lifecycle",
          icone: <IcObjetivo />,
          filhos: fases.map((f) => ({ id: `m/ciclo/${f}`, rotulo: f, icone: <IcObjetivo />, acao: () => onObjetivo(f) })),
        },
        {
          id: "m/plugins",
          rotulo: "Plugins",
          icone: <IcPlugin />,
          filhos: [
            { id: "m/plugins/sb", rotulo: "spring-boot", icone: <IcPlugin />, filhos: [{ id: "m/plugins/sb/run", rotulo: "spring-boot:run", icone: <IcObjetivo />, acao: onRodar }] },
            { id: "m/plugins/compiler", rotulo: "compiler", icone: <IcPlugin /> },
            { id: "m/plugins/surefire", rotulo: "surefire", icone: <IcPlugin /> },
          ],
        },
        {
          id: "m/deps",
          rotulo: "Dependencies",
          icone: <IcDependencia />,
          filhos: dependencias.map((d) => ({ id: `m/deps/${d}`, rotulo: d, icone: <IcDependencia /> })),
        },
      ],
    },
  ];
  const objetivoSel = sel?.startsWith("m/ciclo/") ? sel.split("/").pop()! : sel === "m/plugins/sb/run" ? "run" : null;
  return (
    <div className="tw-coluna">
      <div className="tw-barra">
        <button title="Reload All Maven Projects" aria-label="Recarregar"><IcRecarregar /></button>
        <button title="Download Sources" aria-label="Baixar"><IcBaixar /></button>
        <button title="Add Maven Project" aria-label="Adicionar"><IcAdicionar /></button>
        <button title="Remove" aria-label="Remover" disabled><IcRemover /></button>
        <span className="tw-sep" />
        <button
          title="Run Maven Build"
          aria-label="Rodar objetivo"
          disabled={!objetivoSel}
          onClick={() => (objetivoSel === "run" ? onRodar() : objetivoSel && onObjetivo(objetivoSel))}
        >
          <IcExecutar />
        </button>
        <button title="Execute Maven Goal" aria-label="Executar objetivo" onClick={() => onObjetivo("package")}><IcRaio /></button>
        <span className="tw-sep" />
        <button title="Expand All" aria-label="Expandir" onClick={() => setAbertos(new Set(["perfis", "m", "m/ciclo", "m/plugins", "m/plugins/sb", "m/deps"]))}><IcExpandir /></button>
        <button title="Collapse All" aria-label="Recolher" onClick={() => setAbertos(new Set())}><IcRecolher /></button>
      </div>
      <ul className="ij-arvore" role="tree" aria-label="Maven">
        <MiniArvore itens={itens} abertos={abertos} alternar={alternar} sel={sel} setSel={setSel} />
      </ul>
      <p className="tw-rodape-dica">Duplo clique numa fase do Lifecycle para rodar.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Database (direita): o mesmo banco do DataGrip
// ---------------------------------------------------------------------------
export function JanelaBanco({ onDataGrip }: { onDataGrip: () => void }) {
  const { abertos, alternar } = useAbertos(["db", "db/portfolio", "db/portfolio/public", "db/t"]);
  const [sel, setSel] = useState<string | null>(null);
  const tabelas = [
    ["projetos", projetos.length],
    ["tecnologias", stack.reduce((n, g) => n + g.itens.length, 0)],
    ["formacao", perfil.formacao.length],
    ["contato", 4],
  ] as const;
  const itens: ItemArvore[] = [
    {
      id: "db",
      rotulo: "portfolio@localhost",
      dica: "1 of 3",
      icone: <IcBanco tamanho={16} />,
      filhos: [
        {
          id: "db/portfolio",
          rotulo: "portfolio",
          icone: <IcBanco tamanho={16} />,
          filhos: [
            {
              id: "db/portfolio/public",
              rotulo: "public",
              icone: <IcObjetivo />,
              filhos: [
                {
                  id: "db/t",
                  rotulo: "tables",
                  dica: `${tabelas.length}`,
                  icone: <IcDependencia />,
                  filhos: tabelas.map(([t, n]) => ({ id: `db/t/${t}`, rotulo: t, dica: `${n} linhas`, icone: <IcDependencia />, acao: onDataGrip })),
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  return (
    <div className="tw-coluna">
      <div className="tw-barra">
        <button title="New" aria-label="Novo"><IcAdicionar /></button>
        <button title="Refresh" aria-label="Atualizar"><IcRecarregar /></button>
      </div>
      <ul className="ij-arvore" role="tree" aria-label="Banco de dados">
        <MiniArvore itens={itens} abertos={abertos} alternar={alternar} sel={sel} setSel={setSel} />
      </ul>
      <button className="tw-botao-azul" onClick={onDataGrip}>
        Abrir no DataGrip
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Git (embaixo): log com os commits de verdade do repositório
// ---------------------------------------------------------------------------
export function JanelaGit() {
  const commits = __GIT__.commits;
  const [sel, setSel] = useState(0);
  const c = commits[sel];
  const data = (iso: string) => {
    const d = new Date(iso);
    return isNaN(+d) ? iso : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  return (
    <div className="tw-git">
      <div className="tw-git-ramos">
        <p className="tw-git-titulo">HEAD (Current Branch)</p>
        <p className="tw-git-grupo">Local</p>
        <p className="tw-git-ramo">★ {__GIT__.branch}</p>
        <p className="tw-git-grupo">Remote</p>
        <p className="tw-git-ramo">origin/{__GIT__.branch}</p>
      </div>
      <div className="tw-git-lista" role="listbox" aria-label="Commits">
        {commits.length ? (
          commits.map((cm, i) => (
            <button key={cm.hash} role="option" aria-selected={i === sel} className={`tw-git-commit${i === sel ? " sel" : ""}`} onClick={() => setSel(i)}>
              <IcCommitGrafo cor={i === 0 ? "var(--ij-ico-verde, #5fb865)" : "var(--ij-ico-azul, #548af7)"} />
              <span className="tw-git-msg">
                {cm.msg}
                {i === 0 && (
                  <>
                    <span className="tw-git-tag">{__GIT__.branch}</span>
                    <span className="tw-git-tag tw-git-tag-2">origin/{__GIT__.branch}</span>
                  </>
                )}
              </span>
              <span className="tw-git-autor">{cm.autor}</span>
              <span className="tw-git-data">{data(cm.data)}</span>
            </button>
          ))
        ) : (
          <p className="tw-vazio">Sem histórico neste build.</p>
        )}
      </div>
      {c && (
        <div className="tw-git-detalhe">
          <p className="tw-git-detalhe-msg">{c.msg}</p>
          <p>
            <span className="tw-git-hash">{c.hash}</span> {c.autor}
          </p>
          <p>{data(c.data)}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pequenas: Problems, Commit, Structure, Services, Notifications
// ---------------------------------------------------------------------------
export function JanelaProblemas() {
  return (
    <div className="tw-problemas">
      <p className="tw-problemas-ok">
        <span aria-hidden="true">✓</span> Nenhum problema no projeto
      </p>
      <p className="tw-vazio">
        {projetos.length} projetos, {stack.reduce((n, g) => n + g.itens.length, 0)} tecnologias e nenhum warning. Por enquanto.
      </p>
    </div>
  );
}

export function JanelaCommit() {
  return (
    <div className="tw-coluna tw-commit">
      <p className="tw-commit-titulo">Changes</p>
      <p className="tw-vazio">Nenhuma alteração. Tudo commitado em {__GIT__.branch}.</p>
      <textarea className="tw-commit-msg" placeholder="Commit Message" disabled />
      <div className="tw-commit-botoes">
        <button disabled>Commit</button>
        <button disabled>Commit and Push…</button>
      </div>
    </div>
  );
}

export function JanelaEstrutura({ arquivoId }: { arquivoId: string | null }) {
  const a = arquivoId ? acharArquivo(arquivoId) : undefined;
  if (!a || a.ling !== "java") return <div className="tw-vazio">Abra uma classe Java para ver a estrutura.</div>;
  const texto = a.texto ?? "";
  const classe = /(?:class|record|enum|interface)\s+(\w+)/.exec(texto)?.[1] ?? a.nome;
  const membros = [...texto.matchAll(/^ {4}(?:public |private |protected )?(?:static )?(?:final )?([\w<>[\], ]+?)\s+(\w+)\s*(\(|=|;)/gm)]
    .filter((m) => !["return", "new"].includes(m[1]))
    .map((m) => ({ nome: m[2], tipo: m[1], metodo: m[3] === "(" }));
  const constantes = a.icone === "enum" ? stack.map((g) => g.grupo) : [];
  return (
    <ul className="ij-arvore tw-estrutura">
      <li className="tw-estrutura-raiz">
        <IcArquivo tipo={a.icone} /> {classe}
      </li>
      {constantes.map((c) => (
        <li key={c}>
          <span className="tw-m tw-m-f">f</span> {c}
        </li>
      ))}
      {membros.map((m) => (
        <li key={m.nome + m.tipo}>
          <span className={`tw-m ${m.metodo ? "tw-m-m" : "tw-m-f"}`}>{m.metodo ? "m" : "f"}</span> {m.nome}
          {m.metodo ? "()" : ""}: <span className="tw-m-tipo">{m.tipo}</span>
        </li>
      ))}
      {a.icone === "enum" && (
        <li className="tw-vazio">ESTUDANDO: {estudando.join(", ")}</li>
      )}
    </ul>
  );
}

export function JanelaServicos({ appRodando, onRodar, onParar }: { appRodando: boolean; onRodar: () => void; onParar: () => void }) {
  return (
    <div className="tw-servicos">
      <ul className="ij-arvore">
        <li className="tw-servico-grupo">
          <IcSpringBoot /> Spring Boot
        </li>
        <li className="tw-servico">
          <span className={`tw-bolinha${appRodando ? " on" : ""}`} />
          <IcArquivo tipo="aplicacao" /> PortfolioApplication
          {appRodando && <span className="tw-servico-porta">:8080/</span>}
          <span className="espaco" />
          {appRodando ? (
            <button onClick={onParar} aria-label="Parar" title="Stop">
              <IcParar />
            </button>
          ) : (
            <button onClick={onRodar} aria-label="Rodar" title="Run">
              <IcExecutar />
            </button>
          )}
        </li>
        <li className="tw-servico-grupo">
          <IcArquivo tipo="docker" /> Docker
        </li>
        <li className="tw-servico">
          <span className="tw-bolinha on" /> portfolio-banco-1 <span className="tw-servico-porta">postgres:17 · 5432</span>
        </li>
      </ul>
    </div>
  );
}

export type Notificacao = {
  id: number;
  titulo: string;
  texto: string;
  hora: string;
  acoes?: { rotulo: string; acao: () => void }[];
};

export function JanelaNotificacoes({ lista, onLimpar }: { lista: Notificacao[]; onLimpar: () => void }) {
  return (
    <div className="tw-coluna">
      <div className="tw-barra">
        <span className="tw-barra-titulo">{lista.length ? `${lista.length} notificações` : "Sem notificações"}</span>
        <span className="espaco" />
        {!!lista.length && (
          <button className="tw-link" onClick={onLimpar}>
            Clear all
          </button>
        )}
      </div>
      <ul className="tw-notificacoes">
        {[...lista].reverse().map((n) => (
          <li key={n.id}>
            <p className="tw-not-titulo">
              {n.titulo} <span>{n.hora}</span>
            </p>
            <p className="tw-not-texto">{n.texto}</p>
            {n.acoes && (
              <p className="tw-not-acoes">
                {n.acoes.map((a) => (
                  <button key={a.rotulo} className="tw-link" onClick={a.acao}>
                    {a.rotulo}
                  </button>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

