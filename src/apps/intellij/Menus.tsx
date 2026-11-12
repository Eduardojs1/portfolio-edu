import { useEffect, useRef, useState, type ReactNode } from "react";

export type ItemMenu =
  | { separador: true }
  | {
      separador?: false;
      rotulo: string;
      atalho?: string;
      acao?: () => void;
      desabilitado?: boolean;
      marcado?: boolean;
      icone?: ReactNode;
      sub?: ItemMenu[];
      dica?: string;
    };

type Props = {
  itens: ItemMenu[];
  pos: { x: number; y: number };
  onFechar: () => void;
  largura?: number;
  titulo?: string;
};

// Menu suspenso do IntelliJ (com submenus que abrem ao passar o mouse)
export function MenuSuspenso({ itens, pos, onFechar, largura, titulo }: Props) {
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fora = (e: PointerEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) onFechar();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    // espera o clique que abriu o menu terminar
    const t = window.setTimeout(() => addEventListener("pointerdown", fora), 0);
    addEventListener("keydown", esc);
    return () => {
      window.clearTimeout(t);
      removeEventListener("pointerdown", fora);
      removeEventListener("keydown", esc);
    };
  }, [onFechar]);

  return (
    <div ref={caixa} className="ij-menu" style={{ left: pos.x, top: pos.y, minWidth: largura }} role="menu">
      {titulo && <p className="ij-menu-titulo">{titulo}</p>}
      <Lista itens={itens} onFechar={onFechar} />
    </div>
  );
}

function Lista({ itens, onFechar }: { itens: ItemMenu[]; onFechar: () => void }) {
  const [aberto, setAberto] = useState<number | null>(null);
  return (
    <>
      {itens.map((it, i) => {
        if (it.separador) return <div key={i} className="ij-menu-sep" role="separator" />;
        return (
          <div key={i} className="ij-menu-linha" onMouseEnter={() => setAberto(it.sub ? i : null)}>
            <button
              role="menuitem"
              className={`ij-menu-item${aberto === i ? " ativo" : ""}`}
              disabled={it.desabilitado}
              aria-haspopup={it.sub ? "menu" : undefined}
              onClick={() => {
                if (it.sub) return setAberto(i);
                it.acao?.();
                onFechar();
              }}
            >
              <span className="ij-menu-icone">{it.marcado ? "✓" : it.icone}</span>
              <span className="ij-menu-rotulo">
                {it.rotulo}
                {it.dica && <small>{it.dica}</small>}
              </span>
              {it.atalho && <span className="ij-menu-atalho">{it.atalho}</span>}
              {it.sub && <span className="ij-menu-seta">›</span>}
            </button>
            {it.sub && aberto === i && (
              <div className="ij-menu ij-submenu" role="menu">
                <Lista itens={it.sub} onFechar={onFechar} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
