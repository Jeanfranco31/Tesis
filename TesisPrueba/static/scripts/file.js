
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadForm = document.getElementById('upload-form');
const previewImg = document.getElementById('preview-img');
const button = document.getElementById('button');
const modalImg = document.getElementById('modal-img');
const option = document.getElementById('select-option');

// Almacena los puntos
let points = [];
const filePathName = '';

    // Permite arrastrar el archivo sobre la zona de drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Quita el estilo al salir
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    // Manejador para cuando se suelta el archivo
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        // Obtiene el archivo y lo asigna al input
        const files = e.dataTransfer.files[0];
        if (files && files.type.startsWith('image/')) {
            fileInput.files = e.dataTransfer.files; // Asignar al input
            showPreview(files); // Mostrar la imagen
        }
    });

    // Permitir hacer clic en la zona de drop
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Cuando seleccionas un archivo mediante clic
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            uploadForm.submit();
        }
    });

    // Función para mostrar la vista previa de la imagen
    function showPreview(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            button.style.display = 'block';
        }
        reader.readAsDataURL(file); // Leer el archivo como una URL
    }

    // Enviar la imagen al servidor
    button.addEventListener('click', async () => {
        let response = {};
        const file = fileInput.files[0];
        if (!file) {
            alert('Selecciona una imagen primero.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            this.response = data;
            this.filePathName = this.response.path;
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }
        console.log(this.response)
        // Mostrar imagen procesada en el modal
        modalImg.src = 'static/uploads/points_' + file.name;

        // Dibujar puntos sobre la imagen
        points = this.response.position;

        // Esperar a que la imagen se cargue para obtener sus dimensiones
        modalImg.onload = () => {

            //GET WIDTH AND HEIGHT FROM IMAGE UPLOAD
            const imgW = modalImg.width;
            const imgH = modalImg.height;

            console.log(modalImg.width, modalImg.height);

            drawPoints(this.response.position, imgW, imgH);
            $('#imageModal').modal('show'); // Mostrar el modal
        };
    });



    // Dibujar puntos sobre la imagen usando las dimensiones correctas
    function drawPoints(points, imgW, imgH) {
        const pointContainer = document.getElementById('point-container');
        pointContainer.innerHTML = ''; // Limpiar puntos anteriores

        points.forEach((point) => {
            const [index, x, y] = point;

            const pointDiv = document.createElement('div');
            pointContainer.style.position = 'absolute';
            pointContainer.style.top = '0';
            pointContainer.style.left = '0';
            pointContainer.style.backgroundColor = 'red';

            pointDiv.classList.add('point');
            pointDiv.style.position = 'absolute';

            pointDiv.style.left = `${(x / imgW) * 295}px`;
            pointDiv.style.top = `${(y / imgH) * 440}px`;


            makePointDraggable(pointDiv, index);

            pointContainer.appendChild(pointDiv);

        });
    }

    // Hacer que un punto sea arrastrable y actualizar su posición
    function makePointDraggable(pointDiv, index) {
        let shiftX, shiftY;
        const container = document.querySelector("#content_body");

        const moveAt = (pageX, pageY) => {
            const containerRect = container.getBoundingClientRect();

            let newX = pageX - shiftX - containerRect.left;
            let newY = pageY - shiftY - containerRect.top;

            newX = Math.max(0, Math.min(newX, container.clientWidth - pointDiv.offsetWidth));
            newY = Math.max(0, Math.min(newY, container.clientHeight - pointDiv.offsetHeight));

            pointDiv.style.left = `${newX}px`;
            pointDiv.style.top = `${newY}px`;
        }

        const onMouseMove = (event) => {
            moveAt(event.pageX, event.pageY);
        }

        pointDiv.addEventListener('mousedown', (e) => {
           e.preventDefault();
           shiftX = e.clientX - pointDiv.getBoundingClientRect().left;
           shiftY = e.clientY - pointDiv.getBoundingClientRect().top;

           document.addEventListener('mousemove', onMouseMove);
           document.addEventListener('mouseup', () => {
               document.removeEventListener('mousemove', onMouseMove);
           },{once : true});
        });
        pointDiv.ondragstart = () => false;
    }

    function savePoints(){
        let optionSelected;
        let sizeImage = { width: 0, height: 0};
        option.addEventListener("change", (event) => {
            optionSelected = event.target.value;

            if(optionSelected === 'option1'){
                sizeImage = {
                    width : 175,
                    height : 260
                }
            }
            else if(optionSelected === 'option2'){
                sizeImage = {
                    width : 225,
                    height : 334
                }
            }
            else{
                sizeImage = {
                    width : 300,
                    height : 445
                }
            }
        resizeImage(sizeImage.width, sizeImage.height);
        });



        modalImg.onload = () => {
            modalImg.style.width = `${sizeImage.width}px`;
            modalImg.style.height = `${sizeImage.height}px`;

            drawPoints(this.response.position, imgW, imgH);
            $('#imageModal').modal('show'); // Mostrar el modal
        };

        return sizeImage;

    }

     function resizeImage(width, height){
     }



