"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BarChart3, BookOpen, Check, ChevronDown, CircleAlert, Clock3, Database, ExternalLink, FileText, Flag, Gavel, Landmark, Search, ShieldCheck, Sparkles, Target, TriangleAlert } from "lucide-react";
import styles from "./page.module.css";

type Status = "Kept" | "In progress" | "Partially kept" | "Unverifiable";
type Filter = "All" | Status;
type TrailRecord = {title?: string; description?: string; finding?: string; observedAt?: string; effect?: string; sourceTitle?: string; sourcePublisher?: string; sourceUrl?: string; date?: string; status?: string; definition?: string; value?: string; unit?: string; period?: string; direction?: string; verdict?: string; reasoning?: string; assessor?: string; publishedAt?: string; statement?: string; claimant?: string; claimType?: string; confidence?: number; summary?: string; mechanism?: string; impact?: string; officialFinding?: boolean};
type PromiseRecord = { title: string; party: string; category: string; status: Status; confidence: number; source: string; detail: string; reviewed: string; evidenceCount: number; evidence?: TrailRecord[]; milestones?: TrailRecord[]; indicators?: TrailRecord[]; assessments?: TrailRecord[]; claims?: TrailRecord[]; integrityEvents?: TrailRecord[] };
type CorpusStat = {label: string; count: number; icon: typeof Database; note: string};

const fallbackPromises: PromiseRecord[] = [
  { title: "Reduce the maximum general PBS co-payment", party: "Labor", category: "Cost of living", status: "Kept", confidence: 0.98, source: "Department of Health", detail: "The maximum price of most PBS medicines for non-concession patients fell from $42.50 to $30 from 1 January 2023.", reviewed: "07 MAR 2023", evidenceCount: 3 },
  { title: "Expand 60-day dispensing for eligible medicines", party: "Labor", category: "Health", status: "Partially kept", confidence: 0.94, source: "Department of Health", detail: "The first stage covered 92 medicines from September 2023. The record supports implementation, but not completion of the full policy ambition.", reviewed: "23 JUN 2023", evidenceCount: 4 },
  { title: "Create the Housing Australia Future Fund", party: "Labor", category: "Housing", status: "In progress", confidence: 0.87, source: "October 2022 Budget", detail: "The fund appears in the budget as a policy measure. Delivery outcomes and the five-year housing target still require later evidence.", reviewed: "25 OCT 2022", evidenceCount: 2 },
  { title: "Invest in Rewiring the Nation", party: "Labor", category: "Climate", status: "In progress", confidence: 0.86, source: "Energy Department", detail: "A Commonwealth and NSW agreement is documented. This is implementation evidence, not proof that every network outcome has been delivered.", reviewed: "22 DEC 2022", evidenceCount: 2 },
];

const corpusLabels: Omit<CorpusStat, "count">[] = [
  {label: "Sources", icon: Database, note: "public records"},
  {label: "Commitments", icon: Flag, note: "promise files"},
  {label: "Evidence", icon: FileText, note: "linked findings"},
  {label: "Milestones", icon: Activity, note: "delivery steps"},
  {label: "Indicators", icon: BarChart3, note: "outcome measures"},
  {label: "Assessments", icon: Target, note: "verdict records"},
  {label: "Claims", icon: Gavel, note: "public positions"},
  {label: "Integrity events", icon: ShieldCheck, note: "separate lens"},
  {label: "Manifestos", icon: BookOpen, note: "source documents"},
  {label: "Government records", icon: Landmark, note: "official context"},
];

const statusClass: Record<Status, string> = { Kept: styles.kept, "In progress": styles.progress, "Partially kept": styles.partial, Unverifiable: styles.unknown };
const statusIcon: Record<Status, typeof Check> = { Kept: Check, "In progress": Clock3, "Partially kept": TriangleAlert, Unverifiable: CircleAlert };

export default function Home() {
  const [records, setRecords] = useState<PromiseRecord[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({source: 15, promise: 4, evidence: 4, milestone: 4, indicator: 4, assessment: 4, claim: 3, integrityEvent: 4, manifesto: 1, government: 1});
  const [dataState, setDataState] = useState<"loading" | "live" | "fallback">("loading");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedTitle, setSelectedTitle] = useState(fallbackPromises[0].title);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("/api/ledger").then(async (response) => {
      if (!response.ok) throw new Error("Sanity ledger unavailable");
      return response.json();
    }).then((data) => {
      const nextPromises = (data.promises ?? []).map((item: {title: string; party?: string; category?: string; status?: string; confidence?: number; source?: string; summary?: string; reviewed?: string; evidenceCount?: number; evidence?: TrailRecord[]; milestones?: TrailRecord[]; indicators?: TrailRecord[]; assessments?: TrailRecord[]; claims?: TrailRecord[]; integrityEvents?: TrailRecord[]}) => ({
        title: item.title,
        party: item.party === "Australian Labor Party" ? "Labor" : item.party ?? "Unknown party",
        category: item.category ?? "Other",
        status: (["Kept", "In progress", "Partially kept", "Unverifiable"] as Status[]).includes(item.status as Status) ? item.status as Status : "Unverifiable",
        confidence: item.confidence ?? 0,
        source: item.source ?? "Sanity record",
        detail: item.summary ?? "No summary has been recorded yet.",
        reviewed: item.reviewed ? new Date(item.reviewed).toLocaleDateString("en-AU", {day: "2-digit", month: "short", year: "numeric"}).toUpperCase() : "NOT REVIEWED",
        evidenceCount: item.evidenceCount ?? 0,
        evidence: item.evidence ?? [],
        milestones: item.milestones ?? [],
        indicators: item.indicators ?? [],
        assessments: item.assessments ?? [],
        claims: item.claims ?? [],
        integrityEvents: item.integrityEvents ?? [],
      }));
      if (nextPromises.length) {
        setRecords(nextPromises);
        setSelectedTitle(nextPromises[0].title);
      }
      if (data.stats) setRecordCounts(data.stats);
      setDataState("live");
    }).catch(() => setDataState("fallback"));
  }, []);
  const promises = useMemo(() => records.length ? records : fallbackPromises, [records]);
  const corpusStats: CorpusStat[] = corpusLabels.map((item) => ({...item, count: recordCounts[({Sources: "source", Commitments: "promise", Evidence: "evidence", Milestones: "milestone", Indicators: "indicator", Assessments: "assessment", Claims: "claim", "Integrity events": "integrityEvent", Manifestos: "manifesto", "Government records": "government"}[item.label] ?? "")] ?? 0}));
  const visible = useMemo(() => promises.filter((item) => {
    const matchesFilter = filter === "All" || item.status === filter;
    return matchesFilter && `${item.title} ${item.party} ${item.category}`.toLowerCase().includes(search.toLowerCase());
  }), [filter, search, promises]);
  const selected = promises.find((item) => item.title === selectedTitle) ?? promises[0];
  const SelectedIcon = statusIcon[selected.status];
  const statusOrder: Status[] = ["Kept", "In progress", "Partially kept", "Unverifiable"];
  const statusCounts = statusOrder.map((status) => ({status, count: promises.filter((item) => item.status === status).length}));
  const maxEvidence = Math.max(...promises.map((item) => item.evidenceCount));
  const averageConfidence = Math.round(promises.reduce((total, item) => total + item.confidence, 0) / promises.length * 100);
  const trailSections = [
    {label: "Commitment", icon: Flag, records: [{title: selected.title, description: selected.detail, status: selected.status}]},
    {label: "Milestones", icon: Activity, records: selected.milestones ?? []},
    {label: "Evidence", icon: FileText, records: selected.evidence ?? []},
    {label: "Indicators", icon: BarChart3, records: selected.indicators ?? []},
    {label: "Assessments", icon: Target, records: selected.assessments ?? []},
    {label: "Claims", icon: Gavel, records: selected.claims ?? []},
    {label: "Integrity", icon: ShieldCheck, records: selected.integrityEvents ?? []},
  ];
  const selectPromise = (title: string) => {
    setSelectedTitle(title);
    window.setTimeout(() => document.getElementById("trail")?.scrollIntoView({behavior: "smooth", block: "start"}), 0);
  };

  return (
    <main className={styles.pageShell}>
      <div className={styles.topRule} />
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top" aria-label="True Oath home"><span className={styles.brandMark}><ShieldCheck size={19} strokeWidth={1.8} /></span><span><strong>TRUE OATH</strong><small>PUBLIC ACCOUNTABILITY LAB</small></span></a>
        <div className={styles.navLinks}><a className={styles.activeLink} href="#ledger"><BookOpen size={14} /> Ledger</a><a href="#method"><Target size={14} /> Method</a><a href="#integrity"><Gavel size={14} /> Integrity</a></div>
        <button className={styles.countryButton} type="button" aria-label="Selected country: Australia"><span className={styles.flag}>AU</span><span>Australia</span><ChevronDown size={15} /></button>
      </nav>

      <section className={styles.hero} id="top"><div className={styles.heroCopy}><div className={styles.eyebrow}><span className={styles.pulse} /> LIVE CASE FILE / AUSTRALIA</div><h1>Promises, <em>with receipts.</em></h1><p className={styles.lede}>A source-grounded record of what political parties promised, what governments did, and where the evidence is still incomplete.</p><div className={styles.heroActions}><a className={styles.primaryButton} href="#ledger">Open the ledger <ArrowUpRight size={16} /></a><a className={styles.textButton} href="#method">How it works <ArrowUpRight size={15} /></a></div></div><div className={styles.signalPanel} aria-label="Ledger status summary"><div className={styles.panelHeader}><span>FIELD STATUS</span><span className={styles.live}><span /> {dataState === "live" ? "SYNCED" : dataState === "loading" ? "CONNECTING" : "OFFLINE COPY"}</span></div><div className={styles.signalReadout}><span className={styles.signalNumber}>{String(promises.length).padStart(2, "0")}</span><span>commitments under review</span></div><div className={styles.signalLine}><span /><span /><span /><span /><span /><span /><span /><span /></div><div className={styles.panelMeta}><span><strong>{Object.values(recordCounts).reduce((a, b) => a + b, 0)}</strong> total records</span><span><strong>{recordCounts.source}</strong> source records</span><span><strong>2022</strong> baseline</span></div></div></section>

      <section className={styles.inspirationBand}><div className={styles.kicker}><span className={styles.sectionIndex}>00</span> WHY THIS EXISTS</div><div className={styles.inspirationGrid}><h2>Election season asks the same question:<br /><em>what if we checked?</em></h2><p>With elections approaching in more countries, voters are asked to remember promises, slogans, reversals, and reasons. True Oath turns that memory test into a source trail. Can Sanity help us keep our sanity? That is the experiment.</p></div></section>

      <section className={styles.statsBand} aria-label="Ledger statistics"><div className={styles.statsIntro}><div className={styles.kicker}><BarChart3 size={14} /> QUICK READ</div><h2>The shape of the evidence.</h2><p>{Object.values(recordCounts).reduce((a, b) => a + b, 0)} Sanity records connect {promises.length} commitments to their sources, proof, delivery steps, measures, assessments, and integrity context.</p><div className={styles.confidenceReadout}><strong>{averageConfidence}%</strong><span>average confidence<br />across assessments</span></div></div><div className={styles.chartCard}><div className={styles.chartHeader}><span>STATUS DISTRIBUTION</span><span>n = {promises.length}</span></div><div className={styles.statusBars}>{statusCounts.map(({status, count}) => <div className={styles.barRow} key={status}><span>{status}</span><div className={styles.barTrack}><span className={`${styles.barFill} ${statusClass[status]}`} style={{width: `${Math.max((count / promises.length) * 100, count ? 4 : 0)}%`}} /></div><strong>{count}</strong></div>)}</div></div><div className={styles.chartCard}><div className={styles.chartHeader}><span>EVIDENCE DEPTH</span><span>linked records</span></div><div className={styles.evidenceBars}>{promises.map((item, index) => <div className={styles.evidenceBar} key={item.title} title={`${item.title}: ${item.evidenceCount} linked records`}><span style={{height: `${(item.evidenceCount / maxEvidence) * 100}%`}} /><small>0{index + 1}</small></div>)}</div><div className={styles.chartLegend}><span>01</span><span>{maxEvidence} records max</span></div></div><div className={styles.inventory}><div className={styles.inventoryHeader}><div><div className={styles.kicker}><Database size={14} /> SANITY CORPUS</div><h3>Every record has a place.</h3></div><span>{Object.values(recordCounts).reduce((a, b) => a + b, 0)} total documents</span></div><div className={styles.inventoryGrid}>{corpusStats.map(({label, count, icon: Icon, note}) => <div className={styles.inventoryItem} key={label}><Icon size={15} /><strong>{count}</strong><span>{label}</span><small>{note}</small></div>)}</div></div></section>

      <section className={styles.workspace} id="ledger"><div className={styles.sectionHead}><div><div className={styles.kicker}><span className={styles.sectionIndex}>01</span> THE LEDGER</div><h2>What happened next?</h2><p>Trace each commitment from campaign language to implementation evidence.</p></div><div className={styles.updated}><span className={styles.statusDot} /> LAST REVIEWED <strong>04 OCT 2026</strong></div></div><div className={styles.controlBar}><label className={styles.searchBox}><Search size={16} /><span className={styles.srOnly}>Search commitments</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the ledger" /></label><div className={styles.filters} aria-label="Filter promises">{(["All", "Kept", "In progress", "Partially kept", "Unverifiable"] as Filter[]).map((item) => <button key={item} className={filter === item ? styles.filterActive : ""} onClick={() => setFilter(item)} type="button">{item}{item !== "All" && <span>{promises.filter((promise) => promise.status === item).length}</span>}</button>)}</div></div><div className={styles.ledgerGrid}><div className={styles.promiseList}><div className={styles.listHeader}><span>COMMITMENT / PARTY / CATEGORY</span><span>STATUS</span></div>{visible.length > 0 ? visible.map((item, index) => { const Icon = statusIcon[item.status]; return <button key={item.title} className={`${styles.promiseRow} ${selected.title === item.title ? styles.selected : ""}`} onClick={() => selectPromise(item.title)} type="button"><span className={styles.rowNumber}>{String(index + 1).padStart(2, "0")}</span><span className={styles.rowMain}><strong>{item.title}</strong><small>{item.party} <span>·</span> {item.category}</small></span><span className={`${styles.status} ${statusClass[item.status]}`}><Icon size={13} /> {item.status}</span><ArrowUpRight className={styles.rowArrow} size={17} /></button>; }) : <div className={styles.emptyState}><Search size={20} /><strong>No matching files</strong><span>Try a different search or clear the filters.</span></div>}</div><aside className={styles.detailPanel} aria-live="polite"><div className={styles.detailTop}><span className={styles.fileTag}><FileText size={13} /> FILE 00{promises.indexOf(selected) + 1}</span><span className={styles.confidence}>CONFIDENCE {Math.round(selected.confidence * 100)}%</span></div><div className={styles.detailStatus}><span className={`${styles.status} ${statusClass[selected.status]}`}><SelectedIcon size={13} /> {selected.status}</span><span className={styles.reviewed}>{selected.reviewed}</span></div><h3>{selected.title}</h3><p>{selected.detail}</p><div className={styles.evidenceBox}><div className={styles.evidenceLabel}><span className={styles.sourcePulse} /> EVIDENCE TRAIL</div><strong>{selected.evidenceCount} linked records</strong><span><Landmark size={13} /> {selected.source}</span></div><a className={styles.openButton} href="#trail">Inspect evidence trail <ExternalLink size={16} /></a></aside></div></section>

      <section className={styles.trailSection} id="trail" aria-live="polite"><div className={styles.sectionHead}><div><div className={styles.kicker}><span className={styles.sectionIndex}>01A</span> THE EVIDENCE TRAIL</div><h2>{selected.title}</h2><p>Follow the record from promise to proof. Every card below comes from a linked Sanity document.</p></div><a className={styles.trailBack} href="#ledger"><ArrowUpRight size={15} /> Back to ledger</a></div><div className={styles.trailPath}>{trailSections.map(({label, icon: Icon, records}) => <a key={label} href={`#trail-${label.toLowerCase()}`} className={styles.trailNode}><Icon size={14} /><span>{label}</span><strong>{records.length}</strong></a>)}</div><div className={styles.trailGrid}>{trailSections.map(({label, icon: Icon, records}) => <section className={styles.trailGroup} id={`trail-${label.toLowerCase()}`} key={label}><div className={styles.trailGroupHead}><span><Icon size={15} /> {label}</span><strong>{records.length}</strong></div>{records.length ? records.map((record, index) => <article className={styles.trailCard} key={`${label}-${index}`}><div className={styles.trailCardMeta}>{record.status || record.effect || record.verdict || record.direction || record.claimType || "linked record"}{record.observedAt || record.date || record.publishedAt ? ` · ${record.observedAt || record.date || record.publishedAt}` : ""}</div><h3>{record.title || record.statement || record.value || "Untitled record"}</h3><p>{record.finding || record.description || record.reasoning || record.summary || record.definition || "No description recorded."}</p>{record.sourceTitle && <div className={styles.trailSource}><Landmark size={13} /> {record.sourcePublisher ? `${record.sourcePublisher} · ` : ""}{record.sourceTitle}{record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={12} /></a>}</div>}</article>) : <p className={styles.trailEmpty}>No linked {label.toLowerCase()} record is currently attached to this commitment.</p>}</section>)}</div></section>

      <section className={styles.integrityBand} id="integrity"><div className={styles.integrityIcon}><Gavel size={21} /></div><div><div className={styles.kicker}>02 / INTEGRITY LENS</div><h2>Not every allegation is a finding.</h2><p>True Oath keeps official findings, unresolved reporting, and no-finding cases visibly separate. That distinction is part of the evidence.</p></div><a className={styles.outlineButton} href="#method">Read the method <ArrowUpRight size={15} /></a></section>
      <section className={styles.method} id="method"><div className={styles.kicker}><span className={styles.sectionIndex}>03</span> THE METHOD</div><div className={styles.methodGrid}><div><h2>Political claims are easy.<br /><em>Accountability is structured.</em></h2><p className={styles.methodLead}>True Oath separates the promise from the proof. Every assessment keeps its source, date, confidence, and unresolved questions in view.</p></div><div className={styles.methodSteps}><div><span>01</span><strong>Commitment</strong><p>What was actually promised, by whom, and by when?</p></div><div><span>02</span><strong>Evidence</strong><p>What changed in budgets, law, programs, or outcomes?</p></div><div><span>03</span><strong>Verdict</strong><p>What can be said confidently, and what stays open?</p></div></div></div></section>
      <footer className={styles.footer}><span>TRUE OATH / AUSTRALIA</span><span><Sparkles size={13} /> SOURCE-GROUNDED BY DESIGN</span><span>BUILT FOR CAREFUL READING</span></footer>
    </main>
  );
}
