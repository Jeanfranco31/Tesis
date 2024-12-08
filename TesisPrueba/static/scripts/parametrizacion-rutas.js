const main_content_view = document.getElementById('main_container_routes');
const folderPath = document.getElementById('folderInput');
const buttonSave = document.getElementById('button_save');
const closeModalButton = document.getElementById('save');
const modalCreateFolder = document.getElementById('modal_create_folder');
const message = document.getElementById('message_modal');
const inputCreateFolder = document.getElementById('inputFolderName');
var main_path = '';


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

        datos.forEach(fila => {
            const filaTabla = document.createElement('tr');
            filaTabla.innerHTML = `
                <td>${fila.id}</td>
                <td>${fila.nombre}</td>
            `;
            tablaCuerpo.appendChild(filaTabla);
        });

        // Muestra la tabla y oculta el mensaje de carga
        document.getElementById('tabla-datos').style.display = 'table';
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

function closeModal(){
    modalCreateFolder.style.display = "none";
}

function openModalCreatePath(){
    modalCreateFolder.style.display = "block";
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
    console.log(response.id_path)

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
    }else{
        generateMessageError(message);
    }
    closeModal();
    location.reload();
}

function generateMessageSuccesfull(message){
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.bottom = '4%';
    messageDiv.style.right = '4%';
    messageDiv.style.backgroundColor = '#6ee90e';
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

