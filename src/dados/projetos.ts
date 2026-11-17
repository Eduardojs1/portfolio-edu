// Os projetos. No site, cada um é uma linha que abre ao clicar (o "+"):
// fechada mostra só o nome; aberta mostra o texto, o que eu fiz e as tecnologias.
type Textos = {
  rotulo: string; // tipo do projeto, ex.: "Bot de Discord" (só no IntelliJ e no DataGrip; o site não mostra)
  resumo: string; // uma linha (vai também para o banco e a API do projeto Java)
  sobre: string; // o que é o projeto (aparece ao abrir)
  fiz: string; // o que eu fiz e como foi feito (aparece ao abrir)
};

export type Projeto = Textos & {
  id: string;
  nome: string;
  variavel: string; // nome em camelCase (não aparece na tela hoje)
  en: Textos;
  stack: string[];
  imagem?: { src: string; alt: string }; // só o projeto Java (banco/API) usa; o site não mostra
};

export const projetos: Projeto[] = [
  {
    id: "bystore",
    nome: "ByStore",
    variavel: "byStore",
    rotulo: "Bot de Discord",
    resumo: "Bot que atende e vende no servidor de Discord de uma loja de mods, configurado por um painel web.",
    sobre:
      "Feito para o servidor de uma loja de mods gráficos de GTA V. O bot abre os tickets de compra e de suporte, cobra no Pix e barra spam e conta fake. A equipe muda tudo pelo painel no navegador, entrando com a própria conta do Discord.",
    fiz: "O bot, a API e o painel, num monorepo em TypeScript. O bot usa discord.js com os Components V2; a API em Fastify roda no mesmo processo e faz o login pelo OAuth2 do Discord; o banco é Postgres com Drizzle. Os schemas em zod ficam num pacote que o bot e o painel usam juntos.",
    en: {
      rotulo: "Discord bot",
      resumo: "Bot that handles support and sales on a mod store's Discord server, set up from a web dashboard.",
      sobre:
        "Built for the server of a GTA V graphics mod store. The bot opens purchase and support tickets, charges through Pix (Brazil's instant payments) and keeps spam and fake accounts out. The staff changes everything from a dashboard in the browser, signing in with their own Discord account.",
      fiz: "The bot, the API and the dashboard, in a TypeScript monorepo. The bot uses discord.js with Components V2; the Fastify API runs in the same process and handles login through Discord OAuth2; the database is Postgres with Drizzle. The zod schemas live in a package shared by the bot and the dashboard.",
    },
    stack: ["TypeScript", "discord.js", "Fastify", "PostgreSQL", "Drizzle", "React", "Tailwind"],
  },
  {
    id: "visual-encore",
    nome: "Visual Encore",
    variavel: "visualEncore",
    rotulo: "Site com 3D",
    resumo: "Site de venda do Visual Encore, mod gráfico de GTA V e FiveM da The Goat.",
    sobre:
      "Site do Visual Encore, um mod gráfico de GTA V e FiveM da The Goat Graphic Store. A venda é no Discord; o site mostra o jogo com e sem o mod, os requisitos e o passo a passo da instalação.",
    fiz: "O site inteiro, em HTML, CSS e JavaScript, sem framework. A cena 3D é em Three.js com bloom, as animações de rolagem são GSAP com ScrollTrigger e a rolagem suave é do Lenis. Também fiz os dois temas e os textos em português, espanhol e inglês.",
    en: {
      rotulo: "3D website",
      resumo: "Sales website for Visual Encore, a GTA V and FiveM graphics mod by The Goat.",
      sobre:
        "Website for Visual Encore, a GTA V and FiveM graphics mod by The Goat Graphic Store. Sales happen on Discord; the site shows the game with and without the mod, the requirements and a step-by-step install guide.",
      fiz: "The whole site, in plain HTML, CSS and JavaScript, no framework. The 3D scene is Three.js with bloom, the scroll animations are GSAP with ScrollTrigger and the smooth scrolling is Lenis. I also built both themes and the copy in Portuguese, Spanish and English.",
    },
    stack: ["Three.js", "GSAP", "ScrollTrigger", "Lenis", "JavaScript"],
    imagem: {
      src: "/img/visual-encore.webp",
      alt: "Site do Visual Encore: um notebook em 3D com a tela escrita Visual Encore, cercado de partículas.",
    },
  },
  {
    id: "hotel-ebenezer",
    nome: "Hotel Ebenezer",
    variavel: "hotelEbenezer",
    rotulo: "Site de hotel",
    resumo: "Site do Hotel Ebenezer, em João Monlevade (MG), com reserva pelo WhatsApp.",
    sobre:
      "Hotel em João Monlevade (MG). O hóspede vê os quartos, as fotos e o restaurante, escolhe as datas e cai no WhatsApp da recepção com a mensagem já escrita.",
    fiz: "O site todo, em HTML, CSS e JavaScript, sem biblioteca de calendário nem de tradução. As animações são em GSAP. Telefone, endereço e mapa ficam juntos no começo do código, para trocar sem mexer no resto.",
    en: {
      rotulo: "Hotel website",
      resumo: "Website for Hotel Ebenezer, in João Monlevade, Brazil, with bookings through WhatsApp.",
      sobre:
        "A hotel in João Monlevade, Brazil. Guests look at the rooms, the photos and the restaurant, pick their dates and land in the front desk's WhatsApp with the message already written.",
      fiz: "The whole site, in HTML, CSS and JavaScript, with no date picker or translation library. The animations are GSAP. Phone, address and map sit together at the top of the code, so they can change without touching anything else.",
    },
    stack: ["HTML", "CSS", "JavaScript", "GSAP"],
    imagem: {
      src: "/img/hotel-ebenezer.webp",
      alt: "Site do Hotel Ebenezer: fachada do hotel com busca de check-in e check-out.",
    },
  },
  {
    id: "fear-studio",
    nome: "Fear Studio",
    variavel: "fearStudio",
    rotulo: "Página de lançamento",
    resumo: "Página com contagem regressiva para a revelação do Fear Studio.",
    sobre:
      "O Fear Studio é o estúdio por trás da By' Store, da Shaders Mods e da GX Store. Antes de mostrar a marca, ele ganhou uma página escura de propósito: um relógio contando até o dia, as logos das três lojas em brasa e nenhuma pista do logo novo.",
    fiz: "A página e o build, em JavaScript puro com Three.js e GSAP. Para publicar, um script em esbuild junta e minifica tudo numa pasta separada, que vai para a Cloudflare Pages; o código legível não sobe.",
    en: {
      rotulo: "Launch page",
      resumo: "Countdown page for the reveal of Fear Studio.",
      sobre:
        "Fear Studio is the studio behind By' Store, Shaders Mods and GX Store. Before showing the brand, it got a page that's dark on purpose: a clock counting down to the day, the three stores' logos in embers and no hint of the new logo.",
      fiz: "The page and the build, in plain JavaScript with Three.js and GSAP. To publish, an esbuild script bundles and minifies everything into a separate folder that goes to Cloudflare Pages; the readable code never ships.",
    },
    stack: ["Three.js", "GSAP", "Web Audio", "esbuild"],
  },
];
