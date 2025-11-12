const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

const ADMIN_PASS = process.env.ADMIN_PASS || 'ClasnaPro2025!';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper functions for reading and writing data
const readDB = (fileName) => {
    const filePath = path.join(__dirname, 'data', fileName);
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error reading or parsing ${fileName}:`, e);
        return [];
    }
};

const writeDB = (fileName, data) => {
    const filePath = path.join(__dirname, 'data', fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Admin authentication middleware
function authAdmin(req, res, next) {
    const pass = req.headers['x-admin-pass'];
    if (pass !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

// Function to process translatable content with fallback
function processTranslatable(items, lang = 'az') {
    if (!Array.isArray(items)) return [];
    return items.map(item => {
        const processedItem = { ...item };
        for (const key in item) {
            if (typeof item[key] === 'object' && item[key] !== null && typeof item[key].az !== 'undefined') {
                processedItem[key] = item[key][lang] || item[key]['az'];
            }
        }
        return processedItem;
    });
}

// Generic function to create public GET endpoints
function createPublicGetEndpoints(resourceName, translatable = false) {
    const fileName = `${resourceName}.json`;
    
    // GET PUBLIC LIST (processed for language)
    app.get(`/api/${resourceName}`, (req, res) => {
        const items = readDB(fileName);
        res.json(translatable ? processTranslatable(items, req.query.lang) : items);
    });

    // GET PUBLIC ITEM by ID (processed for language)
    app.get(`/api/${resourceName}/:id`, (req, res) => {
        const items = readDB(fileName);
        const item = items.find(x => x.id == req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(translatable ? processTranslatable([item], req.query.lang)[0] : item);
    });
}

// Generic function for ADMIN GET and DELETE endpoints
function createAdminEndpoints(resourceName) {
    const fileName = `${resourceName}.json`;
    // GET FULL LIST FOR ADMIN (unprocessed)
    app.get(`/api/admin/${resourceName}`, authAdmin, (req, res) => {
        res.json(readDB(fileName));
    });

    // DELETE ITEM
    app.delete(`/api/admin/${resourceName}/:id`, authAdmin, (req, res) => {
        let items = readDB(fileName);
        const initialLength = items.length;
        items = items.filter(i => i.id !== req.params.id);
        if (items.length < initialLength) {
            writeDB(fileName, items);
            res.json({ success: true, message: 'Element uğurla silindi.' });
        } else {
            res.status(404).json({ error: 'Element tapılmadı.' });
        }
    });
}

// Create public endpoints
createPublicGetEndpoints('tours', true);
createPublicGetEndpoints('destinations', true);
createPublicGetEndpoints('ideas', true);
createPublicGetEndpoints('cars');

// Create admin GET/DELETE endpoints
createAdminEndpoints('tours');
createAdminEndpoints('destinations');
createAdminEndpoints('ideas');
createAdminEndpoints('cars');

// --- Custom POST/PUT logic for each resource ---

// TOURS
app.post('/api/admin/tours', authAdmin, upload.single('imageFile'), (req, res) => {
    let items = readDB('tours.json');
    const newItem = {
        id: `tour${Date.now()}`, price: Number(req.body.price),
        title: { az: req.body.title_az, en: req.body.title_en, ru: req.body.title_ru },
        location: { az: req.body.location_az, en: req.body.location_en, ru: req.body.location_ru },
        duration: { az: req.body.duration_az, en: req.body.duration_en, ru: req.body.duration_ru },
        short: { az: req.body.short_az, en: req.body.short_en, ru: req.body.short_ru },
        details: { az: req.body.details_az, en: req.body.details_en, ru: req.body.details_ru },
        image: req.file ? `/uploads/${req.file.filename}` : ''
    };
    items.unshift(newItem);
    writeDB('tours.json', items);
    res.status(201).json({ success: true, item: newItem });
});
app.put('/api/admin/tours/:id', authAdmin, upload.single('imageFile'), (req, res) => {
    let items = readDB('tours.json');
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const updatedItem = { ...items[index], price: Number(req.body.price),
        title: { az: req.body.title_az, en: req.body.title_en, ru: req.body.title_ru },
        location: { az: req.body.location_az, en: req.body.location_en, ru: req.body.location_ru },
        duration: { az: req.body.duration_az, en: req.body.duration_en, ru: req.body.duration_ru },
        short: { az: req.body.short_az, en: req.body.short_en, ru: req.body.short_ru },
        details: { az: req.body.details_az, en: req.body.details_en, ru: req.body.details_ru },
    };
    if (req.file) updatedItem.image = `/uploads/${req.file.filename}`;
    items[index] = updatedItem;
    writeDB('tours.json', items);
    res.json({ success: true, item: updatedItem });
});

// DESTINATIONS
app.post('/api/admin/destinations', authAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mapImage', maxCount: 1 }]), (req, res) => {
    let items = readDB('destinations.json');
    const newItem = { id: `dest${Date.now()}`,
        name: { az: req.body.name_az, en: req.body.name_en, ru: req.body.name_ru },
        description: { az: req.body.description_az, en: req.body.description_en, ru: req.body.description_ru },
        image: req.files.image ? `/uploads/${req.files.image[0].filename}` : '',
        mapImage: req.files.mapImage ? `/uploads/${req.files.mapImage[0].filename}` : ''
    };
    items.unshift(newItem);
    writeDB('destinations.json', items);
    res.status(201).json({ success: true, item: newItem });
});
app.put('/api/admin/destinations/:id', authAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'mapImage', maxCount: 1 }]), (req, res) => {
    let items = readDB('destinations.json');
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const updatedItem = { ...items[index],
        name: { az: req.body.name_az, en: req.body.name_en, ru: req.body.name_ru },
        description: { az: req.body.description_az, en: req.body.description_en, ru: req.body.description_ru },
    };
    if (req.files.image) updatedItem.image = `/uploads/${req.files.image[0].filename}`;
    if (req.files.mapImage) updatedItem.mapImage = `/uploads/${req.files.mapImage[0].filename}`;
    items[index] = updatedItem;
    writeDB('destinations.json', items);
    res.json({ success: true, item: updatedItem });
});

// CARS
app.post('/api/admin/cars', authAdmin, upload.array('images', 5), (req, res) => {
    let items = readDB('cars.json');
    const newItem = { id: `car${Date.now()}`, title: req.body.title,
        images: req.files.length ? req.files.map(f => `/uploads/${f.filename}`) : []
    };
    items.unshift(newItem);
    writeDB('cars.json', items);
    res.status(201).json({ success: true, item: newItem });
});
app.put('/api/admin/cars/:id', authAdmin, upload.array('images', 5), (req, res) => {
    let items = readDB('cars.json');
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const updatedItem = { ...items[index], title: req.body.title };
    if (req.files.length) updatedItem.images = req.files.map(f => `/uploads/${f.filename}`);
    items[index] = updatedItem;
    writeDB('cars.json', items);
    res.json({ success: true, item: updatedItem });
});

// IDEAS
app.post('/api/admin/ideas', authAdmin, upload.single('image'), (req, res) => {
    let items = readDB('ideas.json');
    const newItem = { id: `idea${Date.now()}`,
        title: { az: req.body.title_az, en: req.body.title_en, ru: req.body.title_ru },
        image: req.file ? `/uploads/${req.file.filename}` : ''
    };
    items.unshift(newItem);
    writeDB('ideas.json', items);
    res.status(201).json({ success: true, item: newItem });
});
app.put('/api/admin/ideas/:id', authAdmin, upload.single('image'), (req, res) => {
    let items = readDB('ideas.json');
    const index = items.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    const updatedItem = { ...items[index],
        title: { az: req.body.title_az, en: req.body.title_en, ru: req.body.title_ru },
    };
    if (req.file) updatedItem.image = `/uploads/${req.file.filename}`;
    items[index] = updatedItem;
    writeDB('ideas.json', items);
    res.json({ success: true, item: updatedItem });
});

// --- CONTACT & BOOKING FORMS ---
app.get('/api/bookings', authAdmin, (req, res) => res.json(readDB('bookings.json')));
app.post('/api/car-booking', (req, res) => {
    const bookings = readDB('bookings.json');
    const newBooking = { bookingId: Date.now().toString(), receivedAt: new Date().toISOString(), ...req.body };
    bookings.unshift(newBooking);
    writeDB('bookings.json', bookings);
    res.json({ success: true, message: 'Müraciətiniz qəbul edildi.' });
});

app.get('/api/contacts', authAdmin, (req, res) => res.json(readDB('contacts.json')));
app.post('/api/contact', (req, res) => {
    const contacts = readDB('contacts.json');
    const newContact = { contactId: Date.now().toString(), receivedAt: new Date().toISOString(), ...req.body };
    contacts.unshift(newContact);
    writeDB('contacts.json', contacts);
    res.json({ success: true, message: 'Mesajınız üçün təşəkkür edirik.' });
});

app.listen(PORT, () => console.log(`Clasna Travel PRO running on http://localhost:${PORT}`));