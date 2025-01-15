const modalDeleteUser = document.getElementById('modal_delete_user');
const deleteButtonOption = document.getElementById('btnDeleteOption');
const modalEditUser = document.getElementById('modal_edit_user');
const btnCancelEdit = document.getElementById('btnCancelEdit');
let btnGuardarEdit = document.getElementById('btnGuardarEdit');
const nameUserElement = document.getElementById('name-user');

const inputNameEdited = document.getElementById('nameEdited');
const inputLastNameEdited = document.getElementById('lastNameEdited');
const inputIdentificationEdited = document.getElementById('identificationEdited');
const cedulaMessage = document.getElementById('cedulaMessage');
const nameLastNameMessage = document.getElementById('nombreMessage');

document.addEventListener("DOMContentLoaded", async() => {
    await cargarUsuarios();
});

async function cargarUsuarios() {
    try {
        const response = await fetch('/users-all');
        const datos = await response.json();

        const tablaCuerpo = document.getElementById('tabla-cuerpo');
        tablaCuerpo.innerHTML = '';
        console.log(datos)
        datos.forEach(fila => {
            if(fila.stateUser === "1"){
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
                    <button style="background-color:green; cursor:pointer;" onclick="editUser(this)"><i class="bi bi-pencil-square" style="color:#ffffff;"></i></button>
                    <button style="background-color:red; cursor:pointer;" onclick="deleteUser(this)"><i class="bi bi-trash3-fill" style="color:#ffffff;"></i></button>
                </td>
            `;
            tablaCuerpo.appendChild(filaTabla);
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

function deleteUser(button){
    let rows = button.closest('tr');
    let rowData = Array.from(rows.querySelectorAll('td')).map(td => td.textContent);
    openModalDeleteUser(rowData);
}

async function openModalDeleteUser(rowData){
    modalDeleteUser.style.display = "block";

    console.log('ID del usuario a eliminar:', rowData[0]);
    deleteButtonOption.addEventListener("click", async() =>{
        let request = new FormData();
        request.append('user',rowData[0]);

        const response = await fetch('/delete_user', {
            method: 'POST',
            body: request
        });

        const data = await response.json();
        console.log(data);
        cargarUsuarios();
        generateMessageSuccesfull(data.message);
        closeModalDeleteUser();
    }, {once:true});
}

function closeModalDeleteUser(){
    modalDeleteUser.style.display = "none";
}

function editUser(button){
    let rows = button.closest('tr');
    let rowData = Array.from(rows.querySelectorAll('td')).map(td => td.textContent);
    openModalEditUser(rowData);
    console.log(rowData);
}

async function openModalEditUser(rowData){
    modalEditUser.style.display = "block";

    // Limpia el formulario previo
    inputNameEdited.value = '';
    inputLastNameEdited.value = '';
    inputIdentificationEdited.value = '';
    nameLastNameMessage.textContent = '';
    cedulaMessage.textContent = '';

    const id = rowData[0]; 
    console.log('ID del usuario a actualizar:', id);
    const originalCedula = rowData[2];

    const request = await fetch('/user-one', {
        method: 'POST',
        body: JSON.stringify({ id }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    var data = await request.json();
    const result = data.result;
    if (result) {
        inputNameEdited.value = result[0];
        inputLastNameEdited.value = result[1];
        inputIdentificationEdited.value = result[2];
    } else {
        console.error("No se encontraron datos para el usuario.");
        return;
    }

    //Botón de guardado
    btnGuardarEdit.replaceWith(btnGuardarEdit.cloneNode(true)); // Limpia eventos previos
    btnGuardarEdit = document.getElementById('btnGuardarEdit'); // Reasigna el botón

    btnGuardarEdit.addEventListener("click", async function guardarCambios() {
        nameLastNameMessage.textContent = '';
        cedulaMessage.textContent = '';

        const formData = new FormData();
        let valid = true;
        formData.append('user_id', id);

        //Validar Nombre y Apellido
        const nombre = inputNameEdited.value.trim();
        const apellido = inputLastNameEdited.value.trim();
        if (nombre.length >= 3 && apellido.length >= 3) {
            formData.append('name', nombre);
            formData.append('lastName', apellido);
        } else if (nombre === '' || apellido === '') {
            valid = false;
            nameLastNameMessage.textContent = 'Este campo no debe estar vacío';
        } else {
            valid = false;
            nameLastNameMessage.textContent = 'Debe contener minimo 3 letras';
        }

        //Validar cédula
        const cedula = inputIdentificationEdited.value.trim();
        if (cedula === originalCedula) {
            // La cédula no ha cambiado, es válida
            formData.append('identification', cedula);
            cedulaMessage.textContent = '';
        } else if (cedula.length === 10 && /^\d+$/.test(cedula)) {
            const response = await fetch('/check_cedula', {
                method: 'POST',
                body: JSON.stringify({ cedula }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        
            const data = await response.json();
        
            if (data.exists) {
                cedulaMessage.textContent = 'La cédula ingresada ya existe';
                valid = false;
            } else {
                formData.append('identification', cedula);
            }
        } else {
            valid = false;
            cedulaMessage.textContent = 'La cédula debe contener exactamente 10 dígitos.';
        }

        // No enviar si hay errores
        if (!valid) {
            console.error('El formulario contiene errores y no se enviará.');
            return;
        }

        try {
            btnGuardarEdit.disabled = true;
            const response = await fetch('/edit_user', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            const localStorageId = localStorage.getItem('id');
            if (result.result) {
                cargarUsuarios();
                closeModalEditUser();
                generateMessageSuccesfull(result.message);
                console.log('id: ', id, ' localStorageId: ', localStorageId);
                if (id === localStorageId) {
                    const requestUser = await fetch('/user-one', {
                        method: 'POST',
                        body: JSON.stringify({ id: localStorageId }),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }); 

                    var resultUser = await requestUser.json();
                    const dataUser = resultUser.result;
                    const UserLocal = dataUser[0];
                    
                    if (UserLocal) {
                        localStorage.setItem('user', UserLocal);
                        nameUserElement.textContent = UserLocal;

                        console.log("Si se encontraron datos para el usuario.");
                    } else {
                        console.log("No se encontraron datos para el usuario.");
                    }
                }
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
        } finally {
            btnGuardarEdit.disabled = false;
        }
    });
}

function closeModalEditUser(){
    modalEditUser.style.display = "none";
}

function generateMessageSuccesfull(message){
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.bottom = '4%';
    messageDiv.style.right = '4%';
    messageDiv.style.backgroundColor = 'rgba(103, 220, 17 ,0.8)';
    messageDiv.style.border = '1px solid #ccc';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.width = '220px';
    messageDiv.style.height = '60px';

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.textAlign  = 'center';
    messageText.style.lineHeight = '60px';
    messageDiv.appendChild(messageText);

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
