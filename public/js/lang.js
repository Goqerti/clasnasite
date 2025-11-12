document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.getElementById('language-switcher');
    const currentLangText = document.getElementById('current-lang-text');
    
    // 1. Brauzer yaddaşından hazırkı dili alırıq (susmaya görə 'az')
    const currentLanguage = localStorage.getItem('language') || 'az';

    // Dili dəyişən və yaddaşda saxlayan funksiya
    function setLanguage(lang) {
        // 2. Yeni dili yaddaşda saxlayırıq
        localStorage.setItem('language', lang);
        
        // 3. Səhifəni yeniləyirik ki, həm statik, həm də dinamik məzmunlar yeni dildə yüklənsin
        window.location.reload();
    }

    // Dil seçimi menyusundakı düymələrə klik hadisəsi
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', (event) => {
            // Yalnız düymələrə basıldıqda işləsin
            if (event.target.tagName === 'BUTTON') {
                const lang = event.target.getAttribute('data-lang');
                // Əgər seçilən dil hazırkı dildən fərqlidirsə, funksiyanı işə sal
                if (lang && lang !== currentLanguage) {
                    setLanguage(lang);
                }
            }
        });
    }

    // Statik mətnləri (HTML-də birbaşa yazılanları) tərcümə edən funksiya
    async function translateStaticContent() {
        try {
            const response = await fetch(`/lang/${currentLanguage}.json`);
            if (!response.ok) {
                console.error(`Statik tərcümə faylı tapılmadı: ${currentLanguage}.json`);
                return;
            }
            const translations = await response.json();
            
            // "data-lang-key" atributu olan bütün elementləri tapıb tərcümə edirik
            document.querySelectorAll('[data-lang-key]').forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (translations[key]) {
                    // Elementin placeholder, title kimi atributlarını da yoxlayırıq
                    if (element.placeholder) {
                        element.placeholder = translations[key];
                    } else if (element.title) {
                        element.title = translations[key];
                    } else {
                        element.textContent = translations[key];
                    }
                }
            });

            // Səhifənin dilini (<html> teqində) yeniləyirik
            document.documentElement.lang = currentLanguage;
            
            // Naviqasiya panelindəki dil yazısını yeniləyirik (AZ, EN, RU)
            if (currentLangText) {
                currentLangText.textContent = currentLanguage.toUpperCase();
            }

        } catch (error) {
            console.error('Statik tərcümə zamanı xəta:', error);
        }
    }
    
    // 4. Hər səhifə yüklənəndə bu funksiya işə düşür və yaddaşdakı dilə görə statik mətnləri tərcümə edir
    translateStaticContent();

    // Dinamik məzmun yükləndikdən sonra tərcümənin tətbiqi üçün "siqnal" gözləyicisi
    // Bu, main.js, tours.js kimi fayllar işini bitirdikdən sonra tərcüməni yeniləyir
    document.addEventListener('contentUpdated', translateStaticContent);
});