const modalDeleteUser = document.getElementById('modal_delete_user');
const deleteButtonOption = document.getElementById('btnDeleteOption');
const modalEditUser = document.getElementById('modal_edit_user');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const btnGuardarEdit = document.getElementById('btnGuardarEdit');

const inputNameEdited = document.getElementById('nameEdited');
const inputLastNameEdited = document.getElementById('lastNameEdited');
const inputIdentificationEdited = document.getElementById('identificationEdited');

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

        //document.getElementById('tabla-datos').style.display = 'table';
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

function deleteUser(button){
    let rows = button.closest('tr');
    let rowData = Array.from(rows.querySelectorAll('td')).map(td => td.textContent);
    openModalDeleteUser(rowData[0]);
}

async function openModalDeleteUser(rowData){
    modalDeleteUser.style.display = "block";

    deleteButtonOption.addEventListener("click", async() =>{
        let request = new FormData();
        request.append('user',rowData);

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
}

async function openModalEditUser(rowData){
    modalEditUser.style.display = "block";
    const id = rowData[0]; 
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
        console.error("No se enccontraron datos para el usuario.");
        return;
    }

    //Botón de guardado
    btnGuardarEdit.addEventListener("click", async() => {
        const formData = new FormData();
        formData.append('name', inputNameEdited.value.trim());
        formData.append('lastName', inputLastNameEdited.value.trim());
        formData.append('identification', inputIdentificationEdited.value.trim());
        formData.append('user_id', id)

        try {
            const response = await fetch('/edit_user', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.result) {
                cargarUsuarios();
                closeModalEditUser();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
        }
    }, { once: true });
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
