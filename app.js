// ==== Datos iniciales ====
// Ya no usamos PROPS local, lo cargamos desde Google Sheets
let PROPS = [];

// ==== Estado ====
let state = {
  query:"",
  tipo:"",
  precio:"",
  recamaras:"",
  chip:"todas",
  page:1,
  pageSize:9,
  favoritos:new Set(JSON.parse(localStorage.getItem("favoritos")||"[]"))
};

const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>[...c.querySelectorAll(s)];
const grid=$("#grid");
const pageCur=$("#pageCur");
const pageMax=$("#pageMax");
const paginacion=$("#paginacion");
const modal=$("#detalleModal");
const formatMoney=v=>(v>=10000?`$${v.toLocaleString()}`:`$${v}`);

// ==== URL de tu Google Sheets Web App ====
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxQMwZOuBUAjIwR2ZyC2r7DlIz78AxG6iMz3yRmI_TDuIbkDiKEwB_IsuaV0atWlVDS/exec";

// ==== Cargar propiedades desde Google Sheets ====
async function loadPropsFromSheet(){
  try{
    const res = await fetch(SHEETS_URL);
    const data = await res.json();
    PROPS = data.map(p=>{
      // Convierte números y booleanos si es necesario
      return {
        ...p,
        id: Number(p.id),
        precio: Number(p.precio),
        recamaras: Number(p.recamaras),
        banos: Number(p.banos),
        m2: Number(p.m2),
        nueva: p.nueva==="true"||p.nueva===true,
        lujo: p.lujo==="true"||p.lujo===true,
        Airbnb: p.Airbnb==="true"||p.Airbnb===true
      };
    });
    applyFilters();
  }catch(err){
    console.error("Error cargando propiedades desde Sheets:", err);
  }
}

// ==== Render ====
function render(props){
  grid.innerHTML="";
  const start=(state.page-1)*state.pageSize;
  const slice=props.slice(start,start+state.pageSize);
  slice.forEach((p,i)=>{
    const card=document.createElement("article");
    card.className="card prop reveal";
    card.innerHTML=`
      <div class="media"><img src="${p.img}" alt="${p.titulo}"></div>
      <div class="content">
        <h3>${p.titulo}</h3>
        <div class="meta">📍 ${p.ciudad} • 🏷️ ${p.tipo} • 🛏️ ${p.recamaras} • 🛁 ${p.banos} • 📐 ${p.m2}m²</div>
        <div class="price">${p.operacion==="venta"?formatMoney(p.precio):`$${p.precio}/mes`}</div>
        <div class="actions">
          <button data-detalle="${p.id}" class="btn-outline">Ver</button>
          <button data-fav="${p.id}" class="btn-fav" aria-pressed="${state.favoritos.has(p.id)}">${state.favoritos.has(p.id)?"♥":"♡"}</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  const totalPages=Math.max(1,Math.ceil(props.length/state.pageSize));
  pageCur.textContent=state.page;
  pageMax.textContent=totalPages;
  paginacion.hidden=totalPages<=1;
}

// ==== Filtros ====
function applyFilters(){
  const q=state.query.toLowerCase();
  let res=PROPS.filter(p=>{
    let matchQ=!q||[p.ciudad,p.titulo].join(" ").toLowerCase().includes(q);
    let matchTipo=!state.tipo||p.tipo===state.tipo;
    let matchRec=!state.recamaras||p.recamaras>=Number(state.recamaras);
    let matchPrecio=true;
    if(state.precio){const [min,max]=state.precio.split("-").map(Number); matchPrecio=p.precio>=min&&p.precio<=max;}
    let matchChip=true;
    if(state.chip==="venta") matchChip=p.operacion==="venta";
    if(state.chip==="renta") matchChip=p.operacion==="renta";
    if(state.chip==="nueva") matchChip=p.nueva;
    if(state.chip==="lujo") matchChip=p.lujo;
    if(state.chip==="airbnb") matchChip = !!p.Airbnb;
    return matchQ&&matchTipo&&matchRec&&matchPrecio&&matchChip;
  });
  state.page=1;
  render(res);
  return res;
}

// ==== Eventos filtros ====
$("#buscador").addEventListener("submit",e=>{
  e.preventDefault();
  state.query=$("#q").value.trim();
  state.tipo=$("#tipo").value;
  state.precio=$("#precio").value;
  state.recamaras=$("#recamaras").value;
  applyFilters();
});
$("#filtrosSecundarios").addEventListener("click",e=>{
  const chip=e.target.closest(".chip");
  if(!chip) return;
  $$(".chip").forEach(c=>c.classList.remove("active"));
  chip.classList.add("active");
  state.chip=chip.dataset.chip;
  applyFilters();
});
$("#paginacion").addEventListener("click",e=>{
  const btn=e.target.closest("button");
  if(!btn) return;
  const total=Math.max(1,Math.ceil(applyFilters().length/state.pageSize));
  if(btn.dataset.page==="prev") state.page=Math.max(1,state.page-1);
  if(btn.dataset.page==="next") state.page=Math.min(total,state.page+1);
  render(applyFilters());
});

// ==== Modal y favoritos ====
grid.addEventListener("click",e=>{
  const btnD=e.target.closest("[data-detalle]");
  const btnF=e.target.closest("[data-fav]");
  if(btnD){
    const id=Number(btnD.dataset.detalle);
    const p=PROPS.find(x=>x.id===id);
    if(!p) return;
    $("#modalImg").src=p.img;
    $("#modalTitulo").textContent=p.titulo;
    $("#modalUbicacion").textContent=`${p.ciudad} • ${p.tipo}`;
    $("#modalBadges").innerHTML=`<span>${p.recamaras} rec</span><span>${p.banos} baños</span><span>${p.m2} m²</span><span>${p.operacion==="venta"?formatMoney(p.precio):`$${p.precio}/mes`}</span>${p.nueva?'<span>Nueva</span>':''}${p.lujo?'<span>Lujo</span>':''}`;
    $("#modalDesc").textContent=p.desc;
    modal.showModal();
  }
  if(btnF) toggleFav(Number(btnF.dataset.fav), btnF);
});
$(".modal-close").addEventListener("click",()=>modal.close());
function toggleFav(id,el){
  if(state.favoritos.has(id)) state.favoritos.delete(id);
  else state.favoritos.add(id);
  localStorage.setItem("favoritos",JSON.stringify([...state.favoritos]));
  if(el){
    const fav=state.favoritos.has(id);
    el.textContent=fav?"♥":"♡";
    el.setAttribute("aria-pressed",fav);
  }
}

// ==== Inicializar ====
loadPropsFromSheet();
