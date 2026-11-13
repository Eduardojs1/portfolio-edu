import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSistema, type AppId, type ControleJanela } from "../../sistema/contexto";
import { definirSinal, emitir, lerSinal, ouvir } from "../../sistema/eventos";
import { IconeIntelliJ } from "../../sistema/icones";
import { projetos } from "../../dados/projetos";
import { perfil } from "../../dados/perfil";
import { reduzMovimento } from "../../util";
import { acharArquivo, arvore, ID, migalhas, NOME_PROJETO, pastasAbertas, type No } from "./projeto";
import { Arvore } from "./Arvore";
import { CodigoView, FerramentasEditor, ImagemView, MarkdownView, type ModoMd } from "./Editor";
import { Navegador } from "./Navegador";
import { Terminal } from "./Terminal";
import { BuscaTudo, type AbaBusca, type Acao } from "./BuscaTudo";
import { MenuSuspenso, type ItemMenu } from "./Menus";
import { fimProcesso, logApp, logMaven, type Sessao } from "./execucao";
import { classeTema, mudarTemaIde, temasIde, useTemaIde } from "./tema";
import { tr, useIdioma } from "../../i18n";
import {
  JanelaBanco,
  JanelaCommit,
  JanelaEstrutura,
  JanelaGit,
  JanelaMaven,
  JanelaNotificacoes,
  JanelaProblemas,
  JanelaRun,
  JanelaServicos,
  type Notificacao,
} from "./Ferramentas";
import {
  IcAdicionar,
  IcArquivo,
  IcAtualizar,
  IcBanco,
  IcBusca,
  IcChevron,
  IcCommit,
  IcDepurar,
  IcEndpoints,
  IcEngrenagem,
  IcEnviar,
  IcEstrutura,
  IcExecucao,
  IcExecutar,
  IcExpandir,
  IcFechar,
  IcFecharJanela,
  IcGit,
  IcLocalizar,
  IcMais,
  IcMaisFerramentas,
  IcMaven,
  IcMaximizarJanela,
  IcMenu,
  IcMinimizarJanela,
  IcNotificacoes,
  IcOcultar,
  IcParar,
  IcProblemas,
  IcProjeto,
  IcRamo,
  IcRecolher,
  IcReexecutar,
  IcRestaurarJanela,
  IcServicos,
  IcSpringBoot,
  IcTerminal,
} from "./icones";

type Esquerda = "projeto" | "commit" | "estrutura";
type Direita = "notificacoes" | "banco" | "maven";
type Inferior = "run" | "terminal" | "problemas" | "git" | "servicos";
type TipoMenu = "principal" | "run" | "vcs" | "projeto" | "config";

const SITE = "::site";

function idsPastas(nos: No[], out: string[] = []) {
  for (const n of nos) {
    if (n.tipo !== "arquivo" && n.filhos?.length) {
      out.push(n.id);
      idsPastas(n.filhos, out);
    }
  }
  return out;
}

const hora = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function IntelliJ({ janela }: { janela: ControleJanela }) {
  const sistema = useSistema();
  const celular = sistema.celular;
  const tema = useTemaIde();
  useIdioma(); // o README e os textos mudam junto com o botão PT/EN

  // ---------------- Abas do editor ----------------
  const [abas, setAbas] = useState<string[]>([ID.app, ID.readme]);
  const [ativa, setAtiva] = useState<string | null>(ID.readme);
  const [modosMd, setModosMd] = useState<Record<string, ModoMd>>({});
  const [cursor, setCursor] = useState<{ l: number; c: number } | null>(null);
  const [ancoraSite, setAncoraSite] = useState<{ id: string; n: number } | null>(null);

  // ---------------- Árvore ----------------
  const [abertas, setAbertas] = useState<Set<string>>(() => new Set(pastasAbertas));
  const [selecionado, setSelecionado] = useState<string | null>("");

  // ---------------- Janelas de ferramenta ----------------
  const [esquerda, setEsquerda] = useState<Esquerda | null>(celular ? null : "projeto");
  // Maven começa fechado: o site rodando ganha a largura toda (o "m" na direita abre)
  const [direita, setDireita] = useState<Direita | null>(null);
  const [inferior, setInferior] = useState<Inferior | null>(null);
  const [tam, setTam] = useState({ esq: 300, dir: 290, inf: 270 });

  // ---------------- Execuções ----------------
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [sessaoAtiva, setSessaoAtiva] = useState<number | null>(null);
  const contador = useRef(0);
  const appRodando = sessoes.some((s) => s.tipo !== "maven" && s.rodando && s.terminou);
  const appSubindo = sessoes.some((s) => s.tipo !== "maven" && s.rodando && !s.terminou);
  const ancoraPendente = useRef<string | null>(null);

  // ---------------- Notificações e popups ----------------
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [balao, setBalao] = useState<Notificacao | null>(null);
  const [menu, setMenu] = useState<null | { tipo: TipoMenu; x: number; y: number }>(null);
  const [busca, setBusca] = useState<AbaBusca | null>(null);
  const [sobre, setSobre] = useState(false);
  const [indexando, setIndexando] = useState(true);
  const raiz = useRef<HTMLDivElement>(null);

  const notificar = useCallback((titulo: string, texto: string, acoes?: Notificacao["acoes"]) => {
    const n = { id: ++contador.current, titulo, texto, hora: hora(), acoes };
    setNotificacoes((l) => [...l, n]);
    setBalao(n);
  }, []);

  useEffect(() => {
    if (!balao) return;
    const t = window.setTimeout(() => setBalao(null), 9000);
    return () => window.clearTimeout(t);
  }, [balao]);

  // ---------------- Ações ----------------
  const abrirArquivo = useCallback(
    (id: string) => {
      const a = acharArquivo(id);
      if (!a || a.binario) return;
      setAbas((l) => (l.includes(id) ? l : [...l, id]));
      setAtiva(id);
      setSelecionado(id);
      setCursor(null);
      setAbertas((s) => {
        const n = new Set(s);
        const partes = id.split("/");
        n.add("");
        for (let i = 1; i < partes.length; i++) n.add(partes.slice(0, i).join("/"));
        return n;
      });
      if (celular) setEsquerda(null);
    },
    [celular]
  );

  const abrirSite = useCallback((ancora?: string) => {
    setAbas((l) => (l.includes(SITE) ? l : [...l, SITE]));
    setAtiva(SITE);
    if (ancora) setAncoraSite({ id: ancora, n: Date.now() });
  }, []);

  const novaSessao = useCallback((tipo: Sessao["tipo"], titulo: string, linhas: Sessao["linhas"]) => {
    const id = ++contador.current;
    setSessoes((l) => {
      // Rodar o app de novo substitui a execução anterior; builds antigos do Maven saem também
      const base = l.filter((s) => (tipo === "maven" ? s.tipo !== "maven" || s.rodando : s.tipo === "maven" && s.rodando));
      return [...base, { id, titulo, tipo, linhas, mostradas: 0, rodando: true, terminou: false }];
    });
    setSessaoAtiva(id);
    setInferior("run");
  }, []);

  // Rodar "na mão" (▶, menu, atalho, terminal…) traz o site para a frente quando ele subir
  const querSite = useRef(false);
  const rodar = useCallback(
    (debug = false) => {
      querSite.current = true;
      novaSessao(debug ? "debug" : "app", "PortfolioApplication", logApp(debug));
    },
    [novaSessao]
  );
  const maven = useCallback((objetivo: string) => novaSessao("maven", `portfolio [${objetivo}]`, logMaven(objetivo)), [novaSessao]);
  const parar = useCallback((id?: number) => {
    setSessoes((l) =>
      l.map((s) =>
        (id !== undefined ? s.id === id : s.tipo !== "maven") && s.rodando
          ? { ...s, rodando: false, terminou: true, linhas: [...s.linhas.slice(0, s.mostradas), fimProcesso(130)], mostradas: s.mostradas + 1 }
          : s
      )
    );
  }, []);

  // Imprime as linhas das execuções no ritmo de cada uma
  useEffect(() => {
    const pendente = sessoes.find((s) => s.rodando && !s.terminou);
    if (!pendente) return;
    const proxima = pendente.linhas[pendente.mostradas];
    const t = window.setTimeout(
      () => {
        setSessoes((l) =>
          l.map((s) => {
            if (s.id !== pendente.id) return s;
            const mostradas = s.mostradas + 1;
            const terminou = mostradas >= s.linhas.length;
            return { ...s, mostradas, terminou, rodando: terminou ? s.tipo !== "maven" : true };
          })
        );
      },
      proxima && !reduzMovimento() ? proxima.atraso : 0
    );
    return () => window.clearTimeout(t);
  }, [sessoes]);

  // O app subiu. Se foi pedido (▶, "Abrir o site"…), o site vem para a frente; se subiu
  // sozinho ao abrir, a aba localhost:8080 fica pronta e o README continua na frente.
  const estavaRodando = useRef(false);
  const [jaRodou, setJaRodou] = useState(false);
  useEffect(() => {
    definirSinal("app-rodando", appRodando);
    if (appRodando && !estavaRodando.current) {
      setJaRodou(true);
      if (querSite.current) {
        abrirSite(ancoraPendente.current ?? undefined);
        if (!lerSinal("guia-aberto"))
          notificar(tr("Projeto ligado! 🎉", "Project running! 🎉"), tr("O site abriu aqui no meio. Role para ver projetos, tecnologias e contato.", "The website opened right here. Scroll to see projects, stack and contact."), [
            { rotulo: tr("Abrir o site", "Open the website"), acao: () => abrirSite() },
          ]);
      } else setAbas((l) => (l.includes(SITE) ? l : [...l, SITE]));
      if (celular) setInferior(null); // no celular o Run cobriria a tela
      ancoraPendente.current = null;
      querSite.current = false;
    }
    estavaRodando.current = appRodando;
  }, [appRodando, abrirSite, notificar, celular]);

  const verSite = useCallback(
    (ancora?: string) => {
      if (appRodando) abrirSite(ancora);
      else {
        ancoraPendente.current = ancora ?? null;
        if (!appSubindo) rodar();
      }
    },
    [appRodando, appSubindo, abrirSite, rodar]
  );

  const seguirLink = useCallback(
    (destino: string) => {
      if (destino === "site") return verSite();
      const i = destino.indexOf(":");
      const tipo = destino.slice(0, i);
      const alvo = destino.slice(i + 1);
      if (tipo === "acao" && alvo === "rodar") rodar();
      else if (tipo === "acao" && alvo === "guia") emitir("sistema:guia", "tour");
      else if (tipo === "abrir") abrirArquivo(alvo);
      else if (tipo === "app") sistema.abrir(alvo as AppId);
      else if (tipo === "site") verSite(alvo);
    },
    [verSite, rodar, abrirArquivo, sistema]
  );

  // Recados de outros apps (menu Iniciar, Spotify…)
  useEffect(() => ouvir("intellij:abrir", (id) => abrirArquivo(id)), [abrirArquivo]);
  useEffect(() => ouvir("intellij:rodar", () => rodar()), [rodar]);
  useEffect(() => ouvir("intellij:site", (ancora) => verSite(ancora || undefined)), [verSite]);

  // Ao abrir, o projeto já sobe sozinho, sem tirar o README da frente: ele é a página
  // inicial ("para me conhecer, escolha abaixo") e o site fica pronto na aba localhost:8080.
  // O ▶ continua lá para religar. Com #abrir=Arquivo.java, abre esse arquivo.
  const ligou = useRef(false);
  useEffect(() => {
    if (ligou.current) return;
    ligou.current = true;
    const m = /^#abrir=(.+)$/.exec(decodeURIComponent(location.hash));
    if (m) abrirArquivo(m[1]);
    novaSessao("app", "PortfolioApplication", logApp(false));
  }, []);

  // "Indexando" nos primeiros segundos, como o de verdade
  useEffect(() => {
    const t = window.setTimeout(() => setIndexando(false), 2600);
    return () => window.clearTimeout(t);
  }, []);

  // O terminal fica vivo depois de aberto, para não perder o histórico
  const [terminalVivo, setTerminalVivo] = useState(false);
  useEffect(() => {
    if (inferior === "terminal") setTerminalVivo(true);
  }, [inferior]);

  const alternarEsq = (j: Esquerda) => setEsquerda((v) => (v === j ? null : j));
  const alternarDir = (j: Direita) => setDireita((v) => (v === j ? null : j));
  const alternarInf = (j: Inferior) => setInferior((v) => (v === j ? null : j));

  const fecharAba = (id: string) => {
    const i = abas.indexOf(id);
    const resto = abas.filter((x) => x !== id);
    setAbas(resto);
    if (ativa === id) setAtiva(resto[Math.min(i, resto.length - 1)] ?? null);
  };

  // ---------------- Atalhos de teclado (só com a janela em foco) ----------------
  const focada = janela.focada;
  useEffect(() => {
    if (!focada) return;
    let ultimoShift = 0;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (e.repeat) return;
        const agora = performance.now();
        if (agora - ultimoShift < 400) {
          setBusca("tudo");
          ultimoShift = 0;
        } else ultimoShift = agora;
        return;
      }
      ultimoShift = 0;
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      const fazer = (f: () => void) => {
        e.preventDefault();
        f();
      };
      if (e.shiftKey && e.key === "F10") fazer(() => rodar());
      else if (e.shiftKey && e.key === "F9") fazer(() => rodar(true));
      else if (ctrl && e.key === "F2") fazer(() => parar());
      else if (ctrl && e.key === "F9") fazer(() => maven("compile"));
      else if (e.altKey && e.key === "F12") fazer(() => alternarInf("terminal"));
      else if (e.altKey && e.key === "1") fazer(() => alternarEsq("projeto"));
      else if (e.altKey && e.key === "4") fazer(() => alternarInf("run"));
      else if (e.altKey && e.key === "6") fazer(() => alternarInf("problemas"));
      else if (e.altKey && e.key === "7") fazer(() => alternarEsq("estrutura"));
      else if (e.altKey && e.key === "8") fazer(() => alternarInf("servicos"));
      else if (e.altKey && e.key === "9") fazer(() => alternarInf("git"));
      else if (e.altKey && e.key === "0") fazer(() => alternarEsq("commit"));
      else if (ctrl && e.shiftKey && k === "n") fazer(() => setBusca("arquivos"));
      else if (ctrl && e.shiftKey && k === "a") fazer(() => setBusca("acoes"));
      else if (ctrl && k === "e") fazer(() => setBusca("arquivos"));
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  }, [focada, rodar, parar, maven]);

  // ---------------- Ações (busca e menus) ----------------
  const acoes: Acao[] = useMemo(
    () => [
      { id: "rodar", rotulo: "Run 'PortfolioApplication'", atalho: "Shift+F10", acao: () => rodar() },
      { id: "debug", rotulo: "Debug 'PortfolioApplication'", atalho: "Shift+F9", acao: () => rodar(true) },
      { id: "parar", rotulo: "Stop 'PortfolioApplication'", atalho: "Ctrl+F2", acao: () => parar() },
      { id: "site", rotulo: "Abrir o site (localhost:8080)", acao: () => verSite() },
      { id: "terminal", rotulo: "Terminal", atalho: "Alt+F12", acao: () => setInferior("terminal") },
      { id: "git", rotulo: "Show Git Log", atalho: "Alt+9", acao: () => setInferior("git") },
      { id: "maven-package", rotulo: "Maven: package", acao: () => maven("package") },
      { id: "maven-test", rotulo: "Maven: test", acao: () => maven("test") },
      { id: "datagrip", rotulo: "Abrir o DataGrip", acao: () => sistema.abrir("datagrip") },
      { id: "spotify", rotulo: "Abrir o Spotify", acao: () => sistema.abrir("spotify") },
      { id: "readme", rotulo: "Abrir o README", acao: () => abrirArquivo(ID.readme) },
      { id: "sobre", rotulo: "About", acao: () => setSobre(true) },
      { id: "guia", rotulo: tr("Guia do portfólio (tour)", "Portfolio guide (tour)"), acao: () => emitir("sistema:guia", "tour") },
      { id: "portfolio", rotulo: tr("Abrir o portfólio no navegador", "Open the portfolio in the browser"), acao: () => sistema.abrir("navegador") },
    ],
    [rodar, parar, verSite, maven, sistema, abrirArquivo]
  );

  const abrirMenu = (tipo: TipoMenu) => (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const base = raiz.current!.getBoundingClientRect();
    const x = tipo === "config" ? Math.max(8, r.right - base.left - 220) : r.left - base.left;
    setMenu((m) => (m?.tipo === tipo ? null : { tipo, x, y: r.bottom - base.top + 4 }));
  };

  const janelasFerramenta: ItemMenu[] = [
    { rotulo: "Project", atalho: "Alt+1", acao: () => setEsquerda("projeto") },
    { rotulo: "Commit", atalho: "Alt+0", acao: () => setEsquerda("commit") },
    { rotulo: "Structure", atalho: "Alt+7", acao: () => setEsquerda("estrutura") },
    { rotulo: "Run", atalho: "Alt+4", acao: () => setInferior("run") },
    { rotulo: "Services", atalho: "Alt+8", acao: () => setInferior("servicos") },
    { rotulo: "Terminal", atalho: "Alt+F12", acao: () => setInferior("terminal") },
    { rotulo: "Problems", atalho: "Alt+6", acao: () => setInferior("problemas") },
    { rotulo: "Git", atalho: "Alt+9", acao: () => setInferior("git") },
    { rotulo: "Maven", acao: () => setDireita("maven") },
    { rotulo: "Database", acao: () => setDireita("banco") },
    { rotulo: "Notifications", acao: () => setDireita("notificacoes") },
  ];

  const itensMenu: Record<TipoMenu, ItemMenu[]> = {
    principal: [
      {
        rotulo: "File",
        sub: [
          { rotulo: "New", sub: [{ rotulo: "Project…", desabilitado: true }, { rotulo: "Java Class", desabilitado: true }] },
          { rotulo: "Open…", desabilitado: true },
          { rotulo: "Recent Projects", sub: projetos.map((p) => ({ rotulo: p.nome, dica: p.rotulo, acao: () => verSite(`projeto-${p.id}`) })) },
          { separador: true },
          { rotulo: "Settings…", atalho: "Ctrl+Alt+S", desabilitado: true },
          { separador: true },
          { rotulo: "Exit", acao: janela.fechar },
        ],
      },
      {
        rotulo: "Edit",
        sub: [
          { rotulo: "Undo", atalho: "Ctrl+Z", desabilitado: true },
          { rotulo: "Redo", atalho: "Ctrl+Shift+Z", desabilitado: true },
          { separador: true },
          { rotulo: "Find in Files…", atalho: "Ctrl+Shift+F", acao: () => setBusca("arquivos") },
        ],
      },
      { rotulo: "View", sub: [{ rotulo: "Tool Windows", sub: janelasFerramenta }, { rotulo: "Appearance", sub: [{ rotulo: "Toolbar", marcado: true }, { rotulo: "Status Bar", marcado: true }] }] },
      {
        rotulo: "Navigate",
        sub: [
          { rotulo: "Search Everywhere", atalho: "Double Shift", acao: () => setBusca("tudo") },
          { rotulo: "Class…", atalho: "Ctrl+N", acao: () => setBusca("classes") },
          { rotulo: "File…", atalho: "Ctrl+Shift+N", acao: () => setBusca("arquivos") },
          { rotulo: "Symbol…", atalho: "Ctrl+Alt+Shift+N", acao: () => setBusca("simbolos") },
        ],
      },
      {
        rotulo: "Code",
        sub: [
          { rotulo: "Reformat Code", atalho: "Ctrl+Alt+L", acao: () => notificar("Reformat Code", tr("Nada a mudar: o código já estava formatado.", "Nothing to change: the code was already formatted.")) },
          { rotulo: "Optimize Imports", atalho: "Ctrl+Alt+O", acao: () => notificar("Optimize Imports", tr("Nenhum import sobrando.", "No unused imports.")) },
        ],
      },
      { rotulo: "Refactor", sub: [{ rotulo: "Rename…", atalho: "Shift+F6", desabilitado: true }, { rotulo: "Extract Method…", atalho: "Ctrl+Alt+M", desabilitado: true }] },
      {
        rotulo: "Build",
        sub: [
          { rotulo: "Build Project", atalho: "Ctrl+F9", acao: () => maven("compile") },
          { rotulo: "Rebuild Project", acao: () => maven("package") },
        ],
      },
      {
        rotulo: "Run",
        sub: [
          { rotulo: "Run 'PortfolioApplication'", atalho: "Shift+F10", acao: () => rodar() },
          { rotulo: "Debug 'PortfolioApplication'", atalho: "Shift+F9", acao: () => rodar(true) },
          { rotulo: "Stop 'PortfolioApplication'", atalho: "Ctrl+F2", acao: () => parar(), desabilitado: !appRodando && !appSubindo },
        ],
      },
      {
        rotulo: "Tools",
        sub: [
          { rotulo: "Open in DataGrip", acao: () => sistema.abrir("datagrip") },
          { rotulo: "Spotify", acao: () => sistema.abrir("spotify") },
          { rotulo: "HTTP Client", desabilitado: true },
        ],
      },
      {
        rotulo: "Git",
        sub: [
          { rotulo: "Commit…", atalho: "Ctrl+K", acao: () => setEsquerda("commit") },
          { rotulo: "Push…", atalho: "Ctrl+Shift+K", acao: () => notificar("Push", tr(`Tudo em dia com origin/${__GIT__.branch}.`, `Everything is up to date with origin/${__GIT__.branch}.`)) },
          { rotulo: "Update Project…", atalho: "Ctrl+T", acao: () => notificar("Update Project", tr("Já está atualizado.", "Already up to date.")) },
          { separador: true },
          { rotulo: "Show Git Log", atalho: "Alt+9", acao: () => setInferior("git") },
        ],
      },
      {
        rotulo: "Window",
        sub: [
          {
            rotulo: "Restore Default Layout",
            atalho: "Shift+F12",
            acao: () => {
              setEsquerda("projeto");
              setDireita(null);
              setInferior(null);
              setTam({ esq: 300, dir: 290, inf: 270 });
            },
          },
        ],
      },
      {
        rotulo: "Help",
        sub: [
          { rotulo: "LEIA-ME.txt", acao: () => emitir("sistema:guia") },
          { rotulo: "Find Action…", atalho: "Ctrl+Shift+A", acao: () => setBusca("acoes") },
          { separador: true },
          { rotulo: "About", acao: () => setSobre(true) },
        ],
      },
    ],
    run: [
      { rotulo: "PortfolioApplication", marcado: true, acao: () => rodar() },
      { rotulo: "portfolio [package]", icone: <IcArquivo tipo="maven" tamanho={14} />, acao: () => maven("package") },
      { rotulo: "PortfolioApplicationTests", icone: <IcArquivo tipo="teste" tamanho={14} />, acao: () => maven("test") },
      { separador: true },
      { rotulo: "Edit Configurations…", desabilitado: true },
    ],
    vcs: [
      { rotulo: "Update Project…", atalho: "Ctrl+T", acao: () => notificar("Update Project", tr("Já está atualizado.", "Already up to date.")) },
      { rotulo: "Commit…", atalho: "Ctrl+K", acao: () => setEsquerda("commit") },
      { rotulo: "Push…", atalho: "Ctrl+Shift+K", acao: () => notificar("Push", tr(`Tudo em dia com origin/${__GIT__.branch}.`, `Everything is up to date with origin/${__GIT__.branch}.`)) },
      { rotulo: "New Branch…", desabilitado: true },
      { separador: true },
      { rotulo: "Local", sub: [{ rotulo: __GIT__.branch, marcado: true }] },
      { rotulo: "Remote", sub: [{ rotulo: `origin/${__GIT__.branch}` }] },
      { separador: true },
      { rotulo: "Show Git Log", acao: () => setInferior("git") },
    ],
    projeto: [
      ...projetos.map((p) => ({ rotulo: p.nome, dica: p.rotulo, icone: <span className="ij-badge ij-badge-mini">{p.nome.slice(0, 2).toUpperCase()}</span>, acao: () => verSite(`projeto-${p.id}`) })),
      { separador: true },
      { rotulo: "New Project…", desabilitado: true },
      { rotulo: "Open…", desabilitado: true },
    ],
    config: [
      { rotulo: "Settings…", atalho: "Ctrl+Alt+S", desabilitado: true },
      { rotulo: "Plugins…", desabilitado: true },
      { separador: true },
      { rotulo: "Theme", sub: temasIde.map((t) => ({ rotulo: t.nome, marcado: tema === t.id, acao: () => mudarTemaIde(t.id) })) },
      { rotulo: "Keymap", sub: [{ rotulo: "Windows", marcado: true }] },
      { separador: true },
      { rotulo: "About", acao: () => setSobre(true) },
    ],
  };

  // ---------------- Divisórias (arrastar para redimensionar) ----------------
  const arrastar = (lado: "esq" | "dir" | "inf") => (e: React.PointerEvent) => {
    e.preventDefault();
    const ini = { x: e.clientX, y: e.clientY, t: tam[lado] };
    const mover = (ev: PointerEvent) => {
      const d = lado === "esq" ? ev.clientX - ini.x : lado === "dir" ? ini.x - ev.clientX : ini.y - ev.clientY;
      setTam((t) => ({ ...t, [lado]: Math.max(lado === "inf" ? 120 : 180, Math.min(lado === "inf" ? 640 : 560, ini.t + d)) }));
    };
    const soltar = () => {
      removeEventListener("pointermove", mover);
      removeEventListener("pointerup", soltar);
      document.body.classList.remove("arrastando");
    };
    document.body.classList.add("arrastando", lado === "inf" ? "arrastando-v" : "arrastando-h");
    addEventListener("pointermove", mover);
    addEventListener("pointerup", soltar, { once: true });
    addEventListener("pointerup", () => document.body.classList.remove("arrastando-v", "arrastando-h"), { once: true });
  };

  // ---------------- Desenho ----------------
  const arquivo = ativa && ativa !== SITE ? acharArquivo(ativa) : undefined;
  const modoMd: ModoMd = arquivo ? (modosMd[arquivo.id] ?? (arquivo.id === ID.readme ? "preview" : "dividido")) : "preview";
  const caminhoStatus = ativa === SITE ? [NOME_PROJETO, "localhost:8080"] : arquivo ? migalhas(arquivo.id) : [NOME_PROJETO];
  const rodandoAlgo = appRodando || appSubindo;

  const faixa = (ativo: boolean, titulo: string, icone: React.ReactNode, acao: () => void, aviso = false) => (
    <button className={`ij-faixa-btn${ativo ? " ativo" : ""}`} onClick={acao} title={titulo} aria-label={titulo} aria-pressed={ativo}>
      {icone}
      {aviso && <span className="ij-faixa-aviso" />}
    </button>
  );

  const tituloEsq: Record<Esquerda, string> = { projeto: "Project", commit: "Commit", estrutura: "Structure" };
  const tituloDir: Record<Direita, string> = { notificacoes: "Notifications", banco: "Database", maven: "Maven" };
  const tituloInf: Record<Inferior, string> = { run: "Run", terminal: "Terminal", problemas: "Problems", git: "Git", servicos: "Services" };

  return (
    <div className={`ij${classeTema(tema)}${celular ? " celular" : ""}${focada ? " focada" : ""}`} ref={raiz} data-guia="intellij">
      {/* ================= Barra principal ================= */}
      <header className="ij-topo" data-arrastar>
        <span className="ij-logo" aria-hidden="true">
          <IconeIntelliJ tamanho={20} />
        </span>
        <button className="ij-tb" onClick={abrirMenu("principal")} aria-label="Main Menu" title="Main Menu">
          <IcMenu />
        </button>
        {celular && (
          <button className={`ij-tb${esquerda ? " ativo" : ""}`} onClick={() => alternarEsq("projeto")} aria-label="Project">
            <IcProjeto tamanho={16} />
          </button>
        )}
        <button className="ij-widget" onClick={abrirMenu("projeto")} title="Projetos recentes">
          <span className="ij-badge">PE</span>
          <span className="ij-widget-texto">{NOME_PROJETO}</span>
          <IcChevron />
        </button>
        {!celular && (
          <>
            <button className="ij-widget" onClick={abrirMenu("vcs")} title="Git Branch">
              <IcRamo />
              <span className="ij-widget-texto">{__GIT__.branch}</span>
              <IcChevron />
            </button>
            <button className="ij-tb" title="Update Project (Ctrl+T)" aria-label="Update Project" onClick={() => notificar("Update Project", tr("Já está atualizado.", "Already up to date."))}>
              <IcAtualizar />
            </button>
            <button className="ij-tb" title="Push (Ctrl+Shift+K)" aria-label="Push" onClick={() => notificar("Push", tr(`Tudo em dia com origin/${__GIT__.branch}.`, `Everything is up to date with origin/${__GIT__.branch}.`))}>
              <IcEnviar />
            </button>
          </>
        )}
        <span className="espaco" />
        {!celular && (
          <button className="ij-widget ij-config" onClick={abrirMenu("run")} title="Run/Debug Configurations">
            <span className="ij-config-icone">
              <IcSpringBoot />
              {appRodando && <span className="ij-config-ponto" />}
            </span>
            <span className="ij-widget-texto">PortfolioApplication</span>
            <IcChevron />
          </button>
        )}
        <button
          className={`ij-tb ij-tb-rodar${jaRodou || rodandoAlgo ? "" : " chamar"}`}
          data-guia="rodar"
          onClick={() => rodar()}
          title={rodandoAlgo ? "Rerun 'PortfolioApplication' (Ctrl+F5)" : "Run 'PortfolioApplication' (Shift+F10)"}
          aria-label="Rodar o PortfolioApplication"
        >
          {rodandoAlgo ? <IcReexecutar /> : <IcExecutar />}
        </button>
        {!celular && (
          <button className="ij-tb" onClick={() => rodar(true)} title="Debug 'PortfolioApplication' (Shift+F9)" aria-label="Debug">
            <IcDepurar />
          </button>
        )}
        {rodandoAlgo && (
          <button className="ij-tb" onClick={() => parar()} title="Stop 'PortfolioApplication' (Ctrl+F2)" aria-label="Parar">
            <IcParar />
          </button>
        )}
        {!celular && (
          <button className="ij-tb" onClick={abrirMenu("run")} aria-label="More Actions" title="More Actions">
            <IcMais />
          </button>
        )}
        {!celular && <span className="ij-sep" />}
        <button className="ij-tb" onClick={() => setBusca("tudo")} title="Search Everywhere (Double Shift)" aria-label="Search Everywhere">
          <IcBusca />
        </button>
        {!celular && (
          <button className="ij-tb" onClick={abrirMenu("config")} title="IDE and Project Settings" aria-label="Settings">
            <IcEngrenagem />
          </button>
        )}
        {!celular && (
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
        )}
      </header>

      {/* ================= Corpo ================= */}
      <div className="ij-corpo">
        <nav className="ij-faixa" aria-label="Janelas de ferramenta (esquerda)">
          {faixa(esquerda === "projeto", "Project (Alt+1)", <IcProjeto />, () => alternarEsq("projeto"))}
          {faixa(esquerda === "commit", "Commit (Alt+0)", <IcCommit />, () => alternarEsq("commit"))}
          {faixa(esquerda === "estrutura", "Structure (Alt+7)", <IcEstrutura />, () => alternarEsq("estrutura"))}
          {faixa(false, "More Tool Windows", <IcMaisFerramentas />, () => setBusca("acoes"))}
          <span className="espaco" />
          {faixa(inferior === "servicos", "Services (Alt+8)", <IcServicos />, () => alternarInf("servicos"))}
          {faixa(inferior === "run", "Run (Alt+4)", <IcExecucao />, () => alternarInf("run"), rodandoAlgo)}
          {faixa(inferior === "terminal", "Terminal (Alt+F12)", <IcTerminal />, () => alternarInf("terminal"))}
          {faixa(inferior === "problemas", "Problems (Alt+6)", <IcProblemas />, () => alternarInf("problemas"))}
          {faixa(inferior === "git", "Git (Alt+9)", <IcGit tamanho={20} />, () => alternarInf("git"))}
        </nav>

        {esquerda && (
          <>
            <aside
              className="ij-tw ij-tw-esq"
              style={celular ? undefined : { width: tam.esq }}
              aria-label={tituloEsq[esquerda]}
              data-guia={esquerda === "projeto" ? "arvore" : undefined}
            >
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">
                  {tituloEsq[esquerda]}
                  {esquerda === "projeto" && <IcChevron />}
                </span>
                <span className="espaco" />
                {esquerda === "projeto" && (
                  <>
                    <button className="ij-tw-btn" title="New…" aria-label="Novo" onClick={() => notificar("New File", tr("Aqui é só leitura. Mas dá para ver tudo! 😄", "This one is read-only. But you can look at everything! 😄"))}>
                      <IcAdicionar />
                    </button>
                    <button className="ij-tw-btn" title="Select Opened File" aria-label="Localizar arquivo aberto" onClick={() => arquivo && abrirArquivo(arquivo.id)}>
                      <IcLocalizar />
                    </button>
                    <button className="ij-tw-btn" title="Expand All" aria-label="Expandir tudo" onClick={() => setAbertas(new Set(idsPastas(arvore)))}>
                      <IcExpandir />
                    </button>
                    <button className="ij-tw-btn" title="Collapse All" aria-label="Recolher tudo" onClick={() => setAbertas(new Set([""]))}>
                      <IcRecolher />
                    </button>
                    <button className="ij-tw-btn" title="Options" aria-label="Opções" onClick={abrirMenu("config")}>
                      <IcMais />
                    </button>
                  </>
                )}
                <button className="ij-tw-btn" title="Hide" aria-label="Ocultar" onClick={() => setEsquerda(null)}>
                  <IcOcultar />
                </button>
              </div>
              {esquerda === "projeto" && (
                <ul className="ij-arvore" role="tree" aria-label="Arquivos do projeto">
                  <Arvore
                    nos={arvore}
                    abertas={abertas}
                    selecionado={selecionado}
                    onAlternar={(id) =>
                      setAbertas((s) => {
                        const n = new Set(s);
                        if (n.has(id)) n.delete(id);
                        else n.add(id);
                        return n;
                      })
                    }
                    onSelecionar={setSelecionado}
                    onAbrir={abrirArquivo}
                  />
                </ul>
              )}
              {esquerda === "commit" && <JanelaCommit />}
              {esquerda === "estrutura" && <JanelaEstrutura arquivoId={arquivo?.id ?? null} />}
            </aside>
            {!celular && <div className="ij-divisor ij-divisor-h" onPointerDown={arrastar("esq")} aria-hidden="true" />}
            {celular && <div className="ij-fundo-gaveta" onClick={() => setEsquerda(null)} />}
          </>
        )}

        <div className="ij-centro">
          <div className="ij-editor-area">
            {abas.length && ativa ? (
              <>
                <div className="ij-abas" role="tablist" aria-label="Arquivos abertos">
                  {abas.map((id) => {
                    const a = id === SITE ? null : acharArquivo(id);
                    const nome = id === SITE ? "localhost:8080" : a!.nome;
                    return (
                      <div key={id} className={`ij-aba${ativa === id ? " ativa" : ""}`} role="presentation">
                        <button role="tab" aria-selected={ativa === id} className="ij-aba-nome" onClick={() => setAtiva(id)} onAuxClick={(e) => e.button === 1 && fecharAba(id)} title={id === SITE ? "http://localhost:8080/" : id}>
                          <IcArquivo tipo={id === SITE ? "site" : a!.icone} />
                          {nome}
                        </button>
                        <button className="ij-aba-fechar" onClick={() => fecharAba(id)} aria-label={`Fechar ${nome}`}>
                          <IcFechar tamanho={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="ij-editor">
                  {ativa === SITE ? (
                    <Navegador appRodando={appRodando} ancora={ancoraSite} avisar={(m) => notificar(m, tr("Já pode colar onde quiser.", "Ready to paste anywhere."))} onRodar={() => rodar()} />
                  ) : arquivo?.imagem ? (
                    <ImagemView arquivo={arquivo} />
                  ) : arquivo ? (
                    <>
                      <FerramentasEditor md={arquivo.ling === "md"} modo={modoMd} onModo={(m) => setModosMd((s) => ({ ...s, [arquivo.id]: m }))} />
                      {arquivo.ling === "md" ? (
                        <MarkdownView key={arquivo.id} arquivo={arquivo} modo={modoMd} onCursor={(l, c) => setCursor({ l, c })} onLink={seguirLink} />
                      ) : (
                        <CodigoView key={arquivo.id} arquivo={arquivo} onCursor={(l, c) => setCursor({ l, c })} onRodar={(m) => (m === "app" ? rodar() : maven("test"))} />
                      )}
                    </>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="ij-vazio">
                <dl>
                  <div>
                    <dt>Search Everywhere</dt>
                    <dd>Double Shift</dd>
                  </div>
                  <div>
                    <dt>Go to File</dt>
                    <dd>Ctrl+Shift+N</dd>
                  </div>
                  <div>
                    <dt>Recent Files</dt>
                    <dd>Ctrl+E</dd>
                  </div>
                  <div>
                    <dt>Navigation Bar</dt>
                    <dd>Alt+Home</dd>
                  </div>
                  <div>
                    <dt>Drop files here to open them</dt>
                    <dd />
                  </div>
                </dl>
              </div>
            )}
          </div>

          {(inferior || terminalVivo) && (
            <>
              {inferior && !celular && <div className="ij-divisor ij-divisor-v" onPointerDown={arrastar("inf")} aria-hidden="true" />}
              <section
                className="ij-tw ij-tw-inf"
                hidden={!inferior}
                style={celular ? undefined : { height: tam.inf }}
                aria-label={tituloInf[inferior ?? "terminal"]}
              >
                <div className="ij-tw-topo">
                  <span className="ij-tw-titulo">{tituloInf[inferior ?? "terminal"]}</span>
                  {inferior === "terminal" && <span className="ij-tw-aba">Local</span>}
                  <span className="espaco" />
                  <button className="ij-tw-btn" title="Hide" aria-label="Ocultar" onClick={() => setInferior(null)}>
                    <IcOcultar />
                  </button>
                </div>
                <div className="ij-tw-corpo">
                  {inferior === "run" && (
                    <JanelaRun
                      sessoes={sessoes}
                      ativa={sessaoAtiva}
                      onAtivar={setSessaoAtiva}
                      onFecharSessao={(id) => {
                        parar(id);
                        setSessoes((l) => l.filter((s) => s.id !== id));
                      }}
                      onParar={(id) => parar(id)}
                      onReexecutar={(s) => (s.tipo === "maven" ? maven(s.titulo.replace(/.*\[(.*)\]/, "$1")) : rodar(s.tipo === "debug"))}
                      onLink={seguirLink}
                    />
                  )}
                  {terminalVivo && (
                    <div className="ij-tw-terminal" hidden={inferior !== "terminal"}>
                    <Terminal
                      appRodando={appRodando}
                      onAbrir={abrirArquivo}
                      onMaven={maven}
                      onRodar={() => rodar()}
                      onApp={(app) => sistema.abrir(app)}
                      onFechar={() => setInferior(null)}
                    />
                    </div>
                  )}
                  {inferior === "problemas" && <JanelaProblemas />}
                  {inferior === "git" && <JanelaGit />}
                  {inferior === "servicos" && <JanelaServicos appRodando={appRodando} onRodar={() => rodar()} onParar={() => parar()} />}
                </div>
              </section>
            </>
          )}
        </div>

        {direita && !celular && (
          <>
            <div className="ij-divisor ij-divisor-h" onPointerDown={arrastar("dir")} aria-hidden="true" />
            <aside className="ij-tw ij-tw-dir" style={{ width: tam.dir }} aria-label={tituloDir[direita]}>
              <div className="ij-tw-topo">
                <span className="ij-tw-titulo">{tituloDir[direita]}</span>
                <span className="espaco" />
                <button className="ij-tw-btn" title="Hide" aria-label="Ocultar" onClick={() => setDireita(null)}>
                  <IcOcultar />
                </button>
              </div>
              {direita === "maven" && <JanelaMaven onObjetivo={maven} onRodar={() => rodar()} />}
              {direita === "banco" && <JanelaBanco onDataGrip={() => sistema.abrir("datagrip")} />}
              {direita === "notificacoes" && <JanelaNotificacoes lista={notificacoes} onLimpar={() => setNotificacoes([])} />}
            </aside>
          </>
        )}

        <nav className="ij-faixa ij-faixa-dir" aria-label="Janelas de ferramenta (direita)">
          {faixa(direita === "notificacoes", "Notifications", <IcNotificacoes />, () => alternarDir("notificacoes"), notificacoes.length > 0 && direita !== "notificacoes")}
          {faixa(direita === "banco", "Database", <IcBanco />, () => alternarDir("banco"))}
          {faixa(direita === "maven", "Maven", <IcMaven />, () => alternarDir("maven"))}
          {faixa(false, "Endpoints", <IcEndpoints />, () => verSite())}
        </nav>
      </div>

      {/* ================= Barra de status ================= */}
      <footer className="ij-status">
        <nav className="ij-status-caminho" aria-label="Caminho">
          {caminhoStatus.map((c, i) => (
            <span key={i}>
              {i > 0 && <i aria-hidden="true">›</i>}
              {c}
            </span>
          ))}
        </nav>
        <span className="espaco" />
        {indexando && (
          <span className="ij-status-index">
            Indexing JDK 21…
            <span className="ij-progresso">
              <span />
            </span>
          </span>
        )}
        {!celular && arquivo && !arquivo.imagem && (
          <>
            <span>{cursor ? `${cursor.l}:${cursor.c}` : "1:1"}</span>
            <span>LF</span>
            <span>UTF-8</span>
            <span>4 spaces</span>
          </>
        )}
        {appRodando && (
          <button className="ij-status-app" onClick={() => setInferior("servicos")} title="PortfolioApplication rodando">
            <span className="tw-bolinha on" /> :8080
          </button>
        )}
      </footer>

      {/* ================= Flutuantes ================= */}
      {menu && <MenuSuspenso itens={itensMenu[menu.tipo]} pos={{ x: menu.x, y: menu.y }} onFechar={() => setMenu(null)} largura={menu.tipo === "principal" ? 200 : 240} titulo={menu.tipo === "projeto" ? "Recent Projects" : undefined} />}
      {busca && <BuscaTudo abaInicial={busca} acoes={acoes} onAbrirArquivo={abrirArquivo} onFechar={() => setBusca(null)} />}

      {balao && (
        <div className="ij-balao" role="status">
          <span className="ij-balao-icone" aria-hidden="true">
            i
          </span>
          <div>
            <p className="ij-balao-titulo">{balao.titulo}</p>
            <p className="ij-balao-texto">{balao.texto}</p>
            {balao.acoes && (
              <p className="ij-balao-acoes">
                {balao.acoes.map((a) => (
                  <button
                    key={a.rotulo}
                    onClick={() => {
                      setBalao(null);
                      a.acao();
                    }}
                  >
                    {a.rotulo}
                  </button>
                ))}
              </p>
            )}
          </div>
          <button className="ij-balao-fechar" onClick={() => setBalao(null)} aria-label={tr("Fechar notificação", "Close notification")}>
            <IcFechar tamanho={10} />
          </button>
        </div>
      )}

      {sobre && (
        <div className="ij-dialogo-fundo" onPointerDown={(e) => e.target === e.currentTarget && setSobre(false)}>
          <div className="ij-dialogo" role="dialog" aria-label="About">
            <IconeIntelliJ tamanho={64} />
            <div>
              <h2>IntelliJ IDEA 2025.2.4</h2>
              <p className="ij-dialogo-fraco">Build #IU-252.27397.103, built on November 2025</p>
              <p>
                {tr("Esta IDE é o portfólio do ", "This IDE is the portfolio of ")}
                <strong>{perfil.linha1}</strong>
                {tr(", feito com React, TypeScript, Three.js e GSAP.", ", built with React, TypeScript, Three.js and GSAP.")}
              </p>
              <p className="ij-dialogo-fraco">Runtime version: 21.0.5 amd64 · Windows 11</p>
              <div className="ij-dialogo-botoes">
                <button onClick={() => { setSobre(false); verSite("contato"); }}>{tr("Falar com o Eduardo", "Contact Eduardo")}</button>
                <button className="primario" onClick={() => setSobre(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
