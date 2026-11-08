/* ============================================
   EAGLE PORTFOLIO - JAVASCRIPT
   All interactivity, animations, logic
   ============================================ */

(function() {
    'use strict';

    /* ============ MOBILE MENU TOGGLE ============ */
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });
    }

    /* ============ SCROLL EFFECTS ============ */
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollY / docHeight) * 100;

        // Scroll progress bar
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }

        // Header shrink effect
        if (header) {
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTop) {
            if (scrollY > 400) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on load

    /* ============ BACK TO TOP CLICK ============ */
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ============ SMOOTH SCROLLING ============ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 70;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ============ REVEAL ON SCROLL (IntersectionObserver) ============ */
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });

        /* ============ SKILL ITEM STAGGER ============ */
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.skill-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 80);
                    });
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.skill-category').forEach(cat => {
            skillObserver.observe(cat);
        });
    } else {
        // Fallback for old browsers - show all
        document.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('active');
        });
        document.querySelectorAll('.skill-item').forEach(el => {
            el.classList.add('visible');
        });
    }

    /* ============ ACTIVE NAV LINK ON SCROLL ============ */
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-links a');

    function highlightNav() {
        const scrollY = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinksList.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.style.color = 'var(--primary-color)';
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });

    /* ============ FORM HANDLING ============ */
    const contactForm = document.querySelector('.contact-form-wrap form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            // Reset after 5s if form doesn't submit (safety)
            setTimeout(() => {
                if (btn.disabled) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }, 5000);
        });
    }

    /* ============ CONSOLE BRANDING ============ */
    console.log(
        '%c🦅 EAGLE Portfolio',
        'color: #4361ee; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);'
    );
    console.log(
        '%cBuilt with HTML5 + CSS3 + Vanilla JS',
        'color: #f72585; font-size: 13px; font-style: italic;'
    );
    console.log(
        '%c📧 ahsanjibran1471@gmail.com',
        'color: #4cc9f0; font-size: 12px;'
    );

})();