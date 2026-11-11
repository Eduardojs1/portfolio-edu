import { useEffect, useRef, useState } from "react";
import { atalhos, normalizar, useApp } from "../contexto";
import { arquivos } from "../dados/arquivos";
import { links, perfil } from "../dados/perfil";
import { projetos } from "../dados/projetos";
import { stack } from "../dados/stack";
import { IconeFechar, IconeMinimizar } from "./Icones";

type Linha =
  | { tipo: "cmd"; texto: string }
  | { tipo: "saida" | "erro" | "dica"; texto: string; href?: string };

const prompt = `PS C:\\${perfil.projeto}>`;

const comandos: Record<string, string> = {
  help: "mostra esta lista",
  ls: "lista os arquivos",
  "abrir <arquivo>": "abre um arquivo no editor",
  whoami: "quem é o dono deste portfólio",
  projetos: "lista os projetos",
  stack: "tecnologias que eu uso",
  contato: "e-mail, WhatsApp, GitHub e LinkedIn",
  run: "executa o PortfolioApplication",
  clear: "limpa o terminal",
};
const nomesComandos = ["help", "ls", "abrir", "cd", "code", "whoami", "projetos", "stack", "contato", "run", "clear", "date", "echo"];

const boasVindas: Linha[] = [{ tipo: "dica", texto: "Terminal do portfólio. Digite help para ver os comandos." }];

function acharArquivoPorNome(nome: string) {
  const n = normalizar(nome.replace(/^\.[\\/]/, ""));
  return arquivos.find((a) => normalizar(a.id) === n) ?? arquivos.find((a) => normalizar(a.id).startsWith(n));
}

export function Terminal({ onFechar }: { onFechar: () => void }) {
  const { abrir, executar } = useApp();
  const [linhas, setLinhas] = useState<Linha[]>(boasVindas);
  const [entrada, setEntrada] = useState("");
  const [historico, setHistorico] = useState<string[]>([]);
  const [pos, setPos] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = corpoRef.current;
    if (c) c.scrollTop = c.scrollHeight;
  }, [linhas]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function rodar(bruto: string) {
    const texto = bruto.trim();
    const [cmd = "", ...args] = texto.split(/\s+/);
    const c = cmd.toLowerCase();
    const saida: Linha[] = [{ tipo: "cmd", texto }];
    const out = (t: string, href?: string) => saida.push({ tipo: "saida", texto: t, href });

    switch (c) {
      case "":
        break;
      case "help":
        out("comandos disponíveis:");
        Object.entries(comandos).forEach(([k, v]) => out(`  ${k.padEnd(17)} ${v}`));
        out(`atalhos: ${atalhos.busca} busca · ${atalhos.terminal} terminal · ${atalhos.executar} executar`);
        break;
      case "ls":
      case "dir":
        out(arquivos.map((a) => a.id).join("   "));
        break;
      case "abrir":
      case "cd":
      case "code":
      case "cat": {
        if (!args[0]) {
          saida.push({ tipo: "erro", texto: `uso: ${c} <arquivo>  (ex.: ${c} projetos.js)` });
          break;
        }
        const a = acharArquivoPorNome(args[0]);
        if (a) {
          out(`abrindo ${a.id}…`);
          abrir(a.id);
        } else {
          saida.push({ tipo: "erro", texto: `arquivo não encontrado: ${args[0]}. Digite ls para ver a lista.` });
        }
        break;
      }
      case "whoami":
        out(`${perfil.linha1}, desenvolvedor full stack.`);
        out("Java e Spring no back, React, Next e Vue no front, bots de Discord e apps desktop.");
        break;
      case "projetos":
        projetos.forEach((p) => out(`  ${p.nome.padEnd(18)} ${p.rotulo}`));
        out("abra projetos.js para ver os detalhes.");
        break;
      case "stack":
        stack.forEach((g) => out(`  ${g.grupo.padEnd(16)} ${g.itens.join(", ")}`));
        break;
      case "contato":
        out(`  e-mail    ${perfil.email}`, links.email);
        out(`  whatsapp  ${perfil.whatsapp.exibir}`, links.whatsapp);
        out(`  github    github.com/${perfil.github}`, links.github);
        out(`  linkedin  in/${perfil.linkedin}`, links.linkedin);
        break;
      case "run":
      case "mvn":
      case "gradle":
        out("executando PortfolioApplication…");
        executar();
        break;
      case "date":
      case "data":
        out(new Date().toLocaleString("pt-BR"));
        break;
      case "echo":
        out(args.join(" "));
        break;
      case "sudo":
        saida.push({ tipo: "erro", texto: "sudo: permissão negada. Boa tentativa." });
        break;
      case "clear":
      case "cls":
        setLinhas([]);
        return;
      default:
        saida.push({
          tipo: "erro",
          texto: `${cmd}: o termo não é reconhecido como nome de comando. Digite help para ver os comandos.`,
        });
    }
    setLinhas((l) => [...l, ...saida]);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      rodar(entrada);
      if (entrada.trim()) setHistorico((h) => [...h, entrada]);
      setEntrada("");
      setPos(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!historico.length) return;
      const p = pos === -1 ? historico.length - 1 : Math.max(0, pos - 1);
      setPos(p);
      setEntrada(historico[p]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pos === -1) return;
      const p = pos + 1;
      if (p >= historico.length) {
        setPos(-1);
        setEntrada("");
      } else {
        setPos(p);
        setEntrada(historico[p]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partes = entrada.split(" ");
      if (partes.length === 1) {
        const op = nomesComandos.filter((n) => n.startsWith(partes[0].toLowerCase()));
        if (op.length === 1) setEntrada(op[0] + " ");
      } else {
        const ultimo = partes[partes.length - 1];
        const op = arquivos.filter((a) => normalizar(a.id).startsWith(normalizar(ultimo)));
        if (op.length === 1) setEntrada([...partes.slice(0, -1), op[0].id].join(" "));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLinhas([]);
    }
  }

  return (
    <section className="janela-inferior" aria-label="Terminal">
      <div className="ji-topo">
        <span className="ji-titulo">Terminal</span>
        <span className="ji-aba">
          Local
          <button onClick={onFechar} aria-label="Fechar aba Local">
            <IconeFechar tamanho={12} />
          </button>
        </span>
        <span className="espaco" />
        <button className="ji-botao" onClick={onFechar} aria-label="Ocultar" title="Ocultar">
          <IconeMinimizar />
        </button>
      </div>
      <div className="terminal-corpo" ref={corpoRef} onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        {linhas.map((l, i) =>
          l.tipo === "cmd" ? (
            <p key={i} className="t-linha">
              <span className="t-prompt">{prompt}</span> {l.texto}
            </p>
          ) : (
            <p key={i} className={`t-linha t-${l.tipo}`}>
              {l.href ? (
                <a href={l.href} target="_blank" rel="noopener">
                  {l.texto}
                </a>
              ) : (
                l.texto
              )}
            </p>
          )
        )}
        <div className="t-linha t-entrada">
          <label htmlFor="terminal-entrada" className="t-prompt">
            {prompt}
          </label>
          <input
            id="terminal-entrada"
            ref={inputRef}
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={aoTeclar}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Comando"
          />
        </div>
      </div>
    </section>
  );
}
