/**
 * OrbitMark shell (P5 / M1): bottom-tab navigation across Tonight · Sky · Catalog ·
 * Passes · Settings, with object-detail routing. Holds the shared engine core and
 * passes it to every screen. The whole manual loop works with no account or sensors.
 */
import { useState } from "react";
import { type TleObject } from "../orbital/catalog";
import { useCatalog } from "./useCatalog";
import { TonightView, ManualSky, CatalogScreen, ObjectDetail, PassesScreen, SettingsScreen, LearnScreen } from "./screens";

const TABS = [
  { id: "tonight", label: "Tonight" }, { id: "sky", label: "Sky" }, { id: "catalog", label: "Catalog" },
  { id: "passes", label: "Passes" }, { id: "learn", label: "Learn" }, { id: "settings", label: "Settings" },
];

function TabIcon({ id }: { id: string }) {
  const s = { width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;
  switch (id) {
    case "tonight": return <svg {...s} viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>;
    case "sky": return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18" /></svg>;
    case "catalog": return <svg {...s} viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h10" /></svg>;
    case "passes": return <svg {...s} viewBox="0 0 24 24"><path d="M3 17a9 9 0 0 1 18 0" /><circle cx="12" cy="17" r="1.4" fill="currentColor" /></svg>;
    case "learn": return <svg {...s} viewBox="0 0 24 24"><path d="M4 5h11a3 3 0 0 1 3 3v11a3 3 0 0 0-3-3H4z" /><path d="M20 5h-2a3 3 0 0 0-3 3v11" /></svg>;
    default: return <svg {...s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>;
  }
}

export default function OrbitMarkApp() {
  const core = useCatalog();
  const [tab, setTab] = useState("tonight");
  const [selected, setSelected] = useState<TleObject | null>(null);

  const goTab = (t: string) => { setSelected(null); setTab(t); };
  const open = (o: TleObject) => { setSelected(o); window.scrollTo(0, 0); };
  const back = () => setSelected(null);

  return (
    <div className="om-shell">
      <div className="om-statusbar"><span>ORBITMARK</span><span>● MODELLED</span></div>
      <main className="om-content">
        {selected ? (
          <ObjectDetail o={selected} core={core} onBack={back} />
        ) : tab === "tonight" ? (
          <TonightView core={core} onOpen={open} onTab={goTab} />
        ) : tab === "sky" ? (
          <ManualSky core={core} onOpen={open} />
        ) : tab === "catalog" ? (
          <CatalogScreen core={core} onOpen={open} />
        ) : tab === "passes" ? (
          <PassesScreen core={core} />
        ) : tab === "learn" ? (
          <LearnScreen />
        ) : (
          <SettingsScreen core={core} />
        )}
      </main>
      <nav className="om-tabs" aria-label="Primary">
        {TABS.map((t) => (
          <button key={t.id} className="om-tab" type="button" aria-current={!selected && tab === t.id ? "page" : undefined} onClick={() => goTab(t.id)}>
            <TabIcon id={t.id} />{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
