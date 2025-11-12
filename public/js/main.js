// DOM yükləndikdən sonra funksiyaları işə salın
document.addEventListener('DOMContentLoaded', () => {
    // Yalnız ana səhifədə olan funksiyaları çağırın
    if (document.querySelector('.hero-section-pro')) {
        loadFeaturedTours();
    }

    // Rəqəm animasiyasını işə salın
    const counters = document.querySelectorAll('.counter-anim');
    if (counters.length > 0) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            const section = counter.closest('.stats-section');
            if (section) {
                observer.observe(section);
            }
        });
    }
});

/**
 * Ana səhifədəki seçilmiş turları yükləyir və göstərir.
 */
async function loadFeaturedTours() {
    const container = document.getElementById('featured-tours-container');
    if (!container) {
        console.error('Featured tours container (#featured-tours-container) not found!');
        return;
    }

    try {
        const lang = localStorage.getItem('language') || 'az';
        
        // DÜZƏLİŞ: Serverdən məlumat dilə uyğun istənilir (?lang=... əlavə edildi)
        const res = await fetch(`/api/tours?lang=${lang}`);
        
        if (!res.ok) throw new Error('Turlar yüklənərkən xəta baş verdi.');
        const tours = await res.json();
        
        container.innerHTML = ''; 

        if (!tours || tours.length === 0) {
            container.innerHTML = '<p class="text-center text-muted col-12">Hazırda seçilmiş tur yoxdur.</p>';
            return;
        }

        tours.slice(0, 3).forEach(tour => {
            // DÜZƏLİŞ: Serverdən hazır məlumat gəldiyi üçün kod sadələşdirildi
            const title = tour.title || 'Başlıq yoxdur';
            const location = tour.location || 'Məkan yoxdur';
            const duration = tour.duration || '';
            const short = tour.short || '';
            
            const col = document.createElement('div');
            col.className = 'col-lg-4 col-md-6 mb-4';
            
            col.innerHTML = `
              <div class="card card-tour p-0 shadow-soft position-relative h-100">
                <a href="/tour.html?id=${tour.id}">
                  <img src="${tour.image}" class="card-img-top" alt="${title}">
                </a>
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title mb-1">${title}</h5>
                  <p class="small text-muted mb-2">${location} • ${duration}</p>
                  <p class="card-text text-muted small flex-grow-1">${short}</p>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <a href="/tour.html?id=${tour.id}" class="btn btn-sm btn-primary" data-lang-key="view_details">Bax</a>
                    <div class="badge-price">$${tour.price}</div>
                  </div>
                </div>
              </div>`;
            container.appendChild(col);
        });

        if(window.updateContentLanguage) {
            window.updateContentLanguage(lang);
        }

    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center col-12">${error.message}</p>`;
        console.error(error);
    }
}

/**
 * Statistika bölməsindəki rəqəmləri animasiya edir.
 */
function animateCounters() {
    const counters = document.querySelectorAll('.counter-anim');
    counters.forEach(counter => {
        if (counter.classList.contains('animated')) return;
        counter.classList.add('animated');

        const target = +counter.getAttribute('data-target');
        let current = 0;
        const increment = target / 100;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.innerText = `${Math.ceil(current)}+`;
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = `${target}+`;
            }
        };
        updateCounter();
    });
}