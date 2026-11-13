import { useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { emitir } from "../../sistema/eventos";
import { dispensarGuia, guiaDispensado } from "../../sistema/Guia";
import { links, perfil } from "../../dados/perfil";
import { useT } from "../../i18n";
import { IcFechar, IcFecharJanela, IcMaximizarJanela, IcMinimizarJanela, IcRestaurarJanela } from "../intellij/icones";

// O LEIA-ME.txt aberto no Bloco de notas: um bilhete do Eduardo para quem acabou de
// sentar no computador dele. As frases com sublinhado fazem alguma coisa.
export function Bloco({ janela }: { janela: ControleJanela }) {
  const { abrir, celular } = useSistema();
  const t = useT();
  const [naoAbrir, setNaoAbrir] = useState(guiaDispensado());
  const arquivo = t("LEIA-ME.txt", "README.txt");

  const acao = (texto: string, fazer: () => void) => (
    <button className="bn-link" onClick={fazer}>
      {texto}
    </button>
  );
  const link = (texto: string, href: string) => (
    <a className="bn-link" href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener">
      {texto}
    </a>
  );
  const tour = acao(t("fazer o tour", "take the tour"), () => {
    janela.minimizar();
    emitir("sistema:guia", "tour");
  });

  return (
    <div className={`bn${celular ? " celular" : ""}`}>
      <div className="bn-topo" data-arrastar>
        <div className="bn-aba">
          <span>{arquivo}</span>
          <button onClick={janela.fechar} aria-label={t(`Fechar ${arquivo}`, `Close ${arquivo}`)}>
            <IcFechar tamanho={10} />
          </button>
        </div>
        <span className="bn-nova" aria-hidden="true">
          +
        </span>
        <span className="espaco" />
        {!celular && (
          <span className="bn-janela" data-nao-arrastar>
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
      <div className="bn-menu" aria-hidden="true">
        <span>{t("Arquivo", "File")}</span>
        <span>{t("Editar", "Edit")}</span>
        <span>{t("Exibir", "View")}</span>
      </div>

      {t.idioma === "pt" ? (
        <div className="bn-texto">
          <p>oi! aqui é o {perfil.nome.toLowerCase()}.</p>
          <p>se você caiu aqui e não é de TI, relaxa: isso é só o meu computador. pode clicar em tudo que nada quebra.</p>
          <p>
            quer ver meu portfólio do jeito normal (projetos, sobre mim e contato)?
            <br />→ {acao("abrir o portfólio no navegador", () => abrir("navegador"))}
          </p>
          <p>
            quer que eu te mostre como funciona cada coisa aqui?
            <br />→ {tour} (uns 2 minutinhos)
          </p>
          <p>
            é de TI? então fica à vontade. o portfólio é um projeto spring boot de verdade aberto no intellij, e já deixei ele rodando: o site
            tá na aba localhost:8080. dá pra fuçar nos arquivos, no banco (datagrip) e no terminal.
          </p>
          <p>
            pra falar comigo:
            <br />
            {"  "}e-mail{"   "}
            {link(perfil.email, links.email)}
            <br />
            {"  "}linkedin {link(perfil.linha1.toLowerCase(), links.linkedin)}
          </p>
          <p>
            valeu pela visita!
            <br />— edu
            <span className="bn-cursor" aria-hidden="true" />
          </p>
          <p className="bn-rodape-texto">
            (esse bilhete abre sozinho quando alguém entra.{" "}
            {acao(naoAbrir ? "voltar a abrir sozinho" : "não abrir mais sozinho", () => {
              dispensarGuia(!naoAbrir);
              setNaoAbrir(!naoAbrir);
            })}
            )
          </p>
        </div>
      ) : (
        <div className="bn-texto">
          <p>hi! it's {perfil.nome.toLowerCase()} here.</p>
          <p>if you landed here and you're not into tech, relax: this is just my computer. click on anything, nothing breaks.</p>
          <p>
            want to see my portfolio the usual way (projects, about me and contact)?
            <br />→ {acao("open the portfolio in the browser", () => abrir("navegador"))}
          </p>
          <p>
            want me to show you how everything here works?
            <br />→ {tour} (about 2 minutes)
          </p>
          <p>
            a developer? make yourself at home. the portfolio is a real spring boot project open in intellij, and it's already running: the
            website is in the localhost:8080 tab. feel free to dig through the files, the database (datagrip) and the terminal.
          </p>
          <p>
            to reach me:
            <br />
            {"  "}e-mail{"   "}
            {link(perfil.email, links.email)}
            <br />
            {"  "}linkedin {link(perfil.linha1.toLowerCase(), links.linkedin)}
          </p>
          <p>
            thanks for stopping by!
            <br />— edu
            <span className="bn-cursor" aria-hidden="true" />
          </p>
          <p className="bn-rodape-texto">
            (this note opens by itself when someone arrives.{" "}
            {acao(naoAbrir ? "open it automatically again" : "don't open it automatically", () => {
              dispensarGuia(!naoAbrir);
              setNaoAbrir(!naoAbrir);
            })}
            )
          </p>
        </div>
      )}

      <div className="bn-status" aria-hidden="true">
        <span>Ln 24, Col 7</span>
        <span className="espaco" />
        {!celular && <span>100%</span>}
        {!celular && <span>Windows (CRLF)</span>}
        <span>UTF-8</span>
      </div>
    </div>
  );
}
