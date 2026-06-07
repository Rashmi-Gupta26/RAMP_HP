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
