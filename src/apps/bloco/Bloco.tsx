import { useState } from "react";
import type { ControleJanela } from "../../sistema/contexto";
import { useSistema } from "../../sistema/contexto";
import { emitir } from "../../sistema/eventos";
import { dispensarGuia, guiaDispensado } from "../../sistema/Guia";
import { links, perfil } from "../../dados/perfil";
import { IcFechar, IcFecharJanela, IcMaximizarJanela, IcMinimizarJanela, IcRestaurarJanela } from "../intellij/icones";

// O LEIA-ME.txt aberto no Bloco de notas: um bilhete do Eduardo para quem acabou de
// sentar no computador dele. As frases com sublinhado fazem alguma coisa.
export function Bloco({ janela }: { janela: ControleJanela }) {
  const { abrir, celular } = useSistema();
  const [naoAbrir, setNaoAbrir] = useState(guiaDispensado());

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

  return (
    <div className={`bn${celular ? " celular" : ""}`}>
      <div className="bn-topo" data-arrastar>
        <div className="bn-aba">
          <span>LEIA-ME.txt</span>
          <button onClick={janela.fechar} aria-label="Fechar LEIA-ME.txt">
            <IcFechar tamanho={10} />
          </button>
        </div>
        <span className="bn-nova" aria-hidden="true">
          +
        </span>
        <span className="espaco" />
        {!celular && (
          <span className="bn-janela" data-nao-arrastar>
            <button onClick={janela.minimizar} aria-label="Minimizar">
              <IcMinimizarJanela />
            </button>
            <button onClick={janela.alternarMaximizar} aria-label={janela.maximizada ? "Restaurar" : "Maximizar"}>
              {janela.maximizada ? <IcRestaurarJanela /> : <IcMaximizarJanela />}
            </button>
            <button className="fechar" onClick={janela.fechar} aria-label="Fechar">
              <IcFecharJanela />
            </button>
          </span>
        )}
      </div>
      <div className="bn-menu" aria-hidden="true">
        <span>Arquivo</span>
        <span>Editar</span>
        <span>Exibir</span>
      </div>

      <div className="bn-texto">
        <p>oi! aqui é o {perfil.nome.toLowerCase()}.</p>
        <p>se você caiu aqui e não é de TI, relaxa: isso é só o meu computador. pode clicar em tudo que nada quebra.</p>
        <p>
          quer ver meu portfólio do jeito normal (projetos, sobre mim e contato)?
          <br />→ {acao("abrir o portfólio no navegador", () => abrir("navegador"))}
        </p>
        <p>
          quer que eu te mostre como funciona cada coisa aqui?
          <br />→{" "}
          {acao("fazer o tour", () => {
            janela.minimizar();
            emitir("sistema:guia", "tour");
          })}{" "}
          (uns 2 minutinhos)
        </p>
        <p>
          é de TI? então fica à vontade. o portfólio é um projeto spring boot de verdade aberto no intellij: aperta o ▶ verde lá em cima que
          ele sobe.
        </p>
        <p>
          pra falar comigo:
          <br />
          {"  "}whatsapp {link(perfil.whatsapp.exibir, links.whatsapp)}
          <br />
          {"  "}e-mail{"   "}
          {link(perfil.email, links.email)}
          <br />
          {"  "}linkedin {link(`in/${perfil.linkedin}`, links.linkedin)}
          <br />
          {"  "}github{"   "}
          {link(`github.com/${perfil.github}`, links.github)}
        </p>
        <p>
          valeu pela visita!
          <br />— {perfil.nome.split(" ")[0].slice(0, 3).toLowerCase()}
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
