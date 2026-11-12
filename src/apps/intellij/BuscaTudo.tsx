import { useEffect, useMemo, useRef, useState } from "react";
import { normalizar } from "../../util";
import { arquivos } from "./projeto";
import { IcArquivo, IcBusca, IcRaio } from "./icones";

export type Acao = { id: string; rotulo: string; atalho?: string; acao: () => void };
export type AbaBusca = "tudo" | "classes" | "arquivos" | "simbolos" | "acoes";

type Item = { chave: string; grupo: Exclude<AbaBusca, "tudo">; titulo: string; detalhe: string; icone: React.ReactNode; abrir: () => void };

const nomesAbas: [AbaBusca, string][] = [
  ["tudo", "All"],
  ["classes", "Classes"],
  ["arquivos", "Files"],
  ["simbolos", "Symbols"],
  ["acoes", "Actions"],
];
const nomesGrupos: Record<Item["grupo"], string> = { classes: "Classes", arquivos: "Files", simbolos: "Symbols", acoes: "Actions" };

type Props = {
  abaInicial: AbaBusca;
  acoes: Acao[];
  onAbrirArquivo: (id: string) => void;
  onFechar: () => void;
};

export function BuscaTudo({ abaInicial, acoes, onAbrirArquivo, onFechar }: Props) {
  const [aba, setAba] = useState<AbaBusca>(abaInicial);
  const [termo, setTermo] = useState("");
  const [sel, setSel] = useState(0);
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLUListElement>(null);

  useEffect(() => campo.current?.focus(), []);

  const todos: Item[] = useMemo(() => {
    const java = arquivos.filter((a) => a.ling === "java");
    const pasta = (id: string) => id.split("/").slice(0, -1).join("/");
    return [
      ...java.map((a) => ({
        chave: `c:${a.id}`,
        grupo: "classes" as const,
        titulo: a.nome.replace(".java", ""),
        detalhe: pasta(a.id).replace(/^src\/(main|test)\/java\//, "").replace(/\//g, "."),
        icone: <IcArquivo tipo={a.icone} />,
        abrir: () => onAbrirArquivo(a.id),
      })),
      ...arquivos
        .filter((a) => !a.binario)
        .map((a) => ({
          chave: `a:${a.id}`,
          grupo: "arquivos" as const,
          titulo: a.nome,
          detalhe: pasta(a.id) || "portfolio-edu",
          icone: <IcArquivo tipo={a.icone} />,
          abrir: () => onAbrirArquivo(a.id),
        })),
      ...java.flatMap((a) =>
        [...(a.texto ?? "").matchAll(/^ {4}(?:public |static |private )*[\w<>[\], ]+\s+(\w+)\s*\(/gm)]
          .filter((m) => !["if", "for", "while", "return"].includes(m[1]))
          .map((m) => ({
            chave: `s:${a.id}:${m[1]}`,
            grupo: "simbolos" as const,
            titulo: `${m[1]}()`,
            detalhe: a.nome.replace(".java", ""),
            icone: <span className="busca-m">m</span>,
            abrir: () => onAbrirArquivo(a.id),
          }))
      ),
      ...acoes.map((ac) => ({
        chave: `x:${ac.id}`,
        grupo: "acoes" as const,
        titulo: ac.rotulo,
        detalhe: ac.atalho ?? "",
        icone: <IcRaio />,
        abrir: ac.acao,
      })),
    ];
  }, [acoes, onAbrirArquivo]);

  const t = normalizar(termo.trim());
  const filtrados = todos.filter((i) => (aba === "tudo" || i.grupo === aba) && (!t || normalizar(`${i.titulo} ${i.detalhe}`).includes(t)));
  const visiveis = aba === "tudo" ? (["classes", "arquivos", "acoes", "simbolos"] as const).flatMap((g) => filtrados.filter((i) => i.grupo === g).slice(0, t ? 8 : 4)) : filtrados;

  useEffect(() => setSel(0), [termo, aba]);
  useEffect(() => {
    lista.current?.querySelector(".sel")?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const abrir = (i: Item | undefined) => {
    if (!i) return;
    onFechar();
    i.abrir();
  };

  return (
    <div className="busca-fundo" onPointerDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="busca" role="dialog" aria-label="Search Everywhere">
        <div className="busca-abas" role="tablist">
          {nomesAbas.map(([id, nome]) => (
            <button key={id} role="tab" aria-selected={aba === id} onClick={() => setAba(id)}>
              {nome}
            </button>
          ))}
          <span className="espaco" />
          <span className="busca-dica-topo">Pressione Shift duas vezes para abrir de novo</span>
        </div>
        <label className="busca-campo">
          <IcBusca />
          <input
            ref={campo}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Digite para buscar classes, arquivos e ações"
            aria-label="Buscar"
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(visiveis.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                abrir(visiveis[sel]);
              } else if (e.key === "Escape") onFechar();
              else if (e.key === "Tab") {
                e.preventDefault();
                const i = nomesAbas.findIndex(([id]) => id === aba);
                setAba(nomesAbas[(i + (e.shiftKey ? nomesAbas.length - 1 : 1)) % nomesAbas.length][0]);
              }
            }}
          />
        </label>
        <ul className="busca-lista" ref={lista} role="listbox">
          {visiveis.length === 0 && <li className="busca-nada">Nada encontrado</li>}
          {visiveis.map((i, idx) => (
            <li key={i.chave} role="presentation">
              {aba === "tudo" && (idx === 0 || visiveis[idx - 1].grupo !== i.grupo) && <p className="busca-grupo">{nomesGrupos[i.grupo]}</p>}
              <div
                role="option"
                aria-selected={idx === sel}
                className={`busca-item${idx === sel ? " sel" : ""}`}
                onMouseEnter={() => setSel(idx)}
                onClick={() => abrir(i)}
              >
                {i.icone}
                <span className="busca-titulo">{i.titulo}</span>
                <span className="busca-detalhe">{i.detalhe}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="busca-rodape">↑↓ para navegar · Enter para abrir · Tab troca a aba</p>
      </div>
    </div>
  );
}
