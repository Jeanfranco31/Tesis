const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const name = document.getElementById('name-user');

var position = -250;

sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});

document.addEventListener("DOMContentLoaded", async() => {
    await cargarUsuarios();
    const nameCache = localStorage.getItem('user');
    if(nameCache){
        name.textContent = nameCache;
    }
});



async function cargarUsuarios() {
    try {
        const response = await fetch('/users-all');
        const datos = await response.json();

        const tablaCuerpo = document.getElementById('tabla-cuerpo');

        datos.forEach(fila => {
            if(fila.stateUser === true){
                fila.stateUser = 'Activo'
            }else{
                fila.stateUser = 'Inactivo'
            }


            const filaTabla = document.createElement('tr');
            filaTabla.innerHTML = `
                <td>${fila.id}</td>
                <td>${fila.nombre} ${fila.apellido}</td>
                <td>${fila.cedula}</td>
                <td>${fila.mail}</td>
                <td>${fila.stateUser}</td>
                <td>
                    <button style="background-color:green; cursor:pointer;"><i class="bi bi-pencil-square" style="color:#ffffff;"></i></button>
                    <button style="background-color:red; cursor:pointer;"><i class="bi bi-trash3-fill" style="color:#ffffff;"></i></button>
                </td>
            `;
            tablaCuerpo.appendChild(filaTabla);
        });

        document.getElementById('tabla-datos').style.display = 'table';
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}
