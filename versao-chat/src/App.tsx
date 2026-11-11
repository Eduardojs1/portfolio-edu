import { useEffect, useRef, useState } from "react";
import { responder } from "./chat/motor";
import { boasVindas } from "./chat/respostas";
import type { Resposta } from "./chat/tipos";
import { perfil } from "./dados/perfil";
import { Blocos } from "./componentes/Blocos";
import { Guia } from "./componentes/Guia";
import { IconeEnviar, IconeFechar, IconeGuia, IconeRecomecar } from "./componentes/Icones";

type Mensagem = { id: number; de: "bot"; resposta: Resposta } | { id: number; de: "voce"; texto: string };

const reduzMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Tempo de "digitando…" proporcional ao tamanho da resposta
function atraso(r: Resposta) {
  if (reduzMovimento()) return 120;
  const letras = r.blocos.reduce((n, b) => n + ("texto" in b ? b.texto.length : 60), 0);
  return Math.min(1400, 420 + letras * 2.5);
}

const inicio = (): Mensagem[] => [{ id: 0, de: "bot", resposta: boasVindas() }];

export default function App() {
  const [mensagens, setMensagens] = useState<Mensagem[]>(inicio);
  const [entrada, setEntrada] = useState("");
  const [digitando, setDigitando] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  const proximoId = useRef(1);
  const timer = useRef<number | undefined>(undefined);
  const listaRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);

  function perguntar(texto: string) {
    const t = texto.trim();
    if (!t || digitando) return;
    setGuiaAberto(false);
    setEntrada("");
    setMensagens((m) => [...m, { id: proximoId.current++, de: "voce", texto: t }]);
    setDigitando(true);
    const r = responder(t);
    timer.current = window.setTimeout(() => {
      setMensagens((m) => [...m, { id: proximoId.current++, de: "bot", resposta: r }]);
      setDigitando(false);
    }, atraso(r));
  }

  function recomecar() {
    window.clearTimeout(timer.current);
    setDigitando(false);
    setMensagens(inicio());
    campoRef.current?.focus();
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Rola até a mensagem nova
  useEffect(() => {
    const l = listaRef.current;
    if (!l) return;
    l.scrollTo({ top: l.scrollHeight, behavior: reduzMovimento() ? "auto" : "smooth" });
  }, [mensagens, digitando]);

  useEffect(() => {
    if (!guiaAberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setGuiaAberto(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [guiaAberto]);

  const ultima = mensagens[mensagens.length - 1];
  const sugestoes = !digitando && ultima.de === "bot" ? ultima.resposta.sugestoes : [];

  return (
    <div className="app">
      {/* ---------- Guia (lateral no computador, gaveta no celular) ---------- */}
      <aside className={`lateral${guiaAberto ? " aberta" : ""}`} aria-label="Guia de perguntas">
        <button className="lateral-fechar" onClick={() => setGuiaAberto(false)} aria-label="Fechar guia">
          <IconeFechar />
        </button>
        <Guia perguntar={perguntar} desativado={digitando} />
      </aside>
      {guiaAberto && <div className="fundo" onClick={() => setGuiaAberto(false)} />}

      {/* ---------- Chat ---------- */}
      <main className="chat">
        <header className="topo">
          <span className="avatar" aria-hidden="true">
            {perfil.iniciais}
          </span>
          <div className="topo-texto">
            <p className="topo-nome">{perfil.linha1}</p>
            <p className="topo-sub">
              <i aria-hidden="true" /> Assistente<span className="sub-extra"> · respostas sobre ele</span>
            </p>
          </div>
          <button className="botao-icone so-celular" onClick={() => setGuiaAberto(true)} aria-label="Abrir guia">
            <IconeGuia />
            <span>Guia</span>
          </button>
          <button className="botao-icone" onClick={recomecar} aria-label="Recomeçar conversa" title="Recomeçar conversa">
            <IconeRecomecar />
          </button>
        </header>

        <div className="mensagens" ref={listaRef}>
          <div className="mensagens-dentro">
            <div className="abertura">
              <span className="avatar avatar-grande" aria-hidden="true">
                {perfil.iniciais}
              </span>
              <h1>
                <span>{perfil.linha1}</span>
                <span className="destaque">{perfil.linha2}</span>
              </h1>
              <p>Pergunte o que quiser sobre ele.</p>
            </div>

            <div role="log" aria-live="polite" aria-label="Conversa">
              {mensagens.map((m) =>
                m.de === "voce" ? (
                  <div key={m.id} className="msg msg-voce">
                    <p>{m.texto}</p>
                  </div>
                ) : (
                  <div key={m.id} className="msg msg-bot">
                    <span className="avatar avatar-msg" aria-hidden="true">
                      {perfil.iniciais}
                    </span>
                    <div className="msg-corpo">
                      <Blocos blocos={m.resposta.blocos} perguntar={perguntar} />
                    </div>
                  </div>
                )
              )}
              {digitando && (
                <div className="msg msg-bot">
                  <span className="avatar avatar-msg" aria-hidden="true">
                    {perfil.iniciais}
                  </span>
                  <div className="digitando" aria-label="Digitando">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}
            </div>

            {sugestoes.length > 0 && (
              <div className="sugestoes" aria-label="Sugestões de pergunta">
                {sugestoes.map((s) => (
                  <button key={s} onClick={() => perguntar(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <form
          className="campo"
          onSubmit={(e) => {
            e.preventDefault();
            perguntar(entrada);
          }}
        >
          <input
            ref={campoRef}
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            placeholder={`Pergunte algo sobre o ${perfil.nome}…`}
            aria-label="Sua pergunta"
            autoComplete="off"
            maxLength={300}
          />
          <button type="submit" disabled={!entrada.trim() || digitando} aria-label="Enviar">
            <IconeEnviar />
          </button>
        </form>
      </main>
    </div>
  );
}
