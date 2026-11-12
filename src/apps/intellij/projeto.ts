// O "projeto" aberto no IntelliJ: um Spring Boot de verdade, em que cada arquivo
// conta uma parte do portfólio. O conteúdo sai de src/dados, então trocar um dado
// muda o código, o banco do DataGrip e o site ao mesmo tempo.
import { perfil } from "../../dados/perfil";
import { projetos } from "../../dados/projetos";
import { estudando, stack } from "../../dados/stack";
import { frentes, textoSobre } from "../../dados/sobre";
import { juntar, quebrar } from "../../util";
import type { TipoIcone } from "./icones";

export type Linguagem =
  | "java"
  | "xml"
  | "yaml"
  | "sql"
  | "md"
  | "docker"
  | "ignore"
  | "shell"
  | "html"
  | "properties"
  | "texto";

export type Arquivo = {
  id: string; // caminho a partir da raiz do projeto
  nome: string;
  icone: TipoIcone;
  ling?: Linguagem;
  texto?: string;
  imagem?: { src: string; largura: number; altura: number; kb: number };
  binario?: boolean;
};

export type PapelPasta = "comum" | "fonte" | "recursos" | "teste" | "excluida" | "pacote" | "modulo";

export type No =
  | { tipo: "pasta"; id: string; nome: string; papel: PapelPasta; dica?: string; filhos: No[] }
  | { tipo: "arquivo"; id: string }
  | { tipo: "especial"; id: string; nome: string; icone: "bibliotecas" | "rascunhos" | "jdk" | "jar"; filhos?: No[] };

export const NOME_PROJETO = perfil.projeto; // portfolio-edu
export const CAMINHO_PROJETO = `E:\\projetos\\${NOME_PROJETO}`;
export const PACOTE = "dev.eduardo.portfolio";
const JAVA = "src/main/java/dev/eduardo/portfolio";
const RES = "src/main/resources";
const TESTE = "src/test/java/dev/eduardo/portfolio";

export const ID = {
  app: `${JAVA}/PortfolioApplication.java`,
  readme: "README.md",
  servico: `${JAVA}/service/ProjetoService.java`,
  desenvolvedor: `${JAVA}/domain/Desenvolvedor.java`,
  stack: `${JAVA}/domain/Stack.java`,
  contato: `${RES}/application.yml`,
  dados: `${RES}/db/migration/V2__insere_dados.sql`,
  pom: "pom.xml",
};

const q = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const sqlTexto = (s: string) => `'${s.replace(/'/g, "''")}'`;
const recuo = (n: number) => " ".repeat(n);
const textoBloco = (texto: string, n: number) =>
  [`${recuo(n)}"""`, ...quebrar(texto, 64).map((l) => recuo(n) + l), `${recuo(n)}"""`].join("\n");

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------
const java = (caminho: string, icone: TipoIcone, texto: string): Arquivo => ({
  id: caminho,
  nome: caminho.split("/").pop()!,
  icone,
  ling: "java",
  texto,
});

const portfolioApplication = `package ${PACOTE};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * Portfólio do ${perfil.linha1}, ${perfil.linha2.toLowerCase()}.
 *
 * Rode esta classe (Shift+F10) para subir o site em http://localhost:8080.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class PortfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioApplication.class, args);
    }
}
`;

const contatoProperties = `package ${PACOTE}.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Meus contatos, lidos do application.yml (portfolio.contato.*).
 */
@ConfigurationProperties(prefix = "portfolio.contato")
public record ContatoProperties(
        String email,
        String whatsapp,
        String github,
        String linkedin
) {
}
`;

const contatoController = `package ${PACOTE}.controller;

import ${PACOTE}.config.ContatoProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GET /api/contato: como falar comigo.
 */
@RestController
@RequestMapping("/api/contato")
public class ContatoController {

    private final ContatoProperties contato;

    public ContatoController(ContatoProperties contato) {
        this.contato = contato;
    }

    @GetMapping
    public ContatoProperties contato() {
        return contato;
    }
}
`;

const projetoController = `package ${PACOTE}.controller;

import ${PACOTE}.domain.Projeto;
import ${PACOTE}.service.ProjetoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * GET /api/projetos: tudo que eu construí.
 * GET /api/projetos?tecnologia=Three.js: só os que usam uma tecnologia.
 */
@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private final ProjetoService service;

    public ProjetoController(ProjetoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Projeto> listar(@RequestParam(required = false) String tecnologia) {
        return tecnologia == null ? service.listar() : service.usando(tecnologia);
    }
}
`;

const siteController = `package ${PACOTE}.controller;

import ${PACOTE}.domain.Desenvolvedor;
import ${PACOTE}.domain.Stack;
import ${PACOTE}.service.ProjetoService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * A página do portfólio (templates/index.html).
 */
@Controller
public class SiteController {

    private final ProjetoService projetos;

    public SiteController(ProjetoService projetos) {
        this.projetos = projetos;
    }

    @GetMapping("/")
    public String inicio(Model model) {
        model.addAttribute("dev", Desenvolvedor.eduardo());
        model.addAttribute("projetos", projetos.listar());
        model.addAttribute("stack", Stack.values());
        return "index";
    }
}
`;

const desenvolvedor = `package ${PACOTE}.domain;

import java.util.List;

/**
 * Quem está por trás do código.
 */
public record Desenvolvedor(
        String nome,
        String cargo,
        String sobre,
        List<String> oQueEuFaco,
        List<Formacao> formacao,
        boolean disponivel
) {

    public static Desenvolvedor eduardo() {
        return new Desenvolvedor(
                ${q(perfil.linha1)},
                ${q(perfil.linha2)},
${textoBloco(textoSobre, 16)},
                List.of(
${frentes.map(([f]) => `                        ${q(f)}`).join(",\n")}
                ),
                List.of(
${perfil.formacao.map((f) => `                        new Formacao(${q(f.curso)}, ${q(f.onde.split(" · ")[0])})`).join(",\n")}
                ),
                ${perfil.disponivel}
        );
    }
}
`;

const formacao = `package ${PACOTE}.domain;

/**
 * Um curso que eu fiz (ou estou fazendo).
 */
public record Formacao(String curso, String instituicao) {
}
`;

const projeto = `package ${PACOTE}.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.List;

/**
 * Um projeto do portfólio. Os dados estão em db/migration/V2__insere_dados.sql.
 */
@Table("projetos")
public record Projeto(
        @Id Long id,
        String nome,
        String tipo,
        String resumo,
        String oQueFiz,
        List<String> stack,
        String imagem
) {
}
`;

const stackJava = `package ${PACOTE}.domain;

import java.util.List;

/**
 * O que eu uso no dia a dia, por área.
 */
public enum Stack {

${stack.map((g, i) => `    ${g.grupo}(${g.itens.map(q).join(", ")})${i < stack.length - 1 ? "," : ";"}`).join("\n")}

    /** Ainda estudando: ${juntar(estudando)}. */
    public static final List<String> ESTUDANDO = List.of(${estudando.map(q).join(", ")});

    private final List<String> tecnologias;

    Stack(String... tecnologias) {
        this.tecnologias = List.of(tecnologias);
    }

    public List<String> tecnologias() {
        return tecnologias;
    }
}
`;

const projetoRepository = `package ${PACOTE}.repository;

import ${PACOTE}.domain.Projeto;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface ProjetoRepository extends ListCrudRepository<Projeto, Long> {

    @Query("SELECT * FROM projetos WHERE :tecnologia = ANY(stack) ORDER BY id")
    List<Projeto> findByTecnologia(String tecnologia);
}
`;

const projetoService = `package ${PACOTE}.service;

import ${PACOTE}.domain.Projeto;
import ${PACOTE}.repository.ProjetoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Os projetos que eu construí:
 *
${projetos.map((p) => ` * - ${p.nome}: ${p.rotulo}`).join("\n")}
 */
@Service
public class ProjetoService {

    private final ProjetoRepository repository;

    public ProjetoService(ProjetoRepository repository) {
        this.repository = repository;
    }

    public List<Projeto> listar() {
        return repository.findAll();
    }

    public List<Projeto> usando(String tecnologia) {
        return repository.findByTecnologia(tecnologia);
    }
}
`;

const testes = `package ${PACOTE};

import ${PACOTE}.service.ProjetoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PortfolioApplicationTests {

    @Autowired
    private ProjetoService projetos;

    @Test
    void contextLoads() {
    }

    @Test
    void deveListarOsProjetos() {
        assertThat(projetos.listar()).hasSize(${projetos.length});
    }

    @Test
    void deveFiltrarPorTecnologia() {
        assertThat(projetos.usando("Three.js")).isNotEmpty();
    }
}
`;

const v1 = `-- Tabelas do portfólio

CREATE TABLE projetos
(
    id        BIGSERIAL PRIMARY KEY,
    nome      VARCHAR(80)  NOT NULL,
    tipo      VARCHAR(80)  NOT NULL,
    resumo    TEXT         NOT NULL,
    o_que_fiz TEXT,
    stack     TEXT[]       NOT NULL,
    imagem    VARCHAR(200)
);

CREATE TABLE tecnologias
(
    id        SERIAL PRIMARY KEY,
    area      VARCHAR(30) NOT NULL,
    nome      VARCHAR(40) NOT NULL,
    estudando BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE TABLE formacao
(
    id          SERIAL PRIMARY KEY,
    curso       VARCHAR(120) NOT NULL,
    instituicao VARCHAR(120) NOT NULL
);

CREATE TABLE contato
(
    canal VARCHAR(20) PRIMARY KEY,
    valor VARCHAR(120) NOT NULL
);
`;

const v2 = `-- Os dados que aparecem no site

INSERT INTO projetos (nome, tipo, resumo, o_que_fiz, stack, imagem)
VALUES
${projetos
  .map(
    (p) => `    (${sqlTexto(p.nome)},
     ${sqlTexto(p.rotulo)},
     ${sqlTexto(p.resumo)},
     ${sqlTexto(p.fiz)},
     ARRAY [${p.stack.map(sqlTexto).join(", ")}],
     ${p.imagem ? sqlTexto(p.imagem.src) : "NULL"})`
  )
  .join(",\n")};

INSERT INTO tecnologias (area, nome, estudando)
VALUES
${stack
  .flatMap((g) => g.itens.map((t) => `    (${sqlTexto(g.grupo)}, ${sqlTexto(t)}, ${estudando.includes(t) ? "TRUE" : "FALSE"})`))
  .join(",\n")};

INSERT INTO formacao (curso, instituicao)
VALUES
${perfil.formacao.map((f) => `    (${sqlTexto(f.curso)}, ${sqlTexto(f.onde)})`).join(",\n")};

INSERT INTO contato (canal, valor)
VALUES ('email', ${sqlTexto(perfil.email)}),
       ('whatsapp', ${sqlTexto(perfil.whatsapp.exibir)}),
       ('github', ${sqlTexto(`github.com/${perfil.github}`)}),
       ('linkedin', ${sqlTexto(`in/${perfil.linkedin}`)});
`;

const applicationYml = `server:
  port: 8080

spring:
  application:
    name: portfolio
  datasource:
    url: jdbc:postgresql://localhost:5432/portfolio
    username: eduardo
    password: \${DB_PASSWORD}
  flyway:
    enabled: true
  thymeleaf:
    cache: false

# Como falar comigo
portfolio:
  contato:
    email: ${perfil.email}
    whatsapp: "${perfil.whatsapp.exibir}"
    github: github.com/${perfil.github}
    linkedin: in/${perfil.linkedin}
`;

const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title th:text="\${dev.nome}">Eduardo Dev</title>
</head>
<body>
<header>
    <h1 th:text="\${dev.nome}">Eduardo Dev</h1>
    <p th:text="\${dev.cargo}">Full Stack</p>
</header>

<section id="projetos">
    <article th:each="projeto : \${projetos}">
        <img th:if="\${projeto.imagem}" th:src="\${projeto.imagem}" alt="">
        <h2 th:text="\${projeto.nome}">Projeto</h2>
        <p th:text="\${projeto.resumo}">Resumo</p>
    </article>
</section>

<section id="stack">
    <div th:each="area : \${stack}">
        <h3 th:text="\${area}">BACKEND</h3>
        <span th:each="t : \${area.tecnologias()}" th:text="\${t}">Java</span>
    </div>
</section>
</body>
</html>
`;

const pom = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.5.7</version>
        <relativePath/>
    </parent>

    <groupId>dev.eduardo</groupId>
    <artifactId>portfolio</artifactId>
    <version>1.0.0</version>
    <name>portfolio</name>
    <description>Portfólio do ${perfil.linha1}</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;

const dockerfile = `# Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw -q package -DskipTests

# Run
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/portfolio-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`;

const compose = `services:
  banco:
    image: postgres:17
    environment:
      POSTGRES_DB: portfolio
      POSTGRES_USER: eduardo
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    ports:
      - "5432:5432"

  app:
    build: .
    depends_on:
      - banco
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://banco:5432/portfolio
      DB_PASSWORD: \${DB_PASSWORD}
    ports:
      - "8080:8080"
`;

const gitignore = `target/
!.mvn/wrapper/maven-wrapper.jar

### IntelliJ IDEA ###
.idea/*
!.idea/misc.xml
!.idea/vcs.xml
*.iml

### Segredos ###
.env
`;

const mvnw = `#!/bin/sh
# ----------------------------------------------------------------------------
# Apache Maven Wrapper startup script, version 3.3.2
#
# Baixa o Maven certo na primeira vez e roda o build:
#   ./mvnw spring-boot:run
# ----------------------------------------------------------------------------

set -euf
MAVEN_PROJECTBASEDIR=\${MAVEN_BASEDIR:-"$(dirname "$0")"}
exec java -classpath "$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar" \\
  org.apache.maven.wrapper.MavenWrapperMain "$@"
`;

const mvnwCmd = `@REM Apache Maven Wrapper startup script, version 3.3.2
@REM Uso: mvnw.cmd spring-boot:run
@echo off
set MAVEN_PROJECTBASEDIR=%~dp0
java -classpath "%MAVEN_PROJECTBASEDIR%.mvn\\wrapper\\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
`;

const wrapperProps = `distributionUrl=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip
`;

const ideaMisc = `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="ExternalStorageConfigurationManager" enabled="true" />
  <component name="MavenProjectsManager">
    <option name="originalFiles">
      <list>
        <option value="$PROJECT_DIR$/pom.xml" />
      </list>
    </option>
  </component>
  <component name="ProjectRootManager" version="2" languageLevel="JDK_21" project-jdk-name="21" project-jdk-type="JavaSDK" />
</project>
`;

const ideaVcs = `<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="VcsDirectoryMappings">
    <mapping directory="" vcs="Git" />
  </component>
</project>
`;

// README: a primeira coisa que abre. Links com "acao:", "abrir:", "app:" e "site:"
// viram ações no preview (ver Markdown.tsx).
const readme = `# ${perfil.linha1}

![Retrato do ${perfil.nome}](/img/eduardo.webp "retrato")

**${perfil.linha2}** · Java, Spring Boot, React e bots de Discord

${textoSobre}

## Por onde começar

Não precisa entender de programação: é só clicar nos links azuis. 😉

| Quero... | Clique em |
| --- | --- |
| Ver o portfólio como um site comum | [Abrir no navegador](app:navegador) |
| Ver o site rodando aqui no programa | [▶ Ligar o projeto](acao:rodar) (o mesmo que o ▶ verde lá em cima) |
| Conhecer cada programa com calma | [Fazer o tour guiado](acao:guia) |
| Falar comigo | [Contato](site:contato) |
| Ver os projetos em código | [ProjetoService.java](abrir:${ID.servico}) |
| Ver os projetos no banco de dados | [Abrir no DataGrip](app:datagrip) |
| Ouvir o que eu ouço programando | [Abrir o Spotify](app:spotify) |

## Projetos

${projetos.map((p) => `- **${p.nome}** · ${p.rotulo}. ${p.resumo} [Ver no site](site:projeto-${p.id})`).join("\n")}

## Stack

${stack.map((g) => `**${g.grupo.replace(/_/g, " ").toLowerCase()}:** ${g.itens.map((t) => `\`${t}\``).join(" ")}`).join("\n\n")}

## Contato

- E-mail: [${perfil.email}](mailto:${perfil.email})
- WhatsApp: [${perfil.whatsapp.exibir}](https://wa.me/${perfil.whatsapp.numero})
- GitHub: [github.com/${perfil.github}](https://github.com/${perfil.github})
- LinkedIn: [in/${perfil.linkedin}](https://www.linkedin.com/in/${perfil.linkedin})

---

> Dica: aperte \`Shift\` duas vezes para buscar qualquer arquivo ou ação.
`;

const imagem = (nome: string, largura: number, altura: number, kb: number): Arquivo => ({
  id: `${RES}/static/img/${nome}`,
  nome,
  icone: "imagem",
  imagem: { src: `/img/${nome}`, largura, altura, kb },
});

export const arquivos: Arquivo[] = [
  java(ID.app, "aplicacao", portfolioApplication),
  java(`${JAVA}/config/ContatoProperties.java`, "record", contatoProperties),
  java(`${JAVA}/controller/ContatoController.java`, "classe", contatoController),
  java(`${JAVA}/controller/ProjetoController.java`, "classe", projetoController),
  java(`${JAVA}/controller/SiteController.java`, "classe", siteController),
  java(ID.desenvolvedor, "record", desenvolvedor),
  java(`${JAVA}/domain/Formacao.java`, "record", formacao),
  java(`${JAVA}/domain/Projeto.java`, "record", projeto),
  java(ID.stack, "enum", stackJava),
  java(`${JAVA}/repository/ProjetoRepository.java`, "interface", projetoRepository),
  java(ID.servico, "classe", projetoService),
  { id: `${RES}/db/migration/V1__cria_tabelas.sql`, nome: "V1__cria_tabelas.sql", icone: "sql", ling: "sql", texto: v1 },
  { id: ID.dados, nome: "V2__insere_dados.sql", icone: "sql", ling: "sql", texto: v2 },
  imagem("eduardo.webp", 640, 640, 58),
  imagem("hotel-ebenezer.webp", 1200, 750, 36),
  imagem("visual-encore.webp", 1200, 750, 48),
  { id: `${RES}/templates/index.html`, nome: "index.html", icone: "html", ling: "html", texto: indexHtml },
  { id: ID.contato, nome: "application.yml", icone: "yaml", ling: "yaml", texto: applicationYml },
  java(`${TESTE}/PortfolioApplicationTests.java`, "teste", testes),
  { id: ".idea/.gitignore", nome: ".gitignore", icone: "ignore", ling: "ignore", texto: "# Arquivos padrão ignorados\n/shelf/\n/workspace.xml\n" },
  { id: ".idea/misc.xml", nome: "misc.xml", icone: "xml", ling: "xml", texto: ideaMisc },
  { id: ".idea/vcs.xml", nome: "vcs.xml", icone: "xml", ling: "xml", texto: ideaVcs },
  { id: ".mvn/wrapper/maven-wrapper.properties", nome: "maven-wrapper.properties", icone: "properties", ling: "properties", texto: wrapperProps },
  { id: "target/portfolio-1.0.0.jar", nome: "portfolio-1.0.0.jar", icone: "jar", binario: true },
  { id: ".gitignore", nome: ".gitignore", icone: "ignore", ling: "ignore", texto: gitignore },
  { id: "docker-compose.yml", nome: "docker-compose.yml", icone: "yaml", ling: "yaml", texto: compose },
  { id: "Dockerfile", nome: "Dockerfile", icone: "docker", ling: "docker", texto: dockerfile },
  { id: "mvnw", nome: "mvnw", icone: "shell", ling: "shell", texto: mvnw },
  { id: "mvnw.cmd", nome: "mvnw.cmd", icone: "cmd", ling: "shell", texto: mvnwCmd },
  { id: ID.pom, nome: "pom.xml", icone: "maven", ling: "xml", texto: pom },
  { id: ID.readme, nome: "README.md", icone: "md", ling: "md", texto: readme },
];

const porId = new Map(arquivos.map((a) => [a.id, a]));
export const acharArquivo = (id: string) => porId.get(id);

// ---------------------------------------------------------------------------
// Árvore (como a janela Project mostra, com "Compact Middle Packages")
// ---------------------------------------------------------------------------
function papelDe(caminho: string, dentroDeRaiz: boolean): PapelPasta {
  if (caminho === "src/main/java") return "fonte";
  if (caminho === "src/main/resources") return "recursos";
  if (caminho === "src/test/java") return "teste";
  if (caminho === "target") return "excluida";
  return dentroDeRaiz ? "pacote" : "comum";
}

type Montando = { pastas: Map<string, Montando>; arquivos: string[] };

function montar(): No[] {
  const raiz: Montando = { pastas: new Map(), arquivos: [] };
  for (const a of arquivos) {
    const partes = a.id.split("/");
    let atual = raiz;
    for (const p of partes.slice(0, -1)) {
      if (!atual.pastas.has(p)) atual.pastas.set(p, { pastas: new Map(), arquivos: [] });
      atual = atual.pastas.get(p)!;
    }
    atual.arquivos.push(a.id);
  }

  const ordenar = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
  const raizes = ["src/main/java", "src/main/resources", "src/test/java"];

  const converter = (m: Montando, caminho: string, dentroDeRaiz: boolean): No[] => {
    const pastas = [...m.pastas.entries()].sort(([a], [b]) => ordenar(a, b));
    const nos: No[] = pastas.map(([nome, filho]) => {
      let id = caminho ? `${caminho}/${nome}` : nome;
      let rotulo = nome;
      let atual = filho;
      const ehRaiz = raizes.includes(id);
      // Pastas do meio sem arquivos viram "dev.eduardo.portfolio"
      if (dentroDeRaiz) {
        while (atual.arquivos.length === 0 && atual.pastas.size === 1) {
          const [n, f] = [...atual.pastas.entries()][0];
          rotulo += `.${n}`;
          id += `/${n}`;
          atual = f;
        }
      }
      return {
        tipo: "pasta" as const,
        id,
        nome: rotulo,
        papel: papelDe(id, dentroDeRaiz),
        filhos: converter(atual, id, dentroDeRaiz || ehRaiz),
      };
    });
    const arqs = [...m.arquivos]
      .sort((a, b) => ordenar(a.split("/").pop()!, b.split("/").pop()!))
      .map((id) => ({ tipo: "arquivo" as const, id }));
    return [...nos, ...arqs];
  };

  return [
    {
      tipo: "pasta",
      id: "",
      nome: NOME_PROJETO,
      papel: "modulo",
      dica: CAMINHO_PROJETO,
      filhos: converter(raiz, "", false),
    },
    {
      tipo: "especial",
      id: "::bibliotecas",
      nome: "External Libraries",
      icone: "bibliotecas",
      filhos: [
        { tipo: "especial", id: "::jdk", nome: "< 21 >  C:\\Program Files\\Java\\jdk-21", icone: "jdk" },
        ...[
          "org.springframework.boot:spring-boot:3.5.7",
          "org.springframework.boot:spring-boot-autoconfigure:3.5.7",
          "org.springframework:spring-webmvc:6.2.12",
          "org.springframework.data:spring-data-jdbc:3.5.5",
          "org.flywaydb:flyway-core:11.7.2",
          "org.postgresql:postgresql:42.7.8",
          "org.thymeleaf:thymeleaf:3.1.3.RELEASE",
        ].map((lib) => ({ tipo: "especial" as const, id: `::lib:${lib}`, nome: `Maven: ${lib}`, icone: "jar" as const })),
      ],
    },
    { tipo: "especial", id: "::rascunhos", nome: "Scratches and Consoles", icone: "rascunhos", filhos: [] },
  ];
}

export const arvore: No[] = montar();

// Caminho de pastas até um arquivo, como a barra de status mostra
export function migalhas(id: string): string[] {
  const partes = id.split("/");
  const nome = partes.pop()!.replace(/\.java$/, "");
  return [NOME_PROJETO, ...partes, nome];
}

// Pastas abertas quando o projeto abre
export const pastasAbertas = new Set<string>(["", "src", "src/main", "src/main/java", `${JAVA}`]);
