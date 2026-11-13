import { useEffect, useState } from "react";
import { copiar, reduzMovimento } from "../util";
import { links, perfil, periodo } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import { stack } from "../dados/stack";
import { textoSobre, textoSobreEn } from "../dados/sobre";
import { LogoDev } from "../sistema/icones";
import { useT } from "../i18n";
import { TrocaIdioma } from "../TrocaIdioma";
import { Retrato } from "./Retrato";

// O site do portfólio, como o Spring Boot serviria em localhost:8080.
// Aparece no preview do IntelliJ e no Navegador.
type Props = { irPara: (id: string) => void; avisar: (msg: string) => void };

function Digitando({ frases, rotulo }: { frases: string[]; rotulo: string }) {
  const [texto, setTexto] = useState(reduzMovimento() ? frases[0] : "");
  useEffect(() => {
    if (reduzMovimento()) return setTexto(frases[0]);
    let frase = 0;
    let letra = 0;
    let apagando = false;
    let t: number;
    setTexto("");
    const passo = () => {
      const alvo = frases[frase];
      if (!apagando) {
        setTexto(alvo.slice(0, ++letra));
        if (letra === alvo.length) {
          apagando = true;
          t = window.setTimeout(passo, 2200);
          return;
        }
        t = window.setTimeout(passo, 45 + Math.random() * 45);
      } else {
        setTexto(alvo.slice(0, --letra));
        if (letra === 0) {
          apagando = false;
          frase = (frase + 1) % frases.length;
          t = window.setTimeout(passo, 350);
          return;
        }
        t = window.setTimeout(passo, 22);
      }
    };
    t = window.setTimeout(passo, 500);
    return () => window.clearTimeout(t);
  }, [frases]);
  return (
    <p className="s-digitando" aria-label={`${rotulo} ${frases.join(", ")}`}>
      <span className="s-kw">{rotulo}</span> <span aria-hidden="true">{texto}</span>
      <span className="s-cursor" aria-hidden="true" />
    </p>
  );
}

const IcEmail = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const IcLinkedin = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3zM9.5 9.75h3.83v1.54h.06c.53-1.01 1.84-2.07 3.8-2.07 4.06 0 4.81 2.6 4.81 5.99V21h-4v-5.13c0-1.22-.02-2.8-1.71-2.8-1.71 0-1.97 1.33-1.97 2.71V21h-4z" />
  </svg>
);

export function Site({ irPara, avisar }: Props) {
  const t = useT();
  const en = t.idioma === "en";
  // Projetos abertos (o "+" de cada linha)
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());
  const alternarProjeto = (id: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const link = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    irPara(id);
  };
  const secoes: [string, string][] = [
    ["sobre", t("Sobre", "About")],
    ["projetos", t("Projetos", "Projects")],
    ["stack", "Stack"],
    ["carreira", t("Carreira", "Career")],
    ["contato", t("Contato", "Contact")],
  ];

  return (
    <div className="site">
      <header className="s-topo">
        <a href="#inicio" className="s-marca" onClick={link("inicio")}>
          <LogoDev tamanho={28} />
          {perfil.linha1}
        </a>
        <nav className="s-nav" aria-label={t("Seções", "Sections")}>
          {secoes.map(([id, nome]) => (
            <a key={id} href={`#${id}`} onClick={link(id)}>
              {nome}
            </a>
          ))}
        </nav>
        <TrocaIdioma />
      </header>

      <section className="s-heroi" id="inicio">
        <div className="s-heroi-texto">
          <h1 className="s-nome">
            <span>{perfil.linha1}</span>
            <span className="s-nome-destaque">{perfil.linha2}</span>
          </h1>
          <Digitando frases={en ? perfil.construindoEn : perfil.construindo} rotulo={t("construindo", "building")} />
          <p className="s-intro">{en ? perfil.introEn : perfil.intro}</p>
          <div className="s-acoes">
            <button className="s-btn s-btn-primario" onClick={() => irPara("projetos")}>
              {t("Ver projetos", "See projects")}
            </button>
            <button className="s-btn" onClick={() => irPara("contato")}>
              {t("Falar comigo", "Get in touch")}
            </button>
          </div>
        </div>
        <Retrato />
      </section>

      <section className="s-secao" id="sobre">
        <h2 className="s-titulo">{t("Sobre mim", "About me")}</h2>
        <p className="s-texto s-texto-grande">{en ? textoSobreEn : textoSobre}</p>
      </section>

      <section className="s-secao" id="projetos">
        <div className="s-titulo-linha">
          <h2 className="s-titulo">{t("Projetos", "Projects")}</h2>
          <span className="s-contagem">{String(projetos.length).padStart(2, "0")}</span>
        </div>
        <ol className="s-projetos">
          {projetos.map((p, i) => {
            const d = en ? p.en : p;
            const aberto = abertos.has(p.id);
            return (
              <li key={p.id} id={`projeto-${p.id}`} className={`s-proj${aberto ? " aberto" : ""}`}>
                <button className="s-proj-topo" onClick={() => alternarProjeto(p.id)} aria-expanded={aberto} aria-controls={`projeto-${p.id}-mais`}>
                  <span className="s-proj-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="s-proj-titulo">
                    <span className="s-proj-tipo">{d.rotulo}</span>
                    <span className="s-proj-nome">{p.nome}</span>
                    <span className="s-proj-destaques">{d.destaques.join(" · ")}</span>
                  </span>
                  <span className="s-proj-mais" aria-hidden="true">
                    <svg viewBox="0 0 16 16" width="16" height="16">
                      <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="sr-only">{aberto ? t("Fechar detalhes", "Hide details") : t("Ver detalhes", "Show details")}</span>
                </button>
                <div className="s-proj-corpo" id={`projeto-${p.id}-mais`} role="region" aria-label={p.nome}>
                  <div>
                    <div className="s-proj-detalhe">
                      <div>
                        <p className="s-proj-sobre">{d.sobre}</p>
                        <h4 className="s-proj-sub">{t("O que eu fiz", "What I did")}</h4>
                        <p className="s-proj-texto">{d.fiz}</p>
                      </div>
                      <div>
                        <h4 className="s-proj-sub">{t("Por dentro", "Inside")}</h4>
                        <ul className="s-proj-lista">
                          {d.detalhes.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                        <ul className="s-chips s-chips-mini">
                          {p.stack.map((tec) => (
                            <li key={tec} className="s-chip">
                              {tec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="s-secao" id="stack">
        <h2 className="s-titulo">Stack</h2>
        <div className="s-grupos">
          {stack.map((g) => (
            <div key={g.grupo} className="s-grupo">
              <h3 className="s-grupo-nome">{en ? g.nomeEn : g.nome}</h3>
              <ul className="s-chips">
                {g.itens.map((item) => (
                  <li key={item} className="s-chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="s-secao" id="carreira">
        <h2 className="s-titulo">{t("Carreira", "Career")}</h2>
        <div className="s-carreira">
          <div>
            <h3 className="s-subtitulo">{t("Experiência", "Experience")}</h3>
            <ol className="s-linha-tempo">
              {perfil.experiencia.map((x) => (
                <li key={x.empresa} className="s-cargo">
                  <span className="s-cargo-marca" aria-hidden="true" />
                  <strong className="s-cargo-nome">{en ? x.cargoEn : x.cargo}</strong>
                  <span className="s-cargo-empresa">
                    {x.empresa} · {en ? x.tipoEn : x.tipo}
                  </span>
                  <span className="s-cargo-info">{periodo(x.inicio, x.fim, t.idioma)}</span>
                  <span className="s-cargo-info">{en ? x.localEn : x.local}</span>
                  <ul className="s-chips s-chips-mini">
                    {(en ? x.competenciasEn : x.competencias).map((c) => (
                      <li key={c} className="s-chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="s-subtitulo">{t("Formação", "Education")}</h3>
            <ul className="s-frentes">
              {perfil.formacao.map((f) => (
                <li key={f.curso}>
                  <strong>{en ? f.cursoEn : f.curso}</strong>
                  <span>{f.onde}</span>
                </li>
              ))}
            </ul>
            <a className="s-link-externo" href={links.linkedin} target="_blank" rel="noopener">
              {t("Ver o perfil completo no LinkedIn", "See the full profile on LinkedIn")} ↗
            </a>
          </div>
        </div>
      </section>

      <section className="s-secao" id="contato">
        <h2 className="s-titulo">{t("Contato", "Contact")}</h2>
        <p className="s-texto">{t("Tem um projeto ou uma vaga? Me chama.", "Have a project or a role in mind? Get in touch.")}</p>
        <div className="s-canais">
          <div className="s-canal">
            <span className="s-canal-icone">
              <IcEmail />
            </span>
            <span className="s-canal-nome">E-mail</span>
            <a className="s-canal-valor" href={links.email}>
              {perfil.email}
            </a>
            <button
              className="s-mini-btn"
              onClick={async () => avisar((await copiar(perfil.email)) ? t("E-mail copiado", "E-mail copied") : perfil.email)}
            >
              {t("copiar", "copy")}
            </button>
          </div>
          <div className="s-canal">
            <span className="s-canal-icone">
              <IcLinkedin />
            </span>
            <span className="s-canal-nome">LinkedIn</span>
            <a className="s-canal-valor" href={links.linkedin} target="_blank" rel="noopener">
              {perfil.linha1} ↗
            </a>
          </div>
        </div>
      </section>

      <footer className="s-rodape">
        <div className="s-rodape-topo">
          <div className="s-rodape-nome">
            <strong>{perfil.linha1}</strong>
            <span>{perfil.linha2}</span>
          </div>
          <div className="s-rodape-links">
            <a href={links.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">
              <IcLinkedin />
            </a>
            <a href={links.email} aria-label="E-mail" title={perfil.email}>
              <IcEmail />
            </a>
          </div>
        </div>
        <p className="s-rodape-copy">
          © {new Date().getFullYear()} {perfil.linha1}. {t("Todos os direitos reservados.", "All rights reserved.")}
        </p>
      </footer>
    </div>
  );
}
