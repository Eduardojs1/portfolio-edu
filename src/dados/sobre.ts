import { perfil } from "./perfil";

export const textoSobre = `Sou o ${perfil.nome}, desenvolvedor full stack de Belém (PA). Trabalho com Java e Spring no back-end e React, Next e Vue no front, e também mantenho sistemas corporativos em Java EE com Oracle.`;
export const textoSobreEn = `I'm ${perfil.nome}, a full stack developer from Belém, Brazil. I work with Java and Spring on the back end and React, Next and Vue on the front end, and I also maintain enterprise systems in Java EE with Oracle.`;

export const frentes: [string, string][] = [
  ["Sites e landing pages", "com 3D e animação quando o produto pede impacto"],
  ["Sistemas web", "login, painel administrativo, pagamentos e banco de dados"],
  ["Bots de Discord", "cobrança no Pix, tickets e painel de configuração"],
  ["Apps desktop", "apps de Windows em Electron"],
];
export const frentesEn: [string, string][] = [
  ["Websites and landing pages", "with 3D and motion when the product needs impact"],
  ["Web systems", "login, admin dashboards, payments and databases"],
  ["Discord bots", "Pix payments, tickets and a settings dashboard"],
  ["Desktop apps", "Windows apps with Electron"],
];
