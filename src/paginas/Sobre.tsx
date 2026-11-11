import { perfil } from "../dados/perfil";

const frentes = [
  ["Sites e landing pages", "com 3D e animação quando o produto pede impacto"],
  ["Sistemas web", "login, painel administrativo, pagamentos e banco de dados"],
  ["Bots de Discord", "cobrança no Pix, tickets e painel de configuração"],
  ["Apps desktop", "apps de Windows em Electron"],
];

export function Sobre() {
  return (
    <article className="pagina sobre">
      <p className="comentario">{"<!-- sobre.html : quem sou -->"}</p>
      <h1 className="titulo">Sobre mim</h1>
      <p className="texto">
        Sou o {perfil.nome}, desenvolvedor full stack. Trabalho com Java e Spring no back-end e React, Next e Vue no front.
        Também mantenho sistemas corporativos em Java EE e, quando o projeto pede, faço bots e apps desktop.
      </p>

      <h2 className="subtitulo">O que eu faço</h2>
      <ul className="frentes">
        {frentes.map(([nome, desc]) => (
          <li key={nome}>
            <strong>{nome}</strong>
            <span>{desc}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
