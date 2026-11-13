import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { IconeDataGrip } from "../../sistema/icones";
import { sql as realcarSql } from "../intellij/realce";
import { classeTema, mudarTemaIde, temasIde, useTemaIde } from "../intellij/tema";
import { MenuSuspenso, type ItemMenu } from "../intellij/Menus";
import { emitir } from "../../sistema/eventos";
import { normalizar } from "../../util";
import { idiomaAtual } from "../../i18n";
import { tabelas, formatar, type Tabela, type Valor } from "./banco";
import { executar, type Resultado } from "./sql";
import {
  IcAdicionar,
  IcBanco,
  IcBusca,
  IcCheck,
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

// Divide um script em comandos pelo ";" (ignorando os que estão entre aspas ou em comentário)
function dividirSql(texto: string) {
  const out: string[] = [];
  let atual = "";
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (!aspas && ch === "-" && texto[i + 1] === "-") {
      const fim = texto.indexOf("\n", i);
      const j = fim === -1 ? texto.length : fim;
      atual += texto.slice(i, j);
      i = j - 1;
      continue;
    }
    if (ch === "'") aspas = !aspas;
    if (ch === ";" && !aspas) {
      out.push(atual);
      atual = "";
      continue;
    }
    atual += ch;
  }
  out.push(atual);
  return out.filter((c) => c.split("\n").some((l) => l.replace(/--.*$/, "").trim()));
}

const textoInicial = idiomaAtual() === "en"
  ? `-- Eduardo's projects, straight from the database.
-- Put the cursor on a query and press Ctrl+Enter (or the green ▶).`
  : `-- Os projetos do Eduardo, direto do banco.
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
    <rect x="2" y="3" width="12" height="10" rx="1.2" fill="none" stroke="var(--ij-ico-azul, #548af7)" strokeWidth="1.1" />
    <path d="M2 6.5h12M6.5 6.5V13" stroke="var(--ij-ico-azul, #548af7)" strokeWidth="1.1" />
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
      <rect x="5" y="2.5" width="6" height="11" rx="1" fill="none" stroke="var(--ij-ico-cinza, #9da0a8)" strokeWidth="1.1" />
      <path d="M5 6h6M5 9.5h6" stroke="var(--ij-ico-cinza, #9da0a8)" strokeWidth="1.1" />
    </svg>
  );
const IcConsole = () => (
  <svg viewBox="0 0 16 16" width={16} height={16} aria-hidden="true" style={{ flex: "none" }}>
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="var(--ij-ico-cinza, #9da0a8)" strokeWidth="1.1" />
    <text x="8" y="11" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--ij-ico-azul, #548af7)" fontFamily="Inter, sans-serif">
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
function Console({
  texto,
  setTexto,
  onExecutar,
  atualRef,
}: {
  texto: string;
  setTexto: (t: string) => void;
  onExecutar: (sql: string) => void;
  atualRef: React.MutableRefObject<() => string>;
}) {
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
  atualRef.current = consultaAtual;

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
  const { celular, abrir } = useSistema();
  const tema = useTemaIde(); // segue o tema escolhido no IntelliJ
  // Painel da esquerda: Database Explorer, Files ou Bookmarks
  const [esq, setEsq] = useState<"banco" | "arquivos" | "favoritos" | null>(celular ? null : "banco");
  const explorer = esq === "banco";
  const alternarEsq = (p: "banco" | "arquivos" | "favoritos") => setEsq((v) => (v === p ? null : p));
  const raiz = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<null | { itens: ItemMenu[]; x: number; y: number; largura: number }>(null);
  const [tx, setTx] = useState<"Auto" | "Manual">("Auto");
  const [modo, setModo] = useState<"Playground" | "Script">("Playground");
  const [sincronizando, setSincronizando] = useState(false);
  const [problemas, setProblemas] = useState(false);
  const [aviso, setAviso] = useState<null | { titulo: string; texto: string }>(null);
  const [busca, setBusca] = useState<null | { termo: string; sel: number }>(null);
  const [filtros, setFiltros] = useState<Record<string, { where: string; order: string; erro?: string; colunas?: string[]; linhas?: Valor[][] }>>({});
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set(["db", "db/portfolio", "db/portfolio/public", "db/tabelas", "f/raiz", "f/consoles", "f/db", "f/sql"]));
  const [selArvore, setSelArvore] = useState<string | null>(null);
  const [abas, setAbas] = useState<string[]>([CONSOLE]);
  const [ativa, setAtiva] = useState(CONSOLE);
  const [texto, setTexto] = useState(textoInicial);
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [abaResultado, setAbaResultado] = useState<"saida" | "resultado">("resultado");
  const [resultadosAbertos, setResultadosAbertos] = useState(true);
  const contador = useRef(0);

  // Roda um comando ou um script inteiro (cada comando vira uma linha no Output; o último resultado aparece na grade)
  const rodar = useCallback((consulta: string) => {
    const comandos = dividirSql(consulta);
    if (comandos.length === 0) comandos.push(consulta);
    const hora = new Date().toLocaleString("sv-SE").replace("T", " ");
    const novas: Saida[] = comandos.map((sql) => ({
      id: ++contador.current,
      sql: sql.replace(/--.*$/gm, "").replace(/\s+/g, " ").trim(),
      resultado: executar(sql),
      hora,
    }));
    setSaidas((l) => [...l, ...novas]);
    setAbaResultado(novas.every((n) => n.resultado.ok) ? "resultado" : "saida");
    setResultadosAbertos(true);
  }, []);
  const consultaDoCursor = useRef<() => string>(() => "");

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
    if (celular) setEsq(null);
  };
  const fecharAba = (id: string) => {
    if (id === CONSOLE) return;
    const resto = abas.filter((a) => a !== id);
    setAbas(resto);
    if (ativa === id) setAtiva(resto[resto.length - 1] ?? CONSOLE);
  };

  // Balão de aviso no canto, como no IntelliJ
  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 5000);
    return () => window.clearTimeout(t);
  }, [aviso]);
  const avisar = (titulo: string, texto: string) => setAviso({ titulo, texto });

  const abrirMenu = (e: React.MouseEvent, itens: ItemMenu[], largura = 220) => {
    const r = e.currentTarget.getBoundingClientRect();
    const base = raiz.current!.getBoundingClientRect();
    const x = Math.max(4, Math.min(r.left - base.left, base.width - largura - 8));
    setMenu({ itens, x, y: r.bottom - base.top + 4, largura });
  };

  const novaConsulta = () => {
    setAtiva(CONSOLE);
    setTexto((t) => `${t.replace(/\s*$/, "")}\n\nSELECT *\nFROM projetos;\n`);
    avisar("Query Console", "New query added at the end of console [portfolio@localhost].");
  };

  const sincronizar = () => {
    if (sincronizando) return;
    setSincronizando(true);
    window.setTimeout(() => {
      setSincronizando(false);
      avisar("Synchronized", `portfolio@localhost: 1 schema, ${tabelas.length} tables, ${tabelas.reduce((n, t) => n + t.colunas.length, 0)} columns.`);
    }, 900);
  };

  const menuTx: ItemMenu[] = (["Auto", "Manual"] as const).map((m) => ({ rotulo: m, marcado: tx === m, acao: () => setTx(m) }));
  const menuModo: ItemMenu[] = (["Playground", "Script"] as const).map((m) => ({ rotulo: m, marcado: modo === m, acao: () => setModo(m) }));
  const menuTema: ItemMenu = { rotulo: "Theme", sub: temasIde.map((t) => ({ rotulo: t.nome, marcado: tema === t.id, acao: () => mudarTemaIde(t.id) })) };
  const menuPrincipal: ItemMenu[] = [
    {
      rotulo: "File",
      sub: [
        { rotulo: "New Query Console", atalho: "Ctrl+Shift+L", acao: novaConsulta },
        { rotulo: "Data Source…", desabilitado: true },
        { separador: true },
        { rotulo: "Close Tab", atalho: "Ctrl+F4", acao: () => fecharAba(ativa), desabilitado: ativa === CONSOLE },
      ],
    },
    {
      rotulo: "View",
      sub: [
        { rotulo: "Database Explorer", marcado: esq === "banco", acao: () => alternarEsq("banco") },
        { rotulo: "Files", marcado: esq === "arquivos", acao: () => alternarEsq("arquivos") },
        { rotulo: "Bookmarks", marcado: esq === "favoritos", acao: () => alternarEsq("favoritos") },
        { separador: true },
        { rotulo: "Services", marcado: resultadosAbertos, acao: () => setResultadosAbertos((v) => !v) },
        { rotulo: "Problems", marcado: problemas, acao: () => setProblemas((v) => !v) },
      ],
    },
    {
      rotulo: "Database",
      sub: [
        { rotulo: "Execute", atalho: "Ctrl+Enter", acao: () => (setAtiva(CONSOLE), rodar(consultaDoCursor.current() || texto)) },
        { rotulo: "Execute Script", atalho: "Alt+Shift+F10", acao: () => (setAtiva(CONSOLE), rodar(texto)) },
        { rotulo: "Refresh", atalho: "Ctrl+F5", acao: sincronizar },
        { rotulo: "Transaction Mode", sub: menuTx },
      ],
    },
    { rotulo: "Open in IntelliJ IDEA", acao: () => abrir("intellij") },
    { separador: true },
    { rotulo: "Help", sub: [{ rotulo: "About DataGrip", acao: () => avisar("DataGrip 2025.3", "Part of Eduardo's portfolio. The database is real data from the site.") }] },
  ];
  const menuConfig: ItemMenu[] = [
    { rotulo: "Settings…", atalho: "Ctrl+Alt+S", desabilitado: true },
    { rotulo: "Plugins…", desabilitado: true },
    { separador: true },
    menuTema,
    { rotulo: "Keymap", sub: [{ rotulo: "Windows", marcado: true }] },
    { separador: true },
    { rotulo: "About", acao: () => avisar("DataGrip 2025.3", "Build #DB-253 · Runtime: JetBrains Runtime 21") },
  ];
  const menuNovo: ItemMenu[] = [
    { rotulo: "Query Console", atalho: "Ctrl+Shift+L", acao: novaConsulta },
    { rotulo: "Data Source", sub: [{ rotulo: "PostgreSQL", marcado: true }, { rotulo: "MySQL", desabilitado: true }] },
  ];

  // Search Everywhere: tabelas, colunas e ações
  const itensBusca = useMemo(
    () => [
      ...tabelas.map((t) => ({ titulo: t.nome, detalhe: "table · public", fazer: () => abrirTabela(t.nome) })),
      ...tabelas.flatMap((t) => t.colunas.map((c) => ({ titulo: `${t.nome}.${c.nome}`, detalhe: c.tipo, fazer: () => abrirTabela(t.nome) }))),
      { titulo: "New Query Console", detalhe: "action", fazer: novaConsulta },
      { titulo: "Refresh", detalhe: "action", fazer: sincronizar },
      { titulo: "Database Explorer", detalhe: "tool window", fazer: () => setEsq("banco") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const resultadosBusca = busca ? itensBusca.filter((i) => normalizar(`${i.titulo} ${i.detalhe}`).includes(normalizar(busca.termo.trim()))).slice(0, 12) : [];

  // Filtro e ordenação da tabela aberta (WHERE / ORDER BY de verdade, no mini banco)
  const aplicarFiltro = (nome: string) => {
    const f = filtros[nome] ?? { where: "", order: "" };
    if (!f.where.trim() && !f.order.trim()) return setFiltros((m) => ({ ...m, [nome]: { where: "", order: "" } }));
    const r = executar(`SELECT * FROM ${nome}${f.where.trim() ? ` WHERE ${f.where}` : ""}${f.order.trim() ? ` ORDER BY ${f.order}` : ""}`);
    setFiltros((m) => ({ ...m, [nome]: r.ok ? { ...f, erro: undefined, colunas: r.colunas, linhas: r.linhas } : { ...f, erro: r.erro, colunas: undefined, linhas: undefined } }));
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
    <div className={`ij dg${classeTema(tema)}${celular ? " celular" : ""}`} ref={raiz}>
      <header className="ij-topo" data-arrastar>
        <span className="ij-logo" aria-hidden="true">
          <IconeDataGrip tamanho={20} />
        </span>
        <button className={`ij-tb${menu?.itens === menuPrincipal ? " ativo" : ""}`} aria-label="Main Menu" title="Main Menu" onClick={(e) => abrirMenu(e, menuPrincipal, 200)}>
          <IcMenu />
        </button>
        {celular && (
          <button className={`ij-tb${explorer ? " ativo" : ""}`} onClick={() => alternarEsq("banco")} aria-label="Database Explorer">
            <IcBanco tamanho={16} />
          </button>
        )}
        <button
          className="ij-widget"
          onClick={(e) =>
            abrirMenu(e, [
              { rotulo: "portfolio", dica: "E:\\projetos\\portfolio", marcado: true },
              { separador: true },
              { rotulo: "New Project…", desabilitado: true },
              { rotulo: "Open…", desabilitado: true },
            ], 260)
          }
        >
          <span className="ij-badge dg-badge">PO</span>
          <span className="ij-widget-texto">portfolio</span>
          <IcChevron />
        </button>
        <span className="espaco" />
        {!celular && (
          <button className="ij-widget dg-tx" onClick={(e) => abrirMenu(e, menuTx, 160)} title="Transaction mode">
            Tx: {tx} <IcChevron />
          </button>
        )}
        <button className="ij-tb" aria-label="Search Everywhere" title="Search Everywhere" onClick={() => setBusca({ termo: "", sel: 0 })}>
          <IcBusca />
        </button>
        {!celular && (
          <>
            <button className="ij-tb" aria-label="Settings" title="Settings" onClick={(e) => abrirMenu(e, menuConfig, 220)}>
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
          <button className={`ij-faixa-btn${explorer ? " ativo" : ""}`} onClick={() => alternarEsq("banco")} title="Database Explorer" aria-label="Database Explorer">
            <IcBanco />
          </button>
          <button className={`ij-faixa-btn${esq === "arquivos" ? " ativo" : ""}`} onClick={() => alternarEsq("arquivos")} title="Files" aria-label="Files">
            <IcProjeto />
          </button>
          <button className={`ij-faixa-btn${esq === "favoritos" ? " ativo" : ""}`} onClick={() => alternarEsq("favoritos")} title="Bookmarks" aria-label="Bookmarks">
            <IcFavoritos />
          </button>
          <span className="espaco" />
          <button className={`ij-faixa-btn${resultadosAbertos ? " ativo" : ""}`} onClick={() => setResultadosAbertos((v) => !v)} title="Services" aria-label="Services">
            <IcServicos />
          </button>
          <button className={`ij-faixa-btn${problemas ? " ativo" : ""}`} onClick={() => setProblemas((v) => !v)} title="Problems" aria-label="Problems">
            <IcProblemas />
          </button>
        </nav>

        {explorer && (
          <>
            <aside className="ij-tw ij-tw-esq" style={celular ? undefined : { width: 280 }} aria-label="Database Explorer">
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">Database Explorer</span>
                <span className="espaco" />
                <button className="ij-tw-btn" title="New" aria-label="New" onClick={(e) => abrirMenu(e, menuNovo, 200)}><IcAdicionar /></button>
                <button className={`ij-tw-btn${sincronizando ? " girando" : ""}`} title="Refresh" aria-label="Refresh" onClick={sincronizar}><IcRecarregar /></button>
                <button className="ij-tw-btn" title="Collapse All" aria-label="Collapse All" onClick={() => setAbertos(new Set())}><IcRecolher /></button>
                <button className="ij-tw-btn" title="Hide" aria-label="Hide" onClick={() => setEsq(null)}><IcOcultar /></button>
              </div>
              <ul className="ij-arvore" role="tree" aria-label="Bancos">
                <li role="none">
                  {no("db", 0, <><strong>portfolio@localhost</strong></>, <IcBanco tamanho={16} />, true, { dica: sincronizando ? "synchronizing…" : "1 of 3" })}
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
              <p className="tw-rodape-dica">{idiomaAtual() === "en" ? "Double-click a table to see its data." : "Duplo clique numa tabela para ver os dados."}</p>
            </aside>
            {!celular && <div className="ij-divisor ij-divisor-h" aria-hidden="true" />}
            {celular && <div className="ij-fundo-gaveta" onClick={() => setEsq(null)} />}
          </>
        )}

        {esq === "arquivos" && (
          <>
            <aside className="ij-tw ij-tw-esq" style={celular ? undefined : { width: 280 }} aria-label="Files">
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">Files</span>
                <span className="espaco" />
                <button className="ij-tw-btn" title="Hide" aria-label="Hide" onClick={() => setEsq(null)}><IcOcultar /></button>
              </div>
              <ul className="ij-arvore" role="tree" aria-label="Files">
                <li role="none">
                  {no("f/raiz", 0, "Scratches and Consoles", <IcProjeto tamanho={16} />, true)}
                  {abertos.has("f/raiz") && (
                    <ul role="group">
                      <li role="none">
                        {no("f/consoles", 1, "Database Consoles", <IcProjeto tamanho={16} />, true)}
                        {abertos.has("f/consoles") && (
                          <ul role="group">
                            <li role="none">
                              {no("f/db", 2, "portfolio@localhost", <IcBanco tamanho={16} />, true)}
                              {abertos.has("f/db") && (
                                <ul role="group">
                                  <li role="none">{no("f/console", 3, "console", <IcConsole />, false, { onClick: () => setAtiva(CONSOLE) })}</li>
                                </ul>
                              )}
                            </li>
                          </ul>
                        )}
                      </li>
                    </ul>
                  )}
                </li>
                <li role="none">
                  {no("f/sql", 0, "db/migration", <IcProjeto tamanho={16} />, true, { dica: "portfolio-edu" })}
                  {abertos.has("f/sql") && (
                    <ul role="group">
                      {["V1__cria_tabelas.sql", "V2__insere_dados.sql"].map((arq) => (
                        <li key={arq} role="none">
                          {no(`f/sql/${arq}`, 1, arq, <IcConsole />, false, {
                            onDouble: () => {
                              abrir("intellij");
                              emitir("intellij:abrir", `src/main/resources/db/migration/${arq}`);
                            },
                          })}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>
              <p className="tw-rodape-dica">{idiomaAtual() === "en" ? "Double-click a migration to open it in IntelliJ." : "Duplo clique numa migration para abrir no IntelliJ."}</p>
            </aside>
            {!celular && <div className="ij-divisor ij-divisor-h" aria-hidden="true" />}
            {celular && <div className="ij-fundo-gaveta" onClick={() => setEsq(null)} />}
          </>
        )}

        {esq === "favoritos" && (
          <>
            <aside className="ij-tw ij-tw-esq" style={celular ? undefined : { width: 280 }} aria-label="Bookmarks">
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">Bookmarks</span>
                <span className="espaco" />
                <button className="ij-tw-btn" title="Hide" aria-label="Hide" onClick={() => setEsq(null)}><IcOcultar /></button>
              </div>
              <ul className="ij-arvore" role="tree" aria-label="Bookmarks">
                <li role="none">{no("b/projetos", 0, "projetos", <IcTabela />, false, { dica: "table", onClick: () => abrirTabela("projetos") })}</li>
                <li role="none">{no("b/tecnologias", 0, "tecnologias", <IcTabela />, false, { dica: "table", onClick: () => abrirTabela("tecnologias") })}</li>
                <li role="none">
                  {no("b/consulta", 0, "SELECT nome, tipo, stack…", <IcConsole />, false, {
                    dica: "console:4",
                    onClick: () => {
                      setAtiva(CONSOLE);
                      rodar("SELECT nome, tipo, stack FROM projetos ORDER BY id");
                    },
                  })}
                </li>
              </ul>
            </aside>
            {!celular && <div className="ij-divisor ij-divisor-h" aria-hidden="true" />}
            {celular && <div className="ij-fundo-gaveta" onClick={() => setEsq(null)} />}
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
                  <button className="dg-barra-rodar" onClick={() => rodar(consultaDoCursor.current() || texto)} title="Execute (Ctrl+Enter)" aria-label="Executar">
                    <IcExecutar tamanho={14} />
                  </button>
                  <button className="dg-chip" onClick={(e) => abrirMenu(e, menuTx, 160)} title="Transaction mode">
                    Tx: {tx}
                  </button>
                  <button className="dg-chip" onClick={(e) => abrirMenu(e, menuModo, 170)} title="Console mode">
                    {modo}
                  </button>
                  <span className="espaco" />
                  <span className="dg-chip dg-chip-schema">portfolio.public</span>
                </div>
                <div className="ij-editor">
                  <Console texto={texto} setTexto={setTexto} onExecutar={rodar} atualRef={consultaDoCursor} />
                </div>
              </>
            ) : tabelaAberta ? (
              <>
                <div className="dg-barra">
                  {(["where", "order"] as const).map((campo) => (
                    <label key={campo} className="dg-filtro">
                      <span className="t-kw">{campo === "where" ? "WHERE" : "ORDER BY"}</span>
                      <input
                        value={filtros[tabelaAberta.nome]?.[campo] ?? ""}
                        placeholder={campo === "where" ? "<filter criteria>" : "<sorting criteria>"}
                        spellCheck={false}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFiltros((m) => ({ ...m, [tabelaAberta.nome]: { ...(m[tabelaAberta.nome] ?? { where: "", order: "" }), [campo]: v } }));
                        }}
                        onKeyDown={(e) => e.key === "Enter" && aplicarFiltro(tabelaAberta.nome)}
                        onBlur={() => aplicarFiltro(tabelaAberta.nome)}
                        aria-label={campo === "where" ? "WHERE" : "ORDER BY"}
                      />
                    </label>
                  ))}
                  <span className="espaco" />
                  <span className="dg-chip">{(filtros[tabelaAberta.nome]?.linhas ?? tabelaAberta.linhas).length} rows</span>
                </div>
                <div className="ij-editor">
                  {filtros[tabelaAberta.nome]?.erro ? (
                    <p className="dg-saida dg-saida-erro">{filtros[tabelaAberta.nome]!.erro}</p>
                  ) : (
                    <Grade
                      colunas={filtros[tabelaAberta.nome]?.colunas ?? tabelaAberta.colunas.map((c) => c.nome)}
                      linhas={filtros[tabelaAberta.nome]?.linhas ?? tabelaAberta.linhas}
                      tabela={tabelaAberta}
                    />
                  )}
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

      {problemas && (
        <section className="dg-problemas" aria-label="Problems">
          <div className="ij-tw-topo">
            <span className="ij-tw-titulo">Problems</span>
            <span className="espaco" />
            <button className="ij-tw-btn" title="Hide" aria-label="Hide" onClick={() => setProblemas(false)}>
              <IcOcultar />
            </button>
          </div>
          <p className="tw-problemas-ok">
            <IcCheck /> No problems found in console [portfolio@localhost]
          </p>
        </section>
      )}

      {aviso && (
        <div className="ij-balao" role="status">
          <span className="ij-balao-icone" aria-hidden="true">
            i
          </span>
          <div>
            <p className="ij-balao-titulo">{aviso.titulo}</p>
            <p className="ij-balao-texto">{aviso.texto}</p>
          </div>
          <button className="ij-balao-fechar" onClick={() => setAviso(null)} aria-label="Close">
            <IcFechar tamanho={10} />
          </button>
        </div>
      )}

      {menu && <MenuSuspenso itens={menu.itens} pos={{ x: menu.x, y: menu.y }} onFechar={() => setMenu(null)} largura={menu.largura} />}

      {busca && (
        <div className="busca-fundo" onPointerDown={(e) => e.target === e.currentTarget && setBusca(null)}>
          <div className="busca" role="dialog" aria-label="Search Everywhere">
            <label className="busca-campo">
              <IcBusca />
              <input
                autoFocus
                value={busca.termo}
                placeholder="Tables, columns and actions"
                onChange={(e) => setBusca({ termo: e.target.value, sel: 0 })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setBusca(null);
                  else if (e.key === "ArrowDown") setBusca({ ...busca, sel: Math.min(busca.sel + 1, resultadosBusca.length - 1) });
                  else if (e.key === "ArrowUp") setBusca({ ...busca, sel: Math.max(busca.sel - 1, 0) });
                  else if (e.key === "Enter" && resultadosBusca[busca.sel]) {
                    resultadosBusca[busca.sel].fazer();
                    setBusca(null);
                  }
                }}
                aria-label="Search"
              />
            </label>
            <ul className="busca-lista">
              {resultadosBusca.map((r, i) => (
                <li
                  key={r.titulo}
                  className={`busca-item${i === busca.sel ? " sel" : ""}`}
                  onPointerEnter={() => setBusca({ ...busca, sel: i })}
                  onClick={() => {
                    r.fazer();
                    setBusca(null);
                  }}
                >
                  {r.detalhe.startsWith("table") ? <IcTabela /> : r.detalhe === "action" || r.detalhe === "tool window" ? <IcBusca /> : <IcColuna />}
                  <span className="busca-titulo">{r.titulo}</span>
                  <span className="busca-detalhe">{r.detalhe}</span>
                </li>
              ))}
              {resultadosBusca.length === 0 && <li className="busca-nada">Nothing found</li>}
            </ul>
          </div>
        </div>
      )}

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
