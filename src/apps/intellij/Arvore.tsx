import { acharArquivo, type No } from "./projeto";
import { IcArquivo, IcBibliotecas, IcPasta, IcRascunhos, IcSeta } from "./icones";

type Props = {
  nos: No[];
  nivel?: number;
  abertas: Set<string>;
  selecionado: string | null;
  onAlternar: (id: string) => void;
  onSelecionar: (id: string) => void;
  onAbrir: (id: string) => void;
};

const RECUO = 18;

export function Arvore({ nos, nivel = 0, abertas, selecionado, onAlternar, onSelecionar, onAbrir }: Props) {
  return (
    <>
      {nos.map((no) => {
        const pad = { paddingLeft: 6 + nivel * RECUO };
        if (no.tipo === "arquivo") {
          const a = acharArquivo(no.id);
          if (!a) return null;
          return (
            <li key={no.id} role="none">
              <button
                role="treeitem"
                aria-selected={selecionado === a.id}
                className={`ij-no${selecionado === a.id ? " sel" : ""}${a.id.startsWith("target/") ? " excluido" : ""}`}
                style={{ paddingLeft: 6 + nivel * RECUO + 16 }}
                onClick={() => {
                  onSelecionar(a.id);
                  if (!a.binario) onAbrir(a.id);
                }}
              >
                <IcArquivo tipo={a.icone} />
                <span className="ij-no-nome">{a.ling === "java" ? a.nome.replace(/\.java$/, "") : a.nome}</span>
              </button>
            </li>
          );
        }
        const temFilhos = !!no.filhos?.length;
        const aberta = abertas.has(no.id);
        const icone =
          no.tipo === "especial" ? (
            no.icone === "bibliotecas" ? (
              <IcBibliotecas />
            ) : no.icone === "rascunhos" ? (
              <IcRascunhos />
            ) : (
              <IcArquivo tipo={no.icone} />
            )
          ) : (
            <IcPasta papel={no.papel} />
          );
        const excluida = no.tipo === "pasta" && no.papel === "excluida";
        return (
          <li key={no.id} role="none">
            <button
              role="treeitem"
              aria-expanded={temFilhos ? aberta : undefined}
              aria-selected={selecionado === no.id}
              className={`ij-no${selecionado === no.id ? " sel" : ""}${excluida ? " excluida" : ""}${nivel === 0 && no.tipo === "pasta" ? " raiz" : ""}`}
              style={pad}
              onClick={() => {
                onSelecionar(no.id);
                if (temFilhos) onAlternar(no.id);
              }}
            >
              <span className="ij-no-seta">{temFilhos && <IcSeta aberta={aberta} />}</span>
              {icone}
              <span className="ij-no-nome">
                {no.nome}
                {nivel === 0 && no.tipo === "pasta" && <span className="ij-no-modulo"> [portfolio]</span>}
              </span>
              {no.tipo === "pasta" && no.dica && <span className="ij-no-dica">{no.dica}</span>}
            </button>
            {temFilhos && aberta && (
              <ul role="group">
                <Arvore
                  nos={no.filhos!}
                  nivel={nivel + 1}
                  abertas={abertas}
                  selecionado={selecionado}
                  onAlternar={onAlternar}
                  onSelecionar={onSelecionar}
                  onAbrir={onAbrir}
                />
              </ul>
            )}
          </li>
        );
      })}
    </>
  );
}
