import { useEffect, useRef, useState } from "react";
import { Site } from "../../site/Site";
import { links, perfil } from "../../dados/perfil";
import { projetos } from "../../dados/projetos";
import { IcAbrirFora, IcAvancar, IcCadeado, IcRecarregar, IcVoltar } from "./icones";

// O preview do navegador embutido: mostra o que o Spring Boot "serve" em localhost:8080.
type Props = {
  appRodando: boolean;
  ancora: { id: string; n: number } | null;
  avisar: (msg: string) => void;
  onRodar: () => void;
};

const BASE = "localhost:8080";

function json(rota: string) {
  if (rota === "/api/projetos")
    return projetos.map((p, i) => ({
      id: i + 1,
      nome: p.nome,
      tipo: p.rotulo,
      resumo: p.resumo,
      oQueFiz: p.fiz,
      stack: p.stack,
      imagem: p.imagem?.src ?? null,
    }));
  if (rota === "/api/contato")
    return {
      email: perfil.email,
      linkedin: links.linkedin,
    };
  return null;
}

export function Navegador({ appRodando, ancora, avisar, onRodar }: Props) {
  const [historico, setHistorico] = useState<string[]>(["/"]);
  const [pos, setPos] = useState(0);
  const [campo, setCampo] = useState(`${BASE}/`);
  const [recarga, setRecarga] = useState(0);
  const conteudo = useRef<HTMLDivElement>(null);
  const rota = historico[pos];

  const ir = (nova: string) => {
    const r = nova.replace(/^https?:\/\//, "").replace(BASE, "") || "/";
    const limpa = r.startsWith("/") ? r : `/${r}`;
    setHistorico((h) => [...h.slice(0, pos + 1), limpa]);
    setPos((p) => p + 1);
    setCampo(`${BASE}${limpa}`);
  };

  const irPara = (id: string) => {
    const c = conteudo.current;
    const alvo = c?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!c || !alvo) return;
    c.scrollTo({ top: alvo.offsetTop - 64, behavior: "smooth" });
    alvo.classList.add("piscar");
    window.setTimeout(() => alvo.classList.remove("piscar"), 1400);
  };

  // Pedido de outra parte do IDE (README, busca): volta para "/" e rola até a seção
  useEffect(() => {
    if (!ancora) return;
    if (rota !== "/") ir("/");
    const t = window.setTimeout(() => irPara(ancora.id), 120);
    return () => window.clearTimeout(t);
  }, [ancora?.n]);

  useEffect(() => {
    setCampo(`${BASE}${rota}`);
    conteudo.current?.scrollTo({ top: 0 });
  }, [rota]);

  const dados = json(rota);

  return (
    <div className="nav">
      <div className="nav-barra">
        <button disabled={pos === 0} onClick={() => setPos((p) => p - 1)} aria-label="Voltar" title="Voltar">
          <IcVoltar />
        </button>
        <button disabled={pos >= historico.length - 1} onClick={() => setPos((p) => p + 1)} aria-label="Avançar" title="Avançar">
          <IcAvancar />
        </button>
        <button onClick={() => setRecarga((n) => n + 1)} aria-label="Recarregar" title="Recarregar">
          <IcRecarregar />
        </button>
        <form
          className="nav-endereco"
          onSubmit={(e) => {
            e.preventDefault();
            ir(campo);
          }}
        >
          <IcCadeado />
          <input value={campo} onChange={(e) => setCampo(e.target.value)} aria-label="Endereço" spellCheck={false} />
        </form>
        <span className="nav-dica">experimente /api/projetos</span>
        <button onClick={() => window.open(location.href, "_blank", "noopener")} aria-label="Abrir no navegador" title="Abrir no navegador">
          <IcAbrirFora />
        </button>
      </div>

      <div className="nav-conteudo" ref={conteudo} key={`${rota}-${recarga}`} data-guia="site">
        {!appRodando ? (
          <div className="nav-erro">
            <div className="nav-erro-icone" aria-hidden="true">
              ☹
            </div>
            <h1>Não é possível acessar esse site</h1>
            <p>
              <strong>localhost</strong> recusou a conexão.
            </p>
            <p className="nav-erro-dica">Parece que o PortfolioApplication não está rodando.</p>
            <code>ERR_CONNECTION_REFUSED</code>
            <button className="nav-erro-botao" onClick={onRodar}>
              ▶ Rodar o PortfolioApplication
            </button>
          </div>
        ) : rota === "/" ? (
          <Site irPara={irPara} avisar={avisar} />
        ) : dados ? (
          <div className="nav-json">
            <label>
              <input type="checkbox" defaultChecked /> Estilos de formatação
            </label>
            <pre>{JSON.stringify(dados, null, 2)}</pre>
          </div>
        ) : (
          <div className="nav-whitelabel">
            <h1>Whitelabel Error Page</h1>
            <p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p>
            <p>{new Date().toString()}</p>
            <p>There was an unexpected error (type=Not Found, status=404).</p>
            <p className="nav-erro-dica">
              Tente <a href="#" onClick={(e) => { e.preventDefault(); ir("/"); }}>/</a>,{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); ir("/api/projetos"); }}>/api/projetos</a> ou{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); ir("/api/contato"); }}>/api/contato</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
