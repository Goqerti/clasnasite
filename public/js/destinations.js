document.addEventListener("DOMContentLoaded", async () => {
    const wrapper = document.getElementById("destinations-wrapper");
    if (!wrapper) return;

    // Dil seçimini brauzer yaddaşından götürürük
    const lang = localStorage.getItem('language') || 'az';

    try {
        // API sorğusuna dil parametrini əlavə edirik
        const res = await fetch(`/api/destinations?lang=${lang}`);
        if (!res.ok) throw new Error('Network response was not ok');
        
        const destinations = await res.json();

        if (destinations.length === 0) {
            wrapper.innerHTML = '<p class="text-center">Heç bir məkan tapılmadı.</p>';
            return;
        }

        wrapper.innerHTML = destinations.map(dest => `
            <div class="swiper-slide destination-slide">
                <img src="${dest.image}" class="destination-bg" alt="${dest.name}">
                <div class="destination-overlay">
                    <div class="overlay-content">
                        <i class="far fa-heart"></i>
                        <h4 class="fw-bold">${dest.name}</h4>
                        <p>${dest.description}</p>
                        <img src="${dest.mapImage}" class="map-image" alt="${dest.name} xəritəsi">
                        <div class="line"></div>
                    </div>
                </div>
                <h3 class="destination-name">${dest.name}</h3>
            </div>
        `).join('');

        // Swiper slider-i başlatmaq
        new Swiper(".destinations-slider", {
            slidesPerView: 1.5, spaceBetween: 30, centeredSlides: true, loop: true,
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            breakpoints: {
                576: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1200: { slidesPerView: 4, spaceBetween: 30 }
            }
        });

    } catch (e) {
        console.error("Error loading destinations:", e);
        wrapper.innerHTML = '<p class="text-center text-danger">Məkanları yükləmək mümkün olmadı.</p>';
    }
});