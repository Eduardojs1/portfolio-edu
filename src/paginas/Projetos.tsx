import { projetos } from "../dados/projetos";

export function Projetos() {
  return (
    <article className="pagina projetos">
      <p className="comentario">// projetos.js : coisas que construí</p>
      <h1 className="titulo">Projetos</h1>

      <div className="grade-projetos">
        {projetos.map((p) => (
          <section key={p.id} id={`projeto-${p.id}`} className="projeto">
            <div className="projeto-visual">
              {p.imagem ? (
                <img src={p.imagem.src} alt={p.imagem.alt} width={1200} height={750} loading="lazy" />
              ) : (
                <div className="projeto-saida" aria-hidden="true">
                  {p.preview?.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="projeto-corpo">
              <p className="projeto-rotulo">{p.rotulo}</p>
              <h2 className="projeto-nome">{p.nome}</h2>
              <p>{p.resumo}</p>
              <p className="projeto-stack">{p.stack.join(" · ")}</p>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
