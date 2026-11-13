import { useCallback, useEffect, useRef, useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { emitir, ouvir } from "../../sistema/eventos";
import { Site } from "../../site/Site";
import { perfil } from "../../dados/perfil";
import { LogoDev } from "../../sistema/icones";
import { useT } from "../../i18n";
import {
  IcAvancar,
  IcCadeado,
  IcFechar,
  IcFecharJanela,
  IcMais,
  IcMaximizarJanela,
  IcMinimizarJanela,
  IcRecarregar,
  IcRestaurarJanela,
  IcVoltar,
} from "../intellij/icones";

// O portfólio como um site comum, num navegador. É o caminho mais fácil para quem
// não é da área: nada de rodar projeto, é só rolar a página.
export function NavegadorApp({ janela }: { janela: ControleJanela }) {
  const { celular, abrir } = useSistema();
  const t = useT();
  const conteudo = useRef<HTMLDivElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [dica, setDica] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const endereco = location.host || "eduardo.dev";

  const irPara = useCallback((id: string) => {
    const c = conteudo.current;
    const alvo = c?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!c || !alvo) return;
    c.scrollTo({ top: alvo.offsetTop - 64, behavior: "smooth" });
  }, []);

  // Outro lugar pede uma seção (ex.: o guia ou o menu Iniciar)
  useEffect(() => ouvir("navegador:ir", (id) => window.setTimeout(() => irPara(id), 200)), [irPara]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 2200);
    return () => window.clearTimeout(t);
  }, [aviso]);

  return (
    <div className={`br${celular ? " celular" : ""}`}>
      <div className="br-abas" data-arrastar>
        <div className="br-aba">
          <span className="br-favicon" aria-hidden="true">
            <LogoDev tamanho={16} />
          </span>
          <span className="br-aba-titulo">
            {perfil.linha1} | {t("Portfólio", "Portfolio")}
          </span>
          <button className="br-aba-fechar" onClick={janela.fechar} aria-label={t("Fechar aba", "Close tab")}>
            <IcFechar tamanho={10} />
          </button>
        </div>
        <span className="espaco" />
        {!celular && (
          <span className="br-janela" data-nao-arrastar>
            <button onClick={janela.minimizar} aria-label={t("Minimizar", "Minimize")}>
              <IcMinimizarJanela />
            </button>
            <button onClick={janela.alternarMaximizar} aria-label={janela.maximizada ? t("Restaurar", "Restore") : t("Maximizar", "Maximize")}>
              {janela.maximizada ? <IcRestaurarJanela /> : <IcMaximizarJanela />}
            </button>
            <button className="fechar" onClick={janela.fechar} aria-label={t("Fechar", "Close")}>
              <IcFecharJanela />
            </button>
          </span>
        )}
      </div>

      <div className="br-barra">
        <button aria-label={t("Voltar", "Back")} disabled>
          <IcVoltar />
        </button>
        {!celular && (
          <button aria-label={t("Avançar", "Forward")} disabled>
            <IcAvancar />
          </button>
        )}
        <button aria-label={t("Recarregar", "Reload")} onClick={() => setRecarga((n) => n + 1)}>
          <IcRecarregar />
        </button>
        <div className="br-endereco" title={`https://${endereco}/`}>
          <IcCadeado />
          <span>{endereco}</span>
        </div>
        <button aria-label={t("Mais opções", "More options")}>
          <IcMais />
        </button>
      </div>

      {dica && (
        <div className="br-dica" role="note">
          <span>
            {t("Esta é a versão simples do portfólio.", "This is the simple version of the portfolio.")}{" "}
            {!celular && t("Quer ver como um programador vê? ", "Want to see it the way a developer does? ")}
            <button
              onClick={() => {
                abrir("intellij");
                emitir("intellij:site");
              }}
            >
              {t("Abrir no IntelliJ", "Open in IntelliJ")}
            </button>
          </span>
          <button className="br-dica-fechar" onClick={() => setDica(false)} aria-label={t("Fechar aviso", "Close notice")}>
            <IcFechar tamanho={10} />
          </button>
        </div>
      )}

      <div className="br-conteudo" ref={conteudo} key={recarga}>
        <Site irPara={irPara} avisar={setAviso} />
      </div>

      {aviso && (
        <div className="br-aviso" role="status">
          {aviso}
        </div>
      )}
    </div>
  );
}
