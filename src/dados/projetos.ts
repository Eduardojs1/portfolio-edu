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
    resumo: "Bot de Discord com atendimento, pagamentos e um dashboard próprio.",
    destaques: ["Fluxo de atendimento", "Fluxo de pagamentos", "Dashboard próprio"],
    sobre:
      "Um bot de Discord é um programa que entra no servidor como se fosse um membro e responde a comandos, botões e formulários. O ByStore cuida do atendimento e das vendas de um servidor, e tudo se configura por um painel web, sem mexer em código.",
    fiz: "O bot, a API e o dashboard. O bot é em discord.js com TypeScript; a API em Fastify roda no mesmo processo, com login pela conta do Discord; o banco é Postgres com Drizzle; o painel é em React com Tailwind.",
    detalhes: [
      "Tickets por categoria (compras, suporte…), com botões para assumir, adicionar alguém e fechar; ao fechar, a conversa é salva",
      "Pagamento no Pix: QR Code e copia-e-cola no padrão do Banco Central; confirmado o pagamento, o bot entrega o produto e registra a venda",
      "Dashboard com login pelo Discord: editor visual de mensagens, comandos personalizados, logs e configurações",
      "Verificação com captcha e anti-spam (flood, links e convites)",
      "Aviso automático de lives da Twitch e do YouTube",
    ],
    en: {
      rotulo: "Discord bot",
      resumo: "Discord bot with support tickets, payments and its own dashboard.",
      destaques: ["Support flow", "Payment flow", "Its own dashboard"],
      sobre:
        "A Discord bot is a program that joins a server like a member and answers commands, buttons and forms. ByStore handles a server's support and sales, and everything is set up from a web dashboard, no code needed.",
      fiz: "The bot, the API and the dashboard. The bot uses discord.js with TypeScript; a Fastify API runs in the same process, with login through Discord; the database is Postgres with Drizzle; the dashboard is React with Tailwind.",
      detalhes: [
        "Tickets by category (purchases, support…), with buttons to claim, add someone and close; the conversation is saved when it closes",
        "Pix payments: QR code and copy-paste code following the Central Bank standard; once paid, the bot delivers the product and logs the sale",
        "Dashboard with Discord login: visual message editor, custom commands, logs and settings",
        "Captcha verification and anti-spam (flood, links and invites)",
        "Automatic Twitch and YouTube live announcements",
      ],
    },
    stack: ["TypeScript", "Node.js", "discord.js", "Fastify", "PostgreSQL", "React"],
  },
  {
    id: "visual-encore",
    nome: "Visual Encore",
    variavel: "visualEncore",
    rotulo: "Site · 3D · Animação",
    resumo: "Site de um mod gráfico para GTA V e FiveM.",
    destaques: ["Cena 3D", "Animação na rolagem", "Três idiomas"],
    sobre:
      "Site de um mod gráfico para GTA V e FiveM. Abre com o logo se desenhando, que vira um notebook em 3D; com a rolagem, a câmera entra na tela e aparece o resto do site.",
    fiz: "A cena 3D, as animações de rolagem, o tema claro e escuro e os textos em PT, ES e EN.",
    detalhes: [
      "Logo que se desenha e vira um notebook em 3D",
      "Câmera que entra na tela conforme a rolagem",
      "Galeria em voo 3D, com música",
      "Tema claro e escuro, em PT, ES e EN",
    ],
    en: {
      rotulo: "Website · 3D · Motion",
      resumo: "Website for a graphics mod for GTA V and FiveM.",
      destaques: ["3D scene", "Scroll animation", "Three languages"],
      sobre:
        "Website for a graphics mod for GTA V and FiveM. It opens with the logo drawing itself, which turns into a 3D laptop; as you scroll, the camera dives into the screen and the rest of the site shows up.",
      fiz: "The 3D scene, the scroll animations, the light and dark themes and the copy in PT, ES and EN.",
      detalhes: [
        "Logo that draws itself and turns into a 3D laptop",
        "Camera that dives into the screen as you scroll",
        "3D fly-through gallery, with music",
        "Light and dark themes, in PT, ES and EN",
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
    rotulo: "Site institucional",
    resumo: "Site do hotel, com reserva direto pelo WhatsApp.",
    destaques: ["Busca de datas", "Reserva pelo WhatsApp", "Três idiomas"],
    sobre: "Site institucional do Hotel Ebenezer: quartos, galeria, restaurante e reserva direto pelo WhatsApp, em três idiomas.",
    fiz: "O layout, as páginas e a integração da reserva com o WhatsApp.",
    detalhes: ["Busca de datas para a reserva", "Galeria e página do restaurante", "Reserva direto pelo WhatsApp", "Em três idiomas"],
    en: {
      rotulo: "Business website",
      resumo: "Hotel website, with bookings straight through WhatsApp.",
      destaques: ["Date search", "WhatsApp bookings", "Three languages"],
      sobre: "Business website for Hotel Ebenezer: rooms, gallery, restaurant and bookings straight through WhatsApp, in three languages.",
      fiz: "The layout, the pages and the booking integration with WhatsApp.",
      detalhes: ["Date search for bookings", "Gallery and restaurant page", "Bookings straight through WhatsApp", "In three languages"],
    },
    stack: ["HTML", "CSS", "JavaScript"],
    imagem: {
      src: "/img/hotel-ebenezer.webp",
      alt: "Site do Hotel Ebenezer: fachada do hotel com busca de check-in e check-out.",
    },
  },
  {
    id: "fear-studio",
    nome: "Fear Studio",
    variavel: "fearStudio",
    rotulo: "Teaser de lançamento",
    resumo: "Teaser de lançamento de um estúdio.",
    destaques: ["Contagem regressiva", "Som sintetizado", "Cena 3D"],
    sobre: "Teaser de lançamento de um estúdio: uma contagem até a revelação, com um tic-tac sintetizado a cada segundo e névoa e cinzas em 3D.",
    fiz: "A cena 3D, o som gerado no navegador e o build que minifica tudo para publicar.",
    detalhes: [
      "Contagem regressiva até a revelação",
      "Tic-tac sintetizado a cada segundo (Web Audio)",
      "Névoa e cinzas em 3D",
      "Build minificado e publicado na Cloudflare Pages",
    ],
    en: {
      rotulo: "Launch teaser",
      resumo: "Launch teaser for a studio.",
      destaques: ["Countdown", "Synthesized sound", "3D scene"],
      sobre: "Launch teaser for a studio: a countdown to the reveal, with a ticking clock synthesized every second and fog and ashes in 3D.",
      fiz: "The 3D scene, the sound generated in the browser and the build that minifies everything for release.",
      detalhes: [
        "Countdown to the reveal",
        "Ticking clock synthesized every second (Web Audio)",
        "Fog and ashes in 3D",
        "Minified build deployed to Cloudflare Pages",
      ],
    },
    stack: ["Three.js", "GSAP", "Web Audio", "esbuild"],
  },
];
