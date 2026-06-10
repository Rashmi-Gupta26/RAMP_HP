// Shared helpers: header markup, carousel, etc.

function renderHeader(active) {
  const items = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'program', label: 'The Program', href: 'program.html' },
    { id: 'institutes', label: 'Institutes', href: 'institutes.html' },
    { id: 'members', label: 'Members', href: 'members.html' },
    { id: 'news', label: 'News', href: 'news.html' },
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'submit', label: 'Submit Idea', href: 'submit.html', cta: true },
  ];
  return `
  <div class="emblem-strip">
    <div class="container">
      <div class="logos">

  <a href="https://himachal.nic.in/" target="_blank">
    <img src="images/himachal-govt-logo.png" alt="Government of Himachal Pradesh">
  </a>

  <a href="https://ramp.msme.gov.in/" target="_blank">
    <img src="images/ramp-logo.png" alt="RAMP">
  </a>

  <a href="https://iitmandicatalyst.in/" target="_blank">
    <img src="images/catalyst-logo.png" alt="IIT Mandi Catalyst">
  </a>

  <a href="https://emerginghimachal.hp.gov.in/" target="_blank">
    <img src="images/hpced-logo.png" alt="HPCED">
  </a>

  <a href="https://startuphimachal.hp.gov.in/" target="_blank">
    <img src="images/Startup-himachal-logo.png" alt="Startup Himachal">
  </a>

  <a href="https://www.worldbank.org/" target="_blank">
    <img src="images/world-bank-logo.jpg" alt="World Bank">
  </a>

</div>
      <div class="gov-line">
        <strong>Department of Industries</strong>
        Government of Himachal Pradesh
      </div>
    </div>
  </div>
  <div class="identity">
    <div class="container">
      <div class="seal"><img src="images/ramp-logo.png" alt=""></div>
      <div>
        <h1 class="name">RAMP — Raising and Accelerating MSME Performance</h1>
        <p class="sub">Himachal Pradesh chapter · Implemented by IIT Mandi Catalyst with HPCED · A World Bank–assisted initiative</p>
      </div>
    </div>
  </div>
  <nav class="nav">
    <div class="container">
      <ul>
        ${items.map(it => `
          <li><a href="${it.href}" class="${it.id===active?'active':''}${it.cta?' cta':''}">${it.label}</a></li>
        `).join('')}
      </ul>
    </div>
  </nav>
  `;
}

function renderFooter() {
  return `
  <footer>
    <div class="container">
      <div>
        <h4>RAMP Himachal Pradesh</h4>
        <p style="color:rgba(255,255,255,0.8); margin-top:4px;">
          A World Bank–assisted initiative of the Ministry of MSME, Government of India,
          implemented in Himachal Pradesh by the Department of Industries with
          IIT Mandi Catalyst as Knowledge Partner.
        </p>
      </div>
      <div>
        <h4>Sections</h4>
        <ul>
          <li><a href="program.html">The Program</a></li>
          <li><a href="institutes.html">Institutes</a></li>
          <li><a href="members.html">Members</a></li>
          <li><a href="news.html">News</a></li>
          <li><a href="dashboard.html">Government Dashboard</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li>IIT Mandi Catalyst</li>
          <li>Kamand Campus, Mandi 175005</li>
          <li>catalyst@iitmandi.ac.in</li>
          <li>+91 1905 267028</li>
        </ul>
      </div>
    </div>
    <div class="container">
      <div class="copy">
        © ${new Date().getFullYear()} Department of Industries, Government of Himachal Pradesh · All rights reserved
      </div>
    </div>
  </footer>
  `;
}

function mountChrome(active) {
  const head = document.getElementById('site-header');
  const foot = document.getElementById('site-footer');
  if (head) head.innerHTML = renderHeader(active);
  if (foot) foot.innerHTML = renderFooter();
  ensureSubmitLightbox();
  bindSubmitTriggers();
}

// ===== Zoho lightbox form (Submit your idea) =====
// Inject the lightbox container + open function on every page so any
// "Submit your idea" button opens the form directly without navigating.
function ensureSubmitLightbox() {
  if (window.__rampSubmitLightboxReady) return;
  window.__rampSubmitLightboxReady = true;

  // styles
  const css = `
    .zf_lB_Dimmer_981025{position:fixed;top:0;left:0;right:0;bottom:0;background:#000;opacity:.8;z-index:10000000;}
    .zf_lB_Container_981025{position:fixed;background:#fff;margin:0;padding:0;height:4368px;width:70%;top:50%;left:50%;margin-right:-50%;transform:translate(-50%,-50%);max-height:calc(100% - 60px);z-index:999999;transition:height .5s ease;outline:none;border-radius:10px;overflow:hidden;}
    .zf_lB_Wrapper_981025{position:fixed;top:50%;left:50%;margin-left:0;margin-top:-180px;z-index:10000001;}
    .zf_main_id_981025{height:calc(100% - 0px);display:flex;overflow-y:auto;overflow-x:hidden;}
    .zf_lb_closeform_981025{position:absolute;right:-20px;background:#2f2e2e;padding:0;border-radius:50%;width:34px;height:34px;top:-15px;cursor:pointer;border:2px solid #d9d9d9;}
    .zf_lb_closeform_981025:before,.zf_lb_closeform_981025:after{position:absolute;left:16px;content:' ';height:19px;width:2px;top:7px;background:#f7f7f7;}
    .zf_lb_closeform_981025:before{transform:rotate(45deg);}
    .zf_lb_closeform_981025:after{transform:rotate(-45deg);}
    @media screen and (max-width:380px){.zf_lB_Container_981025{width:90% !important;}}
    @media screen and (min-width:381px) and (max-width:480px){.zf_lB_Container_981025{width:92% !important;}}
    @media screen and (min-width:481px) and (max-width:700px){.zf_lB_Container_981025{width:88% !important;}}
    @media screen and (min-width:701px) and (max-width:900px){.zf_lB_Container_981025{width:80% !important;}}
    @media screen and (min-width:901px) and (max-width:1268px){.zf_lB_Container_981025{width:75% !important;}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // container
  const iframeDiv = document.createElement('div');
  iframeDiv.id = 'ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g_981025';
  iframeDiv.className = 'zf_main_id_981025';

  const closeFormDiv = document.createElement('div');
  closeFormDiv.id = 'deleteform_981025';
  closeFormDiv.className = 'zf_lb_closeform_981025';
  closeFormDiv.setAttribute('tabindex', '0');

  const containerDiv = document.createElement('div');
  containerDiv.id = 'containerDiv_981025';
  containerDiv.className = 'zf_lB_Container_981025';
  containerDiv.appendChild(iframeDiv);
  containerDiv.appendChild(closeFormDiv);

  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = 'zf_lB_Wrapper_981025';
  wrapperDiv.appendChild(containerDiv);

  const dimmerDiv = document.createElement('div');
  dimmerDiv.className = 'zf_lB_Dimmer_981025';
  dimmerDiv.setAttribute('elname', 'popup_box');

  const mainDiv = document.createElement('div');
  mainDiv.id = 'formsLightBox_981025';
  mainDiv.style.display = 'none';
  mainDiv.appendChild(wrapperDiv);
  mainDiv.appendChild(dimmerDiv);

  document.body.appendChild(mainDiv);

  // listeners
  closeFormDiv.addEventListener('click', deleteZForm_981025);
  closeFormDiv.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13 || event.key === ' ' || event.keyCode === 32) {
      event.preventDefault();
      deleteZForm_981025();
    }
  });
  dimmerDiv.addEventListener('click', deleteZForm_981025);

  window.addEventListener('message', function (event) {
    const evntData = event.data;
    if (evntData && evntData.constructor === String) {
      const zf_ifrm_data = evntData.split('|');
      if (zf_ifrm_data.length === 2 || zf_ifrm_data.length === 3) {
        const zf_perma = zf_ifrm_data[0];
        const zf_ifrm_ht_nw = (parseInt(zf_ifrm_data[1], 10) + 15) + 'px';
        const wrap = document.getElementById('ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g_981025');
        if (!wrap) return;
        const iframe = wrap.getElementsByTagName('iframe')[0];
        if (iframe && iframe.src.indexOf('formperma') > 0 && iframe.src.indexOf(zf_perma) > 0) {
          const prevH = iframe.style.height;
          let zf_tout = false;
          if (zf_ifrm_data.length === 3) { iframe.scrollIntoView(); zf_tout = true; }
          if (prevH !== zf_ifrm_ht_nw) {
            const apply = function () {
              iframe.style.minHeight = zf_ifrm_ht_nw;
              const c = document.getElementById('containerDiv_981025');
              if (c) c.style.height = zf_ifrm_ht_nw;
            };
            if (zf_tout) setTimeout(apply, 500); else apply();
          }
        }
      }
    }
  }, false);
}

function getsrcurlZForm_981025(zf_src) {
  try {
    if (!(new RegExp('[?&]referrername=')).test(zf_src)) {
      let rfr = window.location.href;
      try {
        rfr = window.self !== window.top
          ? window.top.location.href
          : (/^https?:\/\/[\w.-]+\.[a-zA-Z]{2,}/i.test(rfr) ? rfr : '');
      } catch (e) {}
      if (rfr) {
        if (rfr.length > 1800) {
          const qi = rfr.indexOf('?');
          if (qi > -1) rfr = rfr.substring(0, qi);
          if (rfr.length > 1800) rfr = rfr.substring(0, 1800);
        }
        zf_src += (zf_src.indexOf('?') > 0 ? '&' : '?') + 'referrername=' + encodeURIComponent(rfr);
      }
    }
  } catch (e) {}
  return zf_src;
}

function loadZForm_981025() {
  const wrap = document.getElementById('ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g_981025');
  if (!wrap) return;
  const existing = wrap.getElementsByTagName('iframe')[0];
  if (existing) return;
  const f = document.createElement('iframe');
  f.src = getsrcurlZForm_981025('https://forms.zohopublic.in/documents1/form/rampprogramregistration/formperma/ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g?zf_rszfm=1');
  f.style.border = 'none';
  f.style.minWidth = '100%';
  f.style.overflow = 'hidden';
  wrap.appendChild(f);
}

function showZForm_981025() {
  ensureSubmitLightbox();
  loadZForm_981025();
  const box = document.getElementById('formsLightBox_981025');
  if (box) box.style.display = 'block';
  document.body.style.overflow = 'hidden';
  setTimeout(function () {
    const c = document.getElementById('containerDiv_981025');
    if (c) { c.setAttribute('tabindex', '-1'); c.focus(); }
  }, 100);
}

function deleteZForm_981025() {
  const box = document.getElementById('formsLightBox_981025');
  if (box) box.style.display = 'none';
  document.body.style.overflow = '';
  const wrap = document.getElementById('ctfU9L6P8jDev-Ru43Ib0SkLSw4dlcSHksoS3a2lC6g_981025');
  if (!wrap) return;
  const iframe = wrap.getElementsByTagName('iframe')[0];
  if (iframe) iframe.remove();
}

// expose for inline onclick fallbacks
window.showZForm_981025 = showZForm_981025;
window.deleteZForm_981025 = deleteZForm_981025;

// Bind every "Submit your idea" affordance to open the lightbox directly
// instead of navigating to submit.html.
function bindSubmitTriggers() {
  const selectors = [
    'a[href="submit.html"]',
    'a[href$="/submit.html"]',
    '[data-submit-idea]'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(function (el) {
    if (el.__rampSubmitBound) return;
    el.__rampSubmitBound = true;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showZForm_981025();
    });
  });
}

// ===== Carousel =====
function initCarousel(rootEl, opts = { interval: 4500 }) {
  const slides = rootEl.querySelectorAll('.slide');
  const dotsWrap = rootEl.querySelector('.dots');
  if (!slides.length) return;
  slides.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.onclick = () => go(i);
    dotsWrap.appendChild(dot);
  });
  let cur = 0;
  function go(i) {
    slides[cur].classList.remove('active');
    dotsWrap.children[cur].classList.remove('active');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dotsWrap.children[cur].classList.add('active');
  }
  setInterval(() => go(cur + 1), opts.interval);
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}
