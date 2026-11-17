import { perfil } from "./perfil";

// Parágrafos separados por linha em branco (no site, cada um vira um <p>)
export const textoSobre = `Sou o ${perfil.linha1}, tenho 22 anos e sou desenvolvedor full stack, de Belém (PA). Me formei em Sistemas de Informação (BSI) pela UFRA, a Universidade Federal Rural da Amazônia. Trabalho com Java e Spring no back-end, React, Next e Vue no front-end, e bancos de dados como PostgreSQL e Oracle.`;

export const textoSobreEn = `I'm ${perfil.linha1}, a 22-year-old full stack developer from Belém, Brazil. I have a bachelor's degree in Information Systems from UFRA, the Federal Rural University of the Amazon. I work with Java and Spring on the back end, React, Next and Vue on the front end, and databases like PostgreSQL and Oracle.`;

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
