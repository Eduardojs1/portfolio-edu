import { mudarIdioma, useT, type Idioma } from "./i18n";

// Botão PT | EN (site, intro). A barra de tarefas tem o seu próprio, no jeito do Windows.
export function TrocaIdioma({ className = "" }: { className?: string }) {
  const t = useT();
  return (
    <div className={`troca-idioma ${className}`} role="group" aria-label={t("Idioma", "Language")}>
      {(["pt", "en"] as Idioma[]).map((i) => (
        <button key={i} aria-pressed={t.idioma === i} onClick={() => mudarIdioma(i)} title={i === "pt" ? "Português" : "English"}>
          {i.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
