// Tudo que o chat fala está aqui. Para mudar uma resposta, edite o texto.
// Para o chat entender uma pergunta nova, acrescente palavras em "palavras".
import { perfil } from "../dados/perfil";
import { projetos, type Projeto } from "../dados/projetos";
import type { Tecnologia } from "../dados/stack";
import type { Intencao, Resposta } from "./tipos";

const nome = perfil.nome;

export const sugestoesIniciais = [
  `Quem é o ${nome}?`,
  "Quais projetos ele fez?",
  "Com o que ele trabalha?",
  "Como falo com ele?",
];

export function boasVindas(): Resposta {
  return {
    blocos: [
      {
        tipo: "texto",
        texto: `Oi! Eu sou o assistente do **${perfil.linha1}**. Pode me perguntar o que quiser sobre ele: quem é, os projetos, as tecnologias e como falar com ele.`,
      },
      { tipo: "texto", texto: "Escreva do seu jeito ou comece por uma destas:" },
    ],
    sugestoes: sugestoesIniciais,
  };
}

export function naoEntendi(): Resposta {
  return {
    blocos: [
      { tipo: "texto", texto: `Essa eu não sei responder. Tenta um dos temas do guia ou pergunta direto pro ${nome}:` },
      { tipo: "contatos", quais: ["whatsapp", "email"] },
    ],
    sugestoes: sugestoesIniciais,
  };
}

export function sobreProjetos(lista: Projeto[]): Resposta {
  const outros = projetos.filter((p) => !lista.includes(p)).map((p) => `Me conta do ${p.nome}`);
  if (lista.length === 1) {
    const p = lista[0];
    return {
      blocos: [
        { tipo: "projetos", ids: [p.id], detalhado: true },
        { tipo: "texto", texto: `**O que ele fez:** ${p.fiz}` },
        { tipo: "chips", itens: p.stack },
      ],
      sugestoes: [...outros.slice(0, 2), "Como falo com ele?"],
    };
  }
  return {
    blocos: [{ tipo: "projetos", ids: lista.map((p) => p.id), detalhado: true }],
    sugestoes: [...outros.slice(0, 1), "Com o que ele trabalha?", "Como falo com ele?"],
  };
}

export function sobreTecnologias(
  achadas: { tech: Tecnologia; frase: string }[],
  usadasEm: Projeto[]
): Resposta {
  const blocos: Resposta["blocos"] = [];
  if (achadas.length === 1) {
    const { tech, frase } = achadas[0];
    blocos.push({ tipo: "texto", texto: `Sim! **${tech.nome}** faz parte do dia a dia dele, ${frase}.` });
    if (tech.nota) blocos.push({ tipo: "texto", texto: tech.nota });
  } else {
    blocos.push({ tipo: "texto", texto: "Sim, todas fazem parte do dia a dia dele:" });
    blocos.push({
      tipo: "lista",
      itens: achadas.map(({ tech, frase }) => `**${tech.nome}**, ${frase}${tech.nota ? `. ${tech.nota}` : ""}`),
    });
  }
  if (usadasEm.length) {
    blocos.push({ tipo: "texto", texto: usadasEm.length === 1 ? "Dá pra ver num projeto:" : "Dá pra ver nestes projetos:" });
    blocos.push({ tipo: "projetos", ids: usadasEm.map((p) => p.id) });
  }
  return { blocos, sugestoes: ["Com o que ele trabalha?", "Quais projetos ele fez?", "Como falo com ele?"] };
}

export function foraDaStack(tech: string): Resposta {
  return {
    blocos: [
      {
        tipo: "texto",
        texto: `**${tech}** não está entre as tecnologias que ele usa no dia a dia. Se for essencial pro seu projeto, vale perguntar direto pra ele:`,
      },
      { tipo: "contatos", quais: ["whatsapp", "email"] },
    ],
    sugestoes: ["Com o que ele trabalha?", "O que ele pode fazer pra mim?"],
  };
}

export const intencoes: Intencao[] = [
  /* ---------- fortes: ganham mesmo quando a frase cita projeto ou tecnologia ---------- */
  {
    id: "sobre-o-chat",
    forte: true,
    palavras: ["voce e", "quem e voce", "quem e vc", "vc e", "e uma ia", "e um robo", "e um bot", "chatgpt", "gpt", "como esse site", "como foi feito", "esse chat", "esse site"],
    resposta: () => ({
      blocos: [
        {
          tipo: "texto",
          texto: `Eu sou o assistente do portfólio do ${nome}. Não sou uma IA: tenho respostas prontas sobre ele e reconheço as perguntas pelos temas do guia.`,
        },
        { tipo: "texto", texto: "Fui feito em React e TypeScript, sem servidor por trás." },
      ],
      sugestoes: [`Quem é o ${nome}?`, "Quais projetos ele fez?"],
    }),
  },
  {
    id: "preco",
    forte: true,
    palavras: ["preco*", "quanto custa", "quanto cobra", "quanto sai", "valor", "valores", "orcamento*", "cobra", "custo", "barato", "caro"],
    resposta: () => ({
      blocos: [
        {
          tipo: "texto",
          texto: "O valor depende do tamanho e do prazo do projeto, então não tem tabela fixa. Manda uma mensagem contando o que você precisa que ele te passa um orçamento:",
        },
        { tipo: "contatos", quais: ["whatsapp", "email"] },
      ],
      sugestoes: ["O que ele pode fazer pra mim?", "Quais projetos ele fez?"],
    }),
  },
  {
    id: "curriculo",
    forte: true,
    palavras: ["curriculo", "cv", "resume"],
    resposta: () =>
      perfil.curriculo
        ? {
            blocos: [
              { tipo: "texto", texto: "Tá aqui:" },
              { tipo: "arquivo", rotulo: "Baixar currículo (PDF)", href: perfil.curriculo },
            ],
            sugestoes: ["Como falo com ele?", "Quais projetos ele fez?"],
          }
        : {
            blocos: [
              { tipo: "texto", texto: "O currículo ainda não está no site. Dá uma olhada no LinkedIn ou pede direto pra ele:" },
              { tipo: "contatos", quais: ["linkedin", "email"] },
            ],
            sugestoes: ["Qual a experiência dele?", "Com o que ele trabalha?"],
          },
  },
  {
    id: "disponivel",
    forte: true,
    palavras: ["disponivel", "disponibilidade", "livre", "agenda", "aceitando", "vaga", "emprego", "contratando", "aberto a", "aberto para", "pode pegar"],
    resposta: () => ({
      blocos: [
        {
          tipo: "texto",
          texto: perfil.disponivel
            ? "Sim! Ele está aceitando novos projetos. O melhor jeito é mandar uma mensagem contando a ideia:"
            : "Agora a agenda está cheia, mas vale mandar mensagem pra combinar uma data:",
        },
        { tipo: "contatos", quais: ["whatsapp", "email"] },
      ],
      sugestoes: ["O que ele pode fazer pra mim?", "Quanto custa?"],
    }),
  },
  {
    id: "contato",
    forte: true,
    palavras: ["contato*", "falar com", "falo com", "fala com", "chamar", "chamo", "email", "e mail", "whatsapp", "whats", "zap", "instagram", "insta", "wpp", "telefone", "numero", "celular", "linkedin", "github", "redes", "rede social", "mandar mensagem"],
    resposta: () => ({
      blocos: [{ tipo: "texto", texto: "Pode chamar por aqui:" }, { tipo: "contatos" }],
      sugestoes: ["Ele está disponível?", "Ele tem currículo?"],
    }),
  },

  /* ---------- gerais (em caso de empate, ganha o que vem primeiro) ---------- */
  {
    id: "ajuda",
    palavras: ["ajuda", "help", "guia", "menu", "opcoes", "o que posso perguntar", "o que voce sabe", "temas", "comecar"],
    resposta: () => ({
      blocos: [
        { tipo: "texto", texto: "Dá pra perguntar sobre:" },
        {
          tipo: "lista",
          itens: [
            `**Quem ele é** e a experiência`,
            "**Projetos** que ele fez",
            "**Tecnologias**, inclusive uma específica, tipo “ele sabe Spring?”",
            "**Serviços** e orçamento",
            "**Contato** e currículo",
          ],
        },
      ],
      sugestoes: sugestoesIniciais,
    }),
  },
  {
    id: "quem",
    palavras: ["quem e", "quem e ele", "eduardo", "sobre ele", "apresenta*", "perfil", "bio", "conta sobre", "fale sobre", "fala sobre", "fala dele", "conhecer", "ele e"],
    resposta: () => ({
      blocos: [
        {
          tipo: "texto",
          texto: `O ${nome} é desenvolvedor **full stack**. Trabalha dos dois lados: Java e Spring Boot no back-end, React, Next e Vue no front. Também mantém sistemas corporativos em Java EE e, quando o projeto pede, faz bots de Discord e apps desktop.`,
        },
        { tipo: "texto", texto: "Ele gosta de quando cada peça funciona sozinha, e mais ainda quando todas conversam entre si." },
      ],
      sugestoes: ["Quais projetos ele fez?", "Com o que ele trabalha?", "Como falo com ele?"],
    }),
  },
  {
    id: "experiencia",
    palavras: ["experiencia*", "anos", "tempo de", "carreira", "trajetoria", "formacao", "faculdade", "curso", "empresa", "onde trabalha", "onde ele trabalha", "trabalha onde", "senior", "pleno", "junior", "nivel"],
    resposta: () => ({
      blocos: [
        {
          tipo: "texto",
          texto: "Ele trabalha com desenvolvimento de ponta a ponta: APIs em Java e Spring Boot, front em React, Next e Vue, sistemas corporativos em Java EE (JBoss e WildFly), bots de Discord com pagamento por Pix e apps desktop em Electron.",
        },
        { tipo: "texto", texto: "A trajetória completa está no LinkedIn dele:" },
        { tipo: "contatos", quais: ["linkedin"] },
      ],
      sugestoes: ["Quais projetos ele fez?", "Ele tem currículo?"],
    }),
  },
  {
    id: "servicos",
    palavras: ["servico*", "o que ele faz", "o que ele pode", "pode fazer", "faz site", "fazer um", "fazer uma", "preciso de", "quero um", "quero uma", "contratar", "freela*", "ajudar", "trabalhar com ele"],
    resposta: () => ({
      blocos: [
        { tipo: "texto", texto: "Dá pra contar com ele pra:" },
        {
          tipo: "lista",
          itens: [
            "**Sites e landing pages**, com 3D e animação quando o produto pede impacto",
            "**Sistemas web** com login, painel administrativo, pagamentos e banco de dados",
            "**APIs** em Java e Spring Boot",
            "**Bots de Discord** com cobrança no Pix, tickets e painel de configuração",
            "**Apps desktop** para Windows em Electron",
          ],
        },
        { tipo: "texto", texto: "Conta o que você precisa e ele te responde com um caminho:" },
        { tipo: "contatos", quais: ["whatsapp", "email"] },
      ],
      sugestoes: ["Quanto custa?", "Quais projetos ele fez?"],
    }),
  },
  {
    id: "projetos",
    palavras: ["projet*", "portfolio", "trabalhos", "cases", "case", "exemplos", "fez", "feito", "construiu", "criou", "desenvolveu", "sites"],
    resposta: () => ({
      blocos: [
        { tipo: "texto", texto: "Esses são os projetos em destaque:" },
        { tipo: "projetos", ids: projetos.map((p) => p.id) },
        { tipo: "texto", texto: "Quer saber mais de algum? É só perguntar pelo nome." },
      ],
      sugestoes: projetos.map((p) => `Me conta do ${p.nome}`),
    }),
  },
  {
    id: "stack",
    palavras: ["stack", "tecnologia*", "linguage*", "ferramenta*", "framework*", "trabalha com", "trabalha", "com o que", "usa", "sabe", "programa", "domina", "conhece", "skills", "habilidade*"],
    resposta: () => ({
      blocos: [
        { tipo: "texto", texto: "Isso é o que ele usa no dia a dia:" },
        { tipo: "stack" },
        { tipo: "texto", texto: "Pode perguntar de uma tecnologia específica, tipo “ele sabe Spring?”." },
      ],
      sugestoes: ["Ele sabe Java?", "Ele faz bot de Discord?", "Quais projetos ele fez?"],
    }),
  },
  {
    id: "local",
    palavras: ["onde mora", "onde ele mora", "cidade", "estado", "pais", "de onde", "mora", "remoto", "presencial", "fuso"],
    resposta: () => ({
      blocos: [
        { tipo: "texto", texto: `Ele é do ${perfil.local}. Pra combinar o formato de trabalho, fala com ele:` },
        { tipo: "contatos", quais: ["whatsapp", "email"] },
      ],
      sugestoes: ["Ele está disponível?", "O que ele pode fazer pra mim?"],
    }),
  },
  {
    id: "saudacao",
    palavras: ["oi", "oii", "ola", "eae", "e ai", "eai", "salve", "bom dia", "boa tarde", "boa noite", "hey", "hello", "opa", "tudo bem", "beleza"],
    resposta: () => ({
      blocos: [{ tipo: "texto", texto: `Oi! Tudo certo por aqui. Pode perguntar o que quiser sobre o ${nome}.` }],
      sugestoes: sugestoesIniciais,
    }),
  },
  {
    id: "agradecimento",
    palavras: ["obrigad*", "valeu", "vlw", "brigad*", "tmj", "agradeco", "show", "massa", "top", "legal"],
    resposta: () => ({
      blocos: [{ tipo: "texto", texto: "De nada! Se quiser tirar mais alguma dúvida, é só perguntar." }],
      sugestoes: ["Como falo com ele?", "Quais projetos ele fez?"],
    }),
  },
  {
    id: "tchau",
    palavras: ["tchau", "flw", "falou", "ate mais", "ate logo", "adeus", "bye"],
    resposta: () => ({
      blocos: [{ tipo: "texto", texto: `Até mais! Se pintar um projeto, chama o ${nome}:` }, { tipo: "contatos", quais: ["whatsapp", "email"] }],
      sugestoes: [],
    }),
  },
];
