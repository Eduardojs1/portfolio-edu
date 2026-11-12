// TROCAR: seus dados. Tudo que aparece no site sai daqui.
export const perfil = {
  // O nome aparece em duas linhas no início; a segunda vem com a cor de destaque.
  linha1: "Eduardo Dev",
  linha2: "Full Stack",
  nome: "Eduardo", // usado nos textos corridos ("Sou o Eduardo…")
  usuario: "eduardo", // aparece no terminal
  projeto: "portfolio-edu", // nome do projeto na barra de cima
  iniciais: "ED",

  papeis: ["Full Stack", "Java & Spring", "React & Next", "Bots & Desktop"],

  // Frases que vão sendo digitadas no início, depois de "construindo"
  construindo: [
    "sites com 3D e animação",
    "APIs em Java e Spring Boot",
    "sistemas web com painel e pagamento",
    "bots de Discord que cobram no Pix",
    "apps desktop em Electron",
  ],
  intro:
    "Faço front, back, bot de Discord e app desktop. Quando um produto digital precisa de tudo isso conversando, eu construo o caminho inteiro.",
  disponivel: true, // card "Disponível para novos projetos" no início

  formacao: [
    { curso: "Sistemas de Informação", onde: "UFRA · Universidade Federal Rural da Amazônia" },
    { curso: "Inglês do básico ao avançado", onde: "Aslan Idiomas" },
  ],

  email: "seuemail@exemplo.com",
  whatsapp: { exibir: "(00) 00000-0000", numero: "5500000000000" },
  github: "seu-usuario",
  linkedin: "seu-usuario",

  // Coloque o PDF em public/ e escreva o caminho aqui, ex.: "/curriculo-eduardo.pdf".
  // Com null, o arquivo some da árvore e da busca.
  curriculo: null as string | null,
};

export const links = {
  email: `mailto:${perfil.email}`,
  whatsapp: `https://wa.me/${perfil.whatsapp.numero}`,
  github: `https://github.com/${perfil.github}`,
  linkedin: `https://www.linkedin.com/in/${perfil.linkedin}`,
};
