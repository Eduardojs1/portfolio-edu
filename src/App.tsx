import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { atalhos, Contexto, useMedia, type AppCtx } from "./contexto";
import { acharArquivo, arquivoInicial, arvore } from "./dados/arquivos";
import { perfil } from "./dados/perfil";
import {
  IconeAplicacao,
  IconeArquivo,
  IconeBusca,
  IconeExecutar,
  IconeFechar,
  IconeMinimizar,
  IconeProjeto,
  IconeTerminal,
} from "./componentes/Icones";
import { Arvore } from "./componentes/Arvore";
import { Terminal } from "./componentes/Terminal";
import { Executar } from "./componentes/Executar";
import { Paleta } from "./componentes/Paleta";
import { Inicio } from "./paginas/Inicio";
import { Sobre } from "./paginas/Sobre";
import { Projetos } from "./paginas/Projetos";
import { Stack } from "./paginas/Stack";
import { Contato } from "./paginas/Contato";
import { Readme } from "./paginas/Readme";

const paginas: Record<string, () => React.JSX.Element> = {
  "inicio.tsx": Inicio,
  "sobre.html": Sobre,
  "projetos.js": Projetos,
  "stack.json": Stack,
  "contato.css": Contato,
  "README.md": Readme,
};

type Painel = "terminal" | "executar" | null;

function arquivoDoEndereco() {
  const id = decodeURIComponent(location.hash.slice(1));
  return paginas[id] ? id : null;
}

export default function App() {
  const ehCelular = useMedia("(max-width: 900px)");

  const [abas, setAbas] = useState<string[]>(() => {
    const doEndereco = arquivoDoEndereco();
    return doEndereco && doEndereco !== arquivoInicial ? [arquivoInicial, doEndereco] : [arquivoInicial];
  });
  const [ativo, setAtivo] = useState<string | null>(() => arquivoDoEndereco() ?? arquivoInicial);
  const [ancora, setAncora] = useState<string | null>(null);
  const [projetoVisivel, setProjetoVisivel] = useState(true);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [pastasFechadas, setPastasFechadas] = useState<Set<string>>(new Set());
  const [painel, setPainel] = useState<Painel>(null);
  const [execucao, setExecucao] = useState(0);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const avisoTimer = useRef<number | undefined>(undefined);

  const abrir = useCallback((id: string, ancoraAlvo?: string) => {
    if (id === "curriculo.pdf") {
      if (perfil.curriculo) window.open(perfil.curriculo, "_blank", "noopener");
      return;
    }
    if (!paginas[id]) return;
    setAbas((a) => (a.includes(id) ? a : [...a, id]));
    setAtivo(id);
    setAncora(ancoraAlvo ?? null);
    setGavetaAberta(false);
  }, []);

  const fechar = (id: string) => {
    const i = abas.indexOf(id);
    const resto = abas.filter((x) => x !== id);
    setAbas(resto);
    if (ativo === id) setAtivo(resto[Math.min(i, resto.length - 1)] ?? null);
  };

  const alternarTerminal = useCallback((forcar?: boolean) => {
    setPainel((p) => {
      const aberto = p === "terminal";
      const quer = forcar === undefined ? !aberto : forcar;
      return quer ? "terminal" : aberto ? null : p;
    });
  }, []);

  const executar = useCallback(() => {
    setPainel("executar");
    setExecucao((n) => n + 1);
  }, []);

  const alternarProjeto = useCallback(() => {
    if (ehCelular) setGavetaAberta((g) => !g);
    else setProjetoVisivel((v) => !v);
  }, [ehCelular]);

  const avisar = useCallback((mensagem: string) => {
    setAviso(mensagem);
    window.clearTimeout(avisoTimer.current);
    avisoTimer.current = window.setTimeout(() => setAviso(null), 2400);
  }, []);

  const ctx: AppCtx = useMemo(
    () => ({ abrir, alternarTerminal, executar, abrirBusca: () => setBuscaAberta(true), avisar }),
    [abrir, alternarTerminal, executar, avisar]
  );

  const alternarPasta = useCallback((chave: string) => {
    setPastasFechadas((s) => {
      const n = new Set(s);
      if (n.has(chave)) n.delete(chave);
      else n.add(chave);
      return n;
    });
  }, []);

  // Endereço acompanha o arquivo aberto (dá para compartilhar o link de uma aba)
  useEffect(() => {
    if (location.hash !== `#${ativo}`) history.replaceState(null, "", ativo ? `#${ativo}` : location.pathname);
    document.title = ativo ? `${ativo} · ${perfil.linha1}` : `${perfil.linha1} | Portfólio`;
  }, [ativo]);

  useEffect(() => {
    const aoMudar = () => {
      const id = arquivoDoEndereco();
      if (id) abrir(id);
    };
    addEventListener("hashchange", aoMudar);
    return () => removeEventListener("hashchange", aoMudar);
  }, [abrir]);

  // Ao trocar de arquivo: volta ao topo ou vai até a âncora pedida
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const alvo = ancora ? document.getElementById(ancora) : null;
    if (alvo) {
      ed.scrollTop += alvo.getBoundingClientRect().top - ed.getBoundingClientRect().top - 16;
      alvo.classList.add("piscar");
      window.setTimeout(() => alvo.classList.remove("piscar"), 1400);
    } else {
      ed.scrollTop = 0;
    }
  }, [ativo, ancora]);

  // Atalhos (os do IntelliJ, mais alguns de navegador)
  useEffect(() => {
    let ultimoShift = 0;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (e.repeat) return;
        const agora = performance.now();
        if (agora - ultimoShift < 400) {
          setBuscaAberta(true);
          ultimoShift = 0;
        } else ultimoShift = agora;
        return;
      }
      ultimoShift = 0;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && (k === "p" || k === "k")) {
        e.preventDefault();
        setBuscaAberta(true);
      } else if ((e.altKey && e.key === "F12") || (mod && k === "j")) {
        e.preventDefault();
        alternarTerminal();
      } else if (e.shiftKey && e.key === "F10") {
        e.preventDefault();
        executar();
      } else if (e.altKey && e.key === "1") {
        e.preventDefault();
        alternarProjeto();
      }
    };
    addEventListener("keydown", tecla);
    return () => removeEventListener("keydown", tecla);
  }, [alternarTerminal, executar, alternarProjeto]);

  const Pagina = ativo ? paginas[ativo] : null;
  const arquivoAtivo = ativo ? acharArquivo(ativo) : undefined;
  const projetoAberto = ehCelular ? gavetaAberta : projetoVisivel;
  const caminhoStatus = arquivoAtivo ? [perfil.projeto, ...arquivoAtivo.caminho, arquivoAtivo.id] : [perfil.projeto];

  return (
    <Contexto.Provider value={ctx}>
      <div className="ide">
        {/* ---------- Barra principal ---------- */}
        <header className="barra-principal">
          <div className="bp-lado">
            <button className="bp-botao so-celular" onClick={() => setGavetaAberta((g) => !g)} aria-label="Projeto" aria-expanded={gavetaAberta}>
              <IconeProjeto />
            </button>
            <span className="bp-widget">
              <span className="bp-avatar" aria-hidden="true">
                {perfil.iniciais}
              </span>
              <span className="bp-texto">{perfil.projeto}</span>
            </span>
          </div>

          <div className="bp-lado">
            <span className="bp-widget bp-config so-desktop">
              <IconeAplicacao />
              <span className="bp-texto">PortfolioApplication</span>
            </span>
            <button
              className="bp-botao bp-executar"
              onClick={executar}
              aria-label={`Executar 'PortfolioApplication' (${atalhos.executar})`}
              title={`Executar 'PortfolioApplication' (${atalhos.executar})`}
            >
              <IconeExecutar cheio />
            </button>
            <button
              className="bp-botao"
              onClick={() => setBuscaAberta(true)}
              aria-label={`Buscar em tudo (${atalhos.busca})`}
              title={`Buscar em tudo (${atalhos.busca})`}
            >
              <IconeBusca />
            </button>
          </div>
        </header>

        <div className={`corpo${projetoVisivel ? "" : " sem-projeto"}`}>
          {/* ---------- Faixa de ferramentas ---------- */}
          <nav className="faixa" aria-label="Janelas de ferramentas">
            <button
              className={projetoVisivel ? "ativo" : ""}
              onClick={() => setProjetoVisivel((v) => !v)}
              aria-label={`Projeto (${atalhos.projeto})`}
              title={`Projeto (${atalhos.projeto})`}
            >
              <IconeProjeto />
            </button>
            <span className="espaco" />
            <button
              className={painel === "terminal" ? "ativo" : ""}
              onClick={() => alternarTerminal()}
              aria-label={`Terminal (${atalhos.terminal})`}
              title={`Terminal (${atalhos.terminal})`}
            >
              <IconeTerminal />
            </button>
          </nav>

          {/* ---------- Janela Projeto ---------- */}
          <aside className={`janela-projeto${gavetaAberta ? " aberta" : ""}`} aria-label="Projeto">
            <div className="jp-topo">
              <span className="jp-titulo">Projeto</span>
              <span className="espaco" />
              <button className="ji-botao" onClick={alternarProjeto} aria-label="Ocultar" title="Ocultar">
                <IconeMinimizar />
              </button>
            </div>
            <ul className="arvore" role="tree" aria-label="Arquivos do projeto">
              <Arvore
                no={arvore}
                ativo={ativo}
                fechadas={pastasFechadas}
                alternarPasta={alternarPasta}
                abrir={abrir}
                focavel={projetoAberto}
              />
            </ul>
          </aside>
          {gavetaAberta && <div className="fundo-gaveta" onClick={() => setGavetaAberta(false)} />}

          {/* ---------- Editor ---------- */}
          <main className="centro">
            <div className="abas" role="tablist" aria-label="Arquivos abertos">
              {abas.map((id) => {
                const a = acharArquivo(id)!;
                return (
                  <div key={id} className={`aba${ativo === id ? " ativa" : ""}`} role="presentation">
                    <button role="tab" aria-selected={ativo === id} className="aba-nome" onClick={() => setAtivo(id)}>
                      <IconeArquivo tipo={a.tipo} />
                      {id}
                    </button>
                    <button className="aba-fechar" onClick={() => fechar(id)} aria-label={`Fechar ${id}`}>
                      <IconeFechar tamanho={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {Pagina && arquivoAtivo ? (
              <div className="editor" ref={editorRef} role="tabpanel" aria-label={arquivoAtivo.id} tabIndex={-1}>
                <Pagina key={`${ativo}${ancora ?? ""}`} />
              </div>
            ) : (
              <div className="editor editor-vazio">
                <dl className="vazio">
                  <div>
                    <dt>Buscar em tudo</dt>
                    <dd>Shift duas vezes</dd>
                  </div>
                  <div>
                    <dt>Terminal</dt>
                    <dd>{atalhos.terminal}</dd>
                  </div>
                  <div>
                    <dt>Executar</dt>
                    <dd>{atalhos.executar}</dd>
                  </div>
                </dl>
              </div>
            )}

            {painel === "terminal" && <Terminal onFechar={() => setPainel(null)} />}
            {painel === "executar" && (
              <Executar key={execucao} onFechar={() => setPainel(null)} onReexecutar={executar} />
            )}
          </main>
        </div>

        {/* ---------- Barra de status ---------- */}
        <footer className="barra-status">
          <nav className="st-caminho" aria-label="Caminho do arquivo">
            {caminhoStatus.map((c, i) => (
              <span key={i}>
                {i > 0 && <i aria-hidden="true">›</i>}
                {c}
              </span>
            ))}
          </nav>
          {arquivoAtivo && <span>{arquivoAtivo.linguagem}</span>}
        </footer>

        {buscaAberta && <Paleta onFechar={() => setBuscaAberta(false)} />}

        <div className={`aviso${aviso ? " visivel" : ""}`} role="status" aria-live="polite">
          {aviso}
        </div>
      </div>
    </Contexto.Provider>
  );
}
