export type Projeto = {
  id: string;
  nome: string;
  apelidos: string[]; // como as pessoas podem chamar o projeto numa pergunta
  rotulo: string;
  resumo: string;
  fiz: string;
  stack: string[];
  imagem?: { src: string; alt: string };
  preview?: string[]; // linhas mostradas no lugar do print
};

export const projetos: Projeto[] = [
  {
    id: "visual-encore",
    nome: "Visual Encore",
    apelidos: ["visual encore", "encore", "mod grafico", "gta"],
    rotulo: "Site · 3D · Animação",
    resumo:
      "Site de um mod gráfico para GTA V e FiveM. Abre com o logo se desenhando, vira um notebook em 3D e, com a rolagem, a câmera entra na tela. Tem galeria em voo 3D, música e três idiomas.",
    fiz: "A cena 3D, as animações de rolagem, tema claro e escuro e os textos em PT, ES e EN.",
    stack: ["Three.js", "GSAP", "ScrollTrigger", "Lenis", "JavaScript"],
    imagem: {
      src: "/img/visual-encore.webp",
      alt: "Site do Visual Encore: um notebook em 3D com a tela escrita Visual Encore, cercado de partículas.",
    },
  },
  {
    id: "hotel-ebenezer",
    nome: "Hotel Ebenezer",
    apelidos: ["hotel ebenezer", "hotel", "ebenezer"],
    rotulo: "Site institucional",
    resumo:
      "Site do hotel com busca de datas, galeria, página do restaurante e reserva direto pelo WhatsApp, em três idiomas.",
    fiz: "Layout, páginas e a integração da reserva com o WhatsApp.",
    stack: ["HTML", "CSS", "JavaScript"],
    imagem: {
      src: "/img/hotel-ebenezer.webp",
      alt: "Site do Hotel Ebenezer: fachada do hotel com busca de check-in e check-out.",
    },
  },
  {
    id: "fear-studio",
    nome: "Fear Studio",
    apelidos: ["fear studio", "fear", "teaser"],
    rotulo: "Teaser de lançamento",
    resumo:
      "Teaser de lançamento de um estúdio: contagem até a revelação, com tic-tac sintetizado a cada segundo, névoa e cinzas em 3D.",
    fiz: "A cena 3D, o som gerado no navegador e o build que minifica tudo para publicar.",
    stack: ["Three.js", "GSAP", "Web Audio", "esbuild"],
    preview: ["revelação em 06d 14h 22m 09s", "tic-tac sintetizado", "névoa e cinzas em 3D"],
  },
];
