import { guia } from "../chat/guia";

export function Guia({ perguntar, desativado }: { perguntar: (t: string) => void; desativado: boolean }) {
  return (
    <div className="guia">
      <h2 className="guia-titulo">Guia</h2>
      <p className="guia-intro">Pergunte do seu jeito ou clique numa pergunta:</p>
      {guia.map((g) => (
        <section key={g.tema} className="guia-tema">
          <h3>{g.tema}</h3>
          <ul>
            {g.perguntas.map((q) => (
              <li key={q}>
                <button onClick={() => perguntar(q)} disabled={desativado}>
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="guia-dica">Dá pra perguntar de uma tecnologia específica, tipo React, Spring ou Docker.</p>
    </div>
  );
}
