import { useEffect, useMemo, useRef, useState } from "react";
import type { AppId } from "./contexto";
import { emitir } from "./eventos";
import { links, perfil } from "../dados/perfil";
import { normalizar } from "../util";
import { useT } from "../i18n";
import {
  IconeDataGrip,
  IconeDesligar,
  IconeEmailApp,
  IconeBloco,
  IconeGuia,
  IconeIntelliJ,
  IconeNavegador,
  IconeLinkedinApp,
  IconeLupa,
  IconeReiniciar,
  IconeSiteApp,
  IconeSpotify,
  LogoDev,
} from "./icones";

type Item = { nome: string; detalhe?: string; Icone: (p: { tamanho?: number }) => React.JSX.Element; acao: () => void };

type Props = {
  focarBusca: boolean;
  onAbrir: (app: AppId) => void;
  onFechar: () => void;
  onDesligar: () => void;
};

export const README = "README.md";
export const SERVICO_PROJETOS = "src/main/java/dev/eduardo/portfolio/service/ProjetoService.java";

export function MenuIniciar({ focarBusca, onAbrir, onFechar, onDesligar }: Props) {
  const t = useT();
  const [busca, setBusca] = useState("");
  const [energia, setEnergia] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const caixa = useRef<HTMLDivElement>(null);

  const fazer = (acao: () => void) => () => {
    acao();
    onFechar();
  };
  const noIntelliJ = (evento: string, dados = "") => () => {
    onAbrir("intellij");
    emitir(evento, dados);
  };
  const site = (url: string) => () => window.open(url, "_blank", "noopener");

  const fixados: Item[] = useMemo(
    () => [
      { nome: t("Portfólio", "Portfolio"), detalhe: t("No navegador, como um site", "In the browser, as a website"), Icone: IconeNavegador, acao: () => onAbrir("navegador") },
      { nome: t("LEIA-ME.txt", "README.txt"), detalhe: t("Comece por aqui", "Start here"), Icone: IconeBloco, acao: () => onAbrir("bloco") },
      { nome: "IntelliJ IDEA", Icone: IconeIntelliJ, acao: () => onAbrir("intellij") },
      { nome: "DataGrip", Icone: IconeDataGrip, acao: () => onAbrir("datagrip") },
      { nome: "Spotify", Icone: IconeSpotify, acao: () => onAbrir("spotify") },
      { nome: "Site", detalhe: "localhost:8080", Icone: IconeSiteApp, acao: noIntelliJ("intellij:site") },
      { nome: "LinkedIn", Icone: IconeLinkedinApp, acao: site(links.linkedin) },
      { nome: "E-mail", detalhe: perfil.email, Icone: IconeEmailApp, acao: () => (location.href = links.email) },
    ],
    [t.idioma]
  );

  const recomendados: Item[] = useMemo(
    () => [
      { nome: t("Tour guiado", "Guided tour"), detalhe: t("Te mostro cada programa", "I'll show you each app"), Icone: IconeGuia, acao: () => emitir("sistema:guia", "tour") },
      { nome: "README.md", detalhe: t("Quem sou e como navegar", "Who I am and how to get around"), Icone: IconeIntelliJ, acao: noIntelliJ("intellij:abrir", README) },
      { nome: t("Rodar o portfólio", "Run the portfolio"), detalhe: "PortfolioApplication · Shift+F10", Icone: IconeIntelliJ, acao: noIntelliJ("intellij:rodar") },
      { nome: "ProjetoService.java", detalhe: t("Os projetos, em código", "The projects, as code"), Icone: IconeIntelliJ, acao: noIntelliJ("intellij:abrir", SERVICO_PROJETOS) },
      { nome: "SELECT * FROM projetos", detalhe: t("No DataGrip", "In DataGrip"), Icone: IconeDataGrip, acao: () => onAbrir("datagrip") },
      { nome: t("Músicas pra codar", "Coding music"), detalhe: t("Playlist no Spotify", "Spotify playlist"), Icone: IconeSpotify, acao: () => { onAbrir("spotify"); emitir("spotify:tocar"); } },
    ],
    [t.idioma]
  );

  useEffect(() => {
    if (focarBusca) campo.current?.focus();
  }, [focarBusca]);

  // Fecha clicando fora ou com Esc
  useEffect(() => {
    const fora = (e: PointerEvent) => {
      const alvo = e.target as HTMLElement;
      if (caixa.current?.contains(alvo) || alvo.closest("[data-menu-iniciar]")) return;
      onFechar();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    addEventListener("pointerdown", fora);
    addEventListener("keydown", esc);
    return () => {
      removeEventListener("pointerdown", fora);
      removeEventListener("keydown", esc);
    };
  }, [onFechar]);

  const termo = normalizar(busca.trim());
  const resultados = termo
    ? [...fixados, ...recomendados].filter((i) => normalizar(`${i.nome} ${i.detalhe ?? ""}`).includes(termo))
    : null;

  return (
    <div className="menu-iniciar" ref={caixa} role="dialog" aria-label={t("Menu Iniciar", "Start menu")}>
      <label className="mi-busca">
        <IconeLupa tamanho={16} />
        <input
          ref={campo}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && resultados?.[0]) fazer(resultados[0].acao)();
          }}
          placeholder={t("Pesquisar aplicativos, arquivos e atalhos", "Search for apps, files and shortcuts")}
          aria-label={t("Pesquisar", "Search")}
        />
      </label>

      {resultados ? (
        <div className="mi-secao">
          <h2 className="mi-titulo">{t("Resultados", "Results")}</h2>
          {resultados.length ? (
            <ul className="mi-lista">
              {resultados.map((i) => (
                <li key={i.nome}>
                  <button onClick={fazer(i.acao)}>
                    <i.Icone tamanho={28} />
                    <span>
                      <strong>{i.nome}</strong>
                      {i.detalhe && <small>{i.detalhe}</small>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mi-vazio">{t("Nada encontrado para", "Nothing found for")} "{busca}".</p>
          )}
        </div>
      ) : (
        <>
          <div className="mi-secao">
            <h2 className="mi-titulo">{t("Fixado", "Pinned")}</h2>
            <ul className="mi-grade">
              {fixados.map((i) => (
                <li key={i.nome}>
                  <button onClick={fazer(i.acao)} title={i.detalhe}>
                    <i.Icone tamanho={32} />
                    <span>{i.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="mi-secao">
            <h2 className="mi-titulo">{t("Recomendado", "Recommended")}</h2>
            <ul className="mi-lista mi-lista-2">
              {recomendados.map((i) => (
                <li key={i.nome}>
                  <button onClick={fazer(i.acao)}>
                    <i.Icone tamanho={28} />
                    <span>
                      <strong>{i.nome}</strong>
                      {i.detalhe && <small>{i.detalhe}</small>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mi-rodape">
        <span className="mi-usuario">
          <LogoDev tamanho={30} />
          {perfil.linha1}
        </span>
        <div className="mi-energia">
          {energia && (
            <div className="mi-energia-menu" role="menu">
              <button role="menuitem" onClick={fazer(onDesligar)}>
                <IconeDesligar /> {t("Desligar", "Shut down")}
              </button>
              <button role="menuitem" onClick={() => location.reload()}>
                <IconeReiniciar /> {t("Reiniciar", "Restart")}
              </button>
            </div>
          )}
          <button
            className="mi-energia-botao"
            onClick={() => setEnergia((v) => !v)}
            aria-label={t("Energia", "Power")}
            aria-expanded={energia}
            title={t("Energia", "Power")}
          >
            <IconeDesligar tamanho={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
