document.addEventListener('DOMContentLoaded', () => {
    const carModelSelect = document.getElementById('carModelSelect');
    const bookingForm = document.getElementById('transportBookingForm');
    const bookingMsg = document.getElementById('bookingMsg');
    const bookingModalEl = document.getElementById('bookingModal');
    const bookingModal = new bootstrap.Modal(bookingModalEl);
    const lang = localStorage.getItem('language') || 'en';

    // Avtomobilləri yüklə və dropdown-a əlavə et
    async function loadCarsForSelect() {
        if (!carModelSelect) return;

        try {
            const res = await fetch('/api/cars');
            if (!res.ok) throw new Error('Network response was not ok');
            const cars = await res.json();
            
            cars.forEach((car, index) => {
                const option = document.createElement('option');
                option.value = `Nº: ${index + 1} - ${car.title}`;
                option.textContent = `Nº: ${index + 1} - ${car.title}`;
                carModelSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cars for select:', error);
            const option = document.createElement('option');
            option.textContent = 'Avtomobilləri yükləmək mümkün olmadı.';
            option.disabled = true;
            carModelSelect.appendChild(option);
        }
    }

    // Formu göndərdikdə
    if (bookingForm) {
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
                    bookingMsg.innerHTML = `<div class="alert alert-success">${json.message || 'Müraciətiniz uğurla göndərildi!'}</div>`;
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
    }

    // Modal açıldıqda köhnə mesajları təmizlə
    bookingModalEl.addEventListener('show.bs.modal', function () {
        bookingMsg.innerHTML = '';
        bookingForm.reset();
    });
    
    loadCarsForSelect();
});