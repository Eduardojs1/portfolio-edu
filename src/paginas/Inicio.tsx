import { useEffect, useState } from "react";
import { reduzMovimento, useApp } from "../contexto";
import { perfil } from "../dados/perfil";

const frases = [
  "sites com 3D e animação",
  "APIs em Java e Spring Boot",
  "sistemas web com painel e pagamento",
  "bots de Discord que cobram no Pix",
  "apps desktop em Electron",
];

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
        letra++;
        setTexto(alvo.slice(0, letra));
        if (letra === alvo.length) {
          apagando = true;
          t = window.setTimeout(passo, 2200);
          return;
        }
        t = window.setTimeout(passo, 45 + Math.random() * 45);
      } else {
        letra--;
        setTexto(alvo.slice(0, letra));
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
    <p className="digitando" aria-label={`Construindo ${frases.join(", ")}`}>
      <span className="tk-kw">construindo</span> <span aria-hidden="true">{texto}</span>
      <span className="cursor" aria-hidden="true" />
    </p>
  );
}

export function Inicio() {
  const { abrir } = useApp();
  return (
    <article className="pagina inicio">
      <p className="comentario">// olá, mundo! bem-vindo ao meu portfólio</p>

      <h1 className="nome">
        <span>{perfil.linha1}</span>
        <span className="nome-destaque">{perfil.linha2}</span>
      </h1>

      <Digitando />

      <p className="intro">
        Faço front, back, bot de Discord e app desktop. Quando um produto digital precisa de tudo isso conversando, eu
        construo o caminho inteiro.
      </p>

      <div className="acoes">
        <button className="btn btn-primario" onClick={() => abrir("projetos.js")}>
          Ver projetos
        </button>
        <button className="btn" onClick={() => abrir("contato.css")}>
          Falar comigo
        </button>
      </div>
    </article>
  );
}
