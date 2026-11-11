import { Fragment } from "react";
import { links, perfil } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import { grupos } from "../dados/stack";
import type { Bloco, Canal } from "../chat/tipos";
import { IconeArquivo, IconeEmail, IconeGithub, IconeLinkedin, IconeSeta, IconeWhatsapp } from "./Icones";

// **negrito** dentro dos textos
export function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {partes.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

const canais: Record<Canal, { rotulo: string; valor: string; href: string; icone: React.ReactNode; externo: boolean }> = {
  whatsapp: { rotulo: "WhatsApp", valor: perfil.whatsapp.exibir, href: links.whatsapp, icone: <IconeWhatsapp />, externo: true },
  email: { rotulo: "E-mail", valor: perfil.email, href: links.email, icone: <IconeEmail />, externo: false },
  linkedin: { rotulo: "LinkedIn", valor: `in/${perfil.linkedin}`, href: links.linkedin, icone: <IconeLinkedin />, externo: true },
  github: { rotulo: "GitHub", valor: `github.com/${perfil.github}`, href: links.github, icone: <IconeGithub />, externo: true },
};

export function Blocos({ blocos, perguntar }: { blocos: Bloco[]; perguntar: (t: string) => void }) {
  return (
    <>
      {blocos.map((b, i) => {
        switch (b.tipo) {
          case "texto":
            return (
              <p key={i} className="b-texto">
                <Rico texto={b.texto} />
              </p>
            );
          case "lista":
            return (
              <ul key={i} className="b-lista">
                {b.itens.map((t) => (
                  <li key={t}>
                    <Rico texto={t} />
                  </li>
                ))}
              </ul>
            );
          case "chips":
            return (
              <ul key={i} className="b-chips" aria-label="Tecnologias">
                {b.itens.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            );
          case "stack":
            return (
              <div key={i} className="b-stack">
                {grupos.map((g) => (
                  <div key={g.id}>
                    <p className="b-stack-nome">{g.nome}</p>
                    <ul className="b-chips">
                      {g.techs.map((t) => (
                        <li key={t.nome}>{t.nome}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          case "contatos":
            return (
              <div key={i} className="b-contatos">
                {(b.quais ?? (Object.keys(canais) as Canal[])).map((c) => {
                  const k = canais[c];
                  return (
                    <a key={c} href={k.href} {...(k.externo ? { target: "_blank", rel: "noopener" } : {})}>
                      {k.icone}
                      <span className="b-contato-rotulo">{k.rotulo}</span>
                      <span className="b-contato-valor">{k.valor}</span>
                      <IconeSeta />
                    </a>
                  );
                })}
              </div>
            );
          case "arquivo":
            return (
              <div key={i} className="b-contatos">
                <a href={b.href} target="_blank" rel="noopener">
                  <IconeArquivo />
                  <span className="b-contato-rotulo">{b.rotulo}</span>
                </a>
              </div>
            );
          case "projetos":
            return (
              <div key={i} className={`b-projetos${b.detalhado ? " detalhado" : ""}`}>
                {b.ids.map((id) => {
                  const p = projetos.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <article key={id} className="b-projeto">
                      <div className="b-projeto-visual">
                        {p.imagem ? (
                          <img src={p.imagem.src} alt={p.imagem.alt} width={1200} height={750} loading="lazy" />
                        ) : (
                          <div className="b-projeto-preview" aria-hidden="true">
                            {p.preview?.map((l) => <span key={l}>{l}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="b-projeto-corpo">
                        <p className="b-projeto-rotulo">{p.rotulo}</p>
                        <h3>{p.nome}</h3>
                        {b.detalhado ? (
                          <p>{p.resumo}</p>
                        ) : (
                          <button className="b-mais" onClick={() => perguntar(`Me conta do ${p.nome}`)}>
                            Saber mais
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            );
        }
      })}
    </>
  );
}
