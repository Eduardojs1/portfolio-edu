import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sistema, type AppId, type ControleJanela } from "./contexto";
import { apps, ordemApps } from "./apps";
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
  const [janelas, setJanelas] = useState<Record<AppId, EstadoJanela>>(() => ({
    intellij: geometria("intellij"),
    datagrip: geometria("datagrip"),
    spotify: geometria("spotify"),
    navegador: { ...geometria("navegador"), aberta: false }, // só abre quando alguém pede
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
        texto: "esses são os programas que eu uso todo dia. vou te mostrar um por um.",
      },
      {
        alvo: '[data-guia="arvore"]',
        antes: () => abrir("intellij"),
        texto: "intellij: é onde eu programo. aqui do lado ficam os arquivos do portfólio, que é um projeto java de verdade.",
      },
      {
        alvo: '[data-guia="rodar"]',
        antes: () => abrir("intellij"),
        texto: "pra ver o site, liga o projeto: clica nesse ▶ verde.",
        acao: { rotulo: "liga pra mim", fazer: () => emitir("intellij:rodar") },
        esperar: "app-rodando",
      },
      {
        alvo: '[data-guia="site"]',
        antes: () => {
          abrir("intellij");
          emitir("intellij:site");
        },
        texto: "pronto, esse é o site rodando. rola a página pra ver os projetos e o contato.",
      },
      {
        alvo: '.bt-app[aria-label="DataGrip"]',
        texto: "datagrip: o banco de dados. meus projetos tão guardados em tabelas aqui.",
        acao: { rotulo: "abrir", fazer: () => abrir("datagrip") },
      },
      {
        alvo: '.bt-app[aria-label="Spotify"]',
        texto: "spotify: o que eu ouço programando. dá o play, a música é gerada na hora.",
        acao: {
          rotulo: "tocar",
          fazer: () => {
            abrir("spotify");
            emitir("spotify:tocar");
          },
        },
      },
      {
        alvo: '.bt-app[aria-label="Navegador"]',
        texto: "prefere o jeito normal? aqui o portfólio abre como um site comum.",
        acao: { rotulo: "abrir", fazer: () => abrir("navegador") },
      },
      {
        alvo: ".bt-iniciar",
        texto: "pra falar comigo: whatsapp, linkedin e e-mail ficam nesse menu.",
        acao: { rotulo: "abrir o menu", fazer: () => setMenu({ busca: false }) },
      },
      {
        alvo: '[data-guia="guia"]',
        texto: "é isso! se precisar, o bilhete fica aqui. valeu pela visita! — edu",
      },
    ],
    [abrir]
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
          <ul className="icones-desktop" aria-label="Área de trabalho">
            {ordemApps.filter((id) => id !== "bloco").map((id) => {
              const { nome, Icone } = apps[id];
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
                <span>LEIA-ME.txt</span>
              </button>
            </li>
            <li>
              <button className={selecionado === "lixeira" ? "sel" : ""} onClick={() => setSelecionado("lixeira")}>
                <IconeLixeira />
                <span>Lixeira</span>
              </button>
            </li>
          </ul>
        )}

        {ordemApps.map((id) => {
          const e = janelas[id];
          if (!e.aberta) return null;
          const { nome, Componente, minimo } = apps[id];
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
              <Suspense fallback={<div className="janela-carregando">Abrindo {nome}…</div>}>
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
