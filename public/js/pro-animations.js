document.addEventListener('DOMContentLoaded', function() {

    // --- 1. "Daha Ətraflı" funksiyası (HAQQIMIZDA BÖLMƏSİ) ---
    const aboutSection = document.getElementById('about-section-content');
    const toggleBtn = document.getElementById('toggle-about-text');

    if (toggleBtn && aboutSection) {
        // Bu kod 'about.html' səhifəsinə yönləndirməni ləğv edir.
        // Əgər düymənin həm mətni genişləndirməsini, həm də səhifəyə keçməsini istəmirsinizsə, bu kodu saxlayın.
        // Yox əgər sadəcə 'about.html'-ə keçməsini istəyirsinizsə, bu bloku silə bilərsiniz.
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = aboutSection.classList.toggle('expanded');
            
            // Dilə uyğun mətni yeniləmək üçün lang.js-ə ötürürük
            const newTextKey = isExpanded ? 'daha_az' : 'about_button';
            this.setAttribute('data-lang-key', newTextKey);
            
            // lang.js-in mövcudluğunu yoxlayıb, dili yeniləyirik
            if (window.updateContentLanguage) {
                window.updateSingleElement(this, localStorage.getItem('language') || 'az');
            }
        });
    }

    // --- 2. Rəqəmlərin artma animasiyası (STATİSTİKA) ---
    const statsSection = document.querySelector('.stats-section');

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        let current = 0;
        const increment = target / 100 > 1 ? Math.ceil(target / 100) : 1;
        
        const update = () => {
            current += increment;
            if (current < target) {
                element.textContent = current;
                requestAnimationFrame(update);
            } else {
                element.textContent = target + '+';
            }
        };
        update();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter-anim');
                counters.forEach(counter => {
                    if (!counter.classList.contains('animated')) {
                        animateCounter(counter);
                        counter.classList.add('animated');
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        observer.observe(statsSection);
    }

    // --- 3. Naviqasiya panelinin sürüşdürmə zamanı dəyişməsi ---
    const nav = document.querySelector('nav.navbar');
    if (nav) {
        document.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // --- 4. YENİLƏNMİŞ Tilt Effekti (Klikləmə problemini həll edir) ---
    const tiltElements = document.querySelectorAll('.card-tour, .destination-card, .idea-card');

    if (tiltElements.length > 0) {
        tiltElements.forEach(el => {
            initializeTiltEffect(el);
        });
    }

    // --- 5. Avtomobil Kirayəsi Səhifəsi Animasiyaları ---
    const carAnimationSection = document.getElementById('car-animation-section');
    if (carAnimationSection) {
        const animatedCar = document.getElementById('animated-car');
        const carObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animatedCar.classList.add('in-view');
                }
            });
        }, { threshold: 0.4 });
        carObserver.observe(carAnimationSection);
    }
});

/**
 * Elementə siçan hərəkətinə həssas olan 3D "tilt" effekti tətbiq edir.
 * Bu funksiya klikləmə problemini aradan qaldırır.
 * @param {HTMLElement} element - Animasiya tətbiq ediləcək element.
 */
function initializeTiltEffect(element) {
    const intensity = 15; // Animasiya effektinin gücü

    element.addEventListener('mousemove', (e) => {
        const { width, height, left, top } = element.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const rotateX = ((y / height) - 0.5) * intensity;
        const rotateY = ((x / width) - 0.5) * -intensity;

        element.style.transition = 'transform 0.1s ease-out';
        element.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transition = 'transform 0.5s ease-in-out';
        element.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
}