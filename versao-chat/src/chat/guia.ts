import { perfil } from "../dados/perfil";

// Temas do guia, com perguntas de exemplo que a pessoa pode clicar
export const guia: { tema: string; perguntas: string[] }[] = [
  { tema: "Sobre ele", perguntas: [`Quem é o ${perfil.nome}?`, "Qual a experiência dele?"] },
  { tema: "Projetos", perguntas: ["Quais projetos ele fez?", "Me conta do Visual Encore"] },
  { tema: "Tecnologias", perguntas: ["Com o que ele trabalha?", "Ele sabe Java?", "Ele faz bot de Discord?"] },
  { tema: "Serviços", perguntas: ["O que ele pode fazer pra mim?", "Quanto custa?"] },
  { tema: "Contato", perguntas: ["Como falo com ele?", "Ele está disponível?", "Ele tem currículo?"] },
];
