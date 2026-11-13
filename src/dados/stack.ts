// Aparece em Stack.java como um enum: cada grupo vira uma constante.
// "nome" e "nomeEn" são como o grupo aparece no site.
export const stack: { grupo: string; nome: string; nomeEn: string; itens: string[] }[] = [
  { grupo: "BACKEND", nome: "Back-end", nomeEn: "Back end", itens: ["Java", "Groovy", "Grails", "Python", "Node.js"] },
  { grupo: "FRONTEND", nome: "Front-end", nomeEn: "Front end", itens: ["HTML", "CSS", "JavaScript", "TypeScript", "Tailwind", "JSF", "JSP"] },
  { grupo: "BANCO_DE_DADOS", nome: "Banco de dados", nomeEn: "Databases", itens: ["PostgreSQL", "Oracle", "MySQL"] },
  { grupo: "DEVOPS", nome: "DevOps", nomeEn: "DevOps", itens: ["Git", "Docker", "Linux"] },
  { grupo: "FERRAMENTAS", nome: "Ferramentas", nomeEn: "Tools", itens: ["IntelliJ", "WebStorm", "DataGrip", "VS Code", "DBeaver", "Postman", "Figma"] },
];

// O que ainda está em aprendizado (vira um comentário no fim do enum e uma coluna no banco)
export const estudando = ["JavaScript", "TypeScript", "Tailwind", "Node.js"];
