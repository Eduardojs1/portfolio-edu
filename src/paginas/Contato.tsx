import { copiar, useApp } from "../contexto";
import { links, perfil } from "../dados/perfil";

const canais = [
  { prop: "email", valor: perfil.email, href: links.email, externo: false },
  { prop: "whatsapp", valor: perfil.whatsapp.exibir, href: links.whatsapp, externo: true },
  { prop: "github", valor: `github.com/${perfil.github}`, href: links.github, externo: true },
  { prop: "linkedin", valor: `in/${perfil.linkedin}`, href: links.linkedin, externo: true },
];

export function Contato() {
  const { avisar } = useApp();

  return (
    <article className="pagina contato">
      <p className="comentario">/* contato.css : bora conversar */</p>
      <h1 className="titulo">Contato</h1>
      <p className="texto">Tem um projeto? Me chama por qualquer um destes.</p>

      <div className="codigo">
        <p>
          <span className="tk-seletor">.contato</span> <span className="tk-pont">{"{"}</span>
        </p>
        {canais.map((c) => (
          <p className="recuo-1" key={c.prop}>
            <span className="tk-prop">{c.prop}</span>
            <span className="tk-pont">: </span>
            <a className="tk-str" href={c.href} {...(c.externo ? { target: "_blank", rel: "noopener" } : {})}>
              "{c.valor}"
            </a>
            <span className="tk-pont">;</span>
            {c.prop === "email" && (
              <button
                className="mini-btn"
                onClick={async () => avisar((await copiar(perfil.email)) ? "E-mail copiado" : `O e-mail é ${perfil.email}`)}
              >
                copiar
              </button>
            )}
          </p>
        ))}
        <p className="tk-pont">{"}"}</p>
      </div>
    </article>
  );
}
