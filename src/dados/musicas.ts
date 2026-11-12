// TROCAR: as músicas do Spotify do desktop.
// Não são arquivos de áudio: cada faixa é um lo-fi gerado no navegador a partir
// do andamento (bpm) e da sequência de acordes. Troque os nomes à vontade.
export type Musica = {
  id: string;
  titulo: string;
  artista: string;
  album: string;
  adicionada: string;
  duracao: number; // segundos
  bpm: number;
  acordes: string[]; // ex.: "Fmaj7", "Em7", "Dm9", "G7"
};

export const playlist = {
  nome: "Músicas pra codar",
  descricao: "Lo-fi gerado no navegador enquanto o build roda.",
  dono: "Eduardo",
};

export const musicas: Musica[] = [
  { id: "cafe", titulo: "Café e commit", artista: "Café com Java", album: "Lo-fi pra codar", adicionada: "há 2 dias", duracao: 144, bpm: 78, acordes: ["Fmaj7", "Em7", "Dm9", "Cmaj7"] },
  { id: "build", titulo: "Build passou de primeira", artista: "Os Full Stack", album: "Lo-fi pra codar", adicionada: "há 2 dias", duracao: 160, bpm: 84, acordes: ["Am9", "Dm9", "G7", "Cmaj9"] },
  { id: "merge", titulo: "Merge sem conflito", artista: "lofi.dev", album: "Pull Requests", adicionada: "há 5 dias", duracao: 132, bpm: 72, acordes: ["Dmaj7", "Bm7", "Em7", "A7"] },
  { id: "deploy", titulo: "Deploy de sexta", artista: "Café com Java", album: "Produção", adicionada: "há 1 semana", duracao: 176, bpm: 88, acordes: ["Cm9", "Fm9", "Bb7", "Ebmaj7"] },
  { id: "npe", titulo: "NullPointer às 3h", artista: "Os Full Stack", album: "Produção", adicionada: "há 1 semana", duracao: 150, bpm: 70, acordes: ["Em9", "Am9", "D7", "Gmaj7"] },
  { id: "refactor", titulo: "Refatorando em paz", artista: "lofi.dev", album: "Pull Requests", adicionada: "há 2 semanas", duracao: 138, bpm: 76, acordes: ["Gmaj7", "F#m7", "Bm7", "Em9"] },
  { id: "stack", titulo: "Pergunta fechada como duplicada", artista: "Café com Java", album: "Lo-fi pra codar", adicionada: "há 3 semanas", duracao: 164, bpm: 80, acordes: ["Bbmaj7", "Am7", "Gm7", "Fmaj7"] },
  { id: "tomcat", titulo: "Tomcat started on port 8080", artista: "Os Full Stack", album: "Spring", adicionada: "há 1 mês", duracao: 140, bpm: 86, acordes: ["Abmaj7", "Gm7", "Fm9", "Ebmaj7"] },
];
