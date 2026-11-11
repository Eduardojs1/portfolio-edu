export type Tecnologia = {
  nome: string;
  apelidos: string[]; // palavras que o chat reconhece (sem acento, minúsculas)
  nota?: string; // frase extra na resposta "ele sabe X?"
};

// Tecnologias que NÃO estão no dia a dia. Se alguém perguntar por elas, o chat diz isso com jeito.
export const foraDaLista = [
  "python", "php", "c#", "csharp", ".net", "dotnet", "angular", "svelte", "flutter", "react native",
  "kotlin", "swift", "golang", "rust", "ruby", "rails", "laravel", "django", "wordpress",
];

export const grupos: { id: string; nome: string; frase: string; techs: Tecnologia[] }[] = [
  {
    id: "front",
    nome: "Front-end",
    frase: "no front-end",
    techs: [
      { nome: "TypeScript", apelidos: ["typescript", "ts"] },
      { nome: "JavaScript", apelidos: ["javascript", "js"] },
      { nome: "React", apelidos: ["react", "reactjs", "react.js"] },
      { nome: "Next.js", apelidos: ["next", "nextjs", "next.js"] },
      { nome: "Vue 3", apelidos: ["vue", "vuejs", "vue.js", "vue 3"] },
      { nome: "Tailwind", apelidos: ["tailwind", "tailwindcss"] },
      { nome: "HTML e CSS", apelidos: ["html", "css"] },
      { nome: "Three.js", apelidos: ["three", "threejs", "three.js", "3d", "webgl"] },
      { nome: "GSAP", apelidos: ["gsap", "animacao", "animacoes"] },
    ],
  },
  {
    id: "back",
    nome: "Back-end",
    frase: "no back-end",
    techs: [
      { nome: "Java 21", apelidos: ["java", "jdk"], nota: "É a linguagem principal dele no back-end." },
      { nome: "Spring Boot", apelidos: ["spring", "spring boot", "springboot"] },
      {
        nome: "Java EE",
        apelidos: ["java ee", "jakarta", "jboss", "wildfly", "j2ee"],
        nota: "Ele mantém sistemas corporativos em Java EE, rodando em JBoss e WildFly.",
      },
      { nome: "Node.js", apelidos: ["node", "nodejs", "node.js"] },
      { nome: "Fastify", apelidos: ["fastify"] },
    ],
  },
  {
    id: "banco",
    nome: "Banco de dados",
    frase: "na parte de banco de dados",
    techs: [
      { nome: "PostgreSQL", apelidos: ["postgres", "postgresql", "sql", "banco de dados", "banco"] },
      { nome: "Prisma", apelidos: ["prisma"] },
      { nome: "Drizzle", apelidos: ["drizzle"] },
      { nome: "Flyway", apelidos: ["flyway", "migration", "migrations"] },
    ],
  },
  {
    id: "bots",
    nome: "Bots e desktop",
    frase: "em bots e apps desktop",
    techs: [
      {
        nome: "discord.js",
        apelidos: ["discord", "discord.js", "bot", "bots"],
        nota: "Ele faz bots com cobrança no Pix, entrega de cargo, tickets, verificação e painel web de configuração.",
      },
      {
        nome: "Electron",
        apelidos: ["electron", "desktop", "app desktop", "exe", "windows"],
        nota: "Ele faz apps de Windows que saem num .exe portátil.",
      },
      { nome: "Pix", apelidos: ["pix", "pagamento", "pagamentos"], nota: "Já integrou cobrança Pix com QR Code no padrão do Banco Central." },
    ],
  },
  {
    id: "infra",
    nome: "Infra",
    frase: "na infra e no deploy",
    techs: [
      { nome: "Docker", apelidos: ["docker", "container", "containers"] },
      { nome: "Vercel", apelidos: ["vercel"] },
      { nome: "Cloudflare Pages", apelidos: ["cloudflare"] },
      { nome: "Render", apelidos: ["render"] },
    ],
  },
];
