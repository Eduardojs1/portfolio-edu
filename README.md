# Portfólio do Eduardo Dev

Portfólio em forma de computador. Quem entra vê a minha mesa em 3D (luminária, teclado gamer, fone, o pato de borracha…); rolando, a câmera entra no monitor e aparece um desktop.

**Para quem não é da área** (recrutador, cliente): ao entrar, abre um `LEIA-ME.txt` no Bloco de notas, um bilhete meu explicando o que fazer: abrir o portfólio num navegador comum, fazer o tour (post-its escritos à mão, com marca-texto em volta de cada coisa) ou só fuçar. O atalho **LEIA-ME** fica sempre no canto da barra de tarefas.

Os programas abertos:

- **IntelliJ IDEA**: o portfólio é um projeto Spring Boot de verdade (`dev.eduardo.portfolio`). O README abre primeiro; o ▶ verde (ou `Shift+F10`) "sobe" o app, mostra o log do Spring e abre o site em `localhost:8080` no preview. Tem janela Project, Maven, Git (com os commits reais deste repositório), Terminal, Search Everywhere (`Shift` duas vezes), menus e por aí vai.
- **DataGrip**: o banco `portfolio` com as tabelas `projetos`, `tecnologias`, `formacao` e `contato`. O console aceita `SELECT` (com `WHERE`, `ORDER BY` e `LIMIT`).
- **Spotify**: uma playlist de lo-fi que é gerada no navegador (Web Audio), sem arquivo de áudio.
- **Navegador**: o portfólio como um site comum, sem IDE no caminho.

O menu Iniciar tem atalhos para GitHub, LinkedIn, WhatsApp e e-mail. "Desligar" volta para a mesa.

Feito com React, TypeScript, Vite, Three.js e GSAP.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173.

## O que trocar

Os dados ficam em `src/dados/`. O código Java do IntelliJ, as tabelas do DataGrip e o site saem todos daqui:

| Arquivo | O que tem |
| --- | --- |
| `perfil.ts` | **nome, e-mail, WhatsApp, GitHub, LinkedIn e currículo**, as frases do início, se está disponível e a formação. Os contatos estão com valores de exemplo: troque antes de publicar. |
| `sobre.ts` | o texto e a lista "O que eu faço". |
| `projetos.ts` | os projetos. Cada um tem `imagem` (print em `public/img/`) ou `preview`. |
| `stack.ts` | as tecnologias por área e o que está em estudo. |
| `musicas.ts` | as músicas do Spotify (nome, artista, andamento e acordes). |

Outros pontos:

- **O projeto do IntelliJ** (árvore e conteúdo dos arquivos): `src/apps/intellij/projeto.ts`.
- **A mesa em 3D**: `src/intro/cena.ts` (objetos, luzes e caminho da câmera) e `src/intro/texturas.ts` (madeira, mousepad, teclas, caneca…).
- **O bilhete** (LEIA-ME.txt): `src/apps/bloco/Bloco.tsx`. **O tour**: `src/sistema/Guia.tsx`, com os textos de cada passo em `src/sistema/Desktop.tsx`.
- **A tela do monitor na mesa** é uma imagem: `public/img/tela.webp`. Se mudar o visual do desktop, tire um print de `http://localhost:5173/#intellij` em 1920×1080 e salve por cima.
- **Foto**: `public/img/eduardo.webp` (README, site e retrato em partículas).

## Links diretos

| Endereço | Abre |
| --- | --- |
| `/#portfolio` | o site direto no navegador (bom para mandar para recrutador) |
| `/#tour` | o desktop já com o tour guiado |
| `/#desktop` | o desktop, sem a intro |
| `/#site` | o IntelliJ já rodando o site |
| `/#datagrip` | o DataGrip |
| `/#spotify` | o Spotify |
| `/#abrir=src/main/java/dev/eduardo/portfolio/service/ProjetoService.java` | um arquivo no IntelliJ |
| `/?camera=0.5` | a intro com a câmera parada num ponto (para ajustar a cena) |

## Atalhos no IntelliJ

| Atalho | O que faz |
| --- | --- |
| `Shift` `Shift` | Search Everywhere |
| `Shift+F10` / `Shift+F9` | rodar / debug |
| `Ctrl+F2` | parar |
| `Alt+F12` | terminal |
| `Alt+1` / `Alt+9` / `Alt+4` | Project / Git / Run |
| `Ctrl+F9` | build (Maven compile) |

## Versão anterior

A versão em forma de chat está guardada em `versao-chat/`. Ela não entra no build.

## Publicar

```bash
npm run build
```

Gera a pasta `dist/`. Na Vercel, importe o repositório e ela detecta o Vite sozinha.
