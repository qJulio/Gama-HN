const form = document.getElementById("propForm");
const table = document.getElementById("propTable");
const modal = document.getElementById("viewModal");

function loadProps(){
    const props = JSON.parse(localStorage.getItem("panelProps")||"[]");
    table.innerHTML = "";
    props.forEach(p => {
        const card = document.createElement("div");
        card.className = "card prop reveal";
        card.innerHTML = `
            <div class="content">
                <h3>${p.titulo}</h3>
                <div class="meta">📍 ${p.ciudad} • 🏷️ ${p.tipo} • 🛏️ ${p.recamaras} • 🛁 ${p.banos} • 📐 ${p.m2}m² • ${p.operacion==="venta"?`$${p.precio.toLocaleString()}`:`$${p.precio}/mes`}</div>
                <div class="actions">
                    <button data-view="${p.id}" class="btn-outline">Ver</button>
                    <button data-edit="${p.id}" class="btn-primary">Editar</button>
                    <button data-delete="${p.id}" class="btn-fav">Borrar</button>
                </div>
            </div>
        `;
        table.appendChild(card);
    });
}

// Guardar nueva propiedad
form.addEventListener("submit", e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const prop = {};
    fd.forEach((v,k)=>{
        if(["precio","recamaras","banos","m2"].includes(k)) prop[k] = Number(v);
        else if(["nueva","lujo"].includes(k)) prop[k] = (v==="true");
        else if(["nueva","lujo","Airbnb"].includes(k)) prop[k] = (v === "true");
        else prop[k] = v.trim();
    });
    const stored = JSON.parse(localStorage.getItem("panelProps")||"[]");
    prop.id = Date.now();
    stored.push(prop);
    localStorage.setItem("panelProps", JSON.stringify(stored));
    form.reset();
    loadProps();
});

// Acciones Ver, Editar, Borrar
table.addEventListener("click", e=>{
    const view = e.target.closest("[data-view]");
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-delete]");
    let props = JSON.parse(localStorage.getItem("panelProps")||"[]");

    if(view){
        const p = props.find(x=>x.id===Number(view.dataset.view));
        $("#viewImg").src = p.img;
        $("#viewTitulo").textContent = p.titulo;
        $("#viewUbicacion").textContent = `${p.ciudad} • ${p.tipo}`;
        $("#viewBadges").innerHTML = `<span>${p.recamaras} rec</span><span>${p.banos} baños</span><span>${p.m2} m²</span><span>${p.operacion==="venta"?`$${p.precio.toLocaleString()}`:`$${p.precio}/mes`}</span>${p.nueva?'<span>Nueva</span>':''}${p.lujo?'<span>Lujo</span>':''}`;
        $("#viewDesc").textContent = p.desc;
        
    
        modal.showModal();
    }

    if(edit){
        const id = Number(edit.dataset.edit);
        const p = props.find(x=>x.id===id);
        form.titulo.value = p.titulo;
        form.ciudad.value = p.ciudad;
        form.tipo.value = p.tipo;
        form.operacion.value = p.operacion;
        form.recamaras.value = p.recamaras;
        
        form.banos.value = p.banos;
        form.m2.value = p.m2;
        form.precio.value = p.precio;
        form.nueva.checked = p.nueva;
        form.lujo.checked = p.lujo;
        form.img.value = p.img;
        form.desc.value = p.desc;

        // Borrar la propiedad antigua al guardar
        props = props.filter(x=>x.id!==id);
        localStorage.setItem("panelProps", JSON.stringify(props));
    }

    if(del){
        const id = Number(del.dataset.delete);
        if(confirm("¿Seguro que quieres borrar esta propiedad?")){
            props = props.filter(x=>x.id!==id);
            localStorage.setItem("panelProps", JSON.stringify(props));
            loadProps();
        }
    }
});

// Cerrar modal
$(".modal-close").addEventListener("click", ()=>modal.close());

// Inicializar tabla
loadProps();

// Funciones auxiliares
function $(sel,c=document){return c.querySelector(sel);}
