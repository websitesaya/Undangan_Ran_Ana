/* =========================================================
   THE WEDDING OF RAN & ANA — script.js
   =========================================================

   ⚠️  WAJIB DIISI SEBELUM PUBLISH ⚠️
   ---------------------------------
   Fitur "Ucapan & Doa" memakai jsonbin.io (database gratis)
   supaya ucapan dari SEMUA tamu bisa saling terlihat.

   Cara setting (gratis, 2 menit):
   1. Buat akun di https://jsonbin.io
   2. Buka "Create Bin", isi konten awal dengan:  []
   3. Setelah dibuat, salin "Bin ID" lalu tempel ke JSONBIN_BIN_ID
   4. Buka menu API Keys, salin "X-Master-Key" lalu tempel
      ke JSONBIN_API_KEY di bawah ini.
   5. Simpan file ini, upload ulang ke hosting Anda.

   Catatan: karena ini website statis (tanpa server sendiri),
   API key akan ikut termuat di kode sisi client. Untuk undangan
   pernikahan pribadi (skala kecil, bukan aplikasi komersial)
   ini adalah cara paling sederhana & umum dipakai.
   ========================================================= */
const CONFIG = {
  JSONBIN_BIN_ID: "6aa8ffefac6210605acf3d3f",
  JSONBIN_API_KEY: "$2a$10$nou5c3yZntdxwBqnGEEOvuCkZpg9GT4CfSp1IXgNhJpKQzhxI8NYO",
  // ⚠️ TODO: bulan belum diketahui — ganti "10" (Oktober) di bawah ini
  // sesuai bulan pernikahan yang sebenarnya (tanggal 23, tahun 2026).
  // Desa Kao, Halmahera Utara memakai zona waktu WIT (UTC+9).
  WEDDING_DATE: "2026-10-23T09:00:00+09:00", // Akad & Pemberkatan, WIT (UTC+9)
  GALLERY_COUNT: 12
};

const JSONBIN_BASE = `https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`;

document.addEventListener("DOMContentLoaded", () => {
  initGuestName();
  initCurtainAndCover();
  initSnow();
  initMusic();
  initCountdown();
  initGallery();
  initCopyButtons();
  initWishes();
  initScrollAnimations();
  attemptAutoplayMusic();
});

/* ---------------------------------------------------------
   Musik: browser modern selalu memblokir audio bersuara sebelum
   ada interaksi user. Trik berikut membuatnya terasa "otomatis":
   1) coba play dalam kondisi muted begitu halaman siap (browser
      hampir selalu izinkan muted-autoplay)
   2) begitu ada sentuhan/klik pertama di mana pun pada halaman,
      langsung unmute + play beneran.
   --------------------------------------------------------- */
function attemptAutoplayMusic(){
  const music = document.getElementById("bgMusic");
  const toggle = document.getElementById("musicToggle");
  if (!music) return;

  music.muted = true;
  music.play().catch(() => {});

  const unlock = () => {
    music.muted = false;
    music.play().then(() => toggle.classList.add("playing")).catch(() => {});
    document.removeEventListener("click", unlock);
    document.removeEventListener("touchstart", unlock);
  };
  document.addEventListener("click", unlock, { once: true });
  document.addEventListener("touchstart", unlock, { once: true });
}

/* ---------------------------------------------------------
   Nama tamu dari URL: index.html?to=Nama%20Tamu
   --------------------------------------------------------- */
function initGuestName(){
  const params = new URLSearchParams(window.location.search);
  const guest = params.get("to") || params.get("kepada");
  const el = document.getElementById("guestName");
  if (guest && el) {
    el.textContent = decodeURIComponent(guest).replace(/\+/g, " ");
  }
}

/* ---------------------------------------------------------
   Buka Undangan -> animasi tirai terbuka
   --------------------------------------------------------- */
function initCurtainAndCover(){
  const openBtn = document.getElementById("openBtn");
  const cover = document.getElementById("cover");
  const curtainLeft = document.getElementById("curtain-left");
  const curtainRight = document.getElementById("curtain-right");
  const music = document.getElementById("bgMusic");

  openBtn.addEventListener("click", () => {
    openBtn.disabled = true;

    // mulai musik (butuh interaksi user agar diizinkan browser)
    if (music) {
      music.volume = 0.85;
      music.play().then(() => {
        document.getElementById("musicToggle").classList.add("playing");
      }).catch(() => { /* autoplay diblokir, user bisa tap tombol musik */ });
    }

    // 1) Tampilkan tirai dalam posisi TERTUTUP menutupi opening screen,
    //    lalu langsung sembunyikan opening screen di baliknya.
    curtainLeft.style.display = "block";
    curtainRight.style.display = "block";
    // paksa reflow supaya transisi berikutnya benar-benar dianimasikan
    void curtainLeft.offsetWidth;
    cover.style.display = "none";

    // 2) Jeda sejenak agar tirai tertutup sempat terlihat, baru terbuka
    setTimeout(() => {
      document.body.classList.add("curtain-open");
    }, 350);

    // 3) Setelah animasi buka selesai, sembunyikan tirai & aktifkan scroll
    setTimeout(() => {
      curtainLeft.style.display = "none";
      curtainRight.style.display = "none";
      document.body.classList.remove("locked");
    }, 350 + 1350);
  });
}

/* ---------------------------------------------------------
   Animasi hujan salju (canvas)
   --------------------------------------------------------- */
function initSnow(){
  const canvas = document.getElementById("snow-canvas");
  const ctx = canvas.getContext("2d");
  let flakes = [];
  let width, height;

  function resize(){
    const stage = document.querySelector(".stage");
    width = canvas.width = stage.offsetWidth || Math.min(window.innerWidth, 480);
    height = canvas.height = window.innerHeight;
  }

  function makeFlakes(){
    const count = Math.round(width / 10);
    flakes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.6 + 1,
      speed: Math.random() * 0.8 + 0.4,
      drift: Math.random() * 0.6 - 0.3,
      opacity: Math.random() * 0.5 + 0.4
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    flakes.forEach(f => {
      ctx.beginPath();
      ctx.globalAlpha = f.opacity;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      f.y += f.speed;
      f.x += f.drift;
      if (f.y > height){ f.y = -4; f.x = Math.random() * width; }
      if (f.x > width) f.x = 0;
      if (f.x < 0) f.x = width;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  resize();
  makeFlakes();
  window.addEventListener("resize", () => { resize(); makeFlakes(); });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) requestAnimationFrame(draw);
}

/* ---------------------------------------------------------
   Tombol musik
   --------------------------------------------------------- */
function initMusic(){
  const btn = document.getElementById("musicToggle");
  const music = document.getElementById("bgMusic");
  btn.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => {});
      btn.classList.add("playing");
    } else {
      music.pause();
      btn.classList.remove("playing");
    }
  });
}

/* ---------------------------------------------------------
   Countdown menuju Pemberkatan
   --------------------------------------------------------- */
function initCountdown(){
  const target = new Date(CONFIG.WEDDING_DATE).getTime();
  const els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs")
  };
  function tick(){
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.d.textContent = String(d).padStart(2, "0");
    els.h.textContent = String(h).padStart(2, "0");
    els.m.textContent = String(m).padStart(2, "0");
    els.s.textContent = String(s).padStart(2, "0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   Galeri Foto1.jpg .. Foto12.jpg + lightbox
   --------------------------------------------------------- */
let galleryImages = [];
let lbIndex = 0;

function initGallery(){
  const grid = document.getElementById("galleryGrid");
  galleryImages = Array.from({ length: CONFIG.GALLERY_COUNT }, (_, i) => `assets/images/Foto${i + 1}.jpg`);

  grid.innerHTML = galleryImages.map((src, i) =>
    `<div class="photo-frame reveal reveal-delay-${(i % 3) + 1}" data-index="${i}"><img class="parallax-img" src="${src}" alt="Foto prewedding ${i + 1}" loading="lazy"></div>`
  ).join("");

  grid.addEventListener("click", (e) => {
    const frame = e.target.closest(".photo-frame");
    if (frame) {
      lbIndex = Number(frame.dataset.index);
      openLightbox();
    }
  });

  const lightbox = document.getElementById("lightbox");
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbPrev").addEventListener("click", () => nav(-1));
  document.getElementById("lbNext").addEventListener("click", () => nav(1));
  lightbox.addEventListener("click", (e) => { if (e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") nav(-1);
    if (e.key === "ArrowRight") nav(1);
  });

  function openLightbox(){
    document.getElementById("lbImage").src = galleryImages[lbIndex];
    lightbox.classList.add("show");
  }
  function closeLightbox(){ lightbox.classList.remove("show"); }
  function nav(dir){
    lbIndex = (lbIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById("lbImage").src = galleryImages[lbIndex];
  }
}

/* ---------------------------------------------------------
   Animasi Saat Scroll: Fade-Up Smooth + Parallax Effect
   --------------------------------------------------------- */
function initScrollAnimations(){
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll(".reveal");

  // 1) Fade-Up Smooth — muncul perlahan dari bawah saat masuk viewport
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  // 2) Parallax Effect — foto bergerak sedikit lebih lambat dari teks saat di-scroll
  const parallaxEls = document.querySelectorAll(".parallax-img");
  if (!prefersReduced && parallaxEls.length) {
    let ticking = false;
    function updateParallax(){
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return; // skip yang jauh di luar layar
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) * 0.06;
        el.style.transform = `translateY(${offset}px) scale(1.12)`;
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }
}

/* ---------------------------------------------------------
   Salin nomor rekening
   --------------------------------------------------------- */
function initCopyButtons(){
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      const original = btn.textContent;
      btn.textContent = "Tersalin!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = original; btn.classList.remove("copied"); }, 1800);
    });
  });
}

/* ---------------------------------------------------------
   Ucapan & Doa — disimpan bersama via JSONBin
   --------------------------------------------------------- */
function isJsonbinConfigured(){
  return CONFIG.JSONBIN_BIN_ID && !CONFIG.JSONBIN_BIN_ID.startsWith("PASTE_")
      && CONFIG.JSONBIN_API_KEY && !CONFIG.JSONBIN_API_KEY.startsWith("PASTE_");
}

const LOCAL_WISHES_KEY = "cv_wishes_local_v1";
function getLocalWishes(){
  try { return JSON.parse(localStorage.getItem(LOCAL_WISHES_KEY) || "[]"); }
  catch(e){ return []; }
}
function setLocalWishes(list){
  localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(list));
}

async function fetchWishes(){
  if (!isJsonbinConfigured()) return getLocalWishes();
  const res = await fetch(`${JSONBIN_BASE}/latest`, {
    headers: {
      "X-Master-Key": CONFIG.JSONBIN_API_KEY,
      "X-Bin-Meta": "false"
    }
  });
  if (!res.ok) throw new Error("Gagal memuat ucapan");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function saveWishes(list){
  if (!isJsonbinConfigured()) { setLocalWishes(list); return; }
  const res = await fetch(JSONBIN_BASE, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": CONFIG.JSONBIN_API_KEY
    },
    body: JSON.stringify(list)
  });
  if (!res.ok) throw new Error("Gagal mengirim ucapan");
  return res.json();
}

function renderWishes(list){
  const wrap = document.getElementById("wishList");
  if (!list.length) {
    wrap.innerHTML = `<p class="wish-empty">Jadilah yang pertama mengirim ucapan &amp; doa 💛</p>`;
    return;
  }
  const sorted = [...list].sort((a, b) => (b.time || 0) - (a.time || 0));
  wrap.innerHTML = sorted.map(w => `
    <div class="wish-item">
      <span class="wish-name">${escapeHtml(w.name)}</span>
      <span class="wish-status">${escapeHtml(w.status || "")}</span>
      <div class="wish-text">${escapeHtml(w.message)}</div>
    </div>
  `).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function initWishes(){
  const wrap = document.getElementById("wishList");
  const form = document.getElementById("wishForm");
  const submitBtn = document.getElementById("wishSubmitBtn");

  if (!isJsonbinConfigured()) {
    const notice = document.createElement("div");
    notice.className = "wish-notice";
    notice.innerHTML = `Mode lokal aktif: ucapan hanya tersimpan di perangkat ini.
      Agar ucapan tampil ke <b>semua tamu</b>, pemilik undangan perlu mengisi
      <code>JSONBIN_BIN_ID</code> &amp; <code>JSONBIN_API_KEY</code> di <code>script.js</code>.`;
    form.parentNode.insertBefore(notice, form);
  }

  fetchWishes()
    .then(renderWishes)
    .catch(() => { wrap.innerHTML = `<p class="wish-empty">Gagal memuat ucapan. Muat ulang halaman.</p>`; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("wishName").value.trim();
    const status = document.getElementById("wishStatus").value;
    const message = document.getElementById("wishMessage").value.trim();
    if (!name || !message) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Mengirim...";
    try {
      const current = await fetchWishes();
      current.push({ name, status, message, time: Date.now() });
      await saveWishes(current);
      renderWishes(current);
      form.reset();
    } catch (err) {
      alert("Maaf, ucapan gagal terkirim. Silakan coba lagi.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Ucapan";
    }
  });
}
