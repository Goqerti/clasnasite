document.addEventListener('DOMContentLoaded', () => {
    loadTourDetails();
});

async function loadTourDetails() {
    const params = new URLSearchParams(window.location.search);
    const tourId = params.get('id');
    const contentContainer = document.getElementById('content');
    
    if (!tourId) {
        contentContainer.innerHTML = '<p class="text-center text-danger">Tur ID tapılmadı.</p>';
        return;
    }

    try {
        const lang = localStorage.getItem('language') || 'az';
        const response = await fetch(`/api/tours?lang=${lang}`);
        const tours = await response.json();
        const tour = tours.find(t => t.id === tourId);

        if (!tour) {
            contentContainer.innerHTML = '<p class="text-center text-danger">Belə bir tur mövcud deyil.</p>';
            return;
        }

        // --- SEO DÜZƏLİŞLƏRİ BAŞLAYIR ---

        // 1. Səhifə başlığını dinamik olaraq turun adına uyğunlaşdırır
        document.title = `${tour.title} - Clasna Travel`;

        // 2. Səhifə üçün dinamik meta description yaradır
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', tour.short);
        
        // 3. Strukturlaşdırılmış məlumat (Schema) əlavə edir
        addTourSchema(tour);

        // --- SEO DÜZƏLİŞLƏRİ BİTİR ---

        renderTourDetails(tour, contentContainer);

    } catch (error) {
        console.error('Error loading tour details:', error);
        contentContainer.innerHTML = `<p class="text-center text-danger">Məlumat yüklənərkən xəta baş verdi.</p>`;
    }
}

function renderTourDetails(tour, container) {
    container.innerHTML = `
        <div class="row">
            <div class="col-lg-8 mb-4 mb-lg-0">
                <img src="${tour.image}" class="img-fluid rounded shadow-sm w-100" alt="${tour.title}">
                <div class="mt-4">
                    <h3 data-lang-key="tour_details">Tur haqqında detallar</h3>
                    <p>${tour.details}</p>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card shadow-soft">
                    <div class="card-body">
                        <h4 class="card-title">${tour.title}</h4>
                        <p class="text-muted"><i class="fas fa-map-marker-alt me-2"></i>${tour.location}</p>
                        <p class="text-muted"><i class="fas fa-clock me-2"></i>${tour.duration}</p>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5" data-lang-key="price">Qiymət:</span>
                            <span class="h4 text-primary fw-bold">$${tour.price}</span>
                        </div>
                        <a href="/contact.html" class="btn btn-primary w-100 mt-3" data-lang-key="book_now">Rezerv et</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addTourSchema(tour) {
    // Köhnə schema-nı sil
    const oldSchema = document.getElementById('tour-schema');
    if (oldSchema) {
        oldSchema.remove();
    }
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": tour.title,
        "description": tour.short,
        "itinerary": {
            "@type": "ItemList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "item": {
                        "@type": "TouristAttraction",
                        "name": tour.location
                    }
                }
            ]
        },
        "offers": {
            "@type": "Offer",
            "price": tour.price,
            "priceCurrency": "USD"
        },
        "provider": {
            "@type": "TravelAgency",
            "name": "Clasna Travel",
            "url": "https://www.clasnatravel.com" // Bura öz saytınızın ünvanını yazın
        }
    };

    const script = document.createElement('script');
    script.id = 'tour-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}