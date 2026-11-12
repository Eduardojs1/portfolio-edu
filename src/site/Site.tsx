import { useEffect, useState } from "react";
import { copiar, reduzMovimento } from "../util";
import { links, perfil } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import { estudando, stack } from "../dados/stack";
import { frentes, textoSobre } from "../dados/sobre";
import { Retrato } from "./Retrato";

// O site do portfólio, como o Spring Boot serviria em localhost:8080.
// Aparece no preview do IntelliJ depois de rodar o PortfolioApplication.
type Props = { irPara: (id: string) => void; avisar: (msg: string) => void };

const frases = perfil.construindo;

function Digitando() {
  const [texto, setTexto] = useState(reduzMovimento() ? frases[0] : "");
  useEffect(() => {
    if (reduzMovimento()) return;
    let frase = 0;
    let letra = 0;
    let apagando = false;
    let t: number;
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
  }, []);
  return (
    <p className="s-digitando" aria-label={`Construindo ${frases.join(", ")}`}>
      <span className="s-kw">construindo</span> <span aria-hidden="true">{texto}</span>
      <span className="s-cursor" aria-hidden="true" />
    </p>
  );
}

const destaque = projetos.find((p) => p.imagem) ?? projetos[0];
const totalTecnologias = new Set(stack.flatMap((g) => g.itens)).size;

const canais = [
  { nome: "E-mail", valor: perfil.email, href: links.email, externo: false },
  { nome: "WhatsApp", valor: perfil.whatsapp.exibir, href: links.whatsapp, externo: true },
  { nome: "GitHub", valor: `github.com/${perfil.github}`, href: links.github, externo: true },
  { nome: "LinkedIn", valor: `in/${perfil.linkedin}`, href: links.linkedin, externo: true },
];

export function Site({ irPara, avisar }: Props) {
  const link = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    irPara(id);
  };

  return (
    <div className="site">
      <header className="s-topo">
        <a href="#inicio" className="s-marca" onClick={link("inicio")}>
          <span className="s-logo">{perfil.iniciais}</span>
          {perfil.linha1}
        </a>
        <nav className="s-nav" aria-label="Seções">
          {[
            ["projetos", "Projetos"],
            ["stack", "Stack"],
            ["sobre", "Sobre"],
            ["contato", "Contato"],
          ].map(([id, nome]) => (
            <a key={id} href={`#${id}`} onClick={link(id)}>
              {nome}
            </a>
          ))}
        </nav>
      </header>

      <section className="s-heroi" id="inicio">
        <div className="s-heroi-texto">
          <p className="s-comentario">// olá, mundo! bem-vindo ao meu portfólio</p>
          <h1 className="s-nome">
            <span>{perfil.linha1}</span>
            <span className="s-nome-destaque">{perfil.linha2}</span>
          </h1>
          <Digitando />
          <p className="s-intro">{perfil.intro}</p>
          <div className="s-acoes">
            <button className="s-btn s-btn-primario" onClick={() => irPara("projetos")}>
              Ver projetos
            </button>
            <button className="s-btn" onClick={() => irPara("contato")}>
              Falar comigo
            </button>
          </div>
        </div>
        <Retrato />
      </section>

      <section className="s-bento" aria-label="Resumo">
        <button className="s-card s-card-destaque" onClick={() => irPara(`projeto-${destaque.id}`)}>
          <span className="s-card-rotulo">// em destaque</span>
          <span className="s-card-visual">
            {destaque.imagem && <img src={destaque.imagem.src} alt="" width={1200} height={750} loading="lazy" />}
          </span>
          <span className="s-card-titulo">{destaque.nome}</span>
          <span className="s-card-texto">{destaque.rotulo}</span>
          <span className="s-card-link">ver projeto →</span>
        </button>
        {perfil.disponivel && (
          <button className="s-card s-card-status" onClick={() => irPara("contato")}>
            <span className="s-card-rotulo">// status</span>
            <span className="s-status">
              <span className="s-ponto" aria-hidden="true" />
              Disponível para novos projetos
            </span>
            <span className="s-card-texto">Tem uma ideia? Me chama e a gente vê o melhor caminho.</span>
            <span className="s-card-link">falar comigo →</span>
          </button>
        )}
        <div className="s-card s-card-numeros">
          <span className="s-card-rotulo">// em números</span>
          <dl className="s-numeros">
            <div>
              <dt>projetos aqui</dt>
              <dd>{projetos.length}</dd>
            </div>
            <div>
              <dt>tecnologias</dt>
              <dd>{totalTecnologias}</dd>
            </div>
            <div>
              <dt>áreas</dt>
              <dd>{stack.length}</dd>
            </div>
          </dl>
        </div>
        <div className="s-card s-card-formacao">
          <span className="s-card-rotulo">// formação</span>
          <ul className="s-formacao">
            {perfil.formacao.map((f) => (
              <li key={f.curso}>
                <strong>{f.curso}</strong>
                <span>{f.onde}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="s-secao" id="projetos">
        <p className="s-comentario">// coisas que construí</p>
        <h2 className="s-titulo">Projetos</h2>
        <div className="s-projetos">
          {projetos.map((p) => (
            <article key={p.id} id={`projeto-${p.id}`} className="s-projeto">
              <div className="s-projeto-visual">
                {p.imagem ? (
                  <img src={p.imagem.src} alt={p.imagem.alt} width={1200} height={750} loading="lazy" />
                ) : (
                  <div className="s-projeto-saida" aria-hidden="true">
                    {p.preview?.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="s-projeto-rotulo">{p.rotulo}</p>
              <h3 className="s-projeto-nome">{p.nome}</h3>
              <p className="s-projeto-resumo">{p.resumo}</p>
              <p className="s-projeto-stack">{p.stack.join(" · ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="s-secao" id="stack">
        <p className="s-comentario">// o que eu uso no dia a dia</p>
        <h2 className="s-titulo">Stack</h2>
        <div className="s-grupos">
          {stack.map((g) => (
            <div key={g.grupo} className="s-grupo">
              <h3 className="s-grupo-nome">{g.grupo}</h3>
              <ul className="s-chips">
                {g.itens.map((item) => (
                  <li key={item} className={`s-chip${estudando.includes(item) ? " s-chip-estudando" : ""}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="s-legenda">
          <span className="s-chip s-chip-estudando">tracejado</span> estudando agora
        </p>
      </section>

      <section className="s-secao" id="sobre">
        <div className="s-sobre">
          <div>
            <p className="s-comentario">// quem sou</p>
            <h2 className="s-titulo">Sobre mim</h2>
            <p className="s-texto">{textoSobre}</p>
          </div>
          <img
            className="s-foto"
            src="/img/eduardo.webp"
            alt={`Retrato do ${perfil.nome} desenhado em rabiscos claros sobre fundo preto.`}
            width={640}
            height={640}
            loading="lazy"
          />
        </div>
        <div className="s-colunas">
          <div>
            <h3 className="s-subtitulo">O que eu faço</h3>
            <ul className="s-frentes">
              {frentes.map(([nome, desc]) => (
                <li key={nome}>
                  <strong>{nome}</strong>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="s-subtitulo">Formação</h3>
            <ul className="s-frentes">
              {perfil.formacao.map((f) => (
                <li key={f.curso}>
                  <strong>{f.curso}</strong>
                  <span>{f.onde}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="s-secao" id="contato">
        <p className="s-comentario">// bora conversar</p>
        <h2 className="s-titulo">Contato</h2>
        <p className="s-texto">Tem um projeto? Me chama por qualquer um destes.</p>
        <div className="s-canais">
          {canais.map((c) => (
            <div key={c.nome} className="s-canal">
              <span className="s-canal-nome">{c.nome}</span>
              <a className="s-canal-valor" href={c.href} {...(c.externo ? { target: "_blank", rel: "noopener" } : {})}>
                {c.valor}
              </a>
              {c.nome === "E-mail" && (
                <button
                  className="s-mini-btn"
                  onClick={async () => avisar((await copiar(perfil.email)) ? "E-mail copiado" : `O e-mail é ${perfil.email}`)}
                >
                  copiar
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="s-rodape">
        <span>
          © {new Date().getFullYear()} {perfil.linha1}
        </span>
        <span>servido pelo Spring Boot na porta 8080 (de mentirinha: é React)</span>
      </footer>
    </div>
  );
}
