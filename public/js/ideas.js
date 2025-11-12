document.addEventListener("DOMContentLoaded", async () => {
    const wrapper = document.getElementById("ideas-wrapper");
    if (!wrapper) return;

    const lang = localStorage.getItem('language') || 'az';

    try {
        const res = await fetch(`/api/ideas?lang=${lang}`);
        if (!res.ok) throw new Error('Network response was not ok');
        
        const ideas = await res.json();

        if (ideas.length === 0) {
            wrapper.innerHTML = '<p class="text-center">Heç bir ideya tapılmadı.</p>';
            return;
        }

        wrapper.innerHTML = ideas.map(idea => `
            <div class="swiper-slide">
                <a href="#" class="idea-card">
                    <img src="${idea.image}" class="idea-card-img" alt="${idea.title}">
                    <div class="idea-card-overlay">
                        <h5 class="idea-card-title">${idea.title}</h5>
                    </div>
                </a>
            </div>
        `).join('');

        new Swiper(".ideas-slider", {
            slidesPerView: 1, spaceBetween: 20,
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            breakpoints: {
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4, spaceBetween: 30 }
            }
        });

    } catch (e) {
        console.error("Error loading ideas:", e);
        wrapper.innerHTML = '<p class="text-center text-danger">İdeyaları yükləmək mümkün olmadı.</p>';
    }
});