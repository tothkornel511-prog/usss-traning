import { useState, useEffect, useMemo, useRef } from 'react';
import badgeUrl from './assets/elite-badge.svg';
import face1 from './assets/ai-face-1.svg';
import face2 from './assets/ai-face-2.svg';
import face3 from './assets/ai-face-3.svg';

const STORE_KEY = 'usss:kepzes:v2';
const SETTINGS_KEY = 'usss:ui:v1';
const PROBAIDO_NAP = 14;

const THEME_STYLES = {
  gold: {
    '--ink': '#06080B',
    '--panel': '#0B0F15',
    '--panel2': '#10151D',
    '--raise': '#141A23',
    '--line': '#1D2531',
    '--hair': '#161C25',
    '--txt': '#E9ECF1',
    '--mut': '#8B95A7',
    '--faint': '#5A6373',
    '--gold': '#C9A227',
    '--gold-lt': '#E8CE7A',
    '--gold-dk': '#8A6F1B',
    '--ok': '#46BC8B',
    '--info': '#5AA9E6',
    '--bad': '#D6455D',
    '--warn': '#E0A13A',
  },
  steel: {
    '--ink': '#05070A',
    '--panel': '#0D1117',
    '--panel2': '#131A23',
    '--raise': '#171F2A',
    '--line': '#232B38',
    '--hair': '#17212C',
    '--txt': '#E5F0FF',
    '--mut': '#8392A6',
    '--faint': '#5D6B7D',
    '--gold': '#6BC7FF',
    '--gold-lt': '#A5E5FF',
    '--gold-dk': '#3C8DC7',
    '--ok': '#63E2B7',
    '--info': '#7AA3FF',
    '--bad': '#F16F97',
    '--warn': '#E0A13A',
  },
  forest: {
    '--ink': '#08120D',
    '--panel': '#0D1811',
    '--panel2': '#141F18',
    '--raise': '#17291C',
    '--line': '#1F2D22',
    '--hair': '#122015',
    '--txt': '#E8F0E9',
    '--mut': '#8B9A8F',
    '--faint': '#5E6A60',
    '--gold': '#8ABE58',
    '--gold-lt': '#BBDD84',
    '--gold-dk': '#6A8C32',
    '--ok': '#52C68A',
    '--info': '#6BB6BE',
    '--bad': '#D6455D',
    '--warn': '#C2A33A',
  },
};

const IMAGE_MODES = ['face1', 'face2', 'face3'];

const VEDETT_STATUS_COLORS = {
  szigorított: '#D6455D',
  védett: '#E0A13A',
  'magas figyelem': '#F16F97',
  'normál': '#46BC8B',
};

const UI_DEFAULTS = {
  theme: 'gold',
  imageMode: 'face1',
  layout: 'wide',
  accent: 'gold',
  isAdmin: false,
  adminCode: 'LSGOVADMIN',
  visitorCode: 'LSGOV',
};

const SZINTEK = [
  {
    id: 's0', sorszam: 0, roman: '0', rang: 'Próbaidős', szin: '#7A8496',
    megjegyzes:
      '2 hétig nem mehet egyedül sehova, nem végezhet LSNTA-tevékenységet, nem adminisztrálhat — függetlenül attól, hány modult végzett el.',
    modulok: [{ kod: '0', nev: 'Belépés, betanulás és bázisrend' }],
  },
  {
    id: 's1', sorszam: 1, roman: 'I', rang: 'Kadét', szin: '#5AA9E6',
    modulok: [
      { kod: 'A', nev: 'Alapvető ismeretek' },
      { kod: 'G1', nev: 'Erőnléti oktatás – alapfok' },
      { kod: 'K', nev: 'Kommunikációs tréning' },
      { kod: 'L', nev: 'Kód használat' },
      { kod: 'R', nev: 'Szolgálati rend és dokumentáció' },
    ],
  },
  {
    id: 's2', sorszam: 2, roman: 'II', rang: 'Sofőr', szin: '#4FC5C7',
    modulok: [
      { kod: 'B1', nev: 'Kormányzati járművek vezetése – alapismeretek' },
      { kod: 'E', nev: 'Egészségügyi oktatás' },
      { kod: 'F', nev: 'Lőfegyver használat alapjai' },
      { kod: 'G2', nev: 'Közelharci oktatás – alapfok' },
      { kod: 'N', nev: 'Jogi ismeretek és kényszerítő eszközök' },
      { kod: 'P', nev: 'Titoktartás és információvédelem' },
    ],
  },
  {
    id: 's3', sorszam: 3, roman: 'III', rang: 'Őrszem', szin: '#46BC8B',
    modulok: [
      { kod: 'B2', nev: 'Kormányzati járművek vezetése – emelt szint' },
      { kod: 'C', nev: 'Konvoj közlekedés' },
      { kod: 'F1', nev: 'Utcai lövész vizsga' },
      { kod: 'G1H', nev: 'Erőnléti oktatás – haladó fokozat' },
      { kod: 'G3', nev: 'Mentális felkészülés' },
      { kod: 'I', nev: 'Kiképzés az éj leple alatt' },
      { kod: 'M', nev: 'Együttműködés más szervezetekkel' },
    ],
  },
  {
    id: 's4', sorszam: 4, roman: 'IV', rang: 'Operátor', szin: '#E0913A',
    modulok: [
      { kod: 'D', nev: 'Taktikai kiképzés' },
      { kod: 'F2', nev: 'Épületharc lövész vizsga' },
      { kod: 'G2H', nev: 'Közelharci oktatás – haladó fokozat' },
      { kod: 'H', nev: 'Helikopter pilóta képzés' },
      { kod: 'J', nev: 'Ejtőernyős vizsga követelmények' },
      { kod: 'O', nev: 'Advance és rendezvénybiztosítás' },
      { kod: 'S1', nev: 'Vízi műveletek' },
      { kod: 'T1', nev: 'Tűzszerész ismeretek' },
    ],
  },
  {
    id: 's5', sorszam: 5, roman: 'V', rang: 'Elit — Parancsnok', szin: '#C9A227',
    modulok: [
      { kod: 'F3', nev: 'Légi egység lövész vizsga' },
      { kod: 'S2', nev: 'Búvárképzés' },
      { kod: 'T2', nev: 'Víz alatti robbanószerkezet' },
      { kod: 'H', nev: 'Helikopter pilóta képzés', ismetelt: 'IV' },
      { kod: 'I', nev: 'Kiképzés az éj leple alatt', ismetelt: 'III' },
      { kod: 'J', nev: 'Ejtőernyős vizsga követelmények', ismetelt: 'IV' },
    ],
  },
  {
    id: 'szak', sorszam: 9, roman: 'SZ', rang: 'Szakirány', szin: '#9C7BD1', szakirany: true,
    megjegyzes: 'Nem szintfüggő. Bárki elvégezheti, aki a feltételeknek megfelel.',
    modulok: [
      { kod: 'ADM', nev: 'Önkormányzati adminisztráció' },
      { kod: 'LSNTA', nev: 'Adóhatósági szolgálat' },
    ],
  },
];

const STATUS = {
  kesz: { label: 'Teljesítve', rovid: 'OK', szin: '#46BC8B' },
  folyamat: { label: 'Folyamatban', rovid: 'FLY', szin: '#5AA9E6' },
  sikertelen: { label: 'Sikertelen', rovid: 'SIK', szin: '#D6455D' },
};
const STATUS_ORDER = ['kesz', 'folyamat', 'sikertelen'];
const KOTELEZO_SZINTEK = SZINTEK.filter((s) => !s.szakirany);
const MODULOK = (() => {
  const ki = [];
  const latott = new Set();
  SZINTEK.forEach((sz) =>
    sz.modulok.forEach((mo) => {
      if (mo.ismetelt || latott.has(mo.kod)) return;
      latott.add(mo.kod);
      ki.push({ ...mo, szintId: sz.id, roman: sz.roman, szin: sz.szin });
    })
  );
  return ki;
})();
const MODUL_KOD = Object.fromEntries(MODULOK.map((m) => [m.kod, m]));

const VEDETT_HELYEK = [
  { id: 'v1', nev: 'Óriáskapu Bunker', zona: 'Külső 12', statusz: 'szigorított', ellenorzes: '2026-08-10', kritikus: 'Haladéktalan lezárás, belső ellenőrzés', kep: face1 },
  { id: 'v2', nev: 'Légi Radarállomás', zona: 'Északi perem', statusz: 'védett', ellenorzes: '2026-08-09', kritikus: 'Behatolás-ellenes készenlét aktív', kep: face2 },
  { id: 'v3', nev: 'Titkos Szakértői Szektor', zona: 'Belső 5', statusz: 'magas figyelem', ellenorzes: '2026-08-08', kritikus: 'Tűzoltás és biztonsági csapat készenlétben', kep: face3 },
];

const EMPTY = { people: [], records: [], ervenyesseg: {}, vedett: [] };

const KEZDETI = {
  ervenyesseg: { F: 12, F1: 12, G1: 12, E: 24 },
  people: [
    { id: 'p1', nev: 'Dr.Lakatos László', jelveny: 'USSS-109', belepes: '2026-08-01', megj: '' },
    { id: 'p2', nev: 'Dr.Hajas Ricsi', jelveny: 'USSS-96', belepes: '2026-08-01', megj: '' },
    { id: 'p3', nev: 'Dominic Hayes', jelveny: 'USSS-118', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p4', nev: 'Christoph Norbert Kleinemann', jelveny: 'USSS-98', belepes: '2026-08-01', megj: '' },
    { id: 'p5', nev: 'Henry Hudson', jelveny: 'USSS-50', belepes: '2026-08-01', megj: '' },
    { id: 'p6', nev: 'Valentino Rossi', jelveny: 'USSS-123', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p7', nev: 'Michel Smith', jelveny: 'USSS-106', belepes: '2026-08-01', megj: '' },
    { id: 'p8', nev: 'Matthew Willams', jelveny: 'USSS-107', belepes: '2026-08-01', megj: '' },
    { id: 'p9', nev: 'John Smith', jelveny: 'USSS-92', belepes: '2026-08-01', megj: '' },
    { id: 'p10', nev: 'Jensen Walker', jelveny: 'USSS-124', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p11', nev: 'Harvey Ross', jelveny: 'USSS-111', belepes: '2026-08-01', megj: '' },
    { id: 'p12', nev: 'Harrelson Grant', jelveny: 'USSS-120', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p13', nev: 'Günther Grün', jelveny: 'USSS-8', belepes: '2026-08-01', megj: '' },
    { id: 'p14', nev: 'Dr. Rick Deckard', jelveny: 'USSS-119', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p15', nev: 'Brian Sorrento', jelveny: 'USSS-112', belepes: '2026-08-01', megj: '' },
    { id: 'p16', nev: 'Alexander Freamen', jelveny: 'USSS-121', belepes: '2026-08-01', megj: 'Újonc' },
    { id: 'p17', nev: 'Titus Long', jelveny: 'USSS-91', belepes: '2026-08-01', megj: '' },
    { id: 'p18', nev: 'Oliver Smith', jelveny: 'USSS-80', belepes: '2026-08-01', megj: '' },
    { id: 'p19', nev: 'Tyron Wolf', jelveny: 'USSS-004', belepes: '2026-08-01', megj: '' },
  ],
  records: [],
  vedett: VEDETT_HELYEK,
};

const FULL_ROSTER_IDS = new Set(KEZDETI.people.map((p) => p.id));

const isFullRoster = (people) => Array.isArray(people) && people.length === KEZDETI.people.length && people.every((p) => FULL_ROSTER_IDS.has(p.id));

const uid = () => Math.random().toString(36).slice(2, 10);
const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('A kód kimásolva a vágólapra.');
  } catch (error) {
    alert('Nem sikerült kimásolni.');
  }
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmt = (iso) => (iso ? iso.replace(/-/g, '.') + '.' : '—');
const ket = (n) => String(n).padStart(2, '0');
function addMonths(iso, ho) {
  if (!iso || !ho) return null;
  const d = new Date(iso + 'T00:00:00');
  const nap = d.getDate();
  d.setMonth(d.getMonth() + Number(ho));
  if (d.getDate() < nap) d.setDate(0);
  return d.toISOString().slice(0, 10);
}
const kulonbseg = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
const napokMulva = (iso) => (iso ? kulonbseg(todayISO(), iso) : null);
const napokOta = (iso) => (iso ? kulonbseg(iso, todayISO()) : null);

function Chip({ szin, bg, children }) {
  return (
    <span className="chip" style={{ color: szin, borderColor: szin + '66', background: bg || szin + '14' }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, kind = '', sm, title }) {
  return (
    <button className={`btn ${kind} ${sm ? 'sm' : ''}`} onClick={onClick} title={title} type="button">
      {children}
    </button>
  );
}

function Card({ title, jobb, children }) {
  return (
    <section className="card">
      {title && (
        <div className="card-hd">
          <h2>{title}</h2>
          {jobb}
        </div>
      )}
      <div className="card-bd">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="lbl">{label}</span>
      {children}
      {hint && <span className="faint" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>{hint}</span>}
    </label>
  );
}

function Sheet({ open, title, alcim, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="veil" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth: wide ? 860 : 470 }}>
        <div className="goldline" />
        <div className="sheet-hd">
          <div>
            <h3>{title}</h3>
            {alcim && <div className="mono faint" style={{ fontSize: 10.5, letterSpacing: '.14em', marginTop: 6 }}>{alcim}</div>}
          </div>
          <Btn kind="quiet" sm onClick={onClose} title="Bezárás">✕</Btn>
        </div>
        <div className="sheet-bd">{children}</div>
      </div>
    </div>
  );
}

function Rail({ elert }) {
  return (
    <div className="rail">
      {KOTELEZO_SZINTEK.map((sz, i) => (
        <span key={sz.id}> 
          {i > 0 && <span className={`seg${elert >= sz.sorszam ? ' on' : ''}`} style={{ '--c': sz.szin }} />}
          <span className={`node${elert >= sz.sorszam ? ' on' : ''}`} style={{ '--c': sz.szin }} title={`${sz.roman} — ${sz.rang}`} />
        </span>
      ))}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(KEZDETI);
  const [ui, setUi] = useState(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SETTINGS_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      ...UI_DEFAULTS,
      ...parsed,
      adminCode: UI_DEFAULTS.adminCode,
      visitorCode: UI_DEFAULTS.visitorCode,
    };
  });
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('attekintes');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [vedettModal, setVedettModal] = useState(null);
  const [vedettFilter, setVedettFilter] = useState('');
  const [vedettStatus, setVedettStatus] = useState('');
  const first = useRef(true);

  const saveVedettSite = (site) => setData((d) => {
    const exists = d.vedett.find((x) => x.id === site.id);
    if (exists) {
      return { ...d, vedett: d.vedett.map((x) => (x.id === site.id ? site : x)) };
    }
    return { ...d, vedett: [...d.vedett, site] };
  });

  const deleteVedettSite = (id) => {
    if (!window.confirm('Biztosan törlöd a védett helyet?')) return;
    setData((d) => ({ ...d, vedett: d.vedett.filter((x) => x.id !== id) }));
  };

  const duplicateVedettSite = (site) => {
    if (!window.confirm('Duplikálod a védett helyet?')) return;
    setData((d) => ({
      ...d,
      vedett: [...d.vedett, { ...site, id: uid(), nev: `${site.nev} másolata` }],
    }));
  };

  const enterCode = (code) => {
    if (code.trim().toUpperCase() === ui.adminCode) {
      setUi((prev) => ({ ...prev, isAdmin: true }));
      alert('Admin mód engedélyezve.');
      return;
    }
    if (code.trim().toUpperCase() === ui.visitorCode) {
      setUi((prev) => ({ ...prev, isAdmin: false }));
      alert('Látogató mód engedélyezve.');
      return;
    }
    alert('Helytelen kód.');
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        const parsed = { ...EMPTY, ...JSON.parse(raw) };
        if (!isFullRoster(parsed.people)) {
          localStorage.setItem(STORE_KEY, JSON.stringify(KEZDETI));
          setData(KEZDETI);
        } else {
          setData(parsed);
        }
      } catch (error) {
        console.warn('Nem sikerült betölteni az adatokat:', error);
        setData(KEZDETI);
      }
    }
    const rawUi = localStorage.getItem(SETTINGS_KEY);
    if (rawUi) {
      try {
        const parsed = JSON.parse(rawUi);
        const safeUi = {
          theme: parsed.theme,
          imageMode: parsed.imageMode,
          layout: parsed.layout,
          accent: parsed.accent,
          isAdmin: parsed.isAdmin ?? false,
        };
        setUi((prev) => ({ ...prev, ...safeUi }));
      } catch (error) {
        console.warn('Nem sikerült betölteni az UI-beállításokat:', error);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (first.current) { first.current = false; return; }
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    setSaved(new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [data, loaded]);

  useEffect(() => {
    Object.entries(THEME_STYLES[ui.theme] || THEME_STYLES.gold).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(ui));
  }, [ui]);

  const recordGroups = useMemo(() => {
    const groups = {};
    data.records.forEach((r) => {
      const key = r.emberId + '|' + r.kod;
      groups[key] = groups[key] || [];
      groups[key].push(r);
    });
    Object.values(groups).forEach((records) => {
      records.sort((a, b) => {
        const da = a.datum || '0000-00-00';
        const db = b.datum || '0000-00-00';
        if (da !== db) return db.localeCompare(da);
        return b.id.localeCompare(a.id);
      });
    });
    return groups;
  }, [data.records]);

  const recMap = useMemo(() => {
    const m = {};
    Object.entries(recordGroups).forEach(([key, records]) => {
      const r = records[0];
      const ho = Number(data.ervenyesseg?.[r.kod] || 0);
      const lejar = r.statusz === 'kesz' && ho > 0 && r.datum ? addMonths(r.datum, ho) : null;
      const hatra = lejar ? napokMulva(lejar) : null;
      m[key] = { ...r, lejar, hatra, lejart: hatra !== null && hatra < 0 };
    });
    return m;
  }, [recordGroups, data.ervenyesseg]);

  const ervenyes = (emberId, kod) => {
    const r = recMap[emberId + '|' + kod];
    return !!r && r.statusz === 'kesz' && !r.lejart;
  };

  const getRecords = (emberId, kod) => recordGroups[emberId + '|' + kod] || [];

  const allapot = useMemo(() => {
    const m = {};
    data.people.forEach((p) => {
      const szintek = {};
      SZINTEK.forEach((sz) => {
        const db = sz.modulok.filter((mo) => ervenyes(p.id, mo.kod)).length;
        szintek[sz.id] = { db, osszes: sz.modulok.length, teljes: db === sz.modulok.length };
      });
      let elert = -1;
      for (const sz of KOTELEZO_SZINTEK) {
        if (szintek[sz.id].teljes) elert = sz.sorszam;
        else break;
      }
      const kovetkezo = KOTELEZO_SZINTEK.find((sz) => !szintek[sz.id].teljes);
      const probaNap = p.belepes ? PROBAIDO_NAP - (napokOta(p.belepes) ?? 0) : null;
      m[p.id] = {
        szintek, elert, kovetkezo,
        rang: elert >= 0 ? KOTELEZO_SZINTEK[elert].rang : 'Nem minősített',
        szin: elert >= 0 ? KOTELEZO_SZINTEK[elert].szin : '#7A8496',
        osszKesz: MODULOK.filter((mo) => ervenyes(p.id, mo.kod)).length,
        probaAktiv: probaNap !== null && probaNap > 0,
        probaNap,
      };
    });
    return m;
  }, [data.people, recMap]);

  const lejarok = useMemo(() => {
    const nevek = Object.fromEntries(data.people.map((p) => [p.id, p]));
    return Object.values(recMap)
      .filter((r) => r.hatra !== null && r.hatra <= 60 && nevek[r.emberId])
      .map((r) => ({ ...r, ember: nevek[r.emberId], modul: MODUL_KOD[r.kod] }))
      .sort((a, b) => a.hatra - b.hatra);
  }, [recMap, data.people]);

  const setRecord = (emberId, kod, statusz) =>
    setData((d) => {
      const i = d.records.findIndex((r) => r.emberId === emberId && r.kod === kod);
      if (statusz === null) return { ...d, records: d.records.filter((_, x) => x !== i) };
      if (i === -1)
        return { ...d, records: [...d.records, { id: uid(), emberId, kod, statusz, datum: statusz === 'kesz' ? todayISO() : '', oktato: '', megj: '' }] };
      return {
        ...d,
        records: d.records.map((r, x) => (x === i ? { ...r, statusz, datum: statusz === 'kesz' ? r.datum || todayISO() : r.datum } : r)),
      };
    });

  const updateRecord = (rec) => setData((d) => ({ ...d, records: d.records.map((r) => (r.id === rec.id ? rec : r)) }));
  const setErveny = (kod, ho) => setData((d) => ({ ...d, ervenyesseg: { ...(d.ervenyesseg || {}), [kod]: Math.max(0, Number(ho) || 0) } }));
  const upsertEmber = (p) =>
    setData((d) => {
      const i = d.people.findIndex((x) => x.id === p.id);
      return { ...d, people: i === -1 ? [...d.people, p] : d.people.map((x) => (x.id === p.id ? p : x)) };
    });
  const torolEmber = (id) => {
    if (!window.confirm('Biztosan törlöd a személyt és az összes kapcsolódó adatát?')) return;
    setData((d) => ({ ...d, people: d.people.filter((p) => p.id !== id), records: d.records.filter((r) => r.emberId !== id) }));
  };
  const torolAllat = () => {
    if (!window.confirm('Biztosan törlöd az összes adatot? Ez visszavonhatatlan.')) return;
    setData(EMPTY);
  };

  const tabs = [
    ['attekintes', 'Áttekintés'],
    ['allomany', 'Állomány'],
    ['tabla', 'Státusztábla'],
    ['modulok', 'Modulok'],
    ['jelentes', 'Jelentések'],
    ['vedett', 'Védett helyek'],
    ...(ui.isAdmin ? [['admin', 'Admin']] : []),
    ['settings', 'Beállítások'],
    ['sugo', 'Súgó'],
  ];
  const aktiv = modal?.type === 'kartya' ? data.people.find((p) => p.id === modal.id) : null;
  const nyit = (id) => setModal({ type: 'kartya', id });

  const csv = useMemo(() => {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const fej = ['Név', 'Jelvényszám', 'Belépés', 'Szint', 'Rang', 'Teljesített', ...MODULOK.map((m) => m.kod)];
    const sorok = data.people.map((p) => {
      const a = allapot[p.id];
      return [
        p.nev,
        p.jelveny,
        p.belepes,
        a.elert >= 0 ? KOTELEZO_SZINTEK[a.elert].roman : '—',
        a.rang,
        `${a.osszKesz}/${MODULOK.length}`,
        ...MODULOK.map((m) => {
          const r = recMap[p.id + '|' + m.kod];
          return !r ? '' : r.lejart ? 'LEJÁRT' : STATUS[r.statusz].rovid;
        }),
      ].map(escape).join(';');
    });
    return [fej.map(escape).join(';'), ...sorok].join('\n');
  }, [data.people, allapot, recMap]);

  const copyCsv = async () => {
    try {
      await navigator.clipboard.writeText(csv);
      alert('CSV kimásolva a vágólapra.');
    } catch (error) {
      alert('Nem sikerült kimásolni.');
    }
  };

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usss-jelentes.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="usss">
      <div className="goldline" />
      <header>
        <div className="wrap masthead">
          <div className="hero">
            <div className="crest">
              <img src={badgeUrl} alt="USSS Embléma" />
            </div>
            <div>
              <h1 className="brand">USSS Elite Training HQ</h1>
              <div className="sub">Oktatási jegyzőkönyv, védett helyek felügyelete és prémium státuszkezelés</div>
            </div>
            <div className="hero-actions">
              <button type="button" className="btn gold" onClick={() => window.location.reload()}>Frissítés</button>
              <a href="https://tothkornel511-prog.github.io/usss-traning/" target="_blank" rel="noreferrer" className="linkbtn" title="Megnyitja az éles weboldalt">https://tothkornel511-prog.github.io/usss-traning/</a>
            </div>
          </div>
          <div className="divider"><span className="diamond" /></div>
        </div>
        <div className="wrap">
          <nav className="tabs">
            {tabs.map(([k, l]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </nav>
          <div className="statusbar">
            <span>OKT-1</span>
            <span>6 szint · 32 modul</span>
            <span className={saved === 'HIBA' ? 'live err' : 'live'}>
              {saved ? `Rögzítve ${saved}` : loaded ? 'Készenlét' : 'Betöltés…'}
            </span>
          </div>
        </div>
      </header>

      <main className="wrap">
        {tab === 'attekintes' && <Attekintes data={data} allapot={allapot} recMap={recMap} lejarok={lejarok} onGo={setTab} onOpen={nyit} />}
        {tab === 'allomany' && (
          <Allomany data={data} allapot={allapot} q={q} setQ={setQ} onOpen={nyit}
            onNew={() => setModal({ type: 'ember', item: null })} onEdit={(p) => setModal({ type: 'ember', item: p })}
            onDelete={torolEmber} onBulk={() => setModal({ type: 'tomeges' })} />
        )}
        {tab === 'tabla' && <Tabla data={data} allapot={allapot} recMap={recMap} onCell={setRecord} onOpen={nyit} />}
        {tab === 'modulok' && <ModulLista data={data} recMap={recMap} onErveny={setErveny} isAdmin={ui.isAdmin} />}
        {tab === 'jelentes' && <Jelentes data={data} allapot={allapot} recMap={recMap} lejarok={lejarok} csv={csv} onCopy={copyCsv} onDownload={downloadCsv} onReset={torolAllat} onDemo={() => setData(KEZDETI)} />}
        {tab === 'vedett' && <Vedett sites={data.vedett} imageMode={ui.imageMode} isAdmin={ui.isAdmin}
          filter={vedettFilter} onFilterChange={setVedettFilter}
          statusFilter={vedettStatus} onStatusFilterChange={setVedettStatus}
          onEdit={(site) => setVedettModal(site)} onDelete={deleteVedettSite} onAdd={() => setVedettModal({ id: uid(), nev: '', zona: '', statusz: '', ellenorzes: todayISO(), kritikus: '', kep: '' })}
          onDuplicate={duplicateVedettSite} />}
        {tab === 'admin' && ui.isAdmin && <AdminPanel data={data} onExport={(json) => copyText(json)} onImport={(json) => { try { setData(JSON.parse(json)); alert('Importálás sikeres.'); } catch (err) { alert('Érvénytelen JSON.'); } }} onReset={() => setData(EMPTY)} />}
        {tab === 'settings' && <Settings ui={ui} onChange={setUi} onEnterCode={enterCode} onRegenerateCodes={() => { setUi((prev) => ({ ...prev, adminCode: UI_DEFAULTS.adminCode, visitorCode: UI_DEFAULTS.visitorCode })); alert('A kódok mostantól újra az alapértelmezett értékek: LSGOVADMIN és LSGOV.'); }} />}
        {tab === 'sugo' && <Sugo />}
      </main>

      <footer>
        {ket(data.people.length)} fő · {ket(data.records.filter((r) => r.statusz === 'kesz').length)} teljesített modul · Belső használatra
      </footer>

      <Karton open={!!aktiv} ember={aktiv} allapot={aktiv ? allapot[aktiv.id] : null} recMap={recMap}
        getRecords={getRecords} records={data.records} onClose={() => setModal(null)} onCell={setRecord} onRecord={updateRecord} />
      <EmberForm open={modal?.type === 'ember'} item={modal?.item} onClose={() => setModal(null)}
        onSave={(p) => { upsertEmber(p); setModal(null); }} />
      <Tomeges open={modal?.type === 'tomeges'} onClose={() => setModal(null)}
        onSave={(l) => { setData((d) => ({ ...d, people: [...d.people, ...l] })); setModal(null); }} />
      <VedettForm open={!!vedettModal} item={vedettModal} onClose={() => setVedettModal(null)}
        onSave={(site) => { saveVedettSite(site); setVedettModal(null); }} />
    </div>
  );
}

function Attekintes({ data, allapot, recMap, lejarok, onGo, onOpen }) {
  if (data.people.length === 0)
    return (
      <div className="empty">
        <h2>Az állomány üres</h2>
        <p className="note" style={{ maxWidth: 520, margin: '0 auto' }}>
          Vedd fel a neveket, majd a státusztáblán egy kattintással jelöld a teljesített modulokat. A rang, a szintlépés, a lejáratok és a próbaidő magától frissül.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 24 }}>
          <Btn kind="gold" onClick={() => onGo('allomany')}>Állomány felvétele</Btn>
        </div>
      </div>
    );

  const proba = data.people.filter((p) => allapot[p.id]?.probaAktiv);
  const lejart = lejarok.filter((r) => r.hatra < 0).length;
  const szintenkent = KOTELEZO_SZINTEK.map((sz) => ({ ...sz, db: data.people.filter((p) => allapot[p.id]?.elert === sz.sorszam).length }));
  const nemMin = data.people.filter((p) => allapot[p.id]?.elert < 0).length;
  const max = Math.max(1, ...szintenkent.map((s) => s.db), nemMin);
  const modulStat = MODULOK.map((mo) => ({
    ...mo, db: data.people.filter((p) => recMap[p.id + '|' + mo.kod]?.statusz === 'kesz' && !recMap[p.id + '|' + mo.kod]?.lejart).length,
  })).sort((a, b) => a.db - b.db).slice(0, 6);

  return (
    <div className="stack">
      <div className="stats">
        {[
          ['Állomány', data.people.length, 'var(--txt)'],
          ['Próbaidős', proba.length, proba.length ? 'var(--warn)' : 'var(--txt)'],
          ['Lejárt modul', lejart, lejart ? 'var(--bad)' : 'var(--txt)'],
          ['Elit', data.people.filter((p) => allapot[p.id]?.elert >= 5).length, 'var(--gold-lt)'],
        ].map(([k, v, c]) => (
          <div className="stat" key={k}>
            <div className="k">{k}</div>
            <div className="v" style={{ color: c }}>{ket(v)}</div>
          </div>
        ))}
      </div>

      {lejarok.length > 0 && (
        <Card title="Lejáró és lejárt érvényesség · 60 nap">
          <p className="note">A lejárt modul nem számít teljesítettnek — amíg nincs frissítve, az érintett visszaesik a korábbi szintre.</p>
          <ul className="list" style={{ marginTop: 12 }}>
            {lejarok.slice(0, 10).map((r) => (
              <li key={r.id} className="spread" style={{ alignItems: 'center' }}>
                <button onClick={() => onOpen(r.emberId)} style={{ textAlign: 'left' }}>
                  <span className="linkname" style={{ fontSize: 14 }}>{r.ember.nev}</span>
                  <span className="mono" style={{ color: 'var(--gold-lt)', marginLeft: 10, fontSize: 11 }}>{r.kod}</span>
                  <span className="faint" style={{ marginLeft: 6, fontSize: 12 }}>{r.modul?.nev}</span>
                </button>
                <Chip szin={r.hatra < 0 ? 'var(--bad)' : 'var(--warn)'}>
                  {r.hatra < 0 ? `LEJÁRT ${Math.abs(r.hatra)} NAPJA` : `${r.hatra} NAP`}
                </Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {proba.length > 0 && (
        <Card title="Próbaidő alatt · korlátozott szolgálat">
          <p className="hairnote">{SZINTEK[0].megjegyzes}</p>
          <ul className="list" style={{ marginTop: 12 }}>
            {proba.map((p) => (
              <li key={p.id} className="spread" style={{ alignItems: 'center' }}>
                <button className="linkname" style={{ fontSize: 14 }} onClick={() => onOpen(p.id)}>{p.nev}</button>
                <Chip szin="var(--warn)">MÉG {allapot[p.id].probaNap} NAP</Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid2">
        <Card title="Létszám szintenként">
          <ul className="list">
            {nemMin > 0 && (
              <li>
                <div className="spread"><span className="muted">Nem minősített</span><span className="mono faint">{ket(nemMin)}</span></div>
                <div className="bar" style={{ marginTop: 8, '--c': '#3A4351' }}><i style={{ width: `${(nemMin / max) * 100}%` }} /></div>
              </li>
            )}
            {szintenkent.map((sz) => (
              <li key={sz.id}>
                <div className="spread">
                  <span><span className="mono faint" style={{ marginRight: 10 }}>{sz.roman}</span>{sz.rang}</span>
                  <span className="mono faint">{ket(sz.db)}</span>
                </div>
                <div className="bar" style={{ marginTop: 8, '--c': sz.szin }}><i style={{ width: `${(sz.db / max) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Legkevesebbet teljesített modulok">
          <ul className="list">
            {modulStat.map((mo) => (
              <li key={mo.kod} className="spread" style={{ alignItems: 'center' }}>
                <span>
                  <span className="mono" style={{ color: mo.szin, marginRight: 12, fontSize: 11 }}>{mo.kod}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{mo.nev}</span>
                </span>
                <Chip szin="var(--faint)" bg="transparent">{mo.db}/{data.people.length}</Chip>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Allomany({ data, allapot, q, setQ, onOpen, onNew, onEdit, onDelete, onBulk }) {
  const lista = data.people
    .filter((p) => (p.nev + ' ' + (p.jelveny || '')).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (allapot[b.id]?.elert ?? -1) - (allapot[a.id]?.elert ?? -1) || a.nev.localeCompare(b.nev, 'hu'));

  return (
    <div className="stack">
      <div className="row">
        <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Keresés — név vagy jelvényszám" value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn onClick={onBulk}>Névsor beillesztése</Btn>
        <Btn kind="gold" onClick={onNew}>+ Új személy</Btn>
      </div>

      {lista.length === 0 ? (
        <div className="empty"><p className="note">Nincs találat. Vedd fel az első személyt, vagy illessz be egy névsort.</p></div>
      ) : (
        <ul className="rows">
          {lista.map((p) => {
            const a = allapot[p.id];
            return (
              <li key={p.id}>
                <div className="spread">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row" style={{ gap: 12 }}>
                      <button className="linkname" onClick={() => onOpen(p.id)}>{p.nev}</button>
                      <Chip szin={a.szin}>
                        {a.elert >= 0 ? `${KOTELEZO_SZINTEK[a.elert].roman} · ` : ''}{a.rang}
                      </Chip>
                      {a.probaAktiv && <Chip szin="var(--warn)">PRÓBAIDŐ {a.probaNap}N</Chip>}
                      <span className="mono faint" style={{ fontSize: 11 }}>{p.jelveny || '—'}</span>
                    </div>
                    <div style={{ maxWidth: 300, marginTop: 10 }}><Rail elert={a.elert} /></div>
                    <div className="faint" style={{ fontSize: 12, marginTop: 8 }}>
                      {a.kovetkezo ? (
                        <>
                          Következő: <span style={{ color: a.kovetkezo.szin }}>{a.kovetkezo.roman} — {a.kovetkezo.rang}</span>
                          <span className="mono"> ({a.szintek[a.kovetkezo.id].db}/{a.szintek[a.kovetkezo.id].osszes})</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--gold-lt)' }}>Teljes kiképzés elvégezve</span>
                      )}
                      <span className="mono" style={{ marginLeft: 14 }}>{a.osszKesz}/{MODULOK.length} modul</span>
                    </div>
                  </div>
                  <div className="row">
                    <Btn kind="gold" sm onClick={() => onOpen(p.id)}>Karton</Btn>
                    <Btn sm onClick={() => onEdit(p)}>Adatok</Btn>
                    <Btn kind="bad" sm onClick={() => onDelete(p.id)}>Törlés</Btn>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Karton({ open, ember, allapot, recMap, getRecords, records, onClose, onCell, onRecord }) {
  if (!open || !ember || !allapot) return null;

  return (
    <Sheet open={open} title={ember.nev} wide onClose={onClose}
      alcim={`${ember.jelveny || 'JELVÉNY N/A'} · Belépés ${fmt(ember.belepes)} · ${allapot.rang}`}>
      <div style={{ maxWidth: 420, marginBottom: 20 }}><Rail elert={allapot.elert} /></div>

      {allapot.probaAktiv && (
        <div style={{ border: '1px solid rgba(224,161,58,.4)', background: 'rgba(224,161,58,.07)', padding: 14, marginBottom: 18 }}>
          <div className="lbl" style={{ color: 'var(--warn)' }}>Próbaidő aktív — még {allapot.probaNap} nap</div>
          <p className="note" style={{ marginTop: 6, fontSize: 12.5 }}>{SZINTEK[0].megjegyzes}</p>
        </div>
      )}

      {SZINTEK.map((sz) => {
        const a = allapot.szintek[sz.id];
        return (
          <div className="lvlbox" key={sz.id} style={{ '--c': sz.szin }}>
            <div className="lvlhd">
              <span className="t">{sz.roman} · {sz.rang}</span>
              <span className="mono" style={{ fontSize: 11, color: a.teljes ? 'var(--ok)' : 'var(--faint)' }}>
                {a.db}/{a.osszes}{a.teljes ? ' · teljes' : ''}
              </span>
            </div>
            {sz.modulok.map((mo) => {
              const records = getRecords(ember.id, mo.kod);
              const latest = records[0];
              return (
                <div className="modrow" key={sz.id + mo.kod}>
                  <span className="kod">{mo.kod}</span>
                  <span className="nev">
                    {mo.nev}
                    {mo.ismetelt && <span className="mono faint" style={{ marginLeft: 8, fontSize: 10 }}>↺ {mo.ismetelt}. szint</span>}
                  </span>
                  <div className="seg">
                    {STATUS_ORDER.map((k) => (
                      <button key={k} className={latest?.statusz === k ? 'on' : ''}
                        style={latest?.statusz === k ? { background: STATUS[k].szin } : undefined}
                        onClick={() => onCell(ember.id, mo.kod, latest?.statusz === k ? null : k)}>
                        {STATUS[k].label}
                      </button>
                    ))}
                  </div>
                  {latest?.statusz === 'kesz' && (
                    <>
                      <input type="date" className="mini" value={latest.datum || ''} onChange={(e) => onRecord({ ...latest, datum: e.target.value })} />
                      <input className="mini" style={{ width: 108 }} placeholder="Oktató" value={latest.oktato || ''} onChange={(e) => onRecord({ ...latest, oktato: e.target.value })} />
                      <input className="mini" style={{ width: 108 }} placeholder="Megjegyzés" value={latest.megj || ''} onChange={(e) => onRecord({ ...latest, megj: e.target.value })} />
                    </>
                  )}
                  {latest?.lejar && (
                    <Chip szin={latest.lejart ? 'var(--bad)' : latest.hatra <= 30 ? 'var(--warn)' : 'var(--faint)'}>
                      {latest.lejart ? `LEJÁRT ${fmt(latest.lejar)}` : `${fmt(latest.lejar)} · ${latest.hatra}N`}
                    </Chip>
                  )}
                  {records.length > 1 && (
                    <div className="note" style={{ marginTop: 10, fontSize: 11, color: 'var(--mut)' }}>
                      {records.length} feljegyzés (utolsó: {fmt(latest?.datum)})
                    </div>
                  )}
                </div>
              );
            })}
            {sz.megjegyzes && <p className="hairnote" style={{ margin: '10px 14px 12px' }}>{sz.megjegyzes}</p>}
          </div>
        );
      })}

      <Card title="Teljes képzési előzmény" jobb={<span className="mono faint">Legfrissebb modulonként</span>}>
        <div className="list">
          {data.records.filter((r) => r.emberId === ember.id).sort((a, b) => (b.datum || '').localeCompare(a.datum || '')).map((rec) => (
            <div key={rec.id} className="modrow" style={{ gap: 12, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 12, marginTop: 12 }}>
              <span className="kod">{rec.kod}</span>
              <span className="nev" style={{ flex: 1, color: 'var(--mut)' }}>{rec.oktato || 'Oktató: N/A'}</span>
              <span className="mono faint">{fmt(rec.datum)} {STATUS[rec.statusz]?.rovid || rec.statusz}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
        <Btn kind="gold" onClick={onClose}>Kész</Btn>
      </div>
    </Sheet>
  );
}

function Tabla({ data, allapot, recMap, onCell, onOpen }) {
  const emberek = [...data.people].sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
  const kov = (s) => {
    if (!s) return 'kesz';
    const i = STATUS_ORDER.indexOf(s);
    return i === STATUS_ORDER.length - 1 ? null : STATUS_ORDER[i + 1];
  };
  const oszlopok = SZINTEK.map((sz) => ({ sz, mod: sz.modulok.filter((m) => !m.ismetelt) }));

  if (emberek.length === 0)
    return <div className="empty"><p className="note">A státusztáblához legalább egy fő szükséges az állományban.</p></div>;

  return (
    <div className="stack">
      <div className="row" style={{ gap: 20, fontSize: 11.5 }}>
        {STATUS_ORDER.map((k) => (
          <span className="row" key={k} style={{ gap: 7 }}>
            <span className="mark" style={{ background: STATUS[k].szin }} />
            <span className="faint">{STATUS[k].label}</span>
          </span>
        ))}
        <span className="row" style={{ gap: 7 }}><span className="expired">!</span><span className="faint">Lejárt</span></span>
        <span className="faint mono" style={{ marginLeft: 'auto', fontSize: 10, letterSpacing: '.14em' }}>CELLÁRA KATTINTVA VÁLT</span>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th className="stick" />
              {oszlopok.map(({ sz, mod }) => (
                <th key={sz.id} className="lvl" colSpan={mod.length} style={{ '--c': sz.szin }}>{sz.roman} · {sz.rang}</th>
              ))}
            </tr>
            <tr>
              <th className="stick lbl">Személy</th>
              {oszlopok.map(({ sz, mod }) => mod.map((mo) => <th key={sz.id + mo.kod} className="code" title={mo.nev}>{mo.kod}</th>))}
            </tr>
          </thead>
          <tbody>
            {emberek.map((p) => {
              const a = allapot[p.id];
              return (
                <tr key={p.id}>
                  <td className="stick person">
                    <button className="linkname" style={{ fontSize: 14 }} onClick={() => onOpen(p.id)}>{p.nev}</button>
                    <div className="mono faint" style={{ fontSize: 10, marginTop: 3 }}>
                      {p.jelveny || '—'} · {a.elert >= 0 ? KOTELEZO_SZINTEK[a.elert].roman : '—'}
                    </div>
                  </td>
                  {oszlopok.map(({ sz, mod }) => mod.map((mo) => {
                    const r = recMap[p.id + '|' + mo.kod];
                    return (
                      <td className="cell" key={sz.id + mo.kod}>
                        <button className="cellbtn" onClick={() => onCell(p.id, mo.kod, kov(r?.statusz))}
                          title={`${mo.kod} — ${mo.nev}${r ? ' · ' + STATUS[r.statusz].label : ''}${r?.lejar ? (r.lejart ? ' · LEJÁRT ' + fmt(r.lejar) : ' · lejár ' + fmt(r.lejar)) : ''}`}>
                          {!r ? <span className="mark empty" />
                            : r.lejart ? <span className="expired">!</span>
                              : <>
                                <span className="mark" style={{ background: STATUS[r.statusz].szin }} />
                                {r.hatra !== null && r.hatra <= 30 && <span className="cnt">{r.hatra}</span>}
                              </>}
                        </button>
                      </td>
                    );
                  }))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ModulLista({ data, recMap, onErveny }) {
  return (
    <div className="stack">
      <Card>
        <p className="hairnote">
          A moduloknál a HÓ azt jelenti, hogy a teljesítés után hány hónapig érvényes az adott képzés. 0 = nem jár le.
          Ezt az értéket egyszer kell beállítani, a rendszer pedig figyeli a lejáratokat, a piros és sárga jelzéseket.
        </p>
      </Card>

      {SZINTEK.map((sz) => (
        <Card key={sz.id} title={`${sz.roman} · ${sz.rang}`} jobb={<span className="mono faint" style={{ fontSize: 10.5 }}>{sz.modulok.length} MODUL</span>}>
          {sz.megjegyzes && <p className="hairnote" style={{ marginBottom: 12 }}>{sz.megjegyzes}</p>}
          <ul className="list">
            {sz.modulok.map((mo) => {
              const ok = data.people.filter((p) => recMap[p.id + '|' + mo.kod]?.statusz === 'kesz' && !recMap[p.id + '|' + mo.kod]?.lejart).length;
              const lejart = data.people.filter((p) => recMap[p.id + '|' + mo.kod]?.lejart).length;
              const ho = data.ervenyesseg?.[mo.kod] || 0;
              return (
                <li key={sz.id + mo.kod} className="spread" style={{ alignItems: 'center' }}>
                  <span style={{ flex: 1, minWidth: 200 }}>
                    <span className="mono" style={{ color: sz.szin, marginRight: 14, fontSize: 11, display: 'inline-block', width: 44 }}>{mo.kod}</span>
                    <span className="muted" style={{ fontSize: 13 }}>{mo.nev}</span>
                    {mo.ismetelt && <span className="mono faint" style={{ marginLeft: 8, fontSize: 10 }}>↺ {mo.ismetelt}. szint</span>}
                  </span>
                  <span className="row" style={{ gap: 10 }}>
                    {lejart > 0 && <Chip szin="var(--bad)">{lejart} LEJÁRT</Chip>}
                    {data.people.length > 0 && <Chip szin="var(--faint)" bg="transparent">{ok}/{data.people.length}</Chip>}
                    <span className="row" style={{ gap: 6 }}>
                      <input type="number" min="0" className="mini" value={ho} onChange={(e) => onErveny(mo.kod, e.target.value)}
                        style={{ width: 56, textAlign: 'center', color: ho > 0 ? 'var(--gold-lt)' : 'var(--faint)', borderColor: ho > 0 ? 'var(--gold-dk)' : 'var(--line)' }} />
                      <span className="mono faint" style={{ fontSize: 10 }}>HÓ</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}



function Jelentes({ data, allapot, recMap, lejarok, csv, onCopy, onDownload, onReset, onDemo }) {
  const totalPeople = data.people.length;
  const totalModules = MODULOK.length;
  const completedSlots = data.records.filter((r) => r.statusz === 'kesz' && !r.lejart).length;
  const totalSlots = totalPeople * totalModules;
  const completionRate = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;
  const probationCount = data.people.filter((p) => allapot[p.id]?.probaAktiv).length;
  const expiringSoon = lejarok.filter((r) => r.hatra !== null && r.hatra > 0 && r.hatra <= 30);
  const expired = lejarok.filter((r) => r.lejart);
  const topPerformers = [...data.people]
    .map((p) => ({ person: p, score: allapot[p.id]?.osszKesz ?? 0, level: allapot[p.id]?.elert ?? -1 }))
    .sort((a, b) => b.score - a.score || a.person.nev.localeCompare(b.person.nev, 'hu'))
    .slice(0, 3);

  const reportNarrative = `USSS Oktatási jelentés
Dátum: ${new Date().toLocaleDateString('hu-HU')}

Összesen ${totalPeople} fő szerepel az állományban.
A jelenlegi képzési fedezet ${completionRate}%: ${completedSlots}/${totalSlots} teljesített modul.
${probationCount > 0 ? `${probationCount} fő még próbaidőn van.` : 'Nincs aktív próbaidős személy.'}
${expiringSoon.length > 0 ? `${expiringSoon.length} modul lejár 30 napon belül.` : 'Nincs 30 napon belüli lejárat.'}
${expired.length > 0 ? `${expired.length} modul már lejárt és azonnali frissítést igényel.` : 'Nincs lejárt modul.'}

Top teljesítők:
${topPerformers.map((item, index) => `${index + 1}. ${item.person.nev} — ${item.score} modul`).join('\n')}

Javasolt intézkedések:
- Ellenőrizd a 30 napon belül lejáró modulokat.
- Frissítsd a lejárt státusszal rendelkező képzéseket mielőbb.
- Kiemelten figyeld a próbaidőn lévő személyeket a következő éles feladatokra.`;

  const copyReportText = async () => {
    try {
      await navigator.clipboard.writeText(reportNarrative);
      alert('A jelentésszöveg kimásolva.');
    } catch (error) {
      alert('Nem sikerült kimásolni a jelentést.');
    }
  };

  const printReport = () => window.print();

  return (
    <div className="stack">
      <div className="report-grid">
        <div className="report-card">
          <div className="lbl">Állomány</div>
          <div className="value">{totalPeople}</div>
          <div className="note">Aktív képzési státusz nyilvántartás</div>
        </div>
        <div className="report-card">
          <div className="lbl">Teljesített modulok</div>
          <div className="value">{completedSlots}</div>
          <div className="note">Érvényes megírt modulok száma</div>
        </div>
        <div className="report-card">
          <div className="lbl">Jelentés fókusz</div>
          <div className="value">{completionRate}%</div>
          <div className="note">Csapat prioritása a teljes képzés felé</div>
        </div>
        <div className="report-card">
          <div className="lbl">Lejáró képzések</div>
          <div className="value">{expiringSoon.length}</div>
          <div className="note">30 napon belül lejáró modulok</div>
        </div>
      </div>

      <Card title="Oktatási jelentés és export">
        <p className="note">Mostantól ez a fül valódi, gyorsan használható riportot ad. A CSV mellett szöveges és nyomtatási formátumban is elérhető.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Btn kind="gold" onClick={onCopy}>CSV másolása</Btn>
          <Btn onClick={onDownload}>CSV letöltése</Btn>
          <Btn kind="gold" onClick={copyReportText}>Összefoglaló kimásolása</Btn>
          <Btn kind="quiet" onClick={printReport}>Nyomtatás</Btn>
          <Btn kind="quiet" onClick={onDemo}>Példaállomány</Btn>
          <Btn kind="bad" onClick={onReset}>Teljes törlés</Btn>
        </div>
      </Card>

      <div className="grid2">
        <Card title="Jelentés pillanatkép">
          <ul className="list">
            <li>
              <div className="lbl">Teljes modulállomány</div>
              <p className="note">{totalSlots} elméleti modulhely van kiosztva a csapat számára.</p>
            </li>
            <li>
              <div className="lbl">Kész státusz</div>
              <p className="note">{completionRate}% az összes modul közül.</p>
            </li>
            <li>
              <div className="lbl">Próbaidős személyek</div>
              <p className="note">{probationCount} fő van még monitorozás alatt.</p>
            </li>
            <li>
              <div className="lbl">Lejárt modulok</div>
              <p className="note">{expired.length} aktív figyelmeztetés.</p>
            </li>
          </ul>
        </Card>
        <Card title="Figyelmeztetések">
          {expiringSoon.length > 0 ? (
            <ul className="list">
              {expiringSoon.slice(0, 6).map((r) => (
                <li key={r.id} className="spread">
                  <span>{r.ember.nev} · {r.kod}</span>
                  <Chip szin="var(--warn)">{r.hatra} nap</Chip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="note">Nincs 30 napon belüli lejáró modul.</p>
          )}
        </Card>
      </div>

      <Card title="Automatikus jelentésszöveg">
        <textarea readOnly rows="10" className="input mono" style={{ marginTop: 14, fontSize: 11, minHeight: 240 }} value={reportNarrative} />
      </Card>

      <Card title="Top teljesítők">
        <ul className="list">
          {topPerformers.map((item, index) => (
            <li key={item.person.id} className="spread" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="lbl">{index + 1}. {item.person.nev}</div>
                <p className="note">{item.score} elismert modul · {item.level >= 0 ? KOTELEZO_SZINTEK[item.level].rang : 'Nincs szint'}.</p>
              </div>
              <span className="mono" style={{ color: 'var(--gold-lt)', marginTop: 4 }}>{item.score} modul</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Settings({ ui, onChange, onEnterCode, onRegenerateCodes }) {
  const [code, setCode] = useState('');
  return (
    <div className="stack">
      <Card title="Megjelenés és prémium beállítások">
        <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <div className="lbl">Téma</div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {Object.keys(THEME_STYLES).map((theme) => (
                <Btn key={theme} kind={ui.theme === theme ? 'gold' : 'quiet'} onClick={() => onChange({ ...ui, theme })}>{theme}</Btn>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 240px' }}>
            <div className="lbl">AI képstílus</div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {IMAGE_MODES.map((mode) => (
                <Btn key={mode} kind={ui.imageMode === mode ? 'gold' : 'quiet'} onClick={() => onChange({ ...ui, imageMode: mode })}>{mode}</Btn>
              ))}
            </div>
          </div>
        </div>
        <p className="note" style={{ marginTop: 16 }}>A választások elmentődnek helyben, és a Védett helyek fülön a kiválasztott képi stílus jelenik meg.</p>
      </Card>
      <Card title="Kódos belépés és szerepkörök">
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Írd be a kódot" value={code} onChange={(e) => setCode(e.target.value)} />
          <Btn kind="gold" onClick={() => onEnterCode(code)}>Belépés</Btn>
        </div>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <Field label="Admin kód"><input className="input" readOnly value={ui.adminCode} /></Field>
          <Field label="Látogató kód"><input className="input" readOnly value={ui.visitorCode} /></Field>
        </div>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <Btn kind="quiet" onClick={() => copyText(ui.adminCode)}>Admin kód másolása</Btn>
          <Btn kind="quiet" onClick={() => copyText(ui.visitorCode)}>Látogató kód másolása</Btn>
          <Btn kind="bad" onClick={onRegenerateCodes}>Alapértelmezett kódokra</Btn>
        </div>
        <p className="note" style={{ marginTop: 12 }}>Az admin kód a szerkesztési jogosultságot adja, a látogató kód csak megtekintésre.</p>
      </Card>
      <Card title="Üzemeltetési gyorsindító">
        <ul className="list">
          <li>
            <div className="lbl">Nyomtatási jelentés</div>
            <p className="note">A Jelentések fülről közvetlenül készíthetsz PDF-et vagy nyomtatott dokumentumot.</p>
          </li>
          <li>
            <div className="lbl">Aktuális csapatfigyelés</div>
            <p className="note">A lejárati és próbaidős figyelmeztetések élőben frissülnek a riportban.</p>
          </li>
          <li>
            <div className="lbl">Gyors betöltés</div>
            <p className="note">Az állományt egyszerűen újratöltheted példaadatokkal vagy törölheted, ha tiszta kezdés kell.</p>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function Vedett({ sites, imageMode, isAdmin, onEdit, onDelete, onAdd, filter, onFilterChange, statusFilter, onStatusFilterChange, onDuplicate }) {
  const selected = imageMode === 'face2' ? face2 : imageMode === 'face3' ? face3 : face1;
  const visible = sites.filter((site) => {
    const matchesText = !filter || [site.nev, site.zona, site.statusz, site.kritikus].some((value) => value?.toLowerCase().includes(filter.toLowerCase()));
    const matchesStatus = !statusFilter || site.statusz.toLowerCase() === statusFilter.toLowerCase();
    return matchesText && matchesStatus;
  });
  const statusOptions = Array.from(new Set(sites.map((site) => site.statusz))).sort();

  return (
    <div className="stack">
      <Card title="Védett helyek felügyelete" jobb={isAdmin ? <Btn kind="gold" onClick={onAdd}>Új hely hozzáadása</Btn> : null}>
        <p className="note">A védett helyek gyors áttekintése. Minden helyszínhez AI-stílusú grafika és biztonsági állapot tartozik.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <input className="input" placeholder="Szűrés név, zóna, státusz..." value={filter} onChange={(e) => onFilterChange(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
          <select className="input" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">Összes státusz</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {isAdmin && <Btn kind="quiet" onClick={() => { onFilterChange(''); onStatusFilterChange(''); }}>Szűrők törlése</Btn>}
        </div>
        <div className="row" style={{ justifyContent: 'space-between', gap: 10, marginTop: 12 }}>
          <span className="mono faint">Mutatva {visible.length}/{sites.length} hely</span>
          {visible.length !== sites.length && <span className="mono faint">Szűrés aktív</span>}
        </div>
      </Card>
      <div className="loc-grid">
        {visible.map((site) => {
          const badgeColor = VEDETT_STATUS_COLORS[site.statusz.toLowerCase()] || 'var(--gold)';
          return (
            <article key={site.id} className="loc-card">
              <div className="loc-img">
                <img src={site.kep || selected} alt={site.nev} />
              </div>
              <div className="loc-bd">
                <div className="card-hd" style={{ padding: 0, borderBottom: 'none' }}>
                  <h2>{site.nev}</h2>
                  <Chip szin={badgeColor}>{site.statusz.toUpperCase()}</Chip>
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
                  <span className="mono faint">Zóna: {site.zona}</span>
                  <span className="mono faint">Utolsó ellenőrzés: {fmt(site.ellenorzes)}</span>
                </div>
                <p className="note" style={{ marginTop: 12 }}>{site.kritikus}</p>
                {site.kritikus && <Chip szin="var(--bad)">KRITIKUS</Chip>}
                {isAdmin && (
                  <div className="row" style={{ gap: 10, marginTop: 16 }}>
                    <Btn kind="quiet" onClick={() => onEdit(site)}>Szerkesztés</Btn>
                    <Btn kind="quiet" onClick={() => onDuplicate(site)}>Duplikálás</Btn>
                    <Btn kind="bad" onClick={() => onDelete(site.id)}>Törlés</Btn>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function VedettForm({ open, item, onClose, onSave }) {
  const defaults = { id: uid(), nev: '', zona: '', statusz: '', ellenorzes: todayISO(), kritikus: '', kep: face1 };
  const [form, setForm] = useState(defaults);

  useEffect(() => {
    if (open) {
      setForm(item ? { ...item } : defaults);
    }
  }, [open, item]);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const selectImage = (img) => () => setForm((prev) => ({ ...prev, kep: img }));

  return (
    <Sheet open={open} title={item ? 'Védett hely szerkesztése' : 'Új védett hely'} onClose={onClose} wide>
      <div className="stack" style={{ gap: 16 }}>
        <div className="fgrid">
          <Field label="Helyszín neve"><input className="input" value={form.nev} onChange={update('nev')} /></Field>
          <Field label="Zóna"><input className="input" value={form.zona} onChange={update('zona')} /></Field>
        </div>
        <div className="fgrid">
          <Field label="Állapot"><input className="input" value={form.statusz} onChange={update('statusz')} placeholder="védett, szigorított, magas figyelem" /></Field>
          <Field label="Utolsó ellenőrzés"><input type="date" className="input" value={form.ellenorzes} onChange={update('ellenorzes')} /></Field>
        </div>
        <Field label="Kritikus megjegyzés"><textarea className="input" rows="3" value={form.kritikus} onChange={update('kritikus')} /></Field>
        <Field label="Kép URL"><input className="input" value={form.kep} onChange={update('kep')} placeholder="https://..." /></Field>
        <Field label="Képstílus">
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {[face1, face2, face3].map((img, index) => (
              <button key={index} type="button" className={`img-select${form.kep === img ? ' selected' : ''}`} onClick={selectImage(img)}>
                <img src={img} alt={`Stílus ${index + 1}`} />
              </button>
            ))}
          </div>
          <p className="note" style={{ marginTop: 8 }}>Megadhatsz külső képet URL-lel, vagy válaszd a sablon AI-stílusokat.</p>
        </Field>
        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <Btn kind="quiet" onClick={onClose}>Mégse</Btn>
          <Btn kind="gold" onClick={() => { onSave(form); }}>Mentés</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function AdminPanel({ data, onExport, onImport, onReset }) {
  const [payload, setPayload] = useState('');
  return (
    <div className="stack">
      <Card title="Adminisztrációs panel">
        <p className="note">A teljes adatbázist exportálhatod, importálhatod, vagy szükség esetén alaphelyzetbe állíthatod.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Btn kind="gold" onClick={() => onExport(JSON.stringify(data, null, 2))}>Exportálás</Btn>
          <Btn kind="quiet" onClick={() => onReset()}>Törlés és újratöltés</Btn>
        </div>
      </Card>
      <Card title="Importálás JSON-ből">
        <textarea className="input mono" rows="8" value={payload} onChange={(e) => setPayload(e.target.value)} placeholder="Illeszd be a JSON-adatot ide..." />
        <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
          <Btn kind="quiet" onClick={() => setPayload('')}>Törlés</Btn>
          <Btn kind="gold" onClick={() => onImport(payload)}>Importálás</Btn>
        </div>
      </Card>
      <Card title="Gyors admin eszközök">
        <ul className="list">
          <li>
            <div className="lbl">Biztonsági mentés</div>
            <p className="note">Mentsd el a JSON-t, mielőtt nagyobb módosításokat végzel.</p>
          </li>
          <li>
            <div className="lbl">Regenerálj kódot</div>
            <p className="note">A Beállítások lapon új admin/látogató kódokat hozhatsz létre.</p>
          </li>
          <li>
            <div className="lbl">Visszaállítás</div>
            <p className="note">Alaphelyzetbe hozza a teljes listát, ideális teszteléshez vagy új kezdéshez.</p>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function Sugo() {
  const pontok = [
    ['Állomány', 'Vedd fel a neveket — egyesével, vagy a Névsor beillesztése gombbal. A belépés dátumától számít a 14 napos próbaidő.'],
    ['Státusztábla', 'A napi munka. Sor = ember, oszlop = modul, a cellára kattintva vált a teljesítési állapot: üres → teljesítve → folyamatban → sikertelen → üres.'],
    ['Karton', 'Névre kattintva aprólékosan láthatod, ki mit végzett el, mikor történt a képzés, ki volt az oktató és van-e lejárat.'],
    ['Rang', 'A rang automatikusan frissül. Csak a teljesen érvényes modulok számítanak, a lejárt modul visszavethet egy szinttel.'],
    ['Lejárat', 'A Modulok fül alatt állíthatod be, hány hónapig érvényes egy modul. 0 = soha nem jár le.'],
    ['Védett helyek', 'A Védett helyek fül új áttekintést ad a biztonsági zónákról AI-szerű képekkel, állapotokkal és helyszíni figyelésekkel.'],
    ['Oktatási jegyzőkönyv', 'A Jelentések fülön kimásolható CSV jelentés készül, amely hasznos oktatási jegyzőkönyvként és adminisztrációs anyagként.'],
  ];
  return (
    <div className="stack">
      <Card title="Hogyan működik">
        <ul className="list">
          {pontok.map(([c, sz]) => (
            <li key={c}>
              <div className="lbl" style={{ color: 'var(--gold-lt)' }}>{c}</div>
              <p className="note" style={{ marginTop: 6 }}>{sz}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Jelölések">
        <ul className="list">
          {STATUS_ORDER.map((k) => (
            <li key={k} className="row"><span className="mark" style={{ background: STATUS[k].szin }} /><span className="muted">{STATUS[k].label}</span></li>
          ))}
          <li className="row"><span className="expired">!</span><span className="muted">Lejárt — frissíteni kell</span></li>
          <li className="row"><span className="mono faint">↺</span><span className="muted">Ugyanaz a modul két szinten: egyszer kell elvégezni.</span></li>
        </ul>
      </Card>
    </div>
  );
}

function EmberForm({ open, item, onClose, onSave }) {
  const ures = { id: '', nev: '', jelveny: '', belepes: todayISO(), megj: '' };
  const [f, setF] = useState(ures);
  useEffect(() => { if (open) setF(item ? { ...item } : { ...ures, id: uid() }); }, [open, item]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <Sheet open={open} title={item ? 'Adatlap szerkesztése' : 'Új személy felvétele'} onClose={onClose}>
      <div className="stack" style={{ gap: 14 }}>
        <Field label="Név"><input className="input" value={f.nev} onChange={set('nev')} placeholder="pl. Kovács Anna" /></Field>
        <div className="fgrid">
          <Field label="Jelvényszám"><input className="input" value={f.jelveny} onChange={set('jelveny')} placeholder="USSS-000" /></Field>
          <Field label="Belépés" hint="Ettől számít a 2 hetes próbaidő"><input type="date" className="input" value={f.belepes} onChange={set('belepes')} /></Field>
        </div>
        <Field label="Megjegyzés"><textarea className="input" rows="2" value={f.megj} onChange={set('megj')} /></Field>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Btn onClick={onClose}>Mégsem</Btn>
          <Btn kind="gold" onClick={() => f.nev.trim() && onSave(f)}>Rögzítés</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function Tomeges({ open, onClose, onSave }) {
  const [szoveg, setSzoveg] = useState('');
  useEffect(() => { if (open) setSzoveg(''); }, [open]);
  const sorok = szoveg.split('\n').map((s) => s.trim()).filter(Boolean);

  return (
    <Sheet open={open} title="Névsor beillesztése" onClose={onClose}>
      <p className="note">Soronként egy fő. A jelvényszám pontosvesszővel elválasztva:</p>
      <p className="mono" style={{ color: 'var(--gold-lt)', marginTop: 6, fontSize: 12.5 }}>Günther Grün; USSS-004</p>
      <textarea className="input mono" rows="8" style={{ marginTop: 14, fontSize: 12.5 }} value={szoveg} onChange={(e) => setSzoveg(e.target.value)} />
      <div className="spread" style={{ marginTop: 14, alignItems: 'center' }}>
        <span className="mono faint" style={{ fontSize: 11 }}>{sorok.length} FŐ</span>
        <span className="row">
          <Btn onClick={onClose}>Mégsem</Btn>
          <Btn kind="gold" onClick={() => {
            const l = sorok.map((s) => {
              const [nev, jelveny = ''] = s.split(';').map((x) => x.trim());
              return { id: uid(), nev, jelveny, belepes: todayISO(), megj: '' };
            }).filter((x) => x.nev);
            if (l.length) onSave(l);
          }}>Felvétel</Btn>
        </span>
      </div>
    </Sheet>
  );
}
