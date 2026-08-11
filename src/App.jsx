import { useState, useEffect, useMemo, useRef } from 'react';
import badgeUrl from './assets/elite-badge.svg';
import face1 from './assets/ai-face-1.svg';
import face2 from './assets/ai-face-2.svg';
import face3 from './assets/ai-face-3.svg';

const STORE_KEY = 'usss:kepzes:v2';
const PROBAIDO_NAP = 14;

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

const EMPTY = { people: [], records: [], ervenyesseg: {} };

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
};

const uid = () => Math.random().toString(36).slice(2, 10);
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
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(null);
  const [tab, setTab] = useState('attekintes');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const first = useRef(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      try {
        setData({ ...EMPTY, ...JSON.parse(raw) });
      } catch (error) {
        console.warn('Nem sikerült betölteni az adatokat:', error);
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

  const recMap = useMemo(() => {
    const m = {};
    data.records.forEach((r) => {
      const ho = Number(data.ervenyesseg?.[r.kod] || 0);
      const lejar = r.statusz === 'kesz' && ho > 0 && r.datum ? addMonths(r.datum, ho) : null;
      const hatra = lejar ? napokMulva(lejar) : null;
      m[r.emberId + '|' + r.kod] = { ...r, lejar, hatra, lejart: hatra !== null && hatra < 0 };
    });
    return m;
  }, [data.records, data.ervenyesseg]);

  const ervenyes = (emberId, kod) => {
    const r = recMap[emberId + '|' + kod];
    return !!r && r.statusz === 'kesz' && !r.lejart;
  };

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
  const torolEmber = (id) => setData((d) => ({ ...d, people: d.people.filter((p) => p.id !== id), records: d.records.filter((r) => r.emberId !== id) }));
  const torolAllat = () => setData(EMPTY);

  const tabs = [
    ['attekintes', 'Áttekintés'],
    ['allomany', 'Állomány'],
    ['tabla', 'Státusztábla'],
    ['modulok', 'Modulok'],
    ['jelentes', 'Jelentések'],
    ['vedett', 'Védett helyek'],
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
        {tab === 'modulok' && <ModulLista data={data} recMap={recMap} onErveny={setErveny} />}
        {tab === 'jelentes' && <Jelentes csv={csv} onCopy={copyCsv} onDownload={downloadCsv} onReset={torolAllat} onDemo={() => setData(KEZDETI)} />}
        {tab === 'vedett' && <Vedett sites={VEDETT_HELYEK} />}
        {tab === 'sugo' && <Sugo />}
      </main>

      <footer>
        {ket(data.people.length)} fő · {ket(data.records.filter((r) => r.statusz === 'kesz').length)} teljesített modul · Belső használatra
      </footer>

      <Karton open={!!aktiv} ember={aktiv} allapot={aktiv ? allapot[aktiv.id] : null} recMap={recMap}
        onClose={() => setModal(null)} onCell={setRecord} onRecord={updateRecord} />
      <EmberForm open={modal?.type === 'ember'} item={modal?.item} onClose={() => setModal(null)}
        onSave={(p) => { upsertEmber(p); setModal(null); }} />
      <Tomeges open={modal?.type === 'tomeges'} onClose={() => setModal(null)}
        onSave={(l) => { setData((d) => ({ ...d, people: [...d.people, ...l] })); setModal(null); }} />
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

function Karton({ open, ember, allapot, recMap, onClose, onCell, onRecord }) {
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
              const r = recMap[ember.id + '|' + mo.kod];
              return (
                <div className="modrow" key={sz.id + mo.kod}>
                  <span className="kod">{mo.kod}</span>
                  <span className="nev">
                    {mo.nev}
                    {mo.ismetelt && <span className="mono faint" style={{ marginLeft: 8, fontSize: 10 }}>↺ {mo.ismetelt}. szint</span>}
                  </span>
                  <div className="seg">
                    {STATUS_ORDER.map((k) => (
                      <button key={k} className={r?.statusz === k ? 'on' : ''}
                        style={r?.statusz === k ? { background: STATUS[k].szin } : undefined}
                        onClick={() => onCell(ember.id, mo.kod, r?.statusz === k ? null : k)}>
                        {STATUS[k].label}
                      </button>
                    ))}
                  </div>
                  {r?.statusz === 'kesz' && (
                    <>
                      <input type="date" className="mini" value={r.datum || ''} onChange={(e) => onRecord({ ...r, datum: e.target.value })} />
                      <input className="mini" style={{ width: 108 }} placeholder="Oktató" value={r.oktato || ''} onChange={(e) => onRecord({ ...r, oktato: e.target.value })} />
                      <input className="mini" style={{ width: 108 }} placeholder="Megjegyzés" value={r.megj || ''} onChange={(e) => onRecord({ ...r, megj: e.target.value })} />
                    </>
                  )}
                  {r?.lejar && (
                    <Chip szin={r.lejart ? 'var(--bad)' : r.hatra <= 30 ? 'var(--warn)' : 'var(--faint)'}>
                      {r.lejart ? `LEJÁRT ${fmt(r.lejar)}` : `${fmt(r.lejar)} · ${r.hatra}N`}
                    </Chip>
                  )}
                </div>
              );
            })}
            {sz.megjegyzes && <p className="hairnote" style={{ margin: '10px 14px 12px' }}>{sz.megjegyzes}</p>}
          </div>
        );
      })}

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

function Jelentes({ csv, onCopy, onDownload, onReset, onDemo }) {
  return (
    <div className="stack">
      <Card title="Oktatási jegyzőkönyv és jelentés export">
        <p className="note">A kimutatás személyenként adja vissza a teljesítést, lejáratokat és az érvényességi státuszt. Használd Excelben vagy riportként.</p>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Btn kind="gold" onClick={onCopy}>CSV másolása</Btn>
          <Btn onClick={onDownload}>CSV letöltése</Btn>
          <Btn kind="quiet" onClick={onDemo}>Példaállomány betöltése</Btn>
          <Btn kind="bad" onClick={onReset}>Teljes állomány törlése</Btn>
        </div>
      </Card>
      <Card title="CSV adatforrás">
        <textarea readOnly rows="10" className="input mono" style={{ marginTop: 14, fontSize: 11, minHeight: 250 }} value={csv} />
      </Card>
      <Card title="GitHub és dokumentáció">
        <p className="note">A projekt lokálisan tárolja az adatokat, és a `src/App.jsx` alapján bővíthető egyedi jelentésekkel és oktatási jegyzőkönyvekkel.</p>
      </Card>
    </div>
  );
}

function Vedett({ sites }) {
  return (
    <div className="stack">
      <Card title="Védett helyek felügyelete">
        <p className="note">A védett helyek gyors áttekintése. Minden helyszínhez AI-stílusú grafika és biztonsági állapot tartozik.</p>
      </Card>
      <div className="loc-grid">
        {sites.map((site) => (
          <article key={site.id} className="loc-card">
            <div className="loc-img">
              <img src={site.kep} alt={site.nev} />
            </div>
            <div className="loc-bd">
              <div className="card-hd" style={{ padding: 0, borderBottom: 'none' }}>
                <h2>{site.nev}</h2>
                <Chip szin="var(--gold)">{site.statusz.toUpperCase()}</Chip>
              </div>
              <div className="row" style={{ justifyContent: 'space-between', marginTop: 14 }}>
                <span className="mono faint">Zóna: {site.zona}</span>
                <span className="mono faint">Utolsó ellenőrzés: {fmt(site.ellenorzes)}</span>
              </div>
              <p className="note" style={{ marginTop: 12 }}>{site.kritikus}</p>
            </div>
          </article>
        ))}
      </div>
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
