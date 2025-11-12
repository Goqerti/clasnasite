let ALL_TOURS = [];

async function loadTours(){
  // Elementin mövcudluğunu yoxlayırıq
  const container = document.getElementById('list');
  if (!container) {
    // Əgər element yoxdursa, heç bir şey etmədən funksiyanı dayandırırıq.
    return;
  }
  
  const res = await fetch('/api/tours');
  ALL_TOURS = await res.json();
  render(ALL_TOURS);
}

function render(list){
  const container = document.getElementById('list');
  // Buradakı yoxlama artıq təhlükəsizdir, çünki yuxarıda varlığını təsdiqləmişik.
  container.innerHTML='';

  if(!list.length){
    container.innerHTML='<div class="col-12">No tours.</div>';
    return;
  }
  
  list.forEach(t=>{
    const col = document.createElement('div');
    col.className='col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card card-tour p-0 position-relative">
        <img src="${t.image}" class="w-100 rounded" alt="${t.title}">
        <div class="p-3">
          <h5 class="mb-1">${t.title}</h5>
          <p class="small text-muted">${t.location} • ${t.duration}</p>
          <p class="text-muted small">${t.short}</p>
          <div class="d-flex justify-content-between align-items-center mt-3">
            <a href="/tour.html?id=${t.id}" class="btn btn-sm btn-outline-primary">Details</a>
            <div class="badge-price">$${t.price}</div>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

// Axtarış və filtr elementlərinin də mövcudluğunu yoxlayaq
const searchInput = document.getElementById('search');
if (searchInput) {
  searchInput.addEventListener('input', function(){
    const q=this.value.trim().toLowerCase();
    render(ALL_TOURS.filter(t=> (t.title+' '+t.location).toLowerCase().includes(q)));
  });
}

const filterSelect = document.getElementById('filter');
if (filterSelect) {
  filterSelect.addEventListener('change', function(){
    const val=this.value;
    if(!val) render(ALL_TOURS);
    else render(ALL_TOURS.filter(t=> (t.duration||'').toLowerCase().includes(val.toLowerCase())));
  });
}

// Funksiyanı səhifə yüklənəndə çağırırıq
loadTours();