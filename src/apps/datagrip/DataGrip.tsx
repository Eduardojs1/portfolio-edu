import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { IconeDataGrip } from "../../sistema/icones";
import { sql as realcarSql } from "../intellij/realce";
import { tabelas, formatar, type Tabela, type Valor } from "./banco";
import { executar, type Resultado } from "./sql";
import {
  IcAdicionar,
  IcBanco,
  IcBusca,
  IcChevron,
  IcEngrenagem,
  IcExecutar,
  IcFavoritos,
  IcFechar,
  IcFecharJanela,
  IcMaximizarJanela,
  IcMenu,
  IcMinimizarJanela,
  IcOcultar,
  IcProblemas,
  IcProjeto,
  IcRecarregar,
  IcRecolher,
  IcRestaurarJanela,
  IcSeta,
  IcServicos,
} from "../intellij/icones";

const CONSOLE = "::console";

const textoInicial = `-- Os projetos do Eduardo, direto do banco.
-- Coloque o cursor numa consulta e aperte Ctrl+Enter (ou o ▶ verde).

SELECT nome, tipo, stack
FROM projetos
ORDER BY id;

SELECT area, nome
FROM tecnologias
WHERE estudando = false
ORDER BY area;

SELECT * FROM tecnologias WHERE estudando = true;

SELECT nome FROM projetos WHERE 'Three.js' = ANY(stack);

SELECT * FROM contato;
`;

// Ícones pequenos do DataGrip
const IcTabela = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" style={{ flex: "none" }}>
    <rect x="2" y="3" width="12" height="10" rx="1.2" fill="none" stroke="#548af7" strokeWidth="1.1" />
    <path d="M2 6.5h12M6.5 6.5V13" stroke="#548af7" strokeWidth="1.1" />
  </svg>
);
const IcColuna = ({ pk }: { pk?: boolean }) =>
  pk ? (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" style={{ flex: "none" }}>
      <circle cx="5.5" cy="8" r="2.6" fill="none" stroke="#d6a14b" strokeWidth="1.2" />
      <path d="M8 8h6M12 8v2.5M14 8v2" stroke="#d6a14b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" style={{ flex: "none" }}>
      <rect x="5" y="2.5" width="6" height="11" rx="1" fill="none" stroke="#9da0a8" strokeWidth="1.1" />
      <path d="M5 6h6M5 9.5h6" stroke="#9da0a8" strokeWidth="1.1" />
    </svg>
  );
const IcConsole = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" style={{ flex: "none" }}>
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="#9da0a8" strokeWidth="1.1" />
    <text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="700" fill="#548af7" fontFamily="Inter, sans-serif">
      SQL
    </text>
  </svg>
);

// ---------------------------------------------------------------------------
// Grade de resultados
// ---------------------------------------------------------------------------
function Grade({ colunas, linhas, tabela }: { colunas: string[]; linhas: Valor[][]; tabela?: Tabela }) {
  const [sel, setSel] = useState<[number, number] | null>(null);
  const pk = (c: string) => tabela?.colunas.find((x) => x.nome === c)?.pk;
  const tipo = (c: string) => tabela?.colunas.find((x) => x.nome === c)?.tipo ?? "";
  return (
    <div className="dg-grade-rolagem">
      <table className="dg-grade">
        <thead>
          <tr>
            <th className="dg-n" />
            {colunas.map((c) => (
              <th key={c} title={tipo(c)}>
                <span className="dg-th">
                  <IcColuna pk={pk(c)} />
                  {c}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i} className={sel?.[0] === i ? "linha-sel" : undefined}>
              <td className="dg-n">{i + 1}</td>
              {l.map((v, j) => (
                <td
                  key={j}
                  className={`${v === null ? "dg-null" : typeof v === "number" ? "dg-numero" : typeof v === "boolean" ? "dg-bool" : ""}${sel?.[0] === i && sel?.[1] === j ? " sel" : ""}`}
                  onClick={() => setSel([i, j])}
                  title={formatar(v)}
                >
                  {formatar(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor do console (textarea com o realce por baixo)
// ---------------------------------------------------------------------------
function Console({ texto, setTexto, onExecutar }: { texto: string; setTexto: (t: string) => void; onExecutar: (sql: string) => void }) {
  const area = useRef<HTMLTextAreaElement>(null);
  const fundo = useRef<HTMLPreElement>(null);
  const numeros = useRef<HTMLDivElement>(null);
  const linhas = useMemo(() => realcarSql(texto), [texto]);

  const sincronizar = () => {
    const a = area.current;
    if (!a) return;
    if (fundo.current) {
      fundo.current.scrollTop = a.scrollTop;
      fundo.current.scrollLeft = a.scrollLeft;
    }
    if (numeros.current) numeros.current.scrollTop = a.scrollTop;
  };

  // A consulta onde está o cursor (ou o texto selecionado)
  const consultaAtual = () => {
    const a = area.current!;
    if (a.selectionStart !== a.selectionEnd) return texto.slice(a.selectionStart, a.selectionEnd);
    const pos = a.selectionStart;
    let inicio = 0;
    const pedacos = texto.split(";").map((p) => {
      const r = { texto: p, de: inicio, ate: inicio + p.length };
      inicio += p.length + 1;
      return r;
    });
    const util = (p: string) => p.split("\n").some((l) => l.replace(/--.*$/, "").trim());
    const atual = pedacos.find((p) => pos >= p.de && pos <= p.ate + 1);
    if (atual && util(atual.texto)) return atual.texto;
    return pedacos.find((p) => p.de >= pos && util(p.texto))?.texto ?? pedacos.find((p) => util(p.texto))?.texto ?? "";
  };

  return (
    <div className="dg-console">
      <div className="dg-numeros" ref={numeros} aria-hidden="true">
        {linhas.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
      <div className="dg-area">
        <pre className="dg-realce" ref={fundo} aria-hidden="true">
          {linhas.map((l, i) => (
            <span key={i} className="dg-realce-linha">
              {l.map((p, j) => (
                <span key={j} className={p.c}>
                  {p.t}
                </span>
              ))}
              {"\n"}
            </span>
          ))}
        </pre>
        <textarea
          ref={area}
          value={texto}
          spellCheck={false}
          aria-label="Console SQL"
          onChange={(e) => setTexto(e.target.value)}
          onScroll={sincronizar}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onExecutar(consultaAtual());
            } else if (e.key === "Tab") {
              e.preventDefault();
              const a = e.currentTarget;
              const s = a.selectionStart;
              setTexto(texto.slice(0, s) + "    " + texto.slice(a.selectionEnd));
              requestAnimationFrame(() => a.setSelectionRange(s + 4, s + 4));
            }
          }}
        />
        <button className="dg-executar-flutuante" onClick={() => onExecutar(consultaAtual())} title="Execute (Ctrl+Enter)" aria-label="Executar consulta">
          <IcExecutar tamanho={14} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
type Saida = { id: number; sql: string; resultado: Resultado; hora: string };

export function DataGrip({ janela }: { janela: ControleJanela }) {
  const { celular } = useSistema();
  const [explorer, setExplorer] = useState(!celular);
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set(["db", "db/portfolio", "db/portfolio/public", "db/tabelas"]));
  const [selArvore, setSelArvore] = useState<string | null>(null);
  const [abas, setAbas] = useState<string[]>([CONSOLE]);
  const [ativa, setAtiva] = useState(CONSOLE);
  const [texto, setTexto] = useState(textoInicial);
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [abaResultado, setAbaResultado] = useState<"saida" | "resultado">("resultado");
  const [resultadosAbertos, setResultadosAbertos] = useState(true);
  const contador = useRef(0);

  const rodar = useCallback((consulta: string) => {
    const resultado = executar(consulta);
    const s: Saida = {
      id: ++contador.current,
      sql: consulta.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim(),
      resultado,
      hora: new Date().toLocaleString("sv-SE").replace("T", " "),
    };
    setSaidas((l) => [...l, s]);
    setAbaResultado(resultado.ok ? "resultado" : "saida");
    setResultadosAbertos(true);
  }, []);

  // Roda a primeira consulta ao abrir, para já aparecer resultado
  const rodouPrimeira = useRef(false);
  useEffect(() => {
    if (rodouPrimeira.current) return;
    rodouPrimeira.current = true;
    rodar("SELECT nome, tipo, stack FROM projetos ORDER BY id");
  }, [rodar]);

  const alternar = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const abrirTabela = (nome: string) => {
    setAbas((l) => (l.includes(nome) ? l : [...l, nome]));
    setAtiva(nome);
    if (celular) setExplorer(false);
  };
  const fecharAba = (id: string) => {
    if (id === CONSOLE) return;
    const resto = abas.filter((a) => a !== id);
    setAbas(resto);
    if (ativa === id) setAtiva(resto[resto.length - 1] ?? CONSOLE);
  };

  const ultima = saidas[saidas.length - 1];
  const ultimoOk = [...saidas].reverse().find((s) => s.resultado.ok);
  const tabelaAberta = ativa !== CONSOLE ? tabelas.find((t) => t.nome === ativa) : undefined;

  const no = (id: string, nivel: number, rotulo: React.ReactNode, icone: React.ReactNode, filhos: boolean, extra?: { dica?: string; onClick?: () => void; onDouble?: () => void }) => (
    <button
      role="treeitem"
      className={`ij-no${selArvore === id ? " sel" : ""}`}
      style={{ paddingLeft: 6 + nivel * 18 }}
      onClick={() => {
        setSelArvore(id);
        if (filhos) alternar(id);
        extra?.onClick?.();
      }}
      onDoubleClick={extra?.onDouble}
    >
      <span className="ij-no-seta">{filhos && <IcSeta aberta={abertos.has(id)} />}</span>
      {icone}
      <span className="ij-no-nome">{rotulo}</span>
      {extra?.dica && <span className="ij-no-dica">{extra.dica}</span>}
    </button>
  );

  return (
    <div className={`ij dg${celular ? " celular" : ""}`}>
      <header className="ij-topo" data-arrastar>
        <span className="ij-logo" aria-hidden="true">
          <IconeDataGrip tamanho={20} />
        </span>
        <button className="ij-tb" aria-label="Main Menu" title="Main Menu">
          <IcMenu />
        </button>
        {celular && (
          <button className={`ij-tb${explorer ? " ativo" : ""}`} onClick={() => setExplorer((v) => !v)} aria-label="Database Explorer">
            <IcBanco tamanho={16} />
          </button>
        )}
        <span className="ij-widget">
          <span className="ij-badge dg-badge">PO</span>
          <span className="ij-widget-texto">portfolio</span>
          <IcChevron />
        </span>
        <span className="espaco" />
        {!celular && <span className="ij-widget dg-tx">Tx: Auto <IcChevron /></span>}
        <button className="ij-tb" aria-label="Search Everywhere" title="Search Everywhere">
          <IcBusca />
        </button>
        {!celular && (
          <>
            <button className="ij-tb" aria-label="Settings" title="Settings">
              <IcEngrenagem />
            </button>
            <span className="ij-janela" data-nao-arrastar>
              <button onClick={janela.minimizar} aria-label="Minimizar" title="Minimizar">
                <IcMinimizarJanela />
              </button>
              <button onClick={janela.alternarMaximizar} aria-label={janela.maximizada ? "Restaurar" : "Maximizar"} title={janela.maximizada ? "Restaurar" : "Maximizar"}>
                {janela.maximizada ? <IcRestaurarJanela /> : <IcMaximizarJanela />}
              </button>
              <button className="fechar" onClick={janela.fechar} aria-label="Fechar" title="Fechar">
                <IcFecharJanela />
              </button>
            </span>
          </>
        )}
      </header>

      <div className="ij-corpo">
        <nav className="ij-faixa" aria-label="Janelas de ferramenta">
          <button className={`ij-faixa-btn${explorer ? " ativo" : ""}`} onClick={() => setExplorer((v) => !v)} title="Database Explorer" aria-label="Database Explorer">
            <IcBanco />
          </button>
          <button className="ij-faixa-btn" title="Files" aria-label="Files">
            <IcProjeto />
          </button>
          <button className="ij-faixa-btn" title="Bookmarks" aria-label="Bookmarks">
            <IcFavoritos />
          </button>
          <span className="espaco" />
          <button className={`ij-faixa-btn${resultadosAbertos ? " ativo" : ""}`} onClick={() => setResultadosAbertos((v) => !v)} title="Services" aria-label="Services">
            <IcServicos />
          </button>
          <button className="ij-faixa-btn" title="Problems" aria-label="Problems">
            <IcProblemas />
          </button>
        </nav>

        {explorer && (
          <>
            <aside className="ij-tw ij-tw-esq" style={celular ? undefined : { width: 280 }} aria-label="Database Explorer">
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">Database Explorer</span>
                <span className="espaco" />
                <button className="ij-tw-btn" title="New" aria-label="Novo"><IcAdicionar /></button>
                <button className="ij-tw-btn" title="Refresh" aria-label="Atualizar"><IcRecarregar /></button>
                <button className="ij-tw-btn" title="Collapse All" aria-label="Recolher" onClick={() => setAbertos(new Set())}><IcRecolher /></button>
                <button className="ij-tw-btn" title="Hide" aria-label="Ocultar" onClick={() => setExplorer(false)}><IcOcultar /></button>
              </div>
              <ul className="ij-arvore" role="tree" aria-label="Bancos">
                <li role="none">
                  {no("db", 0, <><strong>portfolio@localhost</strong></>, <IcBanco tamanho={16} />, true, { dica: "1 of 3" })}
                  {abertos.has("db") && (
                    <ul role="group">
                      <li role="none">
                        {no("db/portfolio", 1, "portfolio", <IcBanco tamanho={16} />, true)}
                        {abertos.has("db/portfolio") && (
                          <ul role="group">
                            <li role="none">
                              {no("db/portfolio/public", 2, "public", <IcProjeto tamanho={16} />, true)}
                              {abertos.has("db/portfolio/public") && (
                                <ul role="group">
                                  <li role="none">
                                    {no("db/tabelas", 3, "tables", <IcProjeto tamanho={16} />, true, { dica: String(tabelas.length) })}
                                    {abertos.has("db/tabelas") && (
                                      <ul role="group">
                                        {tabelas.map((t) => (
                                          <li key={t.nome} role="none">
                                            {no(`db/t/${t.nome}`, 4, t.nome, <IcTabela />, true, { onDouble: () => abrirTabela(t.nome), dica: `${t.linhas.length}` })}
                                            {abertos.has(`db/t/${t.nome}`) && (
                                              <ul role="group">
                                                {t.colunas.map((c) => (
                                                  <li key={c.nome} role="none">
                                                    {no(`db/t/${t.nome}/${c.nome}`, 5, c.nome, <IcColuna pk={c.pk} />, false, { dica: c.tipo })}
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                </ul>
                              )}
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
              <p className="tw-rodape-dica">Duplo clique numa tabela para ver os dados.</p>
            </aside>
            {!celular && <div className="ij-divisor ij-divisor-h" aria-hidden="true" />}
            {celular && <div className="ij-fundo-gaveta" onClick={() => setExplorer(false)} />}
          </>
        )}

        <div className="ij-centro">
          <div className="ij-editor-area">
            <div className="ij-abas" role="tablist">
              {abas.map((id) => (
                <div key={id} className={`ij-aba${ativa === id ? " ativa" : ""}`} role="presentation">
                  <button role="tab" aria-selected={ativa === id} className="ij-aba-nome" onClick={() => setAtiva(id)}>
                    {id === CONSOLE ? <IcConsole /> : <IcTabela />}
                    {id === CONSOLE ? "console [portfolio@localhost]" : id}
                  </button>
                  {id !== CONSOLE && (
                    <button className="ij-aba-fechar" onClick={() => fecharAba(id)} aria-label={`Fechar ${id}`}>
                      <IcFechar tamanho={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {ativa === CONSOLE ? (
              <>
                <div className="dg-barra">
                  <button className="dg-barra-rodar" onClick={() => rodar(texto)} title="Execute (Ctrl+Enter)" aria-label="Executar">
                    <IcExecutar tamanho={14} />
                  </button>
                  <span className="dg-chip">Tx: Auto</span>
                  <span className="dg-chip">Playground</span>
                  <span className="espaco" />
                  <span className="dg-chip dg-chip-schema">portfolio.public</span>
                </div>
                <div className="ij-editor">
                  <Console texto={texto} setTexto={setTexto} onExecutar={rodar} />
                </div>
              </>
            ) : tabelaAberta ? (
              <>
                <div className="dg-barra">
                  <span className="dg-filtro">
                    <span className="t-kw">WHERE</span> <span className="dg-placeholder">&lt;filter criteria&gt;</span>
                  </span>
                  <span className="dg-filtro">
                    <span className="t-kw">ORDER BY</span> <span className="dg-placeholder">&lt;sorting criteria&gt;</span>
                  </span>
                  <span className="espaco" />
                  <span className="dg-chip">{tabelaAberta.linhas.length} rows</span>
                </div>
                <div className="ij-editor">
                  <Grade colunas={tabelaAberta.colunas.map((c) => c.nome)} linhas={tabelaAberta.linhas} tabela={tabelaAberta} />
                </div>
              </>
            ) : null}
          </div>

          {resultadosAbertos && ativa === CONSOLE && (
            <>
              {!celular && <div className="ij-divisor ij-divisor-v" aria-hidden="true" />}
              <section className="ij-tw ij-tw-inf dg-resultados" style={celular ? undefined : { height: 280 }} aria-label="Services">
                <div className="ij-tw-topo">
                  <span className="ij-tw-titulo">Services</span>
                  <span className="dg-abas-resultado" role="tablist">
                    <button role="tab" aria-selected={abaResultado === "saida"} onClick={() => setAbaResultado("saida")}>
                      Output
                    </button>
                    {ultimoOk && ultimoOk.resultado.ok && (
                      <button role="tab" aria-selected={abaResultado === "resultado"} onClick={() => setAbaResultado("resultado")}>
                        <IcTabela /> Result {ultimoOk.id}: {ultimoOk.resultado.tabela}
                      </button>
                    )}
                  </span>
                  <span className="espaco" />
                  <button className="ij-tw-btn" title="Hide" aria-label="Ocultar" onClick={() => setResultadosAbertos(false)}>
                    <IcOcultar />
                  </button>
                </div>
                <div className="ij-tw-corpo dg-resultado-corpo">
                  {abaResultado === "resultado" && ultimoOk && ultimoOk.resultado.ok ? (
                    <div className="dg-resultado">
                      <Grade colunas={ultimoOk.resultado.colunas} linhas={ultimoOk.resultado.linhas} tabela={tabelas.find((t) => ultimoOk.resultado.ok && t.nome === ultimoOk.resultado.tabela)} />
                      <p className="dg-resultado-rodape">
                        {ultimoOk.resultado.linhas.length} rows retrieved starting from 1 in {ultimoOk.resultado.ms} ms (execution: {Math.max(2, Math.round(ultimoOk.resultado.ms * 0.2))} ms, fetching: {Math.round(ultimoOk.resultado.ms * 0.8)} ms)
                      </p>
                    </div>
                  ) : (
                    <div className="dg-saida">
                      {saidas.map((s) => (
                        <div key={s.id} className="dg-saida-item">
                          <p>
                            <span className="dg-saida-db">portfolio&gt;</span> {s.sql}
                          </p>
                          <p className={s.resultado.ok ? "dg-saida-ok" : "dg-saida-erro"}>
                            [{s.hora}] {s.resultado.ok ? `${s.resultado.linhas.length} rows retrieved starting from 1 in ${s.resultado.ms} ms` : s.resultado.erro}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <footer className="ij-status">
        <span className="dg-status-conexao">
          <span className="tw-bolinha on" /> portfolio@localhost
        </span>
        <span>PostgreSQL 17.2</span>
        <span className="espaco" />
        {ultima && <span>{ultima.resultado.ok ? `${ultima.resultado.linhas.length} rows` : "erro na última consulta"}</span>}
        {!celular && (
          <>
            <span>UTF-8</span>
            <span>4 spaces</span>
          </>
        )}
      </footer>
    </div>
  );
}
