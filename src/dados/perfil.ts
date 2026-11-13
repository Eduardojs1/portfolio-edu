// TROCAR: seus dados. Tudo que aparece no site sai daqui.
// Os campos terminados em "En" são a versão em inglês (botão PT/EN).
export const perfil = {
  // O nome aparece em duas linhas no início; a segunda vem com a cor de destaque.
  linha1: "Eduardo Santos",
  linha2: "Full Stack Developer",
  nome: "Eduardo", // usado nos textos corridos ("Sou o Eduardo…")
  usuario: "eduardo", // aparece no terminal
  projeto: "portfolio-edu", // nome do projeto na barra de cima
  iniciais: "ES",

  papeis: ["Full Stack", "Java & Spring", "React & Next", "Bots & Desktop"],

  // Frases que vão sendo digitadas no início, depois de "construindo"
  construindo: ["apps", "sistemas web", "bots de Discord", "sites", "mundos"],
  construindoEn: ["apps", "web systems", "Discord bots", "websites", "worlds"],
  intro: "Do banco de dados à tela: eu construo o produto inteiro.",
  introEn: "From the database to the screen: I build the whole product.",
  disponivel: true,

  formacao: [
    { curso: "Sistemas de Informação", cursoEn: "Information Systems (B.Sc.)", onde: "UFRA · Universidade Federal Rural da Amazônia" },
    { curso: "Inglês do básico ao avançado", cursoEn: "English, beginner to advanced", onde: "Aslan Idiomas" },
  ],

  // Carreira (igual ao LinkedIn). inicio/fim no formato "AAAA-MM"; fim null = até hoje.
  experiencia: [
    {
      cargo: "Analista de Desenvolvimento de Sistemas",
      cargoEn: "Systems Development Analyst",
      empresa: "WPE4BANK",
      tipo: "Tempo integral",
      tipoEn: "Full-time",
      inicio: "2025-05",
      fim: null as string | null,
      local: "Belém, Pará · Presencial",
      localEn: "Belém, Brazil · On-site",
      competencias: ["Resolução de problemas", "Scrum"],
      competenciasEn: ["Problem solving", "Scrum"],
    },
    {
      cargo: "Estagiário de Desenvolvimento Web",
      cargoEn: "Web Development Intern",
      empresa: "Acception Tecnologia",
      tipo: "Estágio",
      tipoEn: "Internship",
      inicio: "2023-11",
      fim: "2025-04" as string | null,
      local: "Belém, Pará · Híbrido",
      localEn: "Belém, Brazil · Hybrid",
      competencias: ["Comunicação", "Trabalho em equipe"],
      competenciasEn: ["Communication", "Teamwork"],
    },
  ],

  email: "edujose2201@gmail.com",
  linkedin: "eduardo-santos-4a6a35267",

  // Coloque o PDF em public/ e escreva o caminho aqui, ex.: "/curriculo-eduardo.pdf".
  // Com null, o arquivo some da árvore e da busca.
  curriculo: null as string | null,
};

export const links = {
  email: `mailto:${perfil.email}`,
  linkedin: `https://www.linkedin.com/in/${perfil.linkedin}/`,
};

// "mai. 2025 – o momento · 1 ano e 7 meses" (conta os meses como o LinkedIn)
const MESES = {
  pt: ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
export function periodo(inicio: string, fim: string | null, idioma: "pt" | "en") {
  const [ai, mi] = inicio.split("-").map(Number);
  const hoje = new Date();
  const [af, mf] = fim ? fim.split("-").map(Number) : [hoje.getFullYear(), hoje.getMonth() + 1];
  const total = af * 12 + mf - (ai * 12 + mi) + 1;
  const anos = Math.floor(total / 12);
  const meses = total % 12;
  const m = MESES[idioma];
  const de = `${m[mi - 1]} ${ai}`;
  const ate = fim ? `${m[mf - 1]} ${af}` : idioma === "pt" ? "o momento" : "Present";
  const dur =
    idioma === "pt"
      ? [anos && `${anos} ${anos === 1 ? "ano" : "anos"}`, meses && `${meses} ${meses === 1 ? "mês" : "meses"}`].filter(Boolean).join(" e ")
      : [anos && `${anos} ${anos === 1 ? "yr" : "yrs"}`, meses && `${meses} ${meses === 1 ? "mo" : "mos"}`].filter(Boolean).join(" ");
  return `${de} – ${ate} · ${dur}`;
}
