// TROCAR: seus dados. O chat responde a partir daqui.
export const perfil = {
  linha1: "Eduardo Dev",
  linha2: "Full Stack",
  nome: "Eduardo",
  iniciais: "ED",
  local: "Brasil",
  disponivel: true, // muda a resposta de "ele está disponível?"

  email: "seuemail@exemplo.com",
  whatsapp: { exibir: "(00) 00000-0000", numero: "5500000000000" },
  github: "seu-usuario",
  linkedin: "seu-usuario",

  // Coloque o PDF em public/ e escreva o caminho aqui, ex.: "/curriculo-eduardo.pdf".
  curriculo: null as string | null,
};

export const links = {
  email: `mailto:${perfil.email}`,
  whatsapp: `https://wa.me/${perfil.whatsapp.numero}`,
  github: `https://github.com/${perfil.github}`,
  linkedin: `https://www.linkedin.com/in/${perfil.linkedin}`,
};
