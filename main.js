// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });
        });
    }

    // Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
        gsap.fromTo(el,
            {
                y: 50,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // Theme Switching Sections
    const darkSections = document.querySelectorAll('[data-theme="dark"]');
    darkSections.forEach((section) => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: () => document.body.classList.add('dark-mode'),
            onEnterBack: () => document.body.classList.add('dark-mode'),
            onLeave: () => document.body.classList.remove('dark-mode'),
            onLeaveBack: () => document.body.classList.remove('dark-mode'),
        });
    });

    // Magnetic Buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    // Modal Logic
    const modal = document.querySelector('#about-modal');
    const readMoreBtn = document.querySelector('#read-more-btn');
    const closeBtn = document.querySelector('#close-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');

    if (readMoreBtn && modal) {
        function openModal() {
            modal.style.display = 'flex';
            if (typeof lenis !== 'undefined') lenis.stop();

            gsap.set([modalOverlay, modalContent], { clearProps: "all" }); // Reset state

            gsap.to(modalOverlay, {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            });

            gsap.fromTo(modalContent,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' }
            );
        }

        function closeModal() {
            gsap.to(modalContent, {
                opacity: 0,
                y: 50,
                duration: 0.5,
                ease: 'power3.in'
            });

            gsap.to(modalOverlay, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    modal.style.display = 'none';
                    if (typeof lenis !== 'undefined') lenis.start();
                }
            });
        }

        readMoreBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    // Mobile Menu Logic
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenuCloseBtn = document.querySelector('.mobile-menu-close');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenuCloseBtn && mobileMenuOverlay) {
        function openMobileMenu() {
            mobileMenuOverlay.style.display = 'flex';
            if (typeof lenis !== 'undefined') lenis.stop();

            gsap.to(mobileMenuOverlay, {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            });

            gsap.fromTo(mobileLinks,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.1, ease: 'power2.out' }
            );
        }

        function closeMobileMenu() {
            gsap.to(mobileMenuOverlay, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    mobileMenuOverlay.style.display = 'none';
                    if (typeof lenis !== 'undefined') lenis.start();
                }
            });
        }

        mobileMenuBtn.addEventListener('click', openMobileMenu);
        mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Image Hover Mobile Toggle
    const hoverContainers = document.querySelectorAll('.image-hover-container');
    hoverContainers.forEach(container => {
        container.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                container.classList.toggle('mobile-hover-active');
            }
        });
    });
});

