/* ═══════════════════════════════════════════════════════════════
   PRELOADER
═══════════════════════════════════════════════════════════════ */
(function () {
    const NAME       = 'DEVAM LATHIYA';
    const nameEl     = document.getElementById('preName');
    const numEl      = document.getElementById('preNum');
    const lineEl     = document.getElementById('preLine');
    const statusEl   = document.getElementById('preStatus');
    const preloader  = document.getElementById('preloader');
    const panelTop   = document.querySelector('.pre-panel-top');
    const panelBot   = document.querySelector('.pre-panel-bottom');
    const preContent = document.getElementById('preContent');
    const preCounter = document.getElementById('preCounter');
    const splineLoader = document.getElementById('splineLoader');

    document.body.classList.add('is-loading');

    // Build name chars
    NAME.split('').forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'pre-name-char';
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        nameEl.appendChild(span);
    });

    const statuses = ['Loading', 'Initialising', 'Building Scene', 'Almost Ready'];
    let statusIdx = 0;

    // ── Curtain exit ──────────────────────────────────────────────
    function revealSite() {
        const tl = gsap.timeline({
            onComplete: () => {
                preloader.remove();
                preContent.remove();
                preCounter.remove();
                statusEl.remove();
                document.body.classList.remove('is-loading');
                if (splineLoader) splineLoader.classList.add('hidden');
                // Hero entrance
                gsap.fromTo('#hero .reveal',
                    { y: 22, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out', stagger: 0.12, delay: 0.05 }
                );
            }
        });

        tl.to([preCounter, preContent, statusEl], {
            opacity: 0, duration: 0.3, ease: 'power2.in'
        });

        tl.to('.pre-panel-top', {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 1.0,
            ease: 'power4.inOut'
        }, '-=0.05');

        tl.to('.pre-panel-bottom', {
            scaleY: 0,
            transformOrigin: 'bottom',
            duration: 1.0,
            ease: 'power4.inOut'
        }, '<');
    }

    // ── Time-based counter — always completes ─────────────────────
    function runCounter(onDone) {
        const start   = performance.now();
        const FAST_MS = 1800;  // 0→85 in 1.8s
        const SLOW_MS = 1400;  // 85→100 in 1.4s
        const FAST_END = 85;

        function frame(now) {
            const elapsed = now - start;
            let pct;

            if (elapsed < FAST_MS) {
                const t = elapsed / FAST_MS;
                pct = Math.floor((1 - Math.pow(1 - t, 2.2)) * FAST_END);
            } else {
                const t = Math.min(1, (elapsed - FAST_MS) / SLOW_MS);
                pct = Math.floor(FAST_END + (1 - Math.pow(1 - t, 3)) * (100 - FAST_END));
            }

            pct = Math.min(100, pct);
            if (numEl) numEl.textContent = pct;

            const newIdx = Math.min(statuses.length - 1, Math.floor((pct / 100) * statuses.length));
            if (newIdx !== statusIdx) {
                statusIdx = newIdx;
                if (statusEl) {
                    gsap.to(statusEl, { opacity: 0, duration: 0.12, onComplete: () => {
                        statusEl.textContent = statuses[statusIdx];
                        gsap.to(statusEl, { opacity: 1, duration: 0.12 });
                    }});
                }
            }

            if (pct < 100) {
                requestAnimationFrame(frame);
            } else {
                setTimeout(onDone, 280);
            }
        }
        requestAnimationFrame(frame);
    }

    // ── Entrance → counter → reveal ───────────────────────────────
    gsap.set([preCounter, statusEl], { opacity: 0 });

    gsap.timeline({ onComplete: () => runCounter(revealSite) })
        .to('.pre-name-char', {
            translateY: '0%', opacity: 1,
            duration: 0.6, ease: 'power3.out',
            stagger: 0.035, delay: 0.2
        })
        .to(lineEl, {
            width: '100%', duration: 0.5, ease: 'power2.out'
        }, '-=0.2')
        .to([preCounter, statusEl], {
            opacity: 1, duration: 0.3
        }, '-=0.1');
})();


/* ═══════════════════════════════════════════════════════════════
   LENIS
═══════════════════════════════════════════════════════════════ */
const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);


/* ═══════════════════════════════════════════════════════════════
   GSAP
═══════════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // ── Cursor: dot snaps instantly, ring lerp-follows ───────────────────
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (dot && ring) {
        let mouseX = 0, mouseY = 0;
        let ringX  = 0, ringY  = 0;
        let visible = false;

        function onMove(x, y) {
            mouseX = x; mouseY = y;
            gsap.set(dot, { x, y });
            if (!visible) {
                visible = true;
                dot.style.opacity  = '1';
                ring.style.opacity = '1';
            }
        }

        // Global mouse tracking - works everywhere including over iframe
        let isOverHero = false;
        const heroSection = document.getElementById('hero');
        
        // Track mouse globally
        document.addEventListener('mousemove', (e) => {
            onMove(e.clientX, e.clientY);
        });
        
        // Detect when mouse enters/leaves hero section
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                isOverHero = true;
            });
            heroSection.addEventListener('mouseleave', () => {
                isOverHero = false;
            });
        }
        
        // Keep cursor visible and updating position even over iframe
        function continuousUpdate() {
            // Cursor stays visible as long as we have a position
            requestAnimationFrame(continuousUpdate);
        }
        continuousUpdate();

        // Ring lazily lerps to mouse pos each frame
        function lerp(a, b, t) { return a + (b - a) * t; }
        (function rafLoop() {
            ringX = lerp(ringX, mouseX, 0.12);
            ringY = lerp(ringY, mouseY, 0.12);
            gsap.set(ring, { x: ringX, y: ringY });
            requestAnimationFrame(rafLoop);
        })();

        // Hover: ring expands on interactive elements
        document.querySelectorAll('a, button, .work-item, .stat, .hero-cta, .service-card').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
        });

        // Auto colour: dark in hero (light bg) → white below (dark bg)
        const heroEl = document.getElementById('hero');
        if (heroEl) {
            new IntersectionObserver((entries) => {
                document.body.classList.toggle('cursor-light', !entries[0].isIntersecting);
            }, { threshold: 0.05 }).observe(heroEl);
        }
    }

    // Scroll reveals — hero handled by preloader
    document.querySelectorAll('.reveal').forEach((el) => {
        if (el.closest('#hero')) return;
        gsap.fromTo(el,
            { y: 30, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
                scrollTrigger: {
                    trigger: el, start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Magnetic buttons
    document.querySelectorAll('.btn, .hero-cta').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, {
                x: (e.clientX - r.left - r.width  / 2) * 0.25,
                y: (e.clientY - r.top  - r.height / 2) * 0.25,
                duration: 0.35, ease: 'power2.out'
            });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
        });
    });

    // Work item hover — number highlight
    document.querySelectorAll('.work-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item.querySelector('.work-num'), { color: '#fff', duration: 0.2 });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item.querySelector('.work-num'), { color: 'var(--text-dim)', duration: 0.2 });
        });
    });

    // Modal
    const modal        = document.querySelector('#about-modal');
    const readMoreBtn  = document.querySelector('#read-more-btn');
    const closeBtn     = document.querySelector('#close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');

    function openModal() {
        modal.style.display = 'flex'; lenis.stop();
        gsap.set([modalOverlay, modalContent], { clearProps: 'all' });
        gsap.to(modalOverlay, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(modalContent, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.05, ease: 'power3.out' });
    }
    function closeModal() {
        gsap.to(modalContent, { opacity: 0, y: 32, duration: 0.35, ease: 'power3.in' });
        gsap.to(modalOverlay, { opacity: 0, duration: 0.35, onComplete: () => { modal.style.display = 'none'; lenis.start(); } });
    }
    readMoreBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.style.display === 'flex') closeModal(); });

    // Mobile menu
    const mobileMenuBtn      = document.querySelector('.mobile-menu-btn');
    const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay  = document.querySelector('.mobile-menu-overlay');
    const mobileLinks        = document.querySelectorAll('.mobile-link');

    function openMobileMenu() {
        mobileMenuOverlay.style.display = 'flex'; lenis.stop();
        gsap.to(mobileMenuOverlay, { opacity: 1, duration: 0.35 });
        gsap.fromTo(mobileLinks, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.1 });
    }
    function closeMobileMenu() {
        gsap.to(mobileMenuOverlay, { opacity: 0, duration: 0.3, onComplete: () => { mobileMenuOverlay.style.display = 'none'; lenis.start(); } });
    }
    mobileMenuBtn?.addEventListener('click', openMobileMenu);
    mobileMenuCloseBtn?.addEventListener('click', closeMobileMenu);
    mobileLinks.forEach(l => l.addEventListener('click', closeMobileMenu));

    // Image hover mobile
    document.querySelectorAll('.image-hover-container').forEach(c => {
        c.addEventListener('click', () => { if (window.innerWidth <= 768) c.classList.toggle('mobile-hover-active'); });
    });

    // Stat counter animation
    document.querySelectorAll('.stat-num').forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                gsap.fromTo(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            }
        });
    });

    // ── Smooth scroll for all navigation links ────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#" or empty
            if (!href || href === '#') return;
            
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Get target position
                const targetPosition = targetElement.offsetTop;
                const offset = 80; // Offset for fixed header/spacing
                
                // Use Lenis smooth scroll
                lenis.scrollTo(targetPosition - offset, {
                    duration: 1.5,
                    easing: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
                    immediate: false
                });
                
                // Close mobile menu if open
                if (mobileMenuOverlay && mobileMenuOverlay.style.display === 'flex') {
                    closeMobileMenu();
                }
            }
        });
    });
});
