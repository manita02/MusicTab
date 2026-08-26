import guitarra from "./guitarra.png";
import piano from "./piano.png";
import ukelele from "./ukelele.png";
import guitarraElectrica from "./guitarra-electrica.png";

const ICO_SRC: Record<string, string> = {
  "/src/assets/guitarra.png": guitarra,
  "/src/assets/piano.png": piano,
  "/src/assets/ukelele.png": ukelele,
  "/src/assets/guitarra-electrica.png": guitarraElectrica,
};

export function resolveInstrumentIco(urlIco?: string | null): string | undefined {
  if (!urlIco) return undefined;
  return ICO_SRC[urlIco] ?? urlIco;
}
