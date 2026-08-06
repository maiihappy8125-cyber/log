import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { Plus, Sprout, Star, CalendarDays, Film, BarChart3, Trophy, Trash2 } from "lucide-react";
import "./style.css";

const services = ["Netflix", "Prime Video", "YouTube", "U-NEXT", "その他"];
const categories = ["映画", "ドラマ", "アニメ", "動画", "その他"];

const today = new Date();
const toDateInput = (date) => date.toISOString().slice(0, 10);
const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

const sampleLogs = [
  {
    id: 1,
    title: "地面師たち",
    service: "Netflix",
    category: "ドラマ",
    date: toDateInput(new Date()),
    rating: 5,
    memo: "テンポがよくて一気に見た。",
    learning: "交渉の空気感と、人を信じさせる演出が印象的。",
  },
  {
    id: 2,
    title: "編み物YouTube：巾着の作り方",
    service: "YouTube",
    category: "動画",
    date: toDateInput(new Date(today.getFullYear(), today.getMonth(), Math.max(1, today.getDate() - 2))),
    rating: 4,
    memo: "ながら見でも理解しやすかった。",
    learning: "最初に完成形を決めると始めやすい。",
  },
  {
    id: 3,
    title: "休日に観た映画",
    service: "Prime Video",
    category: "映画",
    date: toDateInput(new Date(today.getFullYear(), today.getMonth() - 1, 21)),
    rating: 3,
    memo: "気軽に見られた。",
    learning: "気分転換として映画を見る時間も大事。",
  },
];

function monthKey(dateString) {
  return dateString?.slice(0, 7) || "未設定";
}

function monthLabel(key) {
  if (!key || key === "未設定") return "未設定";
  const [year, month] = key.split("-");
  return `${year}年${Number(month)}月`;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "未設定";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topItem(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function BarList({ data, palette = "green" }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  if (!entries.length) {
    return <p className="muted small">まだ記録がありません。</p>;
  }

  return (
    <div className="bar-list">
      {entries.map(([label, count]) => (
        <div key={label}>
          <div className="bar-row">
            <span>{label}</span>
            <span className="muted">{count}件</span>
          </div>
          <div className="bar-bg">
            <div
              className={palette === "beige" ? "bar-fill beige" : "bar-fill green"}
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button type="button" key={star} onClick={() => onChange(star)} className="star-button" aria-label={`${star} stars`}>
          <Star size={24} className={star <= value ? "star active" : "star"} />
        </button>
      ))}
    </div>
  );
}

function App() {
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("subscription-log-records");
      return saved ? JSON.parse(saved) : sampleLogs;
    } catch {
      return sampleLogs;
    }
  });
  const [form, setForm] = useState({
    title: "",
    service: "Netflix",
    category: "映画",
    date: toDateInput(new Date()),
    rating: 3,
    memo: "",
    learning: "",
  });
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  useEffect(() => {
    localStorage.setItem("subscription-log-records", JSON.stringify(logs));
  }, [logs]);

  const months = useMemo(() => {
    const unique = Array.from(new Set([...logs.map((log) => monthKey(log.date)), currentMonthKey]));
    return unique.sort((a, b) => b.localeCompare(a));
  }, [logs]);

  const currentMonthLogs = useMemo(() => logs.filter((log) => monthKey(log.date) === selectedMonth), [logs, selectedMonth]);

  const monthCounts = useMemo(() => {
    return logs.reduce((acc, log) => {
      const key = monthLabel(monthKey(log.date));
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [logs]);

  const serviceCounts = useMemo(() => countBy(currentMonthLogs, "service"), [currentMonthLogs]);
  const categoryCounts = useMemo(() => countBy(currentMonthLogs, "category"), [currentMonthLogs]);
  const bestLogs = useMemo(() => currentMonthLogs.filter((log) => Number(log.rating) === 5), [currentMonthLogs]);
  const topService = topItem(serviceCounts);

  function addLog(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    setLogs((prev) => [{ ...form, id: Date.now(), title: form.title.trim(), memo: form.memo.trim(), learning: form.learning.trim() }, ...prev]);
    setSelectedMonth(monthKey(form.date));
    setForm({ title: "", service: "Netflix", category: "映画", date: toDateInput(new Date()), rating: 3, memo: "", learning: "" });
  }

  function deleteLog(id) {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  function clearAllLogs() {
    if (window.confirm("すべての記録を削除しますか？")) {
      setLogs([]);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="hero">
          <div className="hero-content">
            <div>
              <div className="pill"><Sprout size={16} />サブスクLog</div>
              <h1>見たものを、経験値に。</h1>
              <p>Netflix、Prime Video、YouTube、U-NEXTなどで触れたコンテンツを、経験値として残すログです。消費で終わらせず、今月の「吸収」を見える化します。</p>
            </div>
            <div className="month-box">
              <label>表示中の月</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {months.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
              </select>
            </div>
          </div>
        </motion.header>

        <section className="summary-grid">
          <Card><div className="summary-head"><span>今月の記録</span><CalendarDays size={20} /></div><strong>{currentMonthLogs.length}</strong><p>件の経験値</p></Card>
          <Card><div className="summary-head"><span>よく使ったサービス</span><Trophy size={20} /></div><strong className="text-medium">{topService ? topService[0] : "まだなし"}</strong><p>{topService ? `${topService[1]}件` : "記録すると表示されます"}</p></Card>
          <Card><div className="summary-head"><span>★5の作品</span><Star size={20} className="star active" /></div><strong>{bestLogs.length}</strong><p>忘れたくない作品</p></Card>
          <Card><div className="summary-head"><span>総記録数</span><BarChart3 size={20} /></div><strong>{logs.length}</strong><p>これまでの積み上げ</p></Card>
        </section>

        <div className="layout">
          <Card className="form-card">
            <div className="section-title"><span><Plus size={20} /></span><div><h2>記録を追加</h2><p>見終わったら、30秒でログに残す。</p></div></div>
            <form onSubmit={addLog}>
              <label>タイトル<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：今日観た映画、動画、本など" /></label>
              <div className="two-cols">
                <label>サービス<select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>{services.map((service) => <option key={service}>{service}</option>)}</select></label>
                <label>カテゴリー<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              </div>
              <label>日付<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>評価<StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} /></label>
              <label>一言メモ<textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="例：気軽に見られてよかった。" rows={3} /></label>
              <label>学び / 印象に残ったこと<textarea value={form.learning} onChange={(e) => setForm({ ...form, learning: e.target.value })} placeholder="例：主人公の考え方が印象的だった。" rows={3} /></label>
              <button className="primary-button" type="submit">サブスクLogに追加する</button>
            </form>
          </Card>

          <div className="right-area">
            <Card>
              <div className="section-title"><span className="amber"><BarChart3 size={20} /></span><div><h2>集計</h2><p>月別、サービス別、カテゴリー別で吸収量を見る。</p></div></div>
              <div className="stats-grid"><div><h3>月別集計</h3><BarList data={monthCounts} palette="beige" /></div><div><h3>サービス別</h3><BarList data={serviceCounts} /></div><div><h3>カテゴリー別</h3><BarList data={categoryCounts} palette="beige" /></div></div>
            </Card>

            <Card>
              <div className="list-head"><div className="section-title"><span><Film size={20} /></span><div><h2>記録一覧</h2><p>{monthLabel(selectedMonth)}のログ</p></div></div><div className="list-actions"><div className="count-pill">{currentMonthLogs.length}件表示中</div><button className="clear-button" onClick={clearAllLogs}>全削除</button></div></div>
              <div className="logs">
                {currentMonthLogs.length === 0 ? <div className="empty">この月はまだ記録がありません。最初の1件を追加してみましょう。</div> : currentMonthLogs.map((log) => (
                  <article key={log.id} className="log-card">
                    <div className="log-top"><div><div className="tags"><span>{log.service}</span><span className="tag-amber">{log.category}</span><span className="tag-date">{log.date}</span></div><h3>{log.title}</h3><div className="mini-stars">{[1,2,3,4,5].map((star) => <Star key={star} size={16} className={star <= Number(log.rating) ? "star active" : "star"} />)}</div></div><button className="delete" onClick={() => deleteLog(log.id)} aria-label="delete log"><Trash2 size={18} /></button></div>
                    {log.memo && <p className="memo">{log.memo}</p>}
                    {log.learning && <div className="learning"><b>学び：</b>{log.learning}</div>}
                  </article>
                ))}
              </div>
            </Card>

            <Card>
              <div className="section-title"><span className="amber"><Star size={20} /></span><div><h2>★5の作品一覧</h2><p>今月の「これは残したい」を集める場所。</p></div></div>
              {bestLogs.length === 0 ? <p className="empty small-left">まだ★5の作品はありません。</p> : <div className="best-grid">{bestLogs.map((log) => <div key={log.id} className="best-item"><b>{log.title}</b><p>{log.service} / {log.category}</p></div>)}</div>}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
