// Datos de muestra (reemplaza por datos reales o por tu backend/API)
const PROPS = [
  {
    id: 1,
    titulo: "Casa moderna con jardín",
    ciudad: "TEGUCIGALPA",
    tipo: "Casa",
    operacion: "venta",
    recamaras: 3,
    banos: 2,
    m2: 180,
    precio: 420000,
    nueva: true,
    lujo: false,
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop",
    desc: "Espacios abiertos, cocina integral y terraza con vista verde. Estacionamiento para 2 autos."
  },
  {
    id: 2,
    titulo: "Departamento céntrico",
    ciudad: "TEGUCIGALPA",
    tipo: "Departamento",
    operacion: "renta",
    recamaras: 2,
    banos: 1,
    m2: 78,
    precio: 1200, // renta mensual
    nueva: false,
    lujo: false,
    img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1600&auto=format&fit=crop",
    desc: "Ideal para ejecutivos. Amenidades: gym, cowork y seguridad 24/7."
  },
  {
    id: 3,
    titulo: "Penthouse de lujo con roof",
    ciudad: "TEGUCIGALPA",
    tipo: "Departamento",
    operacion: "venta",
    recamaras: 4,
    banos: 4,
    m2: 260,
    precio: 980000,
    nueva: false,
    lujo: true,
    img: "https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=1600&auto=format&fit=crop",
    desc: "Acabados premium, elevador directo y vista panorámica de la ciudad."
  },
  {
    id: 4,
    titulo: "Oficina lista para entrar",
    ciudad: "TEGUCIGALPA",
    tipo: "Oficina",
    operacion: "renta",
    recamaras: 0,
    banos: 2,
    m2: 120,
    precio: 2200,
    nueva: true,
    lujo: false,
    img: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?q=80&w=1600&auto=format&fit=crop",
    desc: "Open space, 2 privados, sala de juntas y 4 lugares de estacionamiento."
  },
  {
    id: 5,
    titulo: "Residencia con alberca",
    ciudad: "TEGUCIGALPA",
    tipo: "Casa",
    operacion: "venta",
    recamaras: 4,
    banos: 3,
    m2: 300,
    precio: 650000,
    nueva: false,
    lujo: true,
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop",
    desc: "Fraccionamiento privado, doble altura y family room. Alberca climatizada."
  },
  {
    id: 6,
    titulo: "Loft minimalista",
    ciudad: "TEGUCIGALPA",
    tipo: "Departamento",
    operacion: "renta",
    recamaras: 1,
    banos: 1,
    m2: 55,
    precio: 850,
    nueva: false,
    lujo: false,
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=1600&auto=format&fit=crop",
    desc: "Espíritu creativo, luz natural y balcón. A pasos del metro."
  }
];

// Estado
let state = {
  query: "",
  tipo: "",
  precio: "",
  recamaras: "",
  chip: "todas",
  page: 1,
  pageSize: 9,
  favoritos: new Set(JSON.parse(localStorage.getItem("favoritos") || "[]")),
};

// Utilidades
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const formatMoney = v => (v>=10000 ? `$${v.toLocaleString()}` : `$${v}`);

// Elementos
const grid = $("#grid");
const pageCur = $("#pageCur");
const pageMax = $("#pageMax");
const paginacion = $("#paginacion");

// Render de tarjetas
function render(props){
  grid.setAttribute("aria-busy","true");
  grid.innerHTML = "";
  const start = (state.page-1)*state.pageSize;
  const slice = props.slice(start, start + state.pageSize);

  slice.forEach((p,i)=>{
    const card = document.createElement("article");
    card.className = "card prop reveal";
    card.style.animationDelay = `${i*60}ms`;
    card.innerHTML = `
      <div class="media">
        <img src="${p.img}" alt="${p.titulo}" loading="lazy">
        <span class="badge">${p.operacion === "venta" ? "En venta" : "En renta"}</span>
      </div>
      <div class="content">
        <h3>${p.titulo}</h3>
        <div class="meta">
          <span>📍 ${p.ciudad}</span>
          <span>🏷️ ${p.tipo}</span>
          <span>🛏️ ${p.recamaras}</span>
          <span>🛁 ${p.banos}</span>
          <span>📐 ${p.m2} m²</span>
        </div>
        <div class="price">${p.operacion === "venta" ? formatMoney(p.precio) : `$${p.precio}/mes`}</div>
        <div class="actions">
          <button class="btn-outline" data-detalle="${p.id}">Ver detalles</button>
          <button class="btn-fav" aria-pressed="${state.favoritos.has(p.id)}" data-fav="${p.id}">${state.favoritos.has(p.id) ? "♥" : "♡"}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Paginación
  const totalPages = Math.max(1, Math.ceil(props.length / state.pageSize));
  pageCur.textContent = state.page;
  pageMax.textContent = totalPages;
  paginacion.hidden = totalPages <= 1;

  grid.setAttribute("aria-busy","false");

  // Observador para animaciones "reveal"
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){ e.target.classList.add("is-visible"); io.unobserve(e.target); }
    }
  }, {threshold:.12});
  $$(".reveal").forEach(el=> io.observe(el));
}

// Filtro principal
function applyFilters(){
  const q = state.query.toLowerCase();
  let res = PROPS.filter(p=>{
    const matchQ = !q || [p.ciudad, p.titulo].join(" ").toLowerCase().includes(q);
    const matchTipo = !state.tipo || p.tipo === state.tipo;
    const matchRec = !state.recamaras || p.recamaras >= Number(state.recamaras);
    let matchPrecio = true;
    if(state.precio){
      const [min,max] = state.precio.split("-").map(Number);
      matchPrecio = p.precio >= min && p.precio <= max;
    }
    let matchChip = true;
    if(state.chip==="venta") matchChip = p.operacion==="venta";
    if(state.chip==="renta") matchChip = p.operacion==="renta";
    if(state.chip==="nueva") matchChip = !!p.nueva;
    if(state.chip==="lujo") matchChip = !!p.lujo;

    return matchQ && matchTipo && matchRec && matchPrecio && matchChip;
  });

  // KPIs dinámicos
  $("#kpi-listados").textContent = `${res.length}+`;

  // Reinicia página si el filtro cambia
  state.page = 1;
  render(res);
  return res;
}

// Eventos de filtros
$("#buscador").addEventListener("submit", (e)=>{
  e.preventDefault();
  state.query = $("#q").value.trim();
  state.tipo = $("#tipo").value;
  state.precio = $("#precio").value;
  state.recamaras = $("#recamaras").value;
  applyFilters();
});

// Chips
$("#filtrosSecundarios").addEventListener("click", (e)=>{
  const chip = e.target.closest(".chip");
  if(!chip) return;
  $$(".chip").forEach(c=> c.classList.remove("active"));
  chip.classList.add("active");
  state.chip = chip.dataset.chip;
  applyFilters();
});

// Paginación
$("#paginacion").addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const total = Math.max(1, Math.ceil(applyFilters().length / state.pageSize));
  if(btn.dataset.page==="prev") state.page = Math.max(1, state.page-1);
  if(btn.dataset.page==="next") state.page = Math.min(total, state.page+1);
  render(applyFilters());
});

// Modal detalle
const modal = $("#detalleModal");
grid.addEventListener("click", (e)=>{
  const btnD = e.target.closest("[data-detalle]");
  const btnF = e.target.closest("[data-fav]");
  if(btnD){
    const id = Number(btnD.dataset.detalle);
    const p = PROPS.find(x=> x.id === id);
    if(!p) return;
    $("#modalImg").src = p.img;
    $("#modalTitulo").textContent = p.titulo;
    $("#modalUbicacion").textContent = `${p.ciudad} • ${p.tipo}`;
    const badges = $("#modalBadges");
    badges.innerHTML = `
      <span class="badge-chip">${p.recamaras} rec</span>
      <span class="badge-chip">${p.banos} baños</span>
      <span class="badge-chip">${p.m2} m²</span>
      <span class="badge-chip">${p.operacion === "venta" ? formatMoney(p.precio) : `$${p.precio}/mes`}</span>
      ${p.nueva ? '<span class="badge-chip">Nueva</span>' : ''}
      ${p.lujo ? '<span class="badge-chip">Lujo</span>' : ''}
    `;
    $("#modalDesc").textContent = p.desc;
    $("#btnContactar").href = "#contacto";
    const fav = state.favoritos.has(p.id);
    const btnFav = $("#btnFav");
    btnFav.setAttribute("aria-pressed", fav);
    btnFav.textContent = fav ? "♥" : "♡";
    btnFav.dataset.id = p.id;
    modal.showModal();
  }
  if(btnF){
    toggleFav(Number(btnF.dataset.fav), btnF);
  }
});
$(".modal-close").addEventListener("click", ()=> modal.close());
$("#btnFav").addEventListener("click", (e)=>{
  const id = Number(e.currentTarget.dataset.id);
  toggleFav(id, e.currentTarget);
});
function toggleFav(id, el){
  if(state.favoritos.has(id)){ state.favoritos.delete(id); }
  else { state.favoritos.add(id); }
  localStorage.setItem("favoritos", JSON.stringify([...state.favoritos]));
  if(el){
    const fav = state.favoritos.has(id);
    el.setAttribute("aria-pressed", fav);
    el.textContent = fav ? "♥" : "♡";
  }
}

// Navbar móvil
$("#navToggle").addEventListener("click", ()=>{
  const links = document.querySelector(".nav-links");
  const showing = getComputedStyle(links).display !== "none";
  links.style.display = showing ? "none" : "flex";
});

// Dark/Light theme toggle
const toggle = $("#toggle-theme");
let light = false;
toggle.addEventListener("click", ()=>{
  light = !light;
  document.documentElement.classList.toggle("theme-light", light);
});

// Validación simple de formularios
$("#contactForm").addEventListener("submit", (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  if(!form.checkValidity()){
    $("#formMsg").textContent = "Por favor completa los campos requeridos.";
    return;
  }
  $("#formMsg").textContent = "¡Gracias! Te contactaremos muy pronto.";
  form.reset();
});
$("#newsletter").addEventListener("submit", (e)=>{
  e.preventDefault();
  alert("¡Suscripción exitosa!");
});

// Año en footer
$("#year").textContent = new Date().getFullYear();

// Render inicial
applyFilters();
render(PROPS);
const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const url = "https://script.google.com/macros/s/AKfycbxruWsZMKc0VimmxhYuIQBxAgwFhhcQdey7FqymujApdURavXSbz1ikQf9DAoxS3gjG/exec"; // Pega aquí la URL del web app

  try {
    const res = await fetch(url, {
      method: "POST",
      body: data
    });
    const json = await res.json();
    if (json.status === "success") {
      alert("¡Mensaje enviado con éxito!");
      form.reset();
    } else {
      alert("Error: " + json.message);
    }
  } catch (err) {
    alert("Error al enviar, intenta de nuevo.");
    console.error(err);
  }
});
