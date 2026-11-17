// Os projetos. No site, cada um é uma linha que abre ao clicar (o "+"):
// fechada mostra o tipo, o nome e os destaques; aberta mostra o resto.
type Textos = {
  rotulo: string; // tipo do projeto, ex.: "Bot de Discord"
  resumo: string; // uma linha (vai também para o banco e a API do projeto Java)
  destaques: string[]; // a linha de baixo do nome, curtinha
  sobre: string; // o que é o projeto (aparece ao abrir)
  fiz: string; // o que eu fiz e como foi feito (aparece ao abrir)
  detalhes: string[]; // a lista completa (aparece ao abrir)
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
    destaques: ["Tickets com histórico", "Cobrança no Pix", "Painel web"],
    sobre:
      "Feito para o servidor de uma loja de mods gráficos de GTA V. O bot abre os tickets de compra e de suporte, cobra no Pix e barra spam e conta fake. A equipe muda tudo pelo painel no navegador, entrando com a própria conta do Discord.",
    fiz: "O bot, a API e o painel, num monorepo em TypeScript. O bot usa discord.js com os Components V2; a API em Fastify roda no mesmo processo e faz o login pelo OAuth2 do Discord; o banco é Postgres com Drizzle. Os schemas em zod ficam num pacote que o bot e o painel usam juntos.",
    detalhes: [
      "Cada ticket vira um canal privado com a equipe da categoria; ao fechar, a conversa é salva em HTML no canal de logs e na DM do membro",
      "/pix gera o QR Code e o copia-e-cola no padrão do Banco Central, com produto, valor e desconto; a equipe confirma e o bot entrega o cargo e registra a venda",
      "Captcha em imagem na entrada, com idade mínima da conta e limite de tentativas",
      "Anti-spam para flood, mensagem repetida, excesso de menções, convite de outro servidor e link fora da lista liberada",
      "Editor de mensagens com a prévia igual à do Discord, e comandos personalizados que sincronizam ao salvar",
      "Aviso de live da Twitch e do YouTube, com menção de cargo",
    ],
    en: {
      rotulo: "Discord bot",
      resumo: "Bot that handles support and sales on a mod store's Discord server, set up from a web dashboard.",
      destaques: ["Tickets with transcripts", "Pix payments", "Web dashboard"],
      sobre:
        "Built for the server of a GTA V graphics mod store. The bot opens purchase and support tickets, charges through Pix (Brazil's instant payments) and keeps spam and fake accounts out. The staff changes everything from a dashboard in the browser, signing in with their own Discord account.",
      fiz: "The bot, the API and the dashboard, in a TypeScript monorepo. The bot uses discord.js with Components V2; the Fastify API runs in the same process and handles login through Discord OAuth2; the database is Postgres with Drizzle. The zod schemas live in a package shared by the bot and the dashboard.",
      detalhes: [
        "Each ticket becomes a private channel with that category's staff; when it closes, the conversation is saved as HTML to the log channel and the member's DMs",
        "/pix generates the QR code and copy-paste code following the Central Bank standard, with product, price and discount; the staff confirms and the bot hands out the role and logs the sale",
        "Image captcha on join, with a minimum account age and an attempt limit",
        "Anti-spam for flooding, repeated messages, mass mentions, invites to other servers and links outside the allowed list",
        "Message editor with a Discord-accurate preview, and custom commands that sync on save",
        "Twitch and YouTube live announcements, with a role mention",
      ],
    },
    stack: ["TypeScript", "discord.js", "Fastify", "PostgreSQL", "Drizzle", "React", "Tailwind"],
  },
  {
    id: "visual-encore",
    nome: "Visual Encore",
    variavel: "visualEncore",
    rotulo: "Site com 3D",
    resumo: "Site de venda do Visual Encore, mod gráfico de GTA V e FiveM da The Goat.",
    destaques: ["Notebook em 3D", "Galeria em voo", "PT, ES e EN"],
    sobre:
      "Site do Visual Encore, um mod gráfico de GTA V e FiveM da The Goat Graphic Store. A venda é no Discord; o site mostra o jogo com e sem o mod, os requisitos e o passo a passo da instalação.",
    fiz: "O site inteiro, em HTML, CSS e JavaScript, sem framework. A cena 3D é em Three.js com bloom, as animações de rolagem são GSAP com ScrollTrigger e a rolagem suave é do Lenis. Também fiz os dois temas e os textos em português, espanhol e inglês.",
    detalhes: [
      "Abre com o logo da The Goat se desenhando junto de um contador de 000 a 100, que vira um notebook em 3D",
      "Rolando, a câmera entra na tela do notebook e o site aparece do outro lado",
      "No fundo, uma estrela de partículas que muda de forma a cada seção, foge do cursor e pulsa com a música",
      "Comparação do jogo sem e com o mod numa cortina de arrastar",
      "Galeria em que a câmera voa por entre os prints",
      "Tema claro e escuro, com a troca abrindo num círculo a partir do botão",
    ],
    en: {
      rotulo: "3D website",
      resumo: "Sales website for Visual Encore, a GTA V and FiveM graphics mod by The Goat.",
      destaques: ["3D laptop", "Fly-through gallery", "PT, ES and EN"],
      sobre:
        "Website for Visual Encore, a GTA V and FiveM graphics mod by The Goat Graphic Store. Sales happen on Discord; the site shows the game with and without the mod, the requirements and a step-by-step install guide.",
      fiz: "The whole site, in plain HTML, CSS and JavaScript, no framework. The 3D scene is Three.js with bloom, the scroll animations are GSAP with ScrollTrigger and the smooth scrolling is Lenis. I also built both themes and the copy in Portuguese, Spanish and English.",
      detalhes: [
        "Opens with The Goat logo drawing itself next to a 000-to-100 counter, then turning into a 3D laptop",
        "As you scroll, the camera dives into the laptop screen and the site shows up on the other side",
        "In the background, a particle star that changes shape on every section, moves away from the cursor and pulses with the music",
        "Before/after comparison of the game on a draggable curtain",
        "Gallery where the camera flies through the screenshots",
        "Light and dark themes, switching with a circle that opens from the button",
      ],
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
    destaques: ["Reserva pelo WhatsApp", "Calendário próprio", "PT, EN e ES"],
    sobre:
      "Hotel em João Monlevade (MG). O hóspede vê os quartos, as fotos e o restaurante, escolhe as datas e cai no WhatsApp da recepção com a mensagem já escrita.",
    fiz: "O site todo, em HTML, CSS e JavaScript, sem biblioteca de calendário nem de tradução. As animações são em GSAP. Telefone, endereço e mapa ficam juntos no começo do código, para trocar sem mexer no resto.",
    detalhes: [
      "Calendário de check-in e check-out feito do zero",
      "A reserva junta as datas e o número de hóspedes numa mensagem e abre o WhatsApp do hotel",
      "Tradução para inglês e espanhol sem recarregar a página, e a escolha fica salva",
      "Página própria para o restaurante",
      "Galeria de fotos e vídeos que abrem em tela cheia",
    ],
    en: {
      rotulo: "Hotel website",
      resumo: "Website for Hotel Ebenezer, in João Monlevade, Brazil, with bookings through WhatsApp.",
      destaques: ["WhatsApp bookings", "Custom date picker", "PT, EN and ES"],
      sobre:
        "A hotel in João Monlevade, Brazil. Guests look at the rooms, the photos and the restaurant, pick their dates and land in the front desk's WhatsApp with the message already written.",
      fiz: "The whole site, in HTML, CSS and JavaScript, with no date picker or translation library. The animations are GSAP. Phone, address and map sit together at the top of the code, so they can change without touching anything else.",
      detalhes: [
        "Check-in and check-out date picker built from scratch",
        "The booking puts the dates and number of guests into a message and opens the hotel's WhatsApp",
        "English and Spanish without reloading the page, and the choice is remembered",
        "A page of its own for the restaurant",
        "Photo and video gallery that opens full screen",
      ],
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
    destaques: ["Contagem até a revelação", "Tic-tac sintetizado", "Cinzas em 3D"],
    sobre:
      "O Fear Studio é o estúdio por trás da By' Store, da Shaders Mods e da GX Store. Antes de mostrar a marca, ele ganhou uma página escura de propósito: um relógio contando até o dia, as logos das três lojas em brasa e nenhuma pista do logo novo.",
    fiz: "A página e o build. É JavaScript puro com Three.js e GSAP, e o tic-tac sai do Web Audio na hora, sem arquivo de som. Para publicar, um script em esbuild junta e minifica tudo numa pasta separada, que vai para a Cloudflare Pages; o código legível não sobe.",
    detalhes: [
      "Entrada com “Revelar” em letra gótica, que queima em brasa no clique e solta a música",
      "Contagem até a data marcada, com os números se desfazendo em brasa",
      "Tic-tac a cada segundo, gerado no navegador",
      "Névoa e grãos que viram cinza, em 3D",
      "Versão publicada minificada e com proteção contra as ferramentas do navegador",
    ],
    en: {
      rotulo: "Launch page",
      resumo: "Countdown page for the reveal of Fear Studio.",
      destaques: ["Countdown to the reveal", "Synthesized ticking", "3D ashes"],
      sobre:
        "Fear Studio is the studio behind By' Store, Shaders Mods and GX Store. Before showing the brand, it got a page that's dark on purpose: a clock counting down to the day, the three stores' logos in embers and no hint of the new logo.",
      fiz: "The page and the build. It's plain JavaScript with Three.js and GSAP, and the ticking comes from Web Audio on the fly, no sound file. To publish, an esbuild script bundles and minifies everything into a separate folder that goes to Cloudflare Pages; the readable code never ships.",
      detalhes: [
        "Entrance with “Revelar” (reveal) in a gothic font, which burns into embers on click and starts the music",
        "Countdown to the set date, with the digits crumbling into embers",
        "A tick every second, generated in the browser",
        "Fog and grains that turn to ash, in 3D",
        "Published version minified and protected against the browser's dev tools",
      ],
    },
    stack: ["Three.js", "GSAP", "Web Audio", "esbuild"],
  },
];
