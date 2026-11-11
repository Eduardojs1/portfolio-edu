import { atalhos } from "../contexto";
import { perfil } from "../dados/perfil";

export function Readme() {
  return (
    <article className="pagina readme">
      <h1 className="md-h1">{perfil.projeto}</h1>
      <p>Portfólio do {perfil.nome} em forma de IDE. Cada arquivo da janela Projeto é uma parte do site.</p>

      <h2 className="md-h2">Atalhos</h2>
      <ul className="md-lista">
        <li>
          <kbd>Shift</kbd> duas vezes: buscar arquivos, projetos e ações
        </li>
        <li>
          <kbd>{atalhos.terminal}</kbd>: terminal (digite <code>help</code>)
        </li>
        <li>
          <kbd>{atalhos.executar}</kbd>: executar o PortfolioApplication
        </li>
      </ul>

      <h2 className="md-h2">Feito com</h2>
      <p>React, TypeScript e Vite.</p>
    </article>
  );
}
