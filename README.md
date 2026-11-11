# Portfólio do Eduardo Dev

Portfólio em forma de IDE, no estilo da interface nova do IntelliJ, em versão enxuta. Cada arquivo da janela **Projeto** é uma parte do site (`inicio.tsx`, `sobre.html`, `projetos.js`, `stack.json`, `contato.css`, `README.md`).

Escondidos até alguém abrir:
- **Buscar em tudo:** `Shift` duas vezes (ou a lupa), com abas Tudo / Arquivos / Projetos / Ações.
- **Executar:** o botão verde roda o "PortfolioApplication" e mostra um log no estilo Spring Boot.
- **Terminal:** comandos `help`, `ls`, `abrir`, `whoami`, `projetos`, `stack`, `contato` e `run`.

Feito com React, TypeScript e Vite.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

## O que trocar

Tudo fica em `src/dados/`:

| Arquivo | O que tem |
| --- | --- |
| `perfil.ts` | **nome, e-mail, WhatsApp, GitHub, LinkedIn e currículo**. Os contatos estão com valores de exemplo: troque antes de publicar. |
| `projetos.ts` | os projetos. Cada um tem `imagem` (print em `public/img/`) ou `preview` (linhas mostradas no lugar do print). |
| `stack.ts` | as tecnologias de `stack.json`. |
| `arquivos.ts` | os arquivos e as pastas da janela Projeto. |

**Currículo:** coloque o PDF em `public/` e escreva o caminho em `curriculo` no `perfil.ts`. Aí aparece `curriculo.pdf` na árvore e na busca.

**Cores:** ficam no topo de `src/estilos.css`, em `:root`.

## Atalhos

| Atalho | O que faz |
| --- | --- |
| `Shift` `Shift` (ou `Ctrl P`) | buscar em tudo |
| `Alt+F12` (ou `Ctrl J`) | terminal |
| `Shift+F10` | executar |
| `Alt+1` | mostrar ou esconder a janela Projeto |

## Versão anterior

A versão em forma de chat está guardada em `versao-chat/`. Ela não entra no build.

## Publicar

```bash
npm run build
```

Gera a pasta `dist/`. Na Vercel, importe o repositório e ela detecta o Vite sozinha.
