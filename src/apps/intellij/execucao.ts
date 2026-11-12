// Saída das execuções: o log do Spring Boot subindo e as fases do Maven.
import { projetos } from "../../dados/projetos";
import type { Pedaco } from "./realce";
import { CAMINHO_PROJETO } from "./projeto";

export type LinhaLog = { pecas: Pedaco[]; atraso: number; link?: string };

export type Sessao = {
  id: number;
  titulo: string;
  tipo: "app" | "debug" | "maven";
  linhas: LinhaLog[];
  mostradas: number;
  rodando: boolean; // ainda imprimindo ou (no caso do app) no ar
  terminou: boolean; // imprimiu tudo
  codigoSaida?: number;
};

const PID = 18420;
const VERSAO_BOOT = "3.5.7";

const t = (texto: string, c?: string): Pedaco => ({ t: texto, c });
const linha = (pecas: Pedaco[], atraso = 60, link?: string): LinhaLog => ({ pecas, atraso, link });
const simples = (texto: string, c?: string, atraso = 40) => linha([t(texto, c)], atraso);

function carimbo(ms: number) {
  const d = new Date(Date.now() + ms);
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 23);
  const off = -d.getTimezoneOffset();
  const fuso = `${off >= 0 ? "+" : "-"}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`;
  return `${iso}${fuso}`;
}

// Formato do log colorido do Spring Boot
function spring(ms: number, logger: string, msg: string, thread = "main", nivel = "INFO", atraso = 70): LinhaLog {
  return linha(
    [
      t(carimbo(ms), "c-data"),
      t(" "),
      t(nivel.padStart(5), nivel === "WARN" ? "c-aviso" : "c-info"),
      t(` ${PID} `, "c-pid"),
      t("--- [portfolio] [", "c-fraco"),
      t(thread.padStart(15), "c-fraco"),
      t("] ", "c-fraco"),
      t(logger.padEnd(40).slice(0, 40), "c-logger"),
      t(" : ", "c-fraco"),
      t(msg),
    ],
    atraso
  );
}

const BANNER = String.raw`
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _${"`"} | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
`.slice(1).split("\n");

export function logApp(debug: boolean): LinhaLog[] {
  const java = `"C:\\Program Files\\Java\\jdk-21\\bin\\java.exe" ${debug ? "-agentlib:jdwp=transport=dt_socket,address=127.0.0.1:52831,suspend=y,server=n " : ""}-XX:TieredStopAtLevel=1 -Dspring.output.ansi.enabled=always -Dfile.encoding=UTF-8 -classpath ${CAMINHO_PROJETO}\\target\\classes;... dev.eduardo.portfolio.PortfolioApplication`;
  let ms = 0;
  const s = (logger: string, msg: string, passo = 60, thread = "main") => {
    ms += passo;
    return spring(ms, logger, msg, thread, "INFO", passo);
  };
  return [
    simples(java, "c-cmd", 0),
    ...(debug ? [simples("Connected to the target VM, address: '127.0.0.1:52831', transport: 'socket'", undefined, 220)] : []),
    simples("", undefined, 120),
    ...BANNER.map((l) => simples(l, "c-banner", 18)),
    linha([t(" :: Spring Boot :: ", "c-banner-2"), t(`               (v${VERSAO_BOOT})`, "c-fraco")], 30),
    simples("", undefined, 30),
    s("d.e.portfolio.PortfolioApplication", `Starting PortfolioApplication using Java 21.0.5 with PID ${PID} (${CAMINHO_PROJETO}\\target\\classes started by eduardo in ${CAMINHO_PROJETO})`, 160),
    s("d.e.portfolio.PortfolioApplication", 'No active profile set, falling back to 1 default profile: "default"'),
    s(".s.d.r.c.RepositoryConfigurationDelegate", "Bootstrapping Spring Data JDBC repositories in DEFAULT mode.", 140),
    s(".s.d.r.c.RepositoryConfigurationDelegate", "Finished Spring Data repository scanning in 41 ms. Found 1 JDBC repository interface."),
    s("o.s.b.w.embedded.tomcat.TomcatWebServer", "Tomcat initialized with port 8080 (http)", 260),
    s("o.apache.catalina.core.StandardService", "Starting service [Tomcat]"),
    s("o.apache.catalina.core.StandardEngine", "Starting Servlet engine: [Apache Tomcat/10.1.48]"),
    s("o.a.c.c.C.[Tomcat].[localhost].[/]", "Initializing Spring embedded WebApplicationContext", 90),
    s("w.s.c.ServletWebServerApplicationContext", "Root WebApplicationContext: initialization completed in 812 ms"),
    s("com.zaxxer.hikari.HikariDataSource", "HikariPool-1 - Starting...", 180),
    s("com.zaxxer.hikari.pool.HikariPool", "HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@3c2a1f9e", 220),
    s("com.zaxxer.hikari.HikariDataSource", "HikariPool-1 - Start completed."),
    s("org.flywaydb.core.FlywayExecutor", "Database: jdbc:postgresql://localhost:5432/portfolio (PostgreSQL 17.2)", 120),
    s("o.f.core.internal.command.DbValidate", "Successfully validated 2 migrations (execution time 00:00.018s)"),
    s("o.f.core.internal.command.DbMigrate", 'Current version of schema "public": 2'),
    s("o.f.core.internal.command.DbMigrate", 'Schema "public" is up to date. No migration necessary.'),
    s("d.e.portfolio.service.ProjetoService", `${projetos.length} projetos carregados: ${projetos.map((p) => p.nome).join(", ")}`, 140),
    s("o.s.b.w.embedded.tomcat.TomcatWebServer", "Tomcat started on port 8080 (http) with context path '/'", 260),
    s("d.e.portfolio.PortfolioApplication", "Started PortfolioApplication in 2.318 seconds (process running for 2.71)", 120),
    linha([t("Portfólio no ar: ", "c-destaque"), t("http://localhost:8080", "c-link")], 160, "site"),
  ];
}

const objetivos: Record<string, { plugin: string; exec: string; extra?: string[] }[]> = {
  clean: [{ plugin: "maven-clean-plugin:3.4.1:clean", exec: "default-clean", extra: [`Deleting ${CAMINHO_PROJETO}\\target`] }],
  validate: [],
  compile: [
    { plugin: "maven-resources-plugin:3.3.1:resources", exec: "default-resources", extra: ["Copying 1 resource from src\\main\\resources to target\\classes", "Copying 6 resources from src\\main\\resources to target\\classes"] },
    { plugin: "maven-compiler-plugin:3.14.1:compile", exec: "default-compile", extra: ["Recompiling the module because of changed source code.", "Compiling 11 source files with javac [debug parameters release 21] to target\\classes"] },
  ],
  test: [
    { plugin: "maven-resources-plugin:3.3.1:testResources", exec: "default-testResources", extra: ["skip non existing resourceDirectory src\\test\\resources"] },
    { plugin: "maven-compiler-plugin:3.14.1:testCompile", exec: "default-testCompile", extra: ["Compiling 1 source file with javac [debug parameters release 21] to target\\test-classes"] },
    { plugin: "maven-surefire-plugin:3.5.4:test", exec: "default-test" },
  ],
  package: [
    { plugin: "maven-jar-plugin:3.4.2:jar", exec: "default-jar", extra: [`Building jar: ${CAMINHO_PROJETO}\\target\\portfolio-1.0.0.jar`] },
    { plugin: "spring-boot-maven-plugin:3.5.7:repackage", exec: "repackage", extra: ["Replacing main artifact with repackaged archive, adding nested dependencies in BOOT-INF/."] },
  ],
  verify: [],
  install: [
    { plugin: "maven-install-plugin:3.1.4:install", exec: "default-install", extra: [`Installing ${CAMINHO_PROJETO}\\pom.xml to C:\\Users\\eduardo\\.m2\\repository\\dev\\eduardo\\portfolio\\1.0.0\\portfolio-1.0.0.pom`] },
  ],
};
export const fases = ["clean", "validate", "compile", "test", "package", "verify", "install", "site", "deploy"];

export function logMaven(objetivo: string): LinhaLog[] {
  const info = (txt: string, atraso = 45) => linha([t("[", "c-fraco"), t("INFO", "c-info-maven"), t("] ", "c-fraco"), t(txt)], atraso);
  const out: LinhaLog[] = [
    simples(`"C:\\Program Files\\Java\\jdk-21\\bin\\java.exe" -Dmaven.multiModuleProjectDirectory=${CAMINHO_PROJETO} -Dmaven.home=... org.codehaus.classworlds.Launcher ${objetivo}`, "c-cmd", 0),
    info("Scanning for projects...", 200),
    info(""),
    info("--------------------------< dev.eduardo:portfolio >--------------------------", 60),
    info("Building portfolio 1.0.0"),
    info("  from pom.xml"),
    info("--------------------------------[ jar ]---------------------------------"),
  ];
  // Rodar uma fase roda todas as anteriores (menos clean)
  const alvo = fases.indexOf(objetivo);
  const etapas = objetivo === "clean" ? ["clean"] : fases.slice(1, Math.max(1, alvo) + 1).filter((f) => objetivos[f]);
  for (const fase of etapas) {
    for (const passo of objetivos[fase] ?? []) {
      out.push(info(""));
      out.push(linha([t("[", "c-fraco"), t("INFO", "c-info-maven"), t("] ", "c-fraco"), t(`--- ${passo.plugin} (${passo.exec}) @ portfolio ---`, "c-maven-plugin")], 160));
      (passo.extra ?? []).forEach((e) => out.push(info(e, 90)));
      if (passo.plugin.includes("surefire")) {
        out.push(info(""), info("-------------------------------------------------------", 30), info(" T E S T S"), info("-------------------------------------------------------"));
        out.push(info("Running dev.eduardo.portfolio.PortfolioApplicationTests", 300));
        out.push(info("Tests run: 3, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.104 s -- in dev.eduardo.portfolio.PortfolioApplicationTests", 900));
        out.push(info(""), info("Results:"), info(""), info("Tests run: 3, Failures: 0, Errors: 0, Skipped: 0"));
      }
    }
  }
  if (objetivo === "site" || objetivo === "deploy") {
    out.push(info(""), linha([t("[", "c-fraco"), t("WARNING", "c-aviso"), t("] ", "c-fraco"), t(`Nada para publicar em '${objetivo}' neste portfólio. Tente package.`)], 200));
  }
  out.push(
    info("------------------------------------------------------------------------", 200),
    linha([t("[", "c-fraco"), t("INFO", "c-info-maven"), t("] ", "c-fraco"), t("BUILD SUCCESS", "c-sucesso")], 20),
    info("------------------------------------------------------------------------", 20),
    info(`Total time:  ${(1.2 + etapas.length * 0.45).toFixed(3)} s`, 20),
    info(`Finished at: ${carimbo(0).slice(0, 19)}${carimbo(0).slice(23)}`, 20),
    info("------------------------------------------------------------------------", 20),
    simples("", undefined, 40),
    simples("Process finished with exit code 0", "c-fim", 40)
  );
  return out;
}

export const fimProcesso = (codigo: number): LinhaLog => simples(`Process finished with exit code ${codigo}`, "c-fim", 0);
