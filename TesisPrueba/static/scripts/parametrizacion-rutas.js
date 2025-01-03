const main_content_view = document.getElementById('main_container_routes');
const folderPath = document.getElementById('folderInput');
const buttonSave = document.getElementById('button_save');
const closeModalButton = document.getElementById('save');
const modalCreateFolder = document.getElementById('modal_create_folder');
const message = document.getElementById('message_modal');
const inputCreateFolder = document.getElementById('inputFolderName');
const deleteButtons = document.getElementById('deletePath');
const modalOptions = document.getElementById('modal_delete_path');
const deleteButtonOption = document.getElementById('btnDeleteOption');
const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const name = document.getElementById('name-user');

var main_path = '';

let position = -250;
sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});

document.addEventListener("DOMContentLoaded", async function () {
   await HasPath();
   await cargarRutas();
   const nameCache = localStorage.getItem('user');
    if(nameCache){
        name.textContent = nameCache;
    }
});



async function HasPath(){
    const form = new FormData()
    form.append('id', localStorage.getItem('id'))

    try{
        const response = await fetch('/validate_has_path',{
            method: 'POST',
            body: form
        });
        const data = await response.json()
        if(data.ruta){
            folderPath.placeholder = '';
            folderPath.disabled = true;
            buttonSave.style.display = "none";
            folderPath.value = data.ruta;
            main_path = data.ruta;
        }else {
            folderPath.placeholder = 'Pega aqui la ruta que tendra tu proyecto completo'
        }
    }catch(error){
        console.log(error)
    }
}

async function saveMainPath(){
    const form = new FormData()
    form.append('path',folderPath.value)
    form.append('id', localStorage.getItem('id'))

    try{
        const response = await fetch('/parametrizador-ruta-principal',{
            method: 'POST',
            body: form
        });
    }catch(error){
        console.log(error)
    }
}

async function cargarRutas() {
    try {
        let data = new FormData();
        data.append('id', localStorage.getItem('id'));

        const response = await fetch('/all_paths', {
            method: 'POST',
            body: data
        });
        const datos = await response.json();

        const tablaCuerpo = document.getElementById('tabla-cuerpo');
        console.log(datos)
        datos.forEach(fila => {
            const filaTabla = document.createElement('tr');
            filaTabla.innerHTML = `
                <td>${fila.id}</td>
                <td>${fila.nombre}</td>
                <td>${fila.fechaCreacion}</td>
                <td>
                    <button id="deletePath" class="delete-path-btn" style="background-color:red; cursor:pointer; border-radius:4px;" onclick="deletePath(this)">
                        <i class="bi bi-trash3-fill" style="color:#ffffff;"></i>
                    </button>
                </td>
            `;
            tablaCuerpo.appendChild(filaTabla);
        });

        // Muestra la tabla y oculta el mensaje de carga
        document.getElementById('tabla-datos').style.display = 'table';
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

async function saveNewFolder(){
    const data = new FormData();
    data.append('main_path',this.main_path);

    //HACER UNA CONSULTA PARA OBTENER EL ID DE LA RUTA EN BASE
    const request = await fetch('/getIdMainPath',{
        method: 'POST',
        body : data
    });
    let response = await request.json()

    const savefolder = new FormData();
    savefolder.append('nameFolder',this.main_path+'\\'+inputCreateFolder.value);
    savefolder.append('id_main_folder',response.id_path);

    //HACER UNA CONSULTA PARA OBTENER EL ID DE LA RUTA EN BASE
    const request_folder = await fetch('/save_new_folder',{
        method: 'POST',
        body : savefolder
    });
    let response_folder = await request_folder.json();
    let message = response_folder.message;

    if(response_folder.created){
        generateMessageSuccesfull(message);
        let idUser = localStorage.getItem('id');
        await getPaths(idUser);
        location.reload();

    }else{
        generateMessageError(message);
    }
    closeModal();
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

function generateMessageError(message){
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.bottom = '4%';
    messageDiv.style.right = '4%';
    messageDiv.style.backgroundColor = '#da0b0b';
    messageDiv.style.border = '1px solid #ccc';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.width = '220px';
    messageDiv.style.height = '60px';

    const messageText = document.createElement('p');
    messageText.textContent = message;
    messageText.style.textAlign  = 'center';
    messageText.style.lineHeight = '60px';
    messageText.style.color = '#ffffff';
    messageDiv.appendChild(messageText);

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function deletePath(button){
    let rows = button.closest('tr');
    let rowData = Array.from(rows.querySelectorAll('td')).map(td => td.textContent);
    openModalOptions(rowData[1]);
}


//modals actions
function closeModal(){
    modalCreateFolder.style.display = "none";
}

function openModalCreatePath(){
    modalCreateFolder.style.display = "block";
}

function closeModalOptions(){
    modalOptions.style.display = "none";
}

async function openModalOptions(rowData){
    modalOptions.style.display = "block";

    deleteButtonOption.addEventListener("click", async() =>{
        let request = new FormData();
        request.append('path',rowData);

        const response = await fetch('/delete_folder', {
            method: 'POST',
            body: request
        });

        var data = await response.json();
        console.log(data)
        generateMessageSuccesfull(data.message);
        closeModalOptions();
    });

}


async function getPaths(idUser){
    try{
        let form = new FormData();
        console.log(idUser)
        form.append('id',idUser);

        let request = await fetch('/all_paths',{
            method: 'POST',
            body: form
        });

        let response = await request.json();
        localStorage.setItem('paths', JSON.stringify(response));
    }catch(error){
        console.log(error);
    }
}
