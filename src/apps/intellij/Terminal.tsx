import { useEffect, useRef, useState } from "react";
import { perfil } from "../../dados/perfil";
import { projetos } from "../../dados/projetos";
import { normalizar } from "../../util";
import { arquivos, CAMINHO_PROJETO, NOME_PROJETO } from "./projeto";
import { fases } from "./execucao";

type Linha = { tipo: "cmd" | "saida" | "erro" | "dica"; texto: string };

type Props = {
  appRodando: boolean;
  onAbrir: (id: string) => void;
  onMaven: (objetivo: string) => void;
  onRodar: () => void;
  onApp: (app: "datagrip" | "spotify") => void;
  onFechar: () => void;
};

const prompt = `PS ${CAMINHO_PROJETO}>`;

const ajuda: [string, string][] = [
  ["ls", "lista os arquivos do projeto"],
  ["cat <arquivo>", "mostra um arquivo (ex.: cat pom.xml)"],
  ["code <arquivo>", "abre o arquivo no editor"],
  ["mvn <fase>", "roda o Maven (clean, compile, test, package)"],
  ["./mvnw spring-boot:run", "sobe o portfólio"],
  ["curl localhost:8080/api/projetos", "chama a API (com o app rodando)"],
  ["git log", "últimos commits"],
  ["java -version", "versão do Java"],
  ["start spotify", "abre o Spotify (ou datagrip)"],
  ["clear", "limpa o terminal"],
];

function acharPorNome(nome: string) {
  const n = normalizar(nome.replace(/^\.[\\/]/, "").replace(/\\/g, "/"));
  return (
    arquivos.find((a) => normalizar(a.id) === n) ??
    arquivos.find((a) => normalizar(a.nome) === n) ??
    arquivos.find((a) => normalizar(a.nome).startsWith(n))
  );
}

export function Terminal({ appRodando, onAbrir, onMaven, onRodar, onApp, onFechar }: Props) {
  const [linhas, setLinhas] = useState<Linha[]>([
    { tipo: "dica", texto: "Windows PowerShell" },
    { tipo: "dica", texto: "Digite help para ver o que dá para fazer aqui." },
    { tipo: "saida", texto: "" },
  ]);
  const [entrada, setEntrada] = useState("");
  const [historico, setHistorico] = useState<string[]>([]);
  const [pos, setPos] = useState(-1);
  const campo = useRef<HTMLInputElement>(null);
  const corpo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    corpo.current?.scrollTo({ top: corpo.current.scrollHeight });
  }, [linhas]);

  useEffect(() => {
    campo.current?.focus({ preventScroll: true });
  }, []);

  function rodar(bruto: string) {
    const texto = bruto.trim();
    const [cmd = "", ...args] = texto.split(/\s+/);
    const c = cmd.toLowerCase();
    const saida: Linha[] = [{ tipo: "cmd", texto }];
    const out = (t: string) => saida.push({ tipo: "saida", texto: t });
    const erro = (t: string) => saida.push({ tipo: "erro", texto: t });

    switch (c) {
      case "":
        break;
      case "help":
        ajuda.forEach(([k, v]) => out(`  ${k.padEnd(34)} ${v}`));
        break;
      case "ls":
      case "dir": {
        const raiz = new Set(arquivos.map((a) => a.id.split("/")[0]));
        out("");
        out(`    Diretório: ${CAMINHO_PROJETO}`);
        out("");
        [...raiz].sort((a, b) => a.localeCompare(b)).forEach((n) => out(`${arquivos.some((a) => a.id.startsWith(`${n}/`)) ? "d----" : "-a---"}        11/11/2026     21:40   ${n}`));
        out("");
        break;
      }
      case "cat":
      case "type":
      case "more": {
        const a = args[0] ? acharPorNome(args[0]) : undefined;
        if (!args[0]) erro("uso: cat <arquivo>");
        else if (!a) erro(`cat: Não é possível localizar o caminho '${args[0]}' porque ele não existe.`);
        else if (!a.texto) erro(`cat: ${a.nome} é um arquivo binário.`);
        else a.texto.replace(/\n$/, "").split("\n").forEach(out);
        break;
      }
      case "code":
      case "idea":
      case "abrir": {
        const a = args[0] ? acharPorNome(args[0]) : undefined;
        if (a && !a.binario) {
          onAbrir(a.id);
          out(`abrindo ${a.nome}…`);
        } else erro(`arquivo não encontrado: ${args[0] ?? ""}`);
        break;
      }
      case "cd":
        out(args[0] ? "Fica aqui na raiz: use ls, cat e code para navegar." : CAMINHO_PROJETO);
        break;
      case "pwd":
        out(CAMINHO_PROJETO);
        break;
      case "mvn":
      case "./mvnw":
      case "mvnw":
      case ".\\mvnw": {
        const alvo = args.find((a) => !a.startsWith("-")) ?? "";
        if (alvo === "spring-boot:run") {
          out("[INFO] Attaching agents: []");
          onRodar();
        } else if (alvo === "-v" || args.includes("-v") || args.includes("--version")) {
          out("Apache Maven 3.9.11");
          out("Java version: 21.0.5, vendor: Eclipse Adoptium");
        } else if (fases.includes(alvo)) {
          out(`[INFO] rodando ${alvo} na janela Run…`);
          onMaven(alvo);
        } else erro(`[ERROR] Unknown lifecycle phase "${alvo}". Tente: ${fases.slice(0, 7).join(", ")} ou spring-boot:run`);
        break;
      }
      case "java":
        if (args[0] === "-version" || args[0] === "--version") {
          out('openjdk version "21.0.5" 2024-10-15 LTS');
          out("OpenJDK Runtime Environment Temurin-21.0.5+11 (build 21.0.5+11-LTS)");
          out("OpenJDK 64-Bit Server VM Temurin-21.0.5+11 (build 21.0.5+11-LTS, mixed mode, sharing)");
        } else erro("uso: java -version");
        break;
      case "curl":
      case "invoke-webrequest": {
        const url = args.find((a) => a.includes("localhost")) ?? "";
        if (!appRodando) {
          erro("curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server");
          saida.push({ tipo: "dica", texto: "Dica: rode o PortfolioApplication primeiro (Shift+F10)." });
        } else if (url.includes("/api/projetos"))
          out(JSON.stringify(projetos.map((p, i) => ({ id: i + 1, nome: p.nome, tipo: p.rotulo, stack: p.stack }))));
        else if (url.includes("/api/contato"))
          out(JSON.stringify({ email: perfil.email, whatsapp: perfil.whatsapp.exibir, github: `github.com/${perfil.github}`, linkedin: `in/${perfil.linkedin}` }));
        else if (url) out(`<!DOCTYPE html><html lang="pt-BR"><head><title>${perfil.linha1}</title>…`);
        else erro("uso: curl localhost:8080/api/projetos");
        break;
      }
      case "git": {
        const sub = (args[0] ?? "").toLowerCase();
        if (sub === "log") {
          if (!__GIT__.commits.length) out("sem histórico de commits neste build.");
          __GIT__.commits.forEach((cm, i) => out(`${cm.hash} ${i === 0 ? `(HEAD -> ${__GIT__.branch}, origin/${__GIT__.branch}) ` : ""}${cm.msg}`));
        } else if (sub === "status") {
          out(`On branch ${__GIT__.branch}`);
          out(`Your branch is up to date with 'origin/${__GIT__.branch}'.`);
          out("");
          out("nothing to commit, working tree clean");
        } else if (sub === "branch") out(`* ${__GIT__.branch}`);
        else erro("uso: git log | git status | git branch");
        break;
      }
      case "docker":
        if (args[0] === "ps") {
          out("CONTAINER ID   IMAGE         STATUS       PORTS                    NAMES");
          out("3f2a9c1b7e4d   postgres:17   Up 2 hours   0.0.0.0:5432->5432/tcp   portfolio-banco-1");
        } else erro("uso: docker ps");
        break;
      case "start": {
        const app = (args[0] ?? "").toLowerCase();
        if (app === "spotify" || app === "datagrip") {
          onApp(app);
          out(`abrindo ${app}…`);
        } else erro("uso: start spotify | start datagrip");
        break;
      }
      case "whoami":
        out(`${perfil.usuario}`);
        out(`${perfil.linha1}, desenvolvedor full stack. Digite cat README.md para saber mais.`);
        break;
      case "date":
      case "get-date":
        out(new Date().toLocaleString("pt-BR"));
        break;
      case "echo":
        out(args.join(" "));
        break;
      case "sudo":
        erro("sudo: não é reconhecido... e aqui é Windows. Boa tentativa.");
        break;
      case "exit":
        onFechar();
        return;
      case "clear":
      case "cls":
        setLinhas([]);
        return;
      default:
        erro(`${cmd}: O termo '${cmd}' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável.`);
        saida.push({ tipo: "dica", texto: "Digite help para ver os comandos." });
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
      const ultimo = partes[partes.length - 1];
      if (partes.length > 1) {
        const op = arquivos.filter((a) => normalizar(a.nome).startsWith(normalizar(ultimo)));
        if (op.length === 1) setEntrada([...partes.slice(0, -1), op[0].nome].join(" "));
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLinhas([]);
    }
  }

  return (
    <div className="term" ref={corpo} onClick={() => campo.current?.focus({ preventScroll: true })}>
      {linhas.map((l, i) =>
        l.tipo === "cmd" ? (
          <p key={i} className="term-linha">
            <span className="term-prompt">{prompt}</span> {l.texto}
          </p>
        ) : (
          <p key={i} className={`term-linha term-${l.tipo}`}>
            {l.texto}
          </p>
        )
      )}
      <div className="term-linha term-entrada">
        <label htmlFor={`term-${NOME_PROJETO}`} className="term-prompt">
          {prompt}
        </label>
        <input
          id={`term-${NOME_PROJETO}`}
          ref={campo}
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
  );
}
