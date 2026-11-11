import { perfil } from "./perfil";

export type TipoArquivo = "tsx" | "html" | "js" | "json" | "css" | "md" | "pdf";

export type Arquivo = {
  id: string; // nome do arquivo; também vai no endereço (#projetos.js)
  tipo: TipoArquivo;
  linguagem: string; // aparece na barra de status
  caminho: string[]; // pastas até o arquivo (barra de status)
  descricao: string; // aparece na busca
};

const todos: Arquivo[] = [
  { id: "inicio.tsx", tipo: "tsx", linguagem: "TypeScript JSX", caminho: ["src"], descricao: "Início" },
  { id: "sobre.html", tipo: "html", linguagem: "HTML", caminho: ["src"], descricao: "Quem sou e o que faço" },
  { id: "projetos.js", tipo: "js", linguagem: "JavaScript", caminho: ["src"], descricao: "Projetos" },
  { id: "stack.json", tipo: "json", linguagem: "JSON", caminho: ["src"], descricao: "Tecnologias" },
  { id: "contato.css", tipo: "css", linguagem: "CSS", caminho: ["src"], descricao: "Contato" },
  { id: "README.md", tipo: "md", linguagem: "Markdown", caminho: [], descricao: "Sobre este portfólio" },
];

export const arquivos: Arquivo[] = perfil.curriculo
  ? [...todos, { id: "curriculo.pdf", tipo: "pdf", linguagem: "PDF", caminho: [], descricao: "Baixar currículo" }]
  : todos;

export const arquivoInicial = "inicio.tsx";

export function acharArquivo(id: string) {
  return arquivos.find((a) => a.id === id);
}

// Árvore da janela "Projeto": pastas primeiro, como no IntelliJ
export type No =
  | { tipo: "pasta"; nome: string; fonte?: boolean; filhos: No[] }
  | { tipo: "arquivo"; id: string };

export const arvore: No = {
  tipo: "pasta",
  nome: perfil.projeto,
  filhos: [
    {
      tipo: "pasta",
      nome: "src",
      fonte: true,
      filhos: [
        { tipo: "arquivo", id: "inicio.tsx" },
        { tipo: "arquivo", id: "sobre.html" },
        { tipo: "arquivo", id: "projetos.js" },
        { tipo: "arquivo", id: "stack.json" },
        { tipo: "arquivo", id: "contato.css" },
      ],
    },
    { tipo: "arquivo", id: "README.md" },
    ...(perfil.curriculo ? [{ tipo: "arquivo" as const, id: "curriculo.pdf" }] : []),
  ],
};
