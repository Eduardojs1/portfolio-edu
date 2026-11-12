import { lazy, Suspense, useCallback, useState } from "react";
import { Desktop } from "./sistema/Desktop";
import { reduzMovimento } from "./util";

const Intro = lazy(() => import("./intro/Intro").then((m) => ({ default: m.Intro })));

// Primeiro a mesa em 3D (intro). Rolando, a câmera entra no monitor e aparece o desktop,
// que já foi montado por baixo. "Desligar" no menu Iniciar volta para a mesa.
// Dá para pular a intro pelo endereço: #desktop, ou #portfolio, #tour, #site, #datagrip e #spotify para já abrir algo.
export default function App() {
  const [fase, setFase] = useState<"intro" | "desktop">(() =>
    /^#(desktop|intellij|datagrip|spotify|site|portfolio|navegador|tour|abrir=)/.test(location.hash) || reduzMovimento() ? "desktop" : "intro"
  );
  const [desktopMontado, setDesktopMontado] = useState(fase === "desktop");
  const [voltando, setVoltando] = useState(false);

  const quaseLa = useCallback(() => setDesktopMontado(true), []);
  const entrar = useCallback(() => setFase("desktop"), []);
  const desligar = useCallback(() => {
    setVoltando(true);
    setFase("intro");
  }, []);

  return (
    <>
      {desktopMontado && <Desktop ativo={fase === "desktop"} onDesligar={desligar} />}
      {fase === "intro" && (
        <Suspense fallback={<div className="intro-carregando"><span>Ligando o PC…</span></div>}>
          <Intro key={voltando ? "volta" : "ida"} voltando={voltando} onQuaseLa={quaseLa} onEntrar={entrar} />
        </Suspense>
      )}
    </>
  );
}
