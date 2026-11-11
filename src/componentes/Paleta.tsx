import { useEffect, useMemo, useRef, useState } from "react";
import { atalhos, copiar, normalizar, useApp } from "../contexto";
import { acharArquivo, arquivos } from "../dados/arquivos";
import { links, perfil } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import {
  IconeAplicacao,
  IconeArquivo,
  IconeBusca,
  IconeEmail,
  IconeGithub,
  IconeLinkedin,
  IconeTerminal,
  IconeWhatsapp,
} from "./Icones";

type Grupo = "arquivos" | "projetos" | "acoes";
type Item = {
  chave: string;
  grupo: Grupo;
  titulo: string;
  detalhe: string;
  icone: React.ReactNode;
  acao: () => void;
};

const abas: { id: Grupo | "tudo"; nome: string }[] = [
  { id: "tudo", nome: "Tudo" },
  { id: "arquivos", nome: "Arquivos" },
  { id: "projetos", nome: "Projetos" },
  { id: "acoes", nome: "Ações" },
];

export function Paleta({ onFechar }: { onFechar: () => void }) {
  const { abrir, alternarTerminal, executar, avisar } = useApp();
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Grupo | "tudo">("tudo");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const itens: Item[] = useMemo(() => {
    const caminho = (id: string) => {
      const a = acharArquivo(id);
      return a ? [perfil.projeto, ...a.caminho].join("/") : "";
    };
    return [
      ...arquivos.map((a) => ({
        chave: `arq-${a.id}`,
        grupo: "arquivos" as const,
        titulo: a.id,
        detalhe: caminho(a.id),
        icone: <IconeArquivo tipo={a.tipo} />,
        acao: () => abrir(a.id),
      })),
      ...projetos.map((p) => ({
        chave: `proj-${p.id}`,
        grupo: "projetos" as const,
        titulo: p.nome,
        detalhe: p.rotulo,
        icone: <IconeArquivo tipo="js" />,
        acao: () => abrir("projetos.js", `projeto-${p.id}`),
      })),
      {
        chave: "executar",
        grupo: "acoes",
        titulo: "Executar 'PortfolioApplication'",
        detalhe: atalhos.executar,
        icone: <IconeAplicacao />,
        acao: executar,
      },
      {
        chave: "terminal",
        grupo: "acoes",
        titulo: "Terminal",
        detalhe: atalhos.terminal,
        icone: <IconeTerminal tamanho={16} />,
        acao: () => alternarTerminal(true),
      },
      {
        chave: "copiar-email",
        grupo: "acoes",
        titulo: "Copiar e-mail",
        detalhe: perfil.email,
        icone: <IconeEmail tamanho={16} />,
        acao: async () => avisar((await copiar(perfil.email)) ? "E-mail copiado" : `O e-mail é ${perfil.email}`),
      },
      {
        chave: "whatsapp",
        grupo: "acoes",
        titulo: "Chamar no WhatsApp",
        detalhe: perfil.whatsapp.exibir,
        icone: <IconeWhatsapp tamanho={16} />,
        acao: () => window.open(links.whatsapp, "_blank", "noopener"),
      },
      {
        chave: "github",
        grupo: "acoes",
        titulo: "Abrir GitHub",
        detalhe: `github.com/${perfil.github}`,
        icone: <IconeGithub tamanho={16} />,
        acao: () => window.open(links.github, "_blank", "noopener"),
      },
      {
        chave: "linkedin",
        grupo: "acoes",
        titulo: "Abrir LinkedIn",
        detalhe: `in/${perfil.linkedin}`,
        icone: <IconeLinkedin tamanho={16} />,
        acao: () => window.open(links.linkedin, "_blank", "noopener"),
      },
    ];
  }, [abrir, alternarTerminal, executar, avisar]);

  const filtrados = useMemo(() => {
    const b = normalizar(busca.trim());
    return itens.filter(
      (i) => (aba === "tudo" || i.grupo === aba) && (!b || normalizar(`${i.titulo} ${i.detalhe}`).includes(b))
    );
  }, [busca, aba, itens]);

  useEffect(() => {
    inputRef.current?.focus();
    const anterior = document.activeElement as HTMLElement | null;
    return () => anterior?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => setSel(0), [busca, aba]);

  useEffect(() => {
    listaRef.current?.querySelector(".sel")?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  function executarItem(i: Item | undefined) {
    if (!i) return;
    onFechar();
    i.acao();
  }

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      executarItem(filtrados[sel]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onFechar();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const i = abas.findIndex((a) => a.id === aba);
      const prox = (i + (e.shiftKey ? abas.length - 1 : 1)) % abas.length;
      setAba(abas[prox].id);
    }
  }

  // Na aba "Tudo", agrupa com um título por grupo, como no IntelliJ
  const nomesGrupo: Record<Grupo, string> = { arquivos: "Arquivos", projetos: "Projetos", acoes: "Ações" };
  let grupoAnterior: Grupo | null = null;

  return (
    <div className="busca-fundo" onMouseDown={onFechar}>
      <div
        className="busca"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar em tudo"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={aoTeclar}
      >
        <div className="busca-abas" role="tablist" aria-label="Onde buscar">
          {abas.map((a) => (
            <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setAba(a.id)} tabIndex={-1}>
              {a.nome}
            </button>
          ))}
        </div>
        <div className="busca-campo">
          <IconeBusca tamanho={16} />
          <input
            ref={inputRef}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite para buscar arquivos, projetos e ações"
            aria-label="Buscar"
            aria-controls="busca-lista"
            aria-activedescendant={filtrados[sel] ? `busca-${filtrados[sel].chave}` : undefined}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <ul className="busca-lista" id="busca-lista" role="listbox" ref={listaRef}>
          {filtrados.map((i, n) => {
            const titulo = aba === "tudo" && i.grupo !== grupoAnterior ? nomesGrupo[i.grupo] : null;
            grupoAnterior = i.grupo;
            return (
              <li key={i.chave} role="presentation">
                {titulo && <p className="busca-grupo">{titulo}</p>}
                <div
                  id={`busca-${i.chave}`}
                  role="option"
                  aria-selected={n === sel}
                  className={`busca-item${n === sel ? " sel" : ""}`}
                  onMouseMove={() => setSel(n)}
                  onClick={() => executarItem(i)}
                >
                  {i.icone}
                  <span className="busca-titulo">{i.titulo}</span>
                  <span className="busca-detalhe">{i.detalhe}</span>
                </div>
              </li>
            );
          })}
          {!filtrados.length && <li className="busca-nada">Nada encontrado para “{busca}”.</li>}
        </ul>
        <p className="busca-rodape">Aperte Shift duas vezes para abrir a busca de qualquer lugar · Tab troca de aba</p>
      </div>
    </div>
  );
}
