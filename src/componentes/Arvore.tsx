import { acharArquivo, type No } from "../dados/arquivos";
import { IconeArquivo, IconePasta, IconeSeta } from "./Icones";

type Props = {
  no: No;
  nivel?: number;
  caminho?: string;
  ativo: string | null;
  fechadas: Set<string>;
  alternarPasta: (chave: string) => void;
  abrir: (id: string) => void;
  focavel: boolean;
};

export function Arvore({ no, nivel = 0, caminho = "", ativo, fechadas, alternarPasta, abrir, focavel }: Props) {
  const recuo = { paddingLeft: 8 + nivel * 18 };

  if (no.tipo === "arquivo") {
    const a = acharArquivo(no.id);
    if (!a) return null;
    return (
      <li role="none">
        <button
          role="treeitem"
          aria-selected={ativo === a.id}
          className={`no${ativo === a.id ? " sel" : ""}`}
          style={{ paddingLeft: 8 + nivel * 18 + 18 }}
          onClick={() => abrir(a.id)}
          tabIndex={focavel ? 0 : -1}
        >
          <IconeArquivo tipo={a.tipo} />
          <span>{a.id}</span>
        </button>
      </li>
    );
  }

  const chave = `${caminho}/${no.nome}`;
  const aberta = !fechadas.has(chave);
  return (
    <li role="none">
      <button
        role="treeitem"
        aria-expanded={aberta}
        className="no"
        style={recuo}
        onClick={() => alternarPasta(chave)}
        tabIndex={focavel ? 0 : -1}
      >
        <span className="no-seta">
          <IconeSeta aberta={aberta} />
        </span>
        <IconePasta fonte={no.fonte} />
        <span className={nivel === 0 ? "no-raiz" : ""}>{no.nome}</span>
      </button>
      {aberta && (
        <ul role="group">
          {no.filhos.map((f) => (
            <Arvore
              key={f.tipo === "pasta" ? f.nome : f.id}
              no={f}
              nivel={nivel + 1}
              caminho={chave}
              ativo={ativo}
              fechadas={fechadas}
              alternarPasta={alternarPasta}
              abrir={abrir}
              focavel={focavel}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
