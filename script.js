/* 동작 코드 - 평소엔 건드릴 필요 없어요. 앨범/곡 내용은 data.js에서 수정하세요. */
const $ = s => document.querySelector(s);
const grad = c => `linear-gradient(135deg, ${c[0]}, ${c[1]})`;
// 사진이 없거나 경로가 틀려도 색 그라데이션이 대신 보이도록 겹쳐서 지정
const bgOf = a => (a.cover ? `url('${a.cover}'), ` : "") + grad(a.colors);
const trackBg = (t, a) => t.img ? `url('${t.img}'), ${bgOf(a)}` : bgOf(a);
const ytId = u => { const m = (u||"").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };

/* --- 목록 + 장르 필터 --- */
let genre = "전체";
function renderFilters(){
  const genres = ["전체", ...new Set(albums.map(a => a.genre))];
  $("#filters").innerHTML = genres.map(g =>
    `<button class="${g===genre?'on':''}" data-g="${g}">${g}</button>`).join("");
  $("#filters").querySelectorAll("button").forEach(b => b.onclick = () => { genre = b.dataset.g; renderFilters(); renderGrid(); });
}
function renderGrid(){
  $("#grid").innerHTML = albums.filter(a => genre==="전체" || a.genre===genre).map(a => `
    <a class="card" href="#${a.id}">
      <div class="cover" style="background-image:${bgOf(a)}"></div>
      <h3>${a.title}</h3><p>${a.artist}</p>
    </a>`).join("");
}

/* --- 앨범 상세 --- */
let cur = null, list = [], idx = 0;
function renderDetail(a){
  cur = a;
  $("#heroBg").style.backgroundImage = bgOf(a);
  $("#heroCover").style.backgroundImage = bgOf(a);
  $("#dTitle").textContent = a.title;
  $("#dMeta").textContent = `${a.artist} · ${a.year} · ${a.genre}`;
  $("#dDesc").textContent = a.desc;
  list = [...a.tracks].sort((x,y) => (y.main?1:0) - (x.main?1:0)); // 대표곡 먼저
  $("#trackList").innerHTML = list.map((t,i) => `
    <li data-i="${i}" tabindex="0" role="button" class="${ytId(t.url)?'':'nolink'}">
      <span class="play">▶</span><span class="name">${t.t}</span>
      ${t.main?'<span class="badge">대표곡</span>':''}<span class="len">${t.l||""}</span></li>`).join("");
  $("#trackList").querySelectorAll("li").forEach(li => {
    li.onclick = () => openPlayer(+li.dataset.i);
    li.onkeydown = e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openPlayer(+li.dataset.i); } };
  });
  document.title = `${a.title} - ${site.title}`;
}

/* --- 재생 화면 (유튜브 영상은 숨기고 소리 + 진행바만 사용) --- */
let hintTimer = null, yt = null, apiReady = false, pendingId = null, dragging = false, timer = null;
const fmt = s => { s = Math.max(0, Math.floor(s||0)); return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0"); };

window.onYouTubeIframeAPIReady = () => { apiReady = true; if(pendingId) loadVideo(pendingId); };

function loadVideo(id){
  if(!apiReady){ pendingId = id; return; }
  pendingId = null;
  if(yt){ yt.loadVideoById(id); return; }
  yt = new YT.Player("pYT", {
    width:"200", height:"200", videoId:id,
    playerVars:{ autoplay:1, playsinline:1, rel:0 },
    events:{
      onReady: e => e.target.playVideo(),
      onStateChange: e => {
        const playing = e.data === 1;
        $("#player").classList.toggle("playing", playing);   // 재생 중일 때만 원반이 돌아감
        if(playing) showMsg("");
        $("#pToggle").textContent = playing ? "❚❚" : "▶";
        if(playing) startTick(); else if(e.data !== 3) stopTick();
        if(e.data === 0 && list.length > 1) openPlayer(idx + 1);   // 끝나면 다음 곡
      },
      onError: e => {
        const c = e.data;
        if(c === 153 || c === 152) showMsg("파일로 직접 연 화면에서는 재생이 안 돼요. Live Server나 GitHub 주소로 열어 주세요.");
        else if(c === 101 || c === 150) showMsg("이 영상은 올린 사람이 외부 재생을 막아뒀어요. 다른 영상 링크로 바꿔 주세요.");
        else if(c === 2 || c === 100) showMsg("영상 링크를 찾을 수 없어요. 주소가 맞는지 확인해 주세요.");
        else showMsg("이 영상을 재생할 수 없어요. (오류 " + c + ")");
      }
    }
  });
}
function showMsg(m){ $("#pMsg").textContent = m; $("#pMsg").hidden = !m; }
function startTick(){ stopTick(); timer = setInterval(tick, 120); tick(); }
function stopTick(){ clearInterval(timer); }
function tick(){
  if(!yt || !yt.getDuration || dragging) return;
  const d = yt.getDuration() || 0, c = yt.getCurrentTime() || 0;
  $("#pCur").textContent = fmt(c); $("#pDur").textContent = fmt(d);
  setBar(d ? c/d*1000 : 0);
  updateLyrics(c);
}
function setBar(v){ $("#pBar").value = v; $("#pBar").style.setProperty("--p", (v/10) + "%"); }

function openPlayer(i){
  idx = (i + list.length) % list.length;
  const t = list[idx], id = ytId(t.url);
  $("#pBg").style.backgroundImage = trackBg(t, cur);     // 뒷배경: 흐릿하게
  $("#pCover").style.backgroundImage = trackBg(t, cur);  // 가운데: 선명하게
  $("#pTitle").textContent = t.t;
  $("#pArtist").textContent = cur.artist;
  setBar(0); $("#pCur").textContent = "0:00"; $("#pDur").textContent = t.l || "0:00";
  $("#pToggle").textContent = "▶";
  $("#player").classList.remove("playing");
  try{                                                   // 원반/가사에 문제가 생겨도 음악 재생은 계속되게
    $("#pDiscLabel").style.backgroundImage = trackBg(t, cur);   // 원반 가운데 라벨
    setLyrics(t);
  }catch(err){ console.error(err); }
  $("#player").classList.add("open");
  document.body.classList.add("lock");
  if(id){
    showMsg(""); loadVideo(id);
    clearTimeout(hintTimer);                             // 3초 안에 재생이 안 시작되면 ▶ 누르라고 안내
    hintTimer = setTimeout(() => {
      if($("#player").classList.contains("open") && !$("#player").classList.contains("playing") && !$("#pMsg").textContent)
        showMsg("재생이 시작되지 않았어요. ▶ 버튼을 눌러 주세요.");
    }, 3000);
  }
  else { showMsg("이 곡은 아직 유튜브 링크가 없어요. data.js에서 url을 추가해 주세요."); if(yt) yt.stopVideo(); }
}
function closePlayer(){
  $("#player").classList.remove("open", "playing");
  document.body.classList.remove("lock");
  stopTick();
  if(yt && yt.stopVideo) yt.stopVideo();
}
$("#pClose").onclick = closePlayer;
$("#pLogo").onclick = closePlayer;
$("#pPrev").onclick = () => openPlayer(idx - 1);
$("#pNext").onclick = () => openPlayer(idx + 1);
$("#pToggle").onclick = () => {
  if(!yt || !yt.getPlayerState) return;
  yt.getPlayerState() === 1 ? yt.pauseVideo() : yt.playVideo();
};
$("#pBar").addEventListener("input", e => { dragging = true; setBar(+e.target.value);
  if(yt && yt.getDuration){ const tt = yt.getDuration() * e.target.value / 1000; $("#pCur").textContent = fmt(tt); updateLyrics(tt); } });
$("#pBar").addEventListener("change", e => { dragging = false;
  if(yt && yt.seekTo){ const tt = yt.getDuration() * e.target.value / 1000; yt.seekTo(tt, true); updateLyrics(tt); } });
document.addEventListener("keydown", e => { if(e.key==="Escape") closePlayer(); });


/* --- 가사 (싱크) --- */
let curLines = [], lyIdx = -2, lyOff = 0;
const esc = x => x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// "[00:12.50] 가사" 형식(LRC)을 [{t:시간(초), text}] 로 바꿈. 시간이 하나도 없으면 그냥 텍스트로 보여줌
function parseLRC(src){
  const timed = [], plain = [];
  src.split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if(!line || /^\[(ar|ti|al|by|offset|length|re|ve):/i.test(line)) return;
    const stamps = [...line.matchAll(/\[(\d+):(\d+(?:[.:]\d+)?)\]/g)];
    const text = line.replace(/\[[^\]]*\]/g, "").trim();
    if(stamps.length) stamps.forEach(m => timed.push({ t: +m[1]*60 + parseFloat(m[2].replace(":", ".")), text }));
    else plain.push({ t: null, text: line });
  });
  return timed.length ? timed.sort((a,b) => a.t - b.t) : plain;
}
function setLyrics(t){
  curLines = parseLRC(t.lyrics || "");
  lyOff = t.lyricOffset || 0;
  lyIdx = -2;
  const box = $("#pLyrics"), el = $("#pLines");
  el.style.transform = "";
  if(!curLines.length){
    box.classList.add("plain");
    el.innerHTML = `<p class="ly-empty">가사가 없어요</p>`;
    return;
  }
  box.classList.toggle("plain", curLines[0].t === null);
  el.innerHTML = curLines.map((l,i) => `<p class="ly" data-i="${i}">${esc(l.text) || "♪"}</p>`).join("");
  el.querySelectorAll(".ly").forEach(p => p.onclick = () => {      // 가사를 누르면 그 부분으로 이동
    const l = curLines[+p.dataset.i];
    if(l.t !== null && yt && yt.seekTo){ yt.seekTo(Math.max(0, l.t - lyOff), true); updateLyrics(l.t - lyOff); }
  });
  placeLyrics(0);
}
function placeLyrics(i){
  const box = $("#pLyrics"), el = $("#pLines"), line = el.children[Math.max(i, 0)];
  if(!line || box.classList.contains("plain")) return;
  el.style.transform = `translateY(${box.clientHeight/2 - (line.offsetTop + line.offsetHeight/2)}px)`;
}
function updateLyrics(time){
  if(!curLines.length || curLines[0].t === null) return;
  const t = time + lyOff;
  let idx = -1;
  for(let i = 0; i < curLines.length; i++){ if(curLines[i].t <= t) idx = i; else break; }
  if(idx === lyIdx) return;
  lyIdx = idx;
  const kids = $("#pLines").children;
  for(let i = 0; i < kids.length; i++) kids[i].classList.toggle("active", i === idx);
  placeLyrics(idx);                                    // 한 줄 끝날 때마다 한 줄씩 위로
}
window.addEventListener("resize", () => placeLyrics(lyIdx));

/* --- 주소(#앨범id)에 따라 화면 전환 --- */
let wasDetail = false, routeTimer = null;
const jump = y => window.scrollTo({ top: y, behavior: "instant" });
function route(){
  closePlayer();
  clearTimeout(routeTimer);
  const a = albums.find(x => x.id === location.hash.slice(1));
  const detail = $("#detail"), home = $("#home");

  if(a){                                   // 앨범 들어가기: 아래에서 위로 올라오며 나타남
    home.hidden = true; detail.hidden = false; $("#filters").hidden = true;
    detail.classList.remove("leaving", "enter");
    renderDetail(a);
    jump(0);
    void detail.offsetWidth;               // 애니메이션 다시 시작
    detail.classList.add("enter");
    wasDetail = true;
  } else if(wasDetail){                    // 앨범에서 나가기: 반대로 내려가며 사라진 뒤 목록 표시
    document.title = site.title;
    detail.classList.remove("enter");
    detail.classList.add("leaving");
    routeTimer = setTimeout(() => {
      detail.hidden = true; detail.classList.remove("leaving");
      home.hidden = false; $("#filters").hidden = false;
      home.classList.remove("fadein"); void home.offsetWidth; home.classList.add("fadein");
      jump($("#grid").getBoundingClientRect().top + window.scrollY - 70);   // 앨범 목록 위치로
      wasDetail = false;
      onScroll();
    }, 350);
  } else {                                 // 처음 접속
    home.hidden = false; detail.hidden = true; $("#filters").hidden = false;
    document.title = site.title;
    jump(0);
  }
}
window.addEventListener("hashchange", route);

/* --- 첫 화면: 제목/설명/배경 + 스크롤하면 배경이 검정으로 --- */
function applyFont(name, cssVar){
  if(!name) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(name).replace(/%20/g, "+") + "&display=swap";
  document.head.appendChild(link);
  document.documentElement.style.setProperty(cssVar,
    `"${name}", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif`);
}
function setupSite(){
  applyFont(site.fontTitle, "--font-title");
  applyFont(site.fontBody, "--font-body");
  document.querySelector(".logo").textContent = site.title;
  $("#pLogo").textContent = site.title;      // 재생 화면 왼쪽 위 로고: 누르면 그 앨범 화면으로
  $("#siteTitle").textContent = site.title;
  $("#siteDesc").textContent = site.desc;
  $("#homeBg").style.backgroundImage = (site.bg ? `url('${site.bg}'), ` : "") + grad(site.bgColors);
}
function onScroll(){
  const y = window.scrollY, h = window.innerHeight;
  // 스크롤 가능한 길이 안에서 배경이 완전히 검정이 되도록 계산
  const maxScroll = document.documentElement.scrollHeight - h;
  const fadeDist = Math.max(1, Math.min(h * 0.8, maxScroll * 0.8));
  $("#homeBg").style.opacity = Math.max(0, 1 - y / fadeDist);
  $("#introText").style.opacity = Math.max(0, 1 - y / (h * 0.5));
  document.querySelector(".top").classList.toggle("solid", y > h * 0.5);
}
window.addEventListener("scroll", onScroll, {passive:true});
window.addEventListener("resize", onScroll);

function renderTeam(){
  $("#teamGrid").innerHTML = team.map(m => `
    <article class="member">
      <div class="avatar" style="${m.img ? `background-image:url('${m.img}')` : ''}">${m.img ? '' : m.name.charAt(0)}</div>
      <h3>${m.name}</h3>
      <p>${m.role}</p>
    </article>`).join("");
}

setupSite(); renderTeam(); renderFilters(); renderGrid(); route(); onScroll();
