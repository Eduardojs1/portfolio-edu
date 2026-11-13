import { lazy, type ComponentType } from "react";
import type { AppId, ControleJanela } from "./contexto";
import { IconeBloco, IconeDataGrip, IconeIntelliJ, IconeNavegador, IconeSpotify } from "./icones";
import { IntelliJ } from "../apps/intellij/IntelliJ";

const DataGrip = lazy(() => import("../apps/datagrip/DataGrip").then((m) => ({ default: m.DataGrip })));
const Spotify = lazy(() => import("../apps/spotify/Spotify").then((m) => ({ default: m.Spotify })));
const Navegador = lazy(() => import("../apps/navegador/NavegadorApp").then((m) => ({ default: m.NavegadorApp })));
const Bloco = lazy(() => import("../apps/bloco/Bloco").then((m) => ({ default: m.Bloco })));

export type InfoApp = {
  nome: string;
  nomeEn?: string; // nome em inglês, se for diferente
  Icone: (p: { tamanho?: number }) => React.JSX.Element;
  Componente: ComponentType<{ janela: ControleJanela }>;
  minimo: { w: number; h: number };
  // tamanho e posição ao abrir pela primeira vez, em fração da tela
  inicial: { x: number; y: number; w: number; h: number; maximizada: boolean };
  maximo?: { w: number; h: number }; // em pixels; a janela fica centralizada
  rotulo?: string; // nome na barra de tarefas, se for diferente
  rotuloEn?: string;
};

export const ordemApps: AppId[] = ["intellij", "datagrip", "spotify", "navegador", "bloco"];

export const apps: Record<AppId, InfoApp> = {
  intellij: {
    nome: "IntelliJ IDEA",
    Icone: IconeIntelliJ,
    Componente: IntelliJ,
    minimo: { w: 760, h: 480 },
    inicial: { x: 0.06, y: 0.05, w: 0.86, h: 0.84, maximizada: true },
  },
  datagrip: {
    nome: "DataGrip",
    Icone: IconeDataGrip,
    Componente: DataGrip,
    minimo: { w: 640, h: 420 },
    inicial: { x: 0.09, y: 0.07, w: 0.74, h: 0.78, maximizada: false },
  },
  spotify: {
    nome: "Spotify",
    Icone: IconeSpotify,
    Componente: Spotify,
    minimo: { w: 560, h: 420 },
    inicial: { x: 0.28, y: 0.04, w: 0.64, h: 0.9, maximizada: false },
  },
  // O portfólio como um site comum, para quem não é da área
  navegador: {
    nome: "Navegador",
    nomeEn: "Browser",
    Icone: IconeNavegador,
    Componente: Navegador,
    minimo: { w: 480, h: 400 },
    inicial: { x: 0.08, y: 0.04, w: 0.84, h: 0.9, maximizada: true },
  },
  // O bilhete de boas-vindas (LEIA-ME.txt)
  bloco: {
    nome: "Bloco de notas",
    nomeEn: "Notepad",
    rotulo: "LEIA-ME.txt - Bloco de notas",
    rotuloEn: "README.txt - Notepad",
    Icone: IconeBloco,
    Componente: Bloco,
    minimo: { w: 360, h: 320 },
    inicial: { x: 0.25, y: 0.08, w: 0.5, h: 0.8, maximizada: false },
    maximo: { w: 660, h: 640 },
  },
};

// Nome do app no idioma escolhido
export const nomeApp = (id: AppId, en: boolean) => (en && apps[id].nomeEn) || apps[id].nome;
export const rotuloApp = (id: AppId, en: boolean) => (en ? apps[id].rotuloEn : apps[id].rotulo) ?? nomeApp(id, en);
