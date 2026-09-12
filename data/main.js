/**
 * Renders every dynamic section from the data/*.js globals, then initializes the
 * plugins that depend on that markup (AOS, Owl carousels, skill bars).
 *
 * Containers are addressed by explicit id — never by Bootstrap class chains, which
 * break silently when the layout is edited.
 */

// Escape text that is interpolated into markup, so a stray < or & in the data
// can never break the DOM.
function escapeHTML(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Function to render navigation
function renderNavigation() {
  const navbar = document.getElementById('navbar-links');
  const brandElement = document.getElementById('navbar-brand-text');
  const ctaButton = document.getElementById('navbar-cta');

  // Render brand
  if (brandElement) {
    brandElement.textContent = navigationData.brand.text;
  }

  // Render nav items
  if (navbar) {
    navbar.innerHTML = navigationData.navItems.map(item =>
      `<a href="${escapeHTML(item.href)}" class="${escapeHTML(item.class)}">${escapeHTML(item.text)}</a>`
    ).join('');
  }

  // Render CTA button
  if (ctaButton) {
    ctaButton.href = navigationData.ctaButton.href;
    ctaButton.textContent = navigationData.ctaButton.text;
    ctaButton.setAttribute('target', '_blank');
    ctaButton.setAttribute('rel', 'noopener');
  }
}

// Function to render about section
function renderAboutSection() {
  const nameElement = document.getElementById('about-name');
  const titleElement = document.getElementById('about-title');
  const descriptionElement = document.getElementById('about-description');

  if (nameElement) nameElement.textContent = `Hey, I'm ${socialData.profileInfo.name}`;
  if (titleElement) titleElement.textContent = socialData.profileInfo.title;
  if (descriptionElement) descriptionElement.textContent = socialData.profileInfo.description;

  // Render social buttons
  const buttonsDiv = document.getElementById('about-social');
  if (buttonsDiv) {
    buttonsDiv.innerHTML = socialData.socialLinks.map(link => {
      const icon = link.isIconify
        ? `<iconify-icon icon="${escapeHTML(link.icon)}" class="mr-2" aria-hidden="true"></iconify-icon>`
        : `<i class="${escapeHTML(link.icon)} mr-2" aria-hidden="true"></i>`;
      return `<a href="${escapeHTML(link.href)}" target="_blank" rel="noopener" class="${escapeHTML(link.class)}" data-aos="fade-${link.text === 'Github' ? 'left' : 'right'}">
                  ${icon}${escapeHTML(link.text)}
              </a>`;
    }).join('');
  }
}

// Function to render education
function renderEducation() {
  const educationContainer = document.getElementById('education-list');
  if (educationContainer) {
    // PERF: lazy loading + async decoding + explicit dimensions to reduce CLS/TBT.
    educationContainer.innerHTML = educationData.map(edu => {
      const size = edu.logoSize || 20;
      const institution = `<strong> ${escapeHTML(edu.institution)}</strong>`;
      // An empty institutionLink renders as plain text instead of a dead link.
      const institutionMarkup = edu.institutionLink
        ? `<a style="color: gray;" href="${escapeHTML(edu.institutionLink)}"${edu.institutionLink.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${institution}</a>`
        : `<span style="color: gray;">${institution}</span>`;
      return `
      <div class="position-relative mb-4">
        <iconify-icon icon="mdi:circle-slice-8" class="text-primary position-absolute" style="top: 2px; left: -32px; font-size: 14px;" aria-hidden="true"></iconify-icon>
        <h5 class="font-weight-bold mb-1" data-aos="fade-right" data-aos-delay="400">
          ${escapeHTML(edu.degree)}${edu.status ? `<i style="font-family: 'Caveat';"> ${escapeHTML(edu.status)}</i>` : ''}
          ${edu.specialization ? `<br><span class="font-weight-medium mb-1 form-control-sm">(${escapeHTML(edu.specialization)})</span>` : ''}
        </h5>
        <p class="mb-2" data-aos="fade-down" data-aos-delay="550">
          <img src="${escapeHTML(edu.institutionLogo)}" width="${size}" height="${size}" loading="lazy" decoding="async" alt="${escapeHTML(edu.institution)} logo">
          ${institutionMarkup} | <small>${escapeHTML(edu.duration)}</small>
        </p>
        ${edu.description ? `<p data-aos="fade-down" data-aos-delay="700">${escapeHTML(edu.description)}</p>` : ''}
      </div>
    `;
    }).join('');
  }
}

// Function to render experience
function renderExperience() {
  const experienceContainer = document.getElementById('experience-list');
  if (experienceContainer) {
    // PERF: lazy loading + async decoding + explicit dimensions to reduce CLS/TBT.
    experienceContainer.innerHTML = experienceData.map(exp => `
      <div class="position-relative mb-4">
        <iconify-icon icon="mdi:circle-slice-8" class="text-primary position-absolute" style="top: 2px; left: -32px; font-size: 14px;" aria-hidden="true"></iconify-icon>
        <h5 class="font-weight-bold mb-1" data-aos="fade-right" data-aos-delay="400">${escapeHTML(exp.position)}</h5>
        <p class="mb-2" data-aos="fade-right" data-aos-delay="550">
          <img src="${escapeHTML(exp.companyLogo)}" width="${exp.logoWidth || 145}" height="${exp.logoHeight || 25}" loading="lazy" decoding="async" alt="${escapeHTML(exp.company)} logo">
          <strong><a style="color: gray;" href="${escapeHTML(exp.companyLink)}" target="_blank" rel="noopener">${escapeHTML(exp.company)}</a></strong> |
          <small>${escapeHTML(exp.duration)}</small>
        </p>
        <ul style="font-family:'Caveat';">
          ${exp.responsibilities.map((resp, index) =>
            `<li data-aos="fade-down"${index > 0 ? ` data-aos-duration="${1000 + (index * 500)}"` : ''}>${escapeHTML(resp)}</li>`
          ).join('')}
        </ul>
      </div>
    `).join('');
  }
}

// Function to render skills
function renderSkills() {
  const leftSkillContainer = document.getElementById('skills-left');
  const rightSkillContainer = document.getElementById('skills-right');

  function createSkillHTML(skill, index) {
    // No `inline` attribute here: the card centres its icons with flexbox, and the
    // baseline shift `inline` adds pushed each card's title a few pixels out of line.
    const iconHTML = skill.icons.map(icon =>
      `<iconify-icon icon="${escapeHTML(icon.icon)}" style="font-size: ${escapeHTML(icon.size)};" aria-hidden="true"></iconify-icon>`
    ).join('');

    // The meter starts at 0% and is filled by a CSS transition once the section
    // scrolls into view (see animateSkillBars) - no JS per-frame animation.
    return `
      <div class="skill-card" data-aos="fade-up" data-aos-delay="${(index % 3) * 80}">
        <div class="skill-card-top">
          <span class="skill-card-icons">${iconHTML}</span>
          <span class="skill-card-value">${skill.percentage}<i>%</i></span>
        </div>
        <h6 class="skill-card-name">${escapeHTML(skill.name)}</h6>
        <div class="skill-card-meter">
          <span class="skill-card-fill"
                style="width: 0%;"
                role="progressbar"
                data-target-width="${skill.percentage}"
                aria-label="${escapeHTML(skill.name)}"
                aria-valuenow="${skill.percentage}"
                aria-valuemin="0"
                aria-valuemax="100"></span>
        </div>
      </div>
    `;
  }

  if (leftSkillContainer) {
    leftSkillContainer.innerHTML = skillData.leftColumn.map(createSkillHTML).join('');
  }

  if (rightSkillContainer) {
    rightSkillContainer.innerHTML = skillData.rightColumn.map(createSkillHTML).join('');
  }
}

// Function to render projects
function renderProjects() {
  const projectsContainer = document.getElementById('projects-carousel');
  if (projectsContainer) {
    // PERF: intrinsic dimensions + lazy loading to prevent CLS.
    projectsContainer.innerHTML = projectsData.map((project, idx) => `
      <div class="text-center" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
        <div class="card border-0 project-card mx-auto" data-index="${idx}"
             role="button" tabindex="0" aria-label="View details for ${escapeHTML(project.title)}">
          <img src="${escapeHTML(project.image)}" class="card-img-top" alt="${escapeHTML(project.title)} screenshot" width="${project.width}" height="${project.height}" loading="lazy" decoding="async" data-aos="flip-up" data-aos-delay="300" data-aos-duration="1200">
          <div class="card-body mx-auto">
            <h5 class="card-title font-weight-bold" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">${escapeHTML(project.title)}</h5>
            <h6 class="card-description font-weight-bold" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">${escapeHTML(project.subtitle)}</h6>
            <p class="card-text" style="font-family: 'Caveat', cursive;" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000">${escapeHTML(project.description)} <a href="#" class="project-read-more" data-index="${idx}">...more</a></p>
            <small class="card-techStack font-italic d-none" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000" style="font-family: 'Caveat', cursive;">
              <iconify-icon icon="streamline-color:file-code-1-flat" aria-hidden="true"></iconify-icon> ${escapeHTML(project.techStack)}
            </small>
            <div class="card-actions">
              <a href="${escapeHTML(project.liveLink)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary tilt mr-2" data-aos="fade-right" aria-label="Open ${escapeHTML(project.title)} live site">
                <iconify-icon icon="line-md:link" aria-hidden="true"></iconify-icon> Live
              </a>
              <a href="${escapeHTML(project.githubLink)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary tilt" data-aos="fade-left" aria-label="Open ${escapeHTML(project.title)} source on GitHub">
                <iconify-icon icon="mdi:github" aria-hidden="true"></iconify-icon> Github
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Open project modal with data
function openProjectModal(index) {
  var p = projectsData[index];
  if (!p) return;
  // Fill modal fields
  $('#projectModalLabel').text(p.title);
  // PERF: apply intrinsic dimensions to avoid layout shift in modal.
  var $modalImg = $('#projectModalImg');
  $modalImg.attr('src', p.image).attr('alt', p.title + ' screenshot');
  if (p.width && p.height) {
    $modalImg.attr('width', p.width).attr('height', p.height);
  }
  $('#projectModalSubtitle').text(p.subtitle || '');
  $('#projectModalDesc').text(p.description || '');
  $('#projectModalTech').html(p.techStack
    ? `<iconify-icon icon="streamline-color:file-code-1-flat" aria-hidden="true"></iconify-icon> ${escapeHTML(p.techStack)}`
    : '');
  $('#projectModalLive').attr('href', p.liveLink || '#');
  $('#projectModalGithub').attr('href', p.githubLink || '#');
  // Show modal
  $('#projectModal').modal('show');
}

// Function to render certifications
function renderCertifications() {
  const certContainer = document.getElementById('certification-carousel');
  if (certContainer) {
    // PERF: intrinsic dimensions + lazy loading for certificate images to prevent CLS.
    certContainer.innerHTML = certificationData.map(cert => `
      <div class="text-center certificate-view">
        <a href="${escapeHTML(cert.link)}" target="_blank" rel="noopener" title="View Certificate">
          <img class="img-fluid rounded mx-auto d-block" src="${escapeHTML(cert.image)}" alt="${escapeHTML(cert.title)} certificate" width="${cert.width}" height="${cert.height}" loading="lazy" decoding="async" style="max-width: 450px; height: auto;" />
        </a>
      </div>
    `).join('');
  }
}

// Function to render interests
// The icon size is applied as font-size, not width/height attributes: those size
// the SVG inside the component's shadow DOM, where a CSS media query cannot reach
// it - the host would shrink while the drawing stayed 150px and spilled over the
// label. <iconify-icon> defaults to 1em, so font-size drives everything.
function renderInterests() {
  const interestContainer = document.getElementById('interest-list');
  if (interestContainer) {
    interestContainer.innerHTML = interestData.map(interest => `
      <div class="col-lg-4 col-md-6 text-center mb-5">
        <div class="d-flex align-items-center justify-content-center mb-4" data-aos="fade-down" data-aos-delay="600">
          <iconify-icon icon="${escapeHTML(interest.icon)}" class="fadesample interest-icon" style="font-size: ${parseInt(interest.width, 10) || 150}px;" aria-hidden="true"></iconify-icon>
        </div>
        <h4 class="font-weight-bold m-0" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="300" data-aos-offset="0">${escapeHTML(interest.title)}</h4>
      </div>
    `).join('');
  }
}

// Function to render extra curricular
function renderExtraCurricular() {
  const extraContainer = document.getElementById('extracurricular-carousel');
  if (extraContainer) {
    // `achievement` intentionally allows inline markup (<br>) authored in the data file.
    extraContainer.innerHTML = extraCurricularData.map(item => `
      <div class="text-center">
        <iconify-icon icon="bi:quote" class="text-primary mb-4" style="font-size: 48px;" aria-hidden="true"></iconify-icon>
        <span>${escapeHTML(item.category)}</span>
        <h4 class="font-weight-light mb-4">
          <iconify-icon icon="${escapeHTML(item.icon)}" width="50" height="50" aria-hidden="true"></iconify-icon><br>${item.achievement}
        </h4>
        <iconify-icon icon="${escapeHTML(item.bottomIcon)}" width="50" height="50" aria-hidden="true"></iconify-icon>
        <h5 class="font-weight-bold m-0">${escapeHTML(item.organization)}</h5>
      </div>
    `).join('');
  }
}

// Function to render footer social links
function renderFooterSocials() {
  const footerSocialContainer = document.getElementById('footer-socials');
  if (footerSocialContainer) {
    footerSocialContainer.innerHTML = socialData.footerSocials.map(social => {
      // Derive an accessible name from the host, e.g. "linkedin.com" -> "LinkedIn".
      const label = social.label || labelFromHref(social.href);
      const icon = social.isIconify
        ? `<iconify-icon icon="${escapeHTML(social.icon)}" data-aos="fade-down" aria-hidden="true"></iconify-icon>`
        : `<i class="${escapeHTML(social.icon)}" data-aos="fade-down" aria-hidden="true"></i>`;
      return `<a class="${escapeHTML(social.class)}" href="${escapeHTML(social.href)}" target="_blank" rel="noopener" aria-label="${escapeHTML(label)}">
          ${icon}
        </a>`;
    }).join('');
  }

  // Render contact info
  const contactContainer = document.getElementById('footer-contact');
  if (contactContainer) {
    contactContainer.innerHTML = `
      <a class="text-white" href="mailto:${escapeHTML(socialData.contactInfo.email)}" data-aos="fade-down">${escapeHTML(socialData.contactInfo.email)}</a>
      <span class="px-2">|</span>
      <a class="text-white" href="tel:${escapeHTML(socialData.contactInfo.phone)}" data-aos="fade-down">${escapeHTML(socialData.contactInfo.phone)}</a>
    `;
  }
}

function labelFromHref(href) {
  const known = { linkedin: 'LinkedIn', github: 'GitHub', leetcode: 'LeetCode',
    instagram: 'Instagram', facebook: 'Facebook', 'x.com': 'X', twitter: 'X' };
  const match = Object.keys(known).find(key => String(href).indexOf(key) !== -1);
  return match ? known[match] + ' profile' : 'Social profile';
}

// Fill the skill bars with a CSS transition the first time they scroll into view.
function animateSkillBars() {
  const bars = document.querySelectorAll('[data-target-width]');
  if (!bars.length) return;

  const fill = () => bars.forEach(bar => {
    bar.style.width = bar.getAttribute('data-target-width') + '%';
  });

  if (!('IntersectionObserver' in window)) { fill(); return; }

  const section = document.getElementById('skill');
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      fill();
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(section || bars[0]);
}

// Owl carousels can only be created once their slides exist, so they are all
// initialized here — after rendering — and nowhere else.
function initCarousels() {
  if (!window.jQuery || typeof $.fn.owlCarousel === 'undefined') return;

  const $projects = $('#projects-carousel');
  if ($projects.length && $projects.children().length) {
    $projects.owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      smartSpeed: 700,
      dots: true,
      loop: true,
      center: true,
      margin: 20,
      responsive: {
        0: { items: 1, center: false },
        768: { items: 2, center: false },
        992: { items: 3, center: true }
      }
    });

    // Delegated handlers for modal open (survive Owl cloning the slides).
    $projects.on('click', '.project-read-more', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openProjectModal($(this).data('index'));
    });
    $projects.on('click', '.project-card', function (e) {
      if ($(e.target).closest('.card-actions').length) return;
      openProjectModal($(this).data('index'));
    });
    // Keyboard equivalent of the card click (cards are role="button").
    $projects.on('keydown', '.project-card', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        openProjectModal($(this).data('index'));
      }
    });
  }

  $('#certification-carousel, #extracurricular-carousel').each(function () {
    const $this = $(this);
    if (!$this.children().length) return;
    $this.owlCarousel({
      autoplay: true,
      autoplayHoverPause: true,
      smartSpeed: 1500,
      dots: true,
      loop: true,
      items: 1
    });
  });
}

/**
 * Letter-by-letter reveal on the hero subtitle.
 *
 * The deployed site gets this from the textAnimate helper in Shery, which needs three.js,
 * ControlKit and Shery behind it. Same effect here from a span per character and
 * a staggered CSS transition - and unlike the original it runs *after* the text
 * is rendered, so it actually animates the real words rather than an empty node.
 *
 * Characters are grouped into words so the line can still wrap between words.
 */
function initTextAnimate() {
  const el = document.getElementById('about-title');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const text = el.textContent.trim();
  if (!text || el.querySelector('.char')) return;

  el.textContent = '';
  let index = 0;
  text.split(' ').forEach((word, wordIndex) => {
    if (wordIndex > 0) el.appendChild(document.createTextNode(' '));
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    for (const character of word) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = character;
      span.style.transitionDelay = (index * 0.03).toFixed(2) + 's';
      wordSpan.appendChild(span);
      index++;
    }
    el.appendChild(wordSpan);
  });

  function play() {
    el.classList.remove('is-in');
    // force a reflow so the transition restarts when the class comes back
    void el.offsetWidth;
    el.classList.add('is-in');
  }

  if (!('IntersectionObserver' in window)) { play(); return; }

  // Replays whenever the hero scrolls back into view, matching AOS's once: false.
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) play();
      else el.classList.remove('is-in');
    });
  }, { threshold: 0.25 }).observe(el);
}

// AOS must be initialized *after* the dynamic markup exists, otherwise the injected
// elements are never registered and stay at opacity 0 forever.
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 1000,
    offset: 120,
    delay: 0,
    // once: false replays a section's animation every time you scroll back to it,
    // which is what the deployed site does. mirror stays false so nothing fades
    // *out* while you scroll down past it - that part only hid content.
    once: false,
    mirror: false,
    disable: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  });
}

// Initialize all renders when DOM is loaded.
// NOTE: the data files declare `const` at top level, which creates a global *binding*
// but never a property on `window` - so these must be probed by identifier, not by
// window lookup.
const DATA_SOURCES = {
  navigationData: () => navigationData,
  socialData: () => socialData,
  educationData: () => educationData,
  experienceData: () => experienceData,
  skillData: () => skillData,
  projectsData: () => projectsData,
  certificationData: () => certificationData,
  interestData: () => interestData,
  extraCurricularData: () => extraCurricularData
};
const MAX_DATA_ATTEMPTS = 50; // ~5s

function missingDataFiles() {
  return Object.keys(DATA_SOURCES).filter(name => {
    try {
      return typeof DATA_SOURCES[name]() === 'undefined';
    } catch (e) {
      return true; // not evaluated yet
    }
  });
}

function initializeAllData(attempt) {
  attempt = attempt || 0;

  const missing = missingDataFiles();
  if (missing.length) {
    if (attempt >= MAX_DATA_ATTEMPTS) {
      console.error('Data files failed to load:', missing.join(', '));
      // Reveal whatever static content exists rather than leaving the page blank.
      document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
      return;
    }
    setTimeout(() => initializeAllData(attempt + 1), 100);
    return;
  }

  try {
    renderNavigation();
    renderAboutSection();
    renderEducation();
    renderExperience();
    renderSkills();
    renderProjects();
    renderCertifications();
    renderInterests();
    renderExtraCurricular();
    renderFooterSocials();

    initCarousels();
    initTextAnimate();
    animateSkillBars();
    initAOS();

    // Web fonts and lazy images land after this point and change element heights.
    // Recalculate once everything has settled so Owl keeps correct slide widths and
    // AOS keeps correct trigger positions.
    window.addEventListener('load', function () {
      if (window.jQuery && typeof $.fn.owlCarousel !== 'undefined') {
        $('.owl-carousel').trigger('refresh.owl.carousel');
      }
      if (typeof AOS !== 'undefined') AOS.refresh();
    });
  } catch (error) {
    console.error('Error initializing data:', error);
    // Never leave the page invisible because an animation library failed.
    if (typeof AOS === 'undefined') {
      document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));
    }
  }
}
