import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sistema, type AppId, type ControleJanela } from "./contexto";
import { apps, nomeApp, ordemApps } from "./apps";
import { useT } from "../i18n";
import { Janela, type EstadoJanela } from "./Janela";
import { BarraTarefas } from "./BarraTarefas";
import { MenuIniciar } from "./MenuIniciar";
import { IconeBloco, IconeLixeira } from "./icones";
import { useMedia } from "../util";
import { definirSinal, emitir, ouvir } from "./eventos";
import { guiaDispensado, Tour, type PassoTour } from "./Guia";

const BARRA = 48;

function geometria(app: AppId): EstadoJanela {
  const { inicial, maximo } = apps[app];
  const W = innerWidth;
  const H = innerHeight - BARRA;
  let w = Math.round(W * inicial.w);
  let h = Math.round(H * inicial.h);
  let x = Math.round(W * inicial.x);
  let y = Math.round(H * inicial.y);
  if (maximo) {
    // tamanho limitado e centralizada
    w = Math.min(w, maximo.w);
    h = Math.min(h, maximo.h);
    x = Math.round((W - w) / 2);
    y = Math.max(16, Math.round((H - h) / 2.4));
  }
  return {
    x,
    y,
    w,
    h,
    maximizada: inicial.maximizada,
    aberta: true,
    // Os três já ficam "abertos" na barra; o IntelliJ fica na frente
    minimizada: app !== "intellij",
    z: app === "intellij" ? 3 : 1,
  };
}

type Props = { ativo: boolean; onDesligar: () => void };

export function Desktop({ ativo, onDesligar }: Props) {
  const celular = useMedia("(max-width: 900px)");
  const t = useT();
  const en = t.idioma === "en";
  const [janelas, setJanelas] = useState<Record<AppId, EstadoJanela>>(() => ({
    intellij: geometria("intellij"),
    datagrip: geometria("datagrip"),
    spotify: geometria("spotify"),
    navegador: geometria("navegador"), // aberto e minimizado na barra, como os outros
    bloco: { ...geometria("bloco"), aberta: false },
  }));
  const zTopo = useRef(10);
  const [menu, setMenu] = useState<null | { busca: boolean }>(null);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [mudo, setMudo] = useState(false);
  const [tour, setTour] = useState(false);
  const [chamarGuia, setChamarGuia] = useState(false);

  const mudar = useCallback((app: AppId, m: Partial<EstadoJanela>) => {
    setJanelas((j) => ({ ...j, [app]: { ...j[app], ...m } }));
  }, []);

  const focar = useCallback((app: AppId) => {
    setJanelas((j) => {
      if (j[app].z === zTopo.current && !j[app].minimizada) return j;
      return { ...j, [app]: { ...j[app], z: ++zTopo.current, minimizada: false } };
    });
  }, []);

  const abrir = useCallback((app: AppId) => {
    setJanelas((j) => {
      const atual = j[app].aberta ? j[app] : geometria(app);
      return { ...j, [app]: { ...atual, aberta: true, minimizada: false, z: ++zTopo.current } };
    });
  }, []);

  // A janela focada é a de cima entre as visíveis
  const focada = useMemo(() => {
    let melhor: AppId | null = null;
    for (const id of ordemApps) {
      const e = janelas[id];
      if (e.aberta && !e.minimizada && (!melhor || e.z > janelas[melhor].z)) melhor = id;
    }
    return melhor;
  }, [janelas]);

  const clicarNaBarra = (app: AppId) => {
    const e = janelas[app];
    if (!e.aberta) abrir(app);
    else if (e.minimizada) focar(app);
    else if (focada === app) mudar(app, { minimizada: true });
    else focar(app);
  };

  useEffect(() => ouvir("sistema:abrir", (app) => abrir(app as AppId)), [abrir]);

  // Endereço com #datagrip, #spotify, #site, #portfolio ou #tour: já abre o que foi pedido
  const pedidoNoEndereco = useRef(location.hash.slice(1));
  useEffect(() => {
    const h = pedidoNoEndereco.current;
    if (h === "datagrip" || h === "spotify" || h === "navegador") abrir(h);
    else if (h === "portfolio") abrir("navegador");
    else if (h === "site") emitir("intellij:site");
  }, []);

  // ---------------- Guia ----------------
  // Ao entrar no computador: boas-vindas (a não ser que o endereço já peça algo,
  // ou que a pessoa tenha marcado "não mostrar")
  const jaRecebeu = useRef(false);
  useEffect(() => {
    definirSinal("desktop-ativo", ativo);
    if (!ativo || jaRecebeu.current) return;
    // A decisão fica dentro do timer: assim o modo estrito do React (que roda o efeito
    // duas vezes em desenvolvimento) não cancela as boas-vindas
    const t = window.setTimeout(() => {
      if (jaRecebeu.current) return;
      jaRecebeu.current = true;
      const h = pedidoNoEndereco.current;
      if (h === "tour") setTour(true);
      // o bilhete (LEIA-ME.txt) abre sozinho, a não ser que o endereço já peça algo
      else if (!/^(intellij|site|datagrip|spotify|navegador|portfolio|abrir=)/.test(h) && !guiaDispensado()) abrir("bloco");
    }, 650);
    return () => window.clearTimeout(t);
  }, [ativo]);

  const blocoNaFrente = janelas.bloco.aberta && !janelas.bloco.minimizada;
  useEffect(() => definirSinal("guia-aberto", tour || blocoNaFrente), [tour, blocoNaFrente]);
  useEffect(() => ouvir("sistema:guia", (modo) => (modo === "tour" ? setTour(true) : abrir("bloco"))), [abrir]);

  const fecharGuia = useCallback(() => {
    setTour(false);
    setChamarGuia(true); // o botão do guia pisca para a pessoa saber onde ele fica
    window.setTimeout(() => setChamarGuia(false), 4500);
  }, []);

  const passosTour: PassoTour[] = useMemo(
    () => [
      {
        alvo: ".bt-centro",
        texto: t("esses são os programas que eu uso todo dia. vou te mostrar um por um.", "these are the apps I use every day. let me show you each one."),
      },
      {
        alvo: '[data-guia="site"]',
        antes: () => {
          abrir("intellij");
          emitir("intellij:site");
        },
        texto: t(
          "esse é o meu portfólio, já rodando dentro do intellij. rola a página pra ver os projetos e o contato.",
          "this is my portfolio, already running inside intellij. scroll down to see the projects and how to reach me."
        ),
      },
      {
        alvo: '[data-guia="arvore"]',
        antes: () => abrir("intellij"),
        texto: t(
          "intellij: é onde eu programo. aqui do lado ficam os arquivos do portfólio, que é um projeto java de verdade.",
          "intellij: where I code. the portfolio files are right here, and it's a real java project."
        ),
      },
      {
        alvo: '[data-guia="rodar"]',
        antes: () => abrir("intellij"),
        texto: t(
          "esse ▶ verde liga o projeto. já deixei ligado pra você, mas dá pra ver ele subindo de novo.",
          "this green ▶ starts the project. it's already running for you, but you can watch it boot again."
        ),
        acao: { rotulo: t("religar", "restart"), fazer: () => emitir("intellij:rodar") },
      },
      {
        alvo: '.bt-app[data-app="datagrip"]',
        texto: t("datagrip: o banco de dados. meus projetos tão guardados em tabelas aqui.", "datagrip: the database. my projects are stored in tables here."),
        acao: { rotulo: t("abrir", "open"), fazer: () => abrir("datagrip") },
      },
      {
        alvo: '.bt-app[data-app="spotify"]',
        texto: t(
          "spotify: o que eu ouço programando. tem tarcísio do acordeon e um lo-fi que é gerado na hora.",
          "spotify: what I listen to while coding. there's tarcísio do acordeon and a lo-fi that's generated live."
        ),
        acao: {
          rotulo: t("tocar o lo-fi", "play the lo-fi"),
          fazer: () => {
            abrir("spotify");
            emitir("spotify:tocar");
          },
        },
      },
      {
        alvo: '.bt-app[data-app="navegador"]',
        texto: t("prefere o jeito normal? aqui o portfólio abre como um site comum.", "prefer the usual way? here the portfolio opens as a regular website."),
        acao: { rotulo: t("abrir", "open"), fazer: () => abrir("navegador") },
      },
      {
        alvo: ".bt-iniciar",
        texto: t("pra falar comigo: e-mail e linkedin ficam nesse menu.", "to reach me: e-mail and linkedin are in this menu."),
        acao: { rotulo: t("abrir o menu", "open the menu"), fazer: () => setMenu({ busca: false }) },
      },
      {
        alvo: '[data-guia="guia"]',
        texto: t("é isso! se precisar, o bilhete fica aqui. valeu pela visita! — edu", "that's it! if you need it, the note stays here. thanks for stopping by! — edu"),
      },
    ],
    [abrir, t.idioma]
  );

  const controle = (app: AppId): ControleJanela => ({
    maximizada: janelas[app].maximizada || celular,
    focada: focada === app,
    minimizar: () => mudar(app, { minimizada: true }),
    alternarMaximizar: () => mudar(app, { maximizada: !janelas[app].maximizada }),
    fechar: () => mudar(app, { aberta: false, minimizada: false }),
  });

  const ctx = useMemo(() => ({ abrir, desligar: onDesligar, celular, mudo }), [abrir, onDesligar, celular, mudo]);
  const abertas = Object.fromEntries(ordemApps.map((id) => [id, janelas[id].aberta])) as Record<AppId, boolean>;

  return (
    <Sistema.Provider value={ctx}>
      <div className={`desktop${ativo ? " ativo" : ""}${celular ? " celular" : ""}`} inert={!ativo || undefined}>
        <div className="papel-parede" aria-hidden="true" onPointerDown={() => setSelecionado(null)} />

        {!celular && (
          <ul className="icones-desktop" aria-label={t("Área de trabalho", "Desktop")}>
            {ordemApps.filter((id) => id !== "bloco").map((id) => {
              const { Icone } = apps[id];
              const nome = nomeApp(id, en);
              return (
                <li key={id}>
                  <button
                    className={selecionado === id ? "sel" : ""}
                    onClick={() => setSelecionado(id)}
                    onDoubleClick={() => abrir(id)}
                    onKeyDown={(e) => e.key === "Enter" && abrir(id)}
                  >
                    <Icone tamanho={40} />
                    <span>{nome}</span>
                  </button>
                </li>
              );
            })}
            <li>
              <button
                className={selecionado === "leiame" ? "sel" : ""}
                onClick={() => setSelecionado("leiame")}
                onDoubleClick={() => abrir("bloco")}
                onKeyDown={(e) => e.key === "Enter" && abrir("bloco")}
              >
                <IconeBloco tamanho={40} />
                <span>{t("LEIA-ME.txt", "README.txt")}</span>
              </button>
            </li>
            <li>
              <button className={selecionado === "lixeira" ? "sel" : ""} onClick={() => setSelecionado("lixeira")}>
                <IconeLixeira />
                <span>{t("Lixeira", "Recycle Bin")}</span>
              </button>
            </li>
          </ul>
        )}

        {ordemApps.map((id) => {
          const e = janelas[id];
          if (!e.aberta) return null;
          const { Componente, minimo } = apps[id];
          const nome = nomeApp(id, en);
          return (
            <Janela
              key={id}
              nome={nome}
              estado={e}
              focada={focada === id}
              celular={celular}
              minimo={minimo}
              onFocar={() => focar(id)}
              onMudar={(m) => mudar(id, m)}
              onAlternarMaximizar={() => mudar(id, { maximizada: !e.maximizada })}
            >
              <Suspense fallback={<div className="janela-carregando">{t("Abrindo", "Opening")} {nome}…</div>}>
                <Componente janela={controle(id)} />
              </Suspense>
            </Janela>
          );
        })}

        <BarraTarefas
          abertas={abertas}
          chamarGuia={chamarGuia}
          onGuia={() => abrir("bloco")}
          focada={focada}
          menuAberto={!!menu}
          mudo={mudo}
          celular={celular}
          onIniciar={(busca) => setMenu((m) => (m ? null : { busca: !!busca }))}
          onApp={clicarNaBarra}
          onMudo={() => setMudo((v) => !v)}
        />

        {tour && <Tour passos={passosTour} onFim={fecharGuia} />}

        {menu && (
          <MenuIniciar
            focarBusca={menu.busca}
            onAbrir={abrir}
            onFechar={() => setMenu(null)}
            onDesligar={onDesligar}
          />
        )}
      </div>
    </Sistema.Provider>
  );
}
