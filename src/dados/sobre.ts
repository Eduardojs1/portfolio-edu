import { perfil } from "./perfil";

// Parágrafos separados por linha em branco (no site, cada um vira um <p>)
export const textoSobre = `Sou o ${perfil.nome}, desenvolvedor full stack de Belém (PA). Desde maio de 2025 estou na WPE4BANK, num sistema de microcrédito urbano e rural feito em Java EE, com JSF e Oracle. Antes, fiz um ano e meio de estágio em desenvolvimento web na Acception Tecnologia.

Fora do trabalho, pego projeto de todo tipo. Para lojas de mods de GTA V, fiz um bot de Discord que vende no Pix, um instalador para Windows em Electron, uma área de membros em Spring Boot com Next e os sites com 3D. Também fiz um sistema de gestão de clínicas com Spring Boot e Vue.

No back-end, Java com Spring (e Node com TypeScript nos bots). No front, React, Next ou Vue. No banco, PostgreSQL ou Oracle.`;

export const textoSobreEn = `I'm ${perfil.nome}, a full stack developer from Belém, Brazil. Since May 2025 I've been at WPE4BANK, working on an urban and rural microcredit system built with Java EE, JSF and Oracle. Before that, I spent a year and a half as a web development intern at Acception Tecnologia.

Outside work, I take on all kinds of projects. For GTA V mod stores I built a Discord bot that sells through Pix, a Windows installer in Electron, a members area in Spring Boot with Next and the 3D websites. I also built a clinic management system with Spring Boot and Vue.

On the back end, Java with Spring (and Node with TypeScript for the bots). On the front end, React, Next or Vue. For databases, PostgreSQL or Oracle.`;

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
