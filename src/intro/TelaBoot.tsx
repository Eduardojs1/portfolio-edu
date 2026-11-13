import { useEffect, useRef, useState } from "react";
import { LogoDev } from "../sistema/icones";
import { useT } from "../i18n";

// A tela de quando o PC liga, como no Windows: fundo preto, o logo do "fabricante"
// centralizado a 38,2% do topo (a posição que a Microsoft define para o logo de boot)
// e as bolinhas girando embaixo. Quando a mesa 3D fica pronta, apaga.
// O começo fica guardado aqui fora para a tela não recomeçar quando o código da intro
// termina de baixar (o App mostra esta mesma tela enquanto isso).
let comeco = 0;
const ACENDE_LOGO = 450; // o monitor liga preto e o logo aparece um pouco depois
const ACENDE_RODA = 1300; // a roda de progresso aparece em seguida, como no Windows
const MINIMO = 3400; // tempo mínimo na tela (a roda gira um tempinho antes de entrar)

// Há quanto tempo a tela de boot apareceu (0 se não apareceu)
export const tempoDeBoot = () => (comeco ? performance.now() - comeco : 0);

export function TelaBoot({ pronto }: { pronto: boolean }) {
  const t = useT();
  if (!comeco) comeco = performance.now();
  const [agora, setAgora] = useState(() => performance.now());
  const [prontoEm, setProntoEm] = useState<number | null>(null);

  const intervalo = useRef(0);
  useEffect(() => {
    intervalo.current = window.setInterval(() => setAgora(performance.now()), 50);
    return () => window.clearInterval(intervalo.current);
  }, []);
  useEffect(() => {
    if (pronto && prontoEm === null) setProntoEm(performance.now());
  }, [pronto, prontoEm]);

  const ms = agora - comeco;
  // No fim, primeiro somem o logo e a roda (fica tudo preto um instante, como quando o
  // Windows termina de carregar) e só então o preto vai clareando até a mesa aparecer.
  const fim = prontoEm !== null ? Math.max(MINIMO, prontoEm - comeco + 600) : Infinity;
  const apagando = ms > fim;
  const saindo = ms > fim + 500;
  const acabou = ms > fim + 1500;
  useEffect(() => {
    if (acabou) window.clearInterval(intervalo.current);
  }, [acabou]);
  if (acabou) return null;

  return (
    <div className={`boot${apagando ? " apagando" : ""}${saindo ? " saindo" : ""}`} role="status" aria-live="polite" aria-label={t("Ligando o PC", "Booting up")}>
      <span className={`boot-logo${ms > ACENDE_LOGO ? " aceso" : ""}`}>
        <LogoDev tamanho={120} />
      </span>
      {ms > ACENDE_RODA && (
        <span className="boot-roda" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
      )}
    </div>
  );
}
