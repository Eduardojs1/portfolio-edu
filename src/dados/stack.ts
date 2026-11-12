// Aparece em Stack.java como um enum: cada grupo vira uma constante
export const stack: { grupo: string; itens: string[] }[] = [
  { grupo: "BACKEND", itens: ["Java", "Groovy", "Grails", "Python", "Node.js"] },
  { grupo: "FRONTEND", itens: ["HTML", "CSS", "JavaScript", "TypeScript", "Tailwind", "JSF", "JSP"] },
  { grupo: "BANCO_DE_DADOS", itens: ["PostgreSQL", "MySQL"] },
  { grupo: "DEVOPS", itens: ["Git", "Docker", "Linux"] },
  { grupo: "FERRAMENTAS", itens: ["IntelliJ", "VS Code", "DBeaver", "Postman", "Figma"] },
];

// O que ainda está em aprendizado (vira um comentário no fim do enum)
export const estudando = ["JavaScript", "TypeScript", "Tailwind", "Node.js"];
