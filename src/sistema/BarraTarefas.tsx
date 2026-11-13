import { useEffect, useState } from "react";
import type { AppId } from "./contexto";
import { apps, nomeApp, ordemApps, rotuloApp } from "./apps";
import { mudarIdioma, useT } from "../i18n";
import { IconeBateria, IconeBloco, IconeLupa, IconeSetaCima, IconeSom, IconeWifi, LogoDev } from "./icones";

type Props = {
  abertas: Record<AppId, boolean>;
  focada: AppId | null;
  menuAberto: boolean;
  mudo: boolean;
  celular: boolean;
  chamarGuia: boolean;
  onGuia: () => void;
  onIniciar: (busca?: boolean) => void;
  onApp: (app: AppId) => void;
  onMudo: () => void;
};

function useRelogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), 10_000);
    return () => window.clearInterval(t);
  }, []);
  return agora;
}

export function BarraTarefas({ abertas, focada, menuAberto, mudo, celular, chamarGuia, onGuia, onIniciar, onApp, onMudo }: Props) {
  const t = useT();
  const en = t.idioma === "en";
  const agora = useRelogio();
  const local = en ? "en-US" : "pt-BR";
  const hora = agora.toLocaleTimeString(local, { hour: "2-digit", minute: "2-digit" });
  const data = agora.toLocaleDateString(local);
  // Indicador de idioma do Windows (POR/PTB, ENG/US): um clique troca o idioma do portfólio
  const idioma = (
    <button
      className="bt-idioma"
      onClick={() => mudarIdioma(en ? "pt" : "en")}
      title={en ? "English (United States) · click for Português" : "Português (Brasil) · clique para English"}
      aria-label={en ? "Language: English. Switch to Portuguese" : "Idioma: português. Mudar para inglês"}
    >
      <span>{en ? "ENG" : "POR"}</span>
      <span>{en ? "US" : "PTB"}</span>
    </button>
  );

  return (
    <footer className="barra-tarefas" aria-label={t("Barra de tarefas", "Taskbar")}>
      {!celular && (
        <button className={`bt-guia${chamarGuia ? " chamar" : ""}`} onClick={onGuia} data-guia="guia" title={t("LEIA-ME.txt", "README.txt")}>
          <IconeBloco tamanho={26} />
          <span>
            {t("LEIA-ME", "README")}
            <small>{t("comece por aqui", "start here")}</small>
          </span>
        </button>
      )}
      <div className="bt-centro">
        <button
          className={`bt-botao bt-iniciar${menuAberto ? " ativo" : ""}`}
          onClick={() => onIniciar()}
          aria-label={t("Iniciar", "Start")}
          aria-expanded={menuAberto}
          title={t("Iniciar", "Start")}
          data-menu-iniciar
        >
          <LogoDev tamanho={26} />
        </button>
        {!celular && (
          <button className="bt-botao" onClick={() => onIniciar(true)} aria-label={t("Pesquisar", "Search")} title={t("Pesquisar", "Search")} data-menu-iniciar>
            <IconeLupa tamanho={20} />
          </button>
        )}
        {ordemApps.map((id) => {
          if (id === "bloco" && !abertas[id] && !celular) return null;
          const { Icone } = apps[id];
          return (
            <button
              key={id}
              className={`bt-botao bt-app${abertas[id] ? " aberta" : ""}${focada === id ? " focada" : ""}`}
              onClick={() => onApp(id)}
              aria-label={nomeApp(id, en)}
              title={rotuloApp(id, en)}
              data-app={id}
              data-guia={celular && id === "bloco" ? "guia" : undefined}
            >
              <Icone tamanho={26} />
              <span className="bt-indicador" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="bt-bandeja">
        {!celular && (
          <>
            <span className="bt-tray" aria-hidden="true">
              <IconeSetaCima />
            </span>
            <span className="bt-sistema">
              <IconeWifi />
              <button onClick={onMudo} aria-label={mudo ? t("Ativar som", "Unmute") : t("Desativar som", "Mute")} title={mudo ? t("Som desativado", "Muted") : t("Som", "Sound")}>
                <IconeSom mudo={mudo} />
              </button>
              <IconeBateria />
            </span>
          </>
        )}
        {idioma}
        <span className="bt-relogio" aria-label={`${hora}, ${data}`}>
          <span>{hora}</span>
          {!celular && <span>{data}</span>}
        </span>
      </div>
    </footer>
  );
}
