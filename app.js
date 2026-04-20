(function(){
  const EVENT_ISO = '2025-11-01T09:00:00+09:00';
  const COMMENT_KEY = 'ghs_comments_v2';
  const eventDate = new Date(EVENT_ISO);

  const shareBtn = document.getElementById('shareX');
  if (shareBtn) {
    const text = document.title || '血洗いの池 〜残穢〜';
    const intent = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(location.href);
    shareBtn.href = intent;
    shareBtn.target = '_blank';
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  const hand = document.getElementById('hand');
  let handTimer = null;
  let isVisible = false;
  let canTrigger = true;
  function hideHand(){
    if(!hand || !isVisible) return;
    isVisible = false;
    hand.style.bottom = '-280px';
  }
  function showHand(){
    if(!hand || isVisible) return;
    isVisible = true;
    hand.style.bottom = '24px';
    clearTimeout(handTimer);
    handTimer = setTimeout(hideHand, 2600);
  }
  function onScroll(){
    const y = window.scrollY || document.documentElement.scrollTop;
    if(y <= 90){
      canTrigger = true;
      hideHand();
      return;
    }
    if(y > 140 && canTrigger){
      canTrigger = false;
      showHand();
    }
  }
  addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const cdDate = document.getElementById('cd-date');
  const status = document.getElementById('event-status');
  const message = document.getElementById('countdown-message');
  const elD = document.getElementById('cd-d');
  const elH = document.getElementById('cd-h');
  const elM = document.getElementById('cd-m');
  const elS = document.getElementById('cd-s');

  function pad(n){ return String(n).padStart(2, '0'); }
  function formatDate(d){
    const w = ['日','月','火','水','木','金','土'][d.getDay()];
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 (${w}) ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if(cdDate) cdDate.textContent = formatDate(eventDate);

  function updateCountdown(){
    const now = new Date();
    let diff = eventDate.getTime() - now.getTime();
    const isPast = diff <= 0;
    if(isPast) diff = 0;
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if(elD) elD.textContent = String(days);
    if(elH) elH.textContent = pad(hours);
    if(elM) elM.textContent = pad(minutes);
    if(elS) elS.textContent = pad(seconds);

    if(isPast){
      if(status) status.textContent = 'このページは2025年の文化祭企画アーカイブとして閲覧できる。';
      if(message) message.textContent = '開催は終了している。次回用に使う場合は app.js の EVENT_ISO を変更すれば、そのまま再利用できる。';
    } else {
      if(status) status.textContent = '開催前ページとして閲覧できる。来場前の確認用にどうぞ。';
      if(message) message.textContent = '開催までの残り時間を表示中。';
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const form = document.getElementById('c-form');
  const textEl = document.getElementById('c-text');
  const shareEl = document.getElementById('c-share');
  const listEl = document.getElementById('c-list');
  const errorEl = document.getElementById('c-error');
  const okEl = document.getElementById('c-ok');

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }
  function randomName(){
    const pool = ['名無し','通りすがり','池の住人','目撃者','勇者','迷い人','震え声','観測者','影'];
    return pool[Math.floor(Math.random() * pool.length)] + '#' + Math.floor(100 + Math.random() * 900);
  }
  function loadComments(){
    try {
      return JSON.parse(localStorage.getItem(COMMENT_KEY) || '[]');
    } catch (_) {
      return [];
    }
  }
  function saveComments(items){
    localStorage.setItem(COMMENT_KEY, JSON.stringify(items.slice(0, 100)));
  }
  function formatTime(ts){
    const d = new Date(ts);
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function cleanText(str){
    let t = String(str || '').trim();
    ['死ね', '殺す', '通報'].forEach(word => {
      t = t.replace(new RegExp(word, 'gi'), '※');
    });
    return t;
  }
  function renderComments(){
    if(!listEl) return;
    const items = loadComments();
    if(items.length === 0){
      listEl.innerHTML = '<div class="comment-item"><p class="comment-text">まだコメントはない。</p></div>';
      return;
    }
    listEl.innerHTML = items.map(item => (
      '<article class="comment-item">' +
      `<p class="comment-text">${escapeHtml(item.text)}</p>` +
      `<div class="comment-meta">${escapeHtml(item.name)} ・ ${escapeHtml(formatTime(item.ts))}</div>` +
      '</article>'
    )).join('');
  }

  renderComments();

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(errorEl) errorEl.textContent = '';
      if(okEl) okEl.textContent = '';

      const value = cleanText(textEl ? textEl.value : '');
      if(!value){
        if(errorEl) errorEl.textContent = '本文が空です。';
        return;
      }

      const items = loadComments();
      items.unshift({ name: randomName(), text: value, ts: Date.now() });
      saveComments(items);
      renderComments();
      if(textEl) textEl.value = '';
      if(okEl) okEl.textContent = '投稿しました。';

      if(shareEl && shareEl.checked){
        const intent = 'https://x.com/intent/tweet?text=' + encodeURIComponent('【血洗いの池 〜残穢〜】' + value) + '&url=' + encodeURIComponent(location.href);
        window.open(intent, '_blank', 'noopener');
      }
    });
  }
})();
