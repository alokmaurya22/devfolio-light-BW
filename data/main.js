// Function to render navigation
function renderNavigation() {
  const navbar = document.querySelector('.navbar-nav');
  const brandElement = document.querySelector('.navbar-brand h1');
  const ctaButton = document.querySelector('.navbar-collapse .btn-outline-primary');
  
  // Render brand
  if (brandElement) {
    brandElement.textContent = navigationData.brand.text;
  }
  
  // Render nav items
  if (navbar) {
    navbar.innerHTML = navigationData.navItems.map(item => 
      `<a href="${item.href}" class="${item.class}">${item.text}</a>`
    ).join('');
  }
  
  // Render CTA button
  if (ctaButton) {
    ctaButton.href = navigationData.ctaButton.href;
    ctaButton.textContent = navigationData.ctaButton.text;
  }
}

// Function to render about section
function renderAboutSection() {
  const nameElement = document.querySelector('#about h3.display-4');
  const titleElement = document.querySelector('#about h3.text-target');
  const descriptionElement = document.querySelector('#about p[data-aos="fade-up"]');
  const typedTextElement = document.querySelector('.typed-text');
  
  if (nameElement) nameElement.innerHTML = `Hey, I'm ${socialData.profileInfo.name}`;
  if (titleElement) titleElement.textContent = socialData.profileInfo.title;
  if (descriptionElement) descriptionElement.textContent = socialData.profileInfo.description;
  if (typedTextElement) typedTextElement.textContent = socialData.profileInfo.typedText;
  
  // Render social buttons
 const socialContainer = document.querySelector('#about .col-lg-7');
  if (socialContainer) {
      // Create a div for social buttons if it doesn't exist
      let buttonsDiv = socialContainer.querySelector('.social-buttons-container');
      if (!buttonsDiv) {
          buttonsDiv = document.createElement('div');
          buttonsDiv.className = 'social-buttons-container';
          socialContainer.appendChild(buttonsDiv);
      }
      
      buttonsDiv.innerHTML = socialData.socialLinks.map(link => {
          if (link.isIconify) {
              return `<a href="${link.href}" target="_blank" class="${link.class}" data-aos="fade-${link.text === 'Github' ? 'left' : 'right'}">
                  <iconify-icon icon="${link.icon}" class="mr-2"></iconify-icon>${link.text}
              </a>`;
          } else {
              return `<a href="${link.href}" target="_blank" class="${link.class}" data-aos="fade-${link.text === 'Github' ? 'left' : 'right'}">
                  <i class="${link.icon} mr-2" data-aos="fade-in"></i>${link.text}
              </a>`;
          }
      }).join('');
  }
}

// Function to render education
function renderEducation() {
  const educationContainer = document.querySelector('#qualification .col-lg-5 .border-left');
  if (educationContainer) {
    educationContainer.innerHTML = educationData.map(edu => `
      <div class="position-relative mb-4">
        <i class="far fa-dot-circle text-primary position-absolute" style="top: 2px; left: -32px;"></i>
        <h5 class="font-weight-bold mb-1" data-aos="fade-right" data-aos-delay="400">
          ${edu.degree}${edu.status ? `<i style="font-family: 'Caveat';"> ${edu.status}</i>` : ''}
          ${edu.specialization ? `</br><span class="font-weight-medium mb-1 form-control-sm">(${edu.specialization})</span>` : ''}
        </h5>
        <p class="mb-2" data-aos="fade-down" data-aos-delay="550">
          <img src="${edu.institutionLogo}" width="${edu.degree.includes('Intermediate') ? '35' : edu.degree.includes('High') ? '23' : '20'}" height="${edu.degree.includes('Intermediate') ? '35' : edu.degree.includes('High') ? '23' : '20'}">
          <a style="color: gray;" href="${edu.institutionLink}" ${edu.institutionLink.startsWith('http') ? 'target="_blank"' : ''}>
            <strong> ${edu.institution}</strong>
          </a> | <small>${edu.duration}</small>
        </p>
        <p data-aos="fade-down" data-aos-delay="700">${edu.description}</p>
      </div>
    `).join('');
  }
}

// Function to render experience
function renderExperience() {
  const experienceContainer = document.querySelector('#qualification .col-lg-7 .border-left');
  if (experienceContainer) {
    experienceContainer.innerHTML = experienceData.map(exp => `
      <div class="position-relative mb-4">
        <i class="far fa-dot-circle text-primary position-absolute" style="top: 2px; left: -32px;"></i>
        <h5 class="font-weight-bold mb-1" data-aos="fade-right" data-aos-delay="400">${exp.position}</h5>
        <p class="mb-2" data-aos="fade-right" data-aos-delay="550">
          <img src="${exp.companyLogo}" width="${exp.company.includes('WeKnow') ? '125' : '145'}" height="25">
          <strong><a style="color: gray;" href="${exp.companyLink}" target="_blank">${exp.company.includes('Webpro') ? '&nbsp; ' : ''}${exp.company}</a></strong> | 
          <small>${exp.duration}</small>
        </p>
        <p style="font-family: 'Caveat';" data-aos="fade-down" data-aos-delay="600"></p>
        <ul style="font-family:'Caveat';">
          ${exp.responsibilities.map((resp, index) => 
            `<li data-aos="fade-down" ${index > 0 ? `data-aos-duration="${1000 + (index * 500)}"` : ''}>${resp}</li>`
          ).join('')}
        </ul>
      </div>
    `).join('');
  }
}

// Function to render skills
function renderSkills() {
  const leftSkillContainer = document.querySelector('#skill .col-md-6:first-child');
  const rightSkillContainer = document.querySelector('#skill .col-md-6:last-child');
  
  function createSkillHTML(skill, animationDirection) {
    const iconHTML = skill.icons.map(icon => 
      `<iconify-icon ${icon.icon === 'material-icon-theme:git' || icon.icon === 'icon-park:github' || icon.icon === 'logos:react' || icon.icon === 'logos:javascript' || icon.icon === 'logos:java' || icon.icon === 'logos:php' || icon.icon === 'logos:mysql' ? 'inline' : ''} icon="${icon.icon}" style="font-size: ${icon.size};"></iconify-icon>`
    ).join(' ');
    
    return `
      <div class="skill mb-4" data-aos="fade-${animationDirection}">
        <div class="d-flex justify-content-between">
          <h6 class="font-weight-bold">${iconHTML} ${skill.name}</h6>
          <h6 class="font-weight-bold">${skill.percentage}%</h6>
        </div>
        <div class="progress">
          <div class="progress-bar ${skill.color.startsWith('bg-') ? skill.color : ''}" 
               ${!skill.color.startsWith('bg-') ? `style="background-color: ${skill.color};"` : ''} 
               role="progressbar" 
               aria-valuenow="${skill.percentage}" 
               aria-valuemin="0" 
               aria-valuemax="100"></div>
        </div>
      </div>
    `;
  }
  
  if (leftSkillContainer) {
    leftSkillContainer.innerHTML = skillData.leftColumn.map((skill, index) => 
      createSkillHTML(skill, index % 2 === 0 ? 'right' : 'left')
    ).join('');
  }
  
  if (rightSkillContainer) {
    rightSkillContainer.innerHTML = skillData.rightColumn.map((skill, index) => 
      createSkillHTML(skill, index % 2 === 0 ? 'left' : 'right')
    ).join('');
  }
}

// Function to render projects
function renderProjects() {
  const projectsContainer = document.querySelector('.projects-carousel');
  if (projectsContainer) {
    projectsContainer.innerHTML = projectsData.map((project, idx) => `
      <div class="text-center" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
        <div class="card border-0 project-card" data-index="${idx}" style="width: 20rem;">
          <img src="${project.image}" class="card-img-top" alt="${project.title}" data-aos="flip-up" data-aos-delay="300" data-aos-duration="1200">
          <div class="card-body mx-auto">
            <h5 class="card-title fw-bolder" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">${project.title}</h5>
            <h6 class="card-Discription fw-semibold" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">${project.subtitle}</h6>
            <p class="card-text fw-normal" style="font-family: 'Caveat', cursive;" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000">${project.description} <a href="#" class="project-read-more" data-index="${idx}">...more</a></p>
            <small class="card-techStack fst-italic d-none" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000" style="font-family: 'Caveat', cursive;">
              <iconify-icon icon="streamline-color:file-code-1-flat"></iconify-icon> ${project.techStack}
            </small>
            <div class="card-actions">
              <a href="${project.liveLink}" target="_blank" class="btn btn-sm btn-outline-primary tilt mr-2" data-aos="fade-right">
                <iconify-icon icon="line-md:link"></iconify-icon> Live
              </a>
              <a href="${project.githubLink}" target="_blank" class="btn btn-sm btn-outline-primary tilt" data-aos="fade-left">
                <i class="lni lni-github-original"></i> Github
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
  $('#projectModalImg').attr('src', p.image).attr('alt', p.title);
  $('#projectModalSubtitle').text(p.subtitle || '');
  $('#projectModalDesc').text(p.description || '');
  $('#projectModalTech').html(p.techStack ? `<iconify-icon icon="streamline-color:file-code-1-flat"></iconify-icon> ${p.techStack}` : '');
  $('#projectModalLive').attr('href', p.liveLink || '#');
  $('#projectModalGithub').attr('href', p.githubLink || '#');
  // Show modal
  $('#projectModal').modal('show');
}

// Function to render certifications
function renderCertifications() {
  const certContainer = document.querySelector('.testimonial-carousel');
  if (certContainer) {
    certContainer.innerHTML = certificationData.map(cert => `
      <div class="text-center certificate-view">
        <a href="${cert.link}" target="_blank" rel="noopener" title="View Certificate">
          <img class="img-fluid rounded mx-auto d-block" src="${cert.image}" alt="${cert.title}" style="max-width: 450px; height: auto;" />
        </a>
      </div>
    `).join('');
  }
}

// Function to render interests
function renderInterests() {
  const interestContainer = document.querySelector('#service .row.pb-3');
  if (interestContainer) {
    interestContainer.innerHTML = interestData.map(interest => `
      <div class="col-lg-4 col-md-6 text-center mb-5">
        <div class="d-flex align-items-center justify-content-center mb-4" data-aos="fade-down" data-aos-delay="600">
          <iconify-icon icon="${interest.icon}" class="fadesample" width="${interest.width}" height="${interest.height}" id="zoom"></iconify-icon>
        </div>
        <h4 class="font-weight-bold m-0" data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="300" data-aos-offset="0">${interest.title}</h4>
      </div>
    `).join('');
  }
}

// Function to render extra curricular (continued)
function renderExtraCurricular() {
  const extraContainer = document.querySelector('#testimonial .testimonial-carousel');
  if (extraContainer) {
    extraContainer.innerHTML = extraCurricularData.map(item => `
      <div class="text-center">
        <i class="fa fa-3x fa-quote-left text-primary mb-4"></i>
        <span>${item.category}</span>
        <h4 class="font-weight-light mb-4">
          <iconify-icon icon="${item.icon}" width="50" height="50"></iconify-icon><br>${item.achievement}
        </h4>
        <iconify-icon icon="${item.bottomIcon}" width="50" height="50"></iconify-icon>
        <h5 class="font-weight-bold m-0">${item.organization}</h5>
      </div>
    `).join('');
  }
}

// Function to render footer social links
function renderFooterSocials() {
  const footerSocialContainer = document.querySelector('.fot .d-flex.justify-content-center.mb-4');
  if (footerSocialContainer) {
    footerSocialContainer.innerHTML = socialData.footerSocials.map(social => {
      if (social.isIconify) {
        return `<a class="${social.class}" href="${social.href}">
          <iconify-icon icon="${social.icon}" data-aos="fade-down"></iconify-icon>
        </a>`;
      } else {
        return `<a class="${social.class}" href="${social.href}">
          <i class="${social.icon}" data-aos="fade-down"></i>
        </a>`;
      }
    }).join('');
  }
  
  // Render contact info
  const contactContainer = document.querySelector('.fot .d-flex.justify-content-center.mb-3');
  if (contactContainer) {
    contactContainer.innerHTML = `
      <a class="text-white" href="mailto:${socialData.contactInfo.email}" data-aos="fade-down">${socialData.contactInfo.email}</a>
      <span class="px-2">|</span>
      <a class="text-white" href="tel:${socialData.contactInfo.phone}" data-aos="fade-down">${socialData.contactInfo.phone}</a>
    `;
  }
}

// Initialize all renders when DOM is loaded
function initializeAllData() {
  console.log('Initializing all data...');
  
  // Check if all required data is loaded
  if (typeof navigationData === 'undefined' || 
      typeof socialData === 'undefined' || 
      typeof educationData === 'undefined' || 
      typeof experienceData === 'undefined' || 
      typeof skillData === 'undefined' || 
      typeof projectsData === 'undefined' || 
      typeof certificationData === 'undefined' || 
      typeof interestData === 'undefined' || 
      typeof extraCurricularData === 'undefined') {
    console.error('Some data files are not loaded yet. Retrying...');
    setTimeout(initializeAllData, 100);
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
    
    console.log('All data rendered successfully!');
    
    // Re-initialize any necessary plugins after rendering
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
    
    // Re-initialize owl carousel for projects
    if ($('.projects-carousel').length && typeof $.fn.owlCarousel !== 'undefined') {
      const $proj = $('.projects-carousel');
      // Destroy existing instance if any
      if ($proj.hasClass('owl-loaded')) {
        $proj.trigger('destroy.owl.carousel');
        $proj.removeClass('owl-loaded');
        $proj.find('.owl-stage-outer').children().unwrap();
        $proj.find('.owl-stage-outer').remove();
      }
      if ($proj.children().length > 0) {
        $proj.owlCarousel({
          autoplay: true,
          smartSpeed: 700,
          dots: true,
          loop: true,
          center: true,
          margin: 20,
          responsive: {
            0: {
              items: 1,
              center: false
            },
            768: {
              items: 2,
              center: false
            },
            992: {
              items: 3,
              center: true
            }
          }
        });
        // Delegated handlers for modal open
        $proj.on('click', '.project-read-more', function(e) {
          e.preventDefault();
          var idx = $(this).data('index');
          openProjectModal(idx);
        });
        $proj.on('click', '.project-card', function(e) {
          // Ignore clicks on action buttons
          if ($(e.target).closest('.card-actions').length) return;
          var idx = $(this).data('index');
          openProjectModal(idx);
        });
      }
    }
    
    // Re-initialize testimonial carousel
    if ($('.testimonial-carousel').length && typeof $.fn.owlCarousel !== 'undefined') {
      $('.testimonial-carousel').each(function() {
        const $this = $(this);
        if ($this.hasClass('owl-loaded')) {
          $this.trigger('destroy.owl.carousel');
          $this.removeClass('owl-loaded');
          $this.find('.owl-stage-outer').children().unwrap();
          $this.find('.owl-stage-outer').remove();
        }
        if ($this.children().length > 0) {
          $this.owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: true,
            loop: true,
            items: 1
          });
        }
      });
    }
    
    // Animate skill progress bars on scroll into view
    (function() {
      var animatedOnce = false;
      function animateBars() {
        if (animatedOnce) return;
        $('.progress .progress-bar').each(function() {
          var $bar = $(this);
          var target = parseInt($bar.attr('aria-valuenow'), 10) || 0;
          $bar.stop(true, true).css('width', '0%').animate({ width: target + '%' }, 1500);
        });
        animatedOnce = true;
      }

      var $skill = $('#skill');
      if ($skill.length && typeof $.fn.waypoint !== 'undefined') {
        $skill.waypoint(function() {
          animateBars();
          this.destroy();
        }, { offset: '80%' });
      } else {
        // Fallback: trigger after a short delay
        setTimeout(animateBars, 500);
      }
    })();
    
    // Re-initialize typed text if needed
    if ($('.typed-text').length && typeof Typed !== 'undefined') {
      var typed_strings = $('.typed-text').text();
      var typed = new Typed('.typed-text-output', {
        strings: typed_strings.split(', '),
        typeSpeed: 100,
        backSpeed: 20,
        smartBackspace: false,
        loop: true
      });
    }
    
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}