import { stack } from "../dados/stack";

export function Stack() {
  return (
    <article className="pagina stack">
      <p className="comentario">// stack.json : o que eu uso no dia a dia</p>
      <h1 className="titulo">Stack</h1>

      <div className="codigo" aria-label="Tecnologias por área">
        <p className="tk-pont">{"{"}</p>
        {stack.map((g, gi) => (
          <p key={g.grupo} className="recuo-1 json-linha">
            <span className="tk-prop">"{g.grupo}"</span>
            <span className="tk-pont">: [</span>
            {g.itens.map((item, i) => (
              <span key={item}>
                <span className="tk-str json-item">"{item}"</span>
                {i < g.itens.length - 1 && <span className="tk-pont">, </span>}
              </span>
            ))}
            <span className="tk-pont">]{gi < stack.length - 1 ? "," : ""}</span>
          </p>
        ))}
        <p className="tk-pont">{"}"}</p>
      </div>
    </article>
  );
}
