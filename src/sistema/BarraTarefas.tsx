import { useEffect, useState } from "react";
import type { AppId } from "./contexto";
import { apps, ordemApps } from "./apps";
import { IconeBateria, IconeBloco, IconeLupa, IconeSetaCima, IconeSom, IconeWifi, LogoED } from "./icones";

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
  const agora = useRelogio();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const data = agora.toLocaleDateString("pt-BR");

  return (
    <footer className="barra-tarefas" aria-label="Barra de tarefas">
      {!celular && (
        <button className={`bt-guia${chamarGuia ? " chamar" : ""}`} onClick={onGuia} data-guia="guia" title="LEIA-ME.txt">
          <IconeBloco tamanho={26} />
          <span>
            LEIA-ME
            <small>comece por aqui</small>
          </span>
        </button>
      )}
      <div className="bt-centro">
        <button
          className={`bt-botao bt-iniciar${menuAberto ? " ativo" : ""}`}
          onClick={() => onIniciar()}
          aria-label="Iniciar"
          aria-expanded={menuAberto}
          title="Iniciar"
          data-menu-iniciar
        >
          <LogoED tamanho={26} />
        </button>
        {!celular && (
          <button className="bt-botao" onClick={() => onIniciar(true)} aria-label="Pesquisar" title="Pesquisar" data-menu-iniciar>
            <IconeLupa tamanho={20} />
          </button>
        )}
        {ordemApps.map((id) => {
          if (id === "bloco" && !abertas[id] && !celular) return null;
          const { nome, rotulo, Icone } = apps[id];
          return (
            <button
              key={id}
              className={`bt-botao bt-app${abertas[id] ? " aberta" : ""}${focada === id ? " focada" : ""}`}
              onClick={() => onApp(id)}
              aria-label={nome}
              title={rotulo ?? nome}
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
              <button onClick={onMudo} aria-label={mudo ? "Ativar som" : "Desativar som"} title={mudo ? "Som desativado" : "Som"}>
                <IconeSom mudo={mudo} />
              </button>
              <IconeBateria />
            </span>
          </>
        )}
        <span className="bt-relogio" aria-label={`${hora}, ${data}`}>
          <span>{hora}</span>
          {!celular && <span>{data}</span>}
        </span>
      </div>
    </footer>
  );
}
