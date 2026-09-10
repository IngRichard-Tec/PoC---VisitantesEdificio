// Base de datos local
let residentes = JSON.parse(localStorage.getItem('condo_residentes')) || [];
let visitas = JSON.parse(localStorage.getItem('condo_visitas')) || [];

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderResidentes();
  renderVisitas();
  // Establecer fecha por defecto en formulario de visitas a "ahora"
  document.getElementById('vis-fecha').value = new Date().toISOString().slice(0, 16);
});

// Control de Navegación (SPA)
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`sec-${sectionId}`).classList.add('active');
  event.target.classList.add('active');
}

/* ===================================================
   GESTIÓN DE RESIDENTES (CRUD)
=================================================== */

function guardarResidente(e) {
  e.preventDefault();

  const id = document.getElementById('residente-id').value;
  const nombre = document.getElementById('res-nombre').value.trim();
  const telefono = document.getElementById('res-telefono').value.trim();
  const piso = document.getElementById('res-piso').value;
  const depto = document.getElementById('res-depto').value;

  // Validación: Máximo 4 residentes por departamento
  const residentesEnDepto = residentes.filter(r => r.piso === piso && r.depto === depto && r.id !== id);
  if (residentesEnDepto.length >= 4) {
    alert(`El Piso ${piso} - Depto ${depto} ya cuenta con el límite máximo de 4 residentes.`);
    return;
  }

  if (id) {
    // Editar existente
    const index = residentes.findIndex(r => r.id === id);
    residentes[index] = { id, nombre, telefono, piso, depto };
  } else {
    // Crear nuevo
    const nuevoResidente = {
      id: Date.now().toString(),
      nombre,
      telefono,
      piso,
      depto
    };
    residentes.push(nuevoResidente);
  }

  localStorage.setItem('condo_residentes', JSON.stringify(residentes));
  resetFormResidente();
  renderResidentes();
}

function renderResidentes() {
  const tbody = document.getElementById('tabla-residentes');
  tbody.innerHTML = '';

  if(residentes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay residentes registrados.</td></tr>`;
    return;
  }

  residentes.forEach(res => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${res.nombre}</td>
      <td>${res.telefono}</td>
      <td>Piso ${res.piso} - Depto ${res.depto}</td>
      <td>
        <button class="btn btn-warning" onclick="editarResidente('${res.id}')">Editar</button>
        <button class="btn btn-danger" onclick="borrarResidente('${res.id}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarResidente(id) {
  const res = residentes.find(r => r.id === id);
  if (!res) return;

  document.getElementById('residente-id').value = res.id;
  document.getElementById('res-nombre').value = res.nombre;
  document.getElementById('res-telefono').value = res.telefono;
  document.getElementById('res-piso').value = res.piso;
  document.getElementById('res-depto').value = res.depto;

  document.getElementById('form-resident-title').innerText = "Modificar Residente";
  document.getElementById('btn-save-resident').innerText = "Actualizar";
  document.getElementById('btn-cancel-edit').style.display = "inline-block";
}

function borrarResidente(id) {
  if (confirm("¿Estás seguro de que deseas eliminar a este residente?")) {
    residentes = residentes.filter(r => r.id !== id);
    localStorage.setItem('condo_residentes', JSON.stringify(residentes));
    renderResidentes();
  }
}

function resetFormResidente() {
  document.getElementById('form-residente').reset();
  document.getElementById('residente-id').value = '';
  document.getElementById('form-resident-title').innerText = "Agregar Nuevo Residente";
  document.getElementById('btn-save-resident').innerText = "Guardar Residente";
  document.getElementById('btn-cancel-edit').style.display = "none";
}


/* ===================================================
   GESTIÓN DE VISITAS
=================================================== */

// Cargar dinámica de Residentes al seleccionar Piso + Depto
function cargarResidentesDepto() {
  const piso = document.getElementById('vis-piso').value;
  const depto = document.getElementById('vis-depto').value;
  const selectResidente = document.getElementById('vis-residente');

  selectResidente.innerHTML = '';

  if (!piso || !depto) {
    selectResidente.disabled = true;
    selectResidente.innerHTML = '<option value="">-- Primero elige piso y depto --</option>';
    return;
  }

  // Filtrar residentes
  const filtrados = residentes.filter(r => r.piso === piso && r.depto === depto);

  if (filtrados.length === 0) {
    selectResidente.disabled = true;
    selectResidente.innerHTML = '<option value="">No hay residentes en este departamento</option>';
  } else {
    selectResidente.disabled = false;
    selectResidente.innerHTML = '<option value="">-- Seleccione Residente --</option>';
    filtrados.forEach(r => {
      const option = document.createElement('option');
      option.value = r.nombre;
      option.textContent = r.nombre;
      selectResidente.appendChild(option);
    });
  }
}

function guardarVisita(e) {
  e.preventDefault();

  const piso = document.getElementById('vis-piso').value;
  const depto = document.getElementById('vis-depto').value;
  const residente = document.getElementById('vis-residente').value;
  const nombreVisita = document.getElementById('vis-nombre').value.trim();
  const tipoVisita = document.getElementById('vis-tipo').value;
  const fecha = document.getElementById('vis-fecha').value;

  if(!residente) {
    alert("Debes seleccionar un residente.");
    return;
  }

  const nuevaVisita = {
    id: Date.now().toString(),
    piso,
    depto,
    residente,
    nombreVisita,
    tipoVisita,
    fecha
  };

  visitas.push(nuevaVisita);
  localStorage.setItem('condo_visitas', JSON.stringify(visitas));

  alert("Visita registrada correctamente.");
  document.getElementById('form-visita').reset();
  document.getElementById('vis-residente').disabled = true;
  document.getElementById('vis-residente').innerHTML = '<option value="">-- Primero elige piso y depto --</option>';
  
  renderVisitas();
}

function renderVisitas() {
  const tbody = document.getElementById('tabla-visitas');
  tbody.innerHTML = '';

  if (visitas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay visitas registradas.</td></tr>`;
    return;
  }

  // Ordenar de la más reciente a la más antigua
  visitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  visitas.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(v.fecha).toLocaleString()}</td>
      <td><strong>${v.nombreVisita}</strong></td>
      <td>${v.tipoVisita}</td>
      <td>Piso ${v.piso} - Depto ${v.depto}</td>
      <td>${v.residente}</td>
    `;
    tbody.appendChild(tr);
  });
}
