export type Canal = "whatsapp" | "email" | "linkedin" | "github";

export type Bloco =
  | { tipo: "texto"; texto: string } // aceita **negrito**
  | { tipo: "lista"; itens: string[] }
  | { tipo: "projetos"; ids: string[]; detalhado?: boolean }
  | { tipo: "stack" }
  | { tipo: "chips"; itens: string[] }
  | { tipo: "contatos"; quais?: Canal[] }
  | { tipo: "arquivo"; rotulo: string; href: string };

export type Resposta = { blocos: Bloco[]; sugestoes: string[] };

export type Intencao = {
  id: string;
  forte?: boolean; // ganha de projeto e tecnologia citados na mesma frase (ex.: "quanto custa um bot?")
  palavras: string[]; // sem acento e minúsculas; termine com * para aceitar variações (projet* → projeto, projetos)
  resposta: () => Resposta;
};
