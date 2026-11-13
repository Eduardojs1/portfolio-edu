// API oficial de embed do Spotify ("iFrame API"): deixa a barra de baixo do app
// controlar o player do Spotify (tocar, pausar, avançar no tempo, trocar de faixa).
// https://developer.spotify.com/documentation/embeds/references/iframe-api
export type ControleSpotify = {
  loadUri: (uri: string, preferVideo?: boolean, startAt?: number) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  seek: (segundos: number) => void;
  destroy: () => void;
  addListener: (evento: string, cb: (e: { data: Record<string, unknown> }) => void) => void;
};

type ApiSpotify = {
  createController: (
    el: HTMLElement,
    opcoes: { uri: string; width?: string | number; height?: string | number },
    pronto: (c: ControleSpotify) => void
  ) => void;
};

let promessa: Promise<ApiSpotify> | null = null;

export function carregarSpotify(): Promise<ApiSpotify> {
  if (promessa) return promessa;
  promessa = new Promise<ApiSpotify>((resolve, reject) => {
    const w = window as unknown as { onSpotifyIframeApiReady?: (api: ApiSpotify) => void };
    w.onSpotifyIframeApiReady = (api) => resolve(api);
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => {
      promessa = null;
      reject(new Error("Não deu para carregar o player do Spotify"));
    };
    document.head.appendChild(s);
    // Sem resposta em 12 s (rede bloqueando o Spotify): desiste e usa o embed simples
    window.setTimeout(() => reject(new Error("Spotify demorou demais")), 12000);
  });
  return promessa;
}
