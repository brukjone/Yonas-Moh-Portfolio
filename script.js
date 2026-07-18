(() => {
    const video = document.getElementById('bg-video');
    const timecodeEl = document.getElementById('timecode');
    const markersEl = document.getElementById('timelineMarkers');
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');
    const yearEl = document.getElementById('year');
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('[data-nav]');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (yearEl) yearEl.textContent = new Date().getFullYear();

    function formatTimecode(seconds){
        const s = Math.max(0, seconds || 0);
        const mm = Math.floor(s / 60).toString().padStart(2, '0');
        const ss = Math.floor(s % 60).toString().padStart(2, '0');
        return `00:${mm}:${ss}`;
    }

    function layoutMarkers(){
        if (!markersEl) return;
        markersEl.innerHTML = '';
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= 0) return;

        sections.forEach((section) => {
            const pct = (section.offsetTop / scrollableHeight) * 100;
            const marker = document.createElement('div');
            marker.className = 'timeline-marker';
            marker.style.left = `${Math.min(99.7, pct)}%`;
            markersEl.appendChild(marker);
        });
    }

    let targetTime = 0;
    let currentTime = 0;
    const easing = 0.07;

    video.addEventListener('loadedmetadata', () => {
        video.pause();
        video.currentTime = 0;
        layoutMarkers();
    });

    function onScroll(){
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= 0) return;
        const scrollFraction = window.scrollY / scrollableHeight;

        if (video.duration) {
            targetTime = video.duration * scrollFraction;
        }
        if (timecodeEl) {
            timecodeEl.textContent = formatTimecode((video.duration || 0) * scrollFraction);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layoutMarkers);

    function updateVideoFrame(){
        currentTime += (targetTime - currentTime) * easing;
        if (video.duration) {
            video.currentTime = currentTime;
        }
        requestAnimationFrame(updateVideoFrame);
    }

    if (prefersReducedMotion) {
        window.addEventListener('scroll', () => {
            if (video.duration) video.currentTime = targetTime;
        }, { passive: true });
    } else {
        requestAnimationFrame(updateVideoFrame);
    }

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    if ('IntersectionObserver' in window && sections.length && navLinks.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px' });

        sections.forEach(section => observer.observe(section));
    }
})();