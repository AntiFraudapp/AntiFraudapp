const CACHE_KEY = "antifraud_news_cache_v3";
const CACHE_TTL = 60 * 60 * 1e3;
const GNEWS_API_KEY = "a9970499ea4a6a43c5de7d422f0724b2";
async function fetchGlobalNews() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) return data;
    }
  } catch {
  }
  const results = [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1e3;
  async function fetchWithTimeout(url, options, ms = 5e3) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch {
      clearTimeout(id);
      return null;
    }
  }
  async function fetchGNews() {
    var _a;
    try {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent("cybersecurity OR fraud OR scam OR hacking OR crypto")}&lang=pt,en&max=20&apikey=${GNEWS_API_KEY}`;
      const res = await fetchWithTimeout(url);
      if (!(res == null ? void 0 : res.ok)) return;
      const data = await res.json();
      if (data == null ? void 0 : data.articles) {
        const shuffled2 = [...data.articles].sort(() => Math.random() - 0.5);
        for (const a of shuffled2) {
          const pub = new Date(a.publishedAt).getTime();
          if (pub >= sevenDaysAgo) {
            results.push({
              title: a.title,
              source: ((_a = a.source) == null ? void 0 : _a.name) || "GNews",
              url: a.url,
              date: a.publishedAt
            });
          }
        }
      }
    } catch {
    }
  }
  async function fetchCryptoPanic() {
    var _a;
    try {
      const url = "https://cryptopanic.com/api/v1/posts/?auth_token=free&filter=important&public=true&kind=news";
      const res = await fetchWithTimeout(url);
      if (!(res == null ? void 0 : res.ok)) return;
      const data = await res.json();
      if (data == null ? void 0 : data.results) {
        for (const item of data.results.slice(0, 10)) {
          const pub = new Date(item.published_at).getTime();
          if (pub >= sevenDaysAgo) {
            results.push({
              title: item.title,
              source: ((_a = item.source) == null ? void 0 : _a.title) || "CryptoPanic",
              url: item.url,
              date: item.published_at
            });
          }
        }
      }
    } catch {
    }
  }
  await Promise.allSettled([fetchGNews(), fetchCryptoPanic()]);
  const seen = /* @__PURE__ */ new Set();
  const deduped = results.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const shuffled = deduped.sort(() => Math.random() - 0.5);
  const final = shuffled.length > 0 ? shuffled : getFallbackNews();
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: final, timestamp: Date.now() })
    );
  } catch {
  }
  return final;
}
function getFallbackNews() {
  return [
    {
      title: "Ataque ransomware atinge infraestruturas críticas europeias",
      source: "Reuters",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "Nova campanha de phishing visa utilizadores de MBWay em Portugal",
      source: "CNCS",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "Crypto exchange sofre hack de 45M USD — fundos em risco",
      source: "CoinDesk",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "Burla telefónica vishing bate recorde em Portugal em 2026",
      source: "Público",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "FBI alerta para aumento de fraudes com criptomoedas em 2026",
      source: "IC3",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "Europol desmantela rede de burlas SMS em 12 países",
      source: "Europol",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    },
    {
      title: "Nova variante de malware ataca apps bancárias móveis",
      source: "Kaspersky",
      url: "#",
      date: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
}
export {
  fetchGlobalNews
};
