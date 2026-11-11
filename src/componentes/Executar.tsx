import { useEffect, useMemo, useState } from "react";
import { reduzMovimento, useApp } from "../contexto";
import { perfil } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import { IconeAplicacao, IconeFechar, IconeMinimizar, IconeParar, IconeReexecutar } from "./Icones";

type Linha = { tipo: "cmd" | "vazio" | "banner" | "info" | "contato" | "fim"; texto: string; classe?: string };

function montarLog(): Linha[] {
  const t0 = Date.now();
  let passo = 0;
  const hora = () => {
    passo += 37 + Math.floor(Math.random() * 60);
    const d = new Date(t0 + passo);
    return `${d.toLocaleTimeString("pt-BR")}.${String(d.getMilliseconds()).padStart(3, "0")}`;
  };
  const info = (classe: string, texto: string, tipo: Linha["tipo"] = "info"): Linha => ({
    tipo,
    classe,
    texto: `${hora()}  INFO  ${classe.padEnd(20)} : ${texto}`,
  });
  return [
    { tipo: "cmd", texto: `"C:\\Program Files\\Java\\jdk-21\\bin\\java.exe" -jar ${perfil.projeto}.jar` },
    { tipo: "vazio", texto: "" },
    { tipo: "banner", texto: `  :: ${perfil.linha1} ::                (${perfil.linha2.toLowerCase()})` },
    { tipo: "vazio", texto: "" },
    info("PortfolioApplication", "Iniciando PortfolioApplication com Java 21"),
    info("PortfolioApplication", "Perfil ativo: \"full-stack\""),
    info("ProjetoLoader", `${projetos.length} projetos carregados: ${projetos.map((p) => p.nome).join(", ")}`),
    info("StackConfig", "Java, Spring Boot, TypeScript, React, Next.js, Vue"),
    info("PortfolioApplication", `Portfólio no ar em ${location.origin}`),
    info("PortfolioApplication", "Iniciado em 0,42 segundos"),
    info("ContatoService", `${perfil.nome} está disponível para novos projetos → `, "contato"),
  ];
}

export function Executar({ onFechar, onReexecutar }: { onFechar: () => void; onReexecutar: () => void }) {
  const { abrir } = useApp();
  const linhas = useMemo(montarLog, []);
  const [mostradas, setMostradas] = useState(() => (reduzMovimento() ? linhas.length : 0));
  const [parado, setParado] = useState(false);

  useEffect(() => {
    if (mostradas >= linhas.length || parado) return;
    const t = window.setTimeout(() => setMostradas((m) => m + 1), mostradas < 4 ? 60 : 160);
    return () => window.clearTimeout(t);
  }, [mostradas, linhas.length, parado]);

  const visiveis = linhas.slice(0, mostradas);

  return (
    <section className="janela-inferior" aria-label="Executar">
      <div className="ji-topo">
        <span className="ji-titulo">Executar</span>
        <span className="ji-aba">
          <IconeAplicacao tamanho={14} /> PortfolioApplication
          <button onClick={onFechar} aria-label="Fechar aba PortfolioApplication">
            <IconeFechar tamanho={12} />
          </button>
        </span>
        <span className="espaco" />
        <button className="ji-botao" onClick={onFechar} aria-label="Ocultar" title="Ocultar">
          <IconeMinimizar />
        </button>
      </div>
      <div className="ji-corpo">
        <div className="ji-ferramentas">
          <button onClick={onReexecutar} aria-label="Executar de novo" title="Executar de novo">
            <IconeReexecutar />
          </button>
          <button onClick={() => setParado(true)} disabled={parado} aria-label="Parar" title="Parar">
            <IconeParar ativo={!parado} />
          </button>
        </div>
        <div className="console" role="log" aria-live="polite">
          {visiveis.map((l, i) => (
            <p key={i} className={`c-${l.tipo}`}>
              {l.texto}
              {l.tipo === "contato" && (
                <button className="link" onClick={() => abrir("contato.css")}>
                  contato.css
                </button>
              )}
            </p>
          ))}
          {parado && <p className="c-fim">Processo finalizado com código de saída 130</p>}
        </div>
      </div>
    </section>
  );
}
