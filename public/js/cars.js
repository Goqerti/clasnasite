document.addEventListener('DOMContentLoaded', () => {
    const carListContainer = document.getElementById('car-list');
    const bookingModalEl = document.getElementById('bookingModal');
    const bookingModal = new bootstrap.Modal(bookingModalEl);
    const carModelInput = document.getElementById('carModelInput');
    const bookingForm = document.getElementById('bookingForm');
    const bookingMsg = document.getElementById('bookingMsg');
    const lang = localStorage.getItem('language') || 'en';

    // Avtomobilləri yüklə və göstər
    async function loadCars() {
        try {
            const res = await fetch('/api/cars');
            if (!res.ok) throw new Error('Network response was not ok');
            const cars = await res.json();
            
            carListContainer.innerHTML = '';
            if (!cars.length) {
                carListContainer.innerHTML = '<div class="col-12"><p class="text-center">Heç bir avtomobil tapılmadı.</p></div>';
                return;
            }

            cars.forEach((car, index) => {
                const carCard = document.createElement('div');
                carCard.className = 'col-lg-4 col-md-6';
                carCard.setAttribute('data-aos', 'fade-up');
                carCard.setAttribute('data-aos-delay', (index % 3) * 100);

                // Carousel üçün şəkillər
                const carouselItems = car.images && car.images.length > 0
                    ? car.images.map((img, i) => `
                        <div class="carousel-item ${i === 0 ? 'active' : ''}">
                            <img src="${img}" class="d-block w-100 car-card-img" alt="${car.title}">
                        </div>
                    `).join('')
                    : `<div class="carousel-item active"><img src="https://via.placeholder.com/400x250?text=No+Image" class="d-block w-100 car-card-img" alt="No Image Available"></div>`;

                carCard.innerHTML = `
                    <div class="card car-card">
                        <div id="carousel${car.id}" class="carousel slide" data-bs-ride="carousel">
                            <div class="carousel-inner">
                                ${carouselItems}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#carousel${car.id}" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                            </button>
                            <button class="carousel-control-next" type="button" data-bs-target="#carousel${car.id}" data-bs-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Next</span>
                            </button>
                        </div>
                        <div class="card-body text-center">
                            <h5 class="card-title">Nº: ${index + 1} - ${car.title}</h5>
                            <button class="btn btn-primary w-100 mt-2" data-car-title="${car.title}">Müraciət Et</button>
                        </div>
                    </div>
                `;
                carListContainer.appendChild(carCard);
            });
        } catch (error) {
            console.error('Error loading cars:', error);
            carListContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Avtomobilləri yükləmək mümkün olmadı.</p></div>';
        }
    }

    // Müraciət et düyməsinə klikləndikdə
    carListContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.hasAttribute('data-car-title')) {
            const carTitle = e.target.getAttribute('data-car-title');
            carModelInput.value = carTitle;
            bookingMsg.innerHTML = ''; // Köhnə mesajları təmizlə
            bookingForm.reset(); // Formu sıfırla
            bookingModal.show();
        }
    });

    // Formu göndərdikdə
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        bookingMsg.innerHTML = '';
        const fd = new FormData(bookingForm);
        const body = Object.fromEntries(fd.entries());

        try {
            const res = await fetch('/api/car-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            if (res.ok) {
                bookingMsg.innerHTML = `<div class="alert alert-success">${json.message}</div>`;
                bookingForm.reset();
                setTimeout(() => {
                    bookingModal.hide();
                    bookingMsg.innerHTML = ''; 
                }, 3000);
            } else {
                bookingMsg.innerHTML = `<div class="alert alert-danger">${json.error || 'Xəta baş verdi.'}</div>`;
            }
        } catch (error) {
            bookingMsg.innerHTML = `<div class="alert alert-danger">Şəbəkə xətası. Zəhmət olmasa, yenidən cəhd edin.</div>`;
        }
    });

    loadCars();
});