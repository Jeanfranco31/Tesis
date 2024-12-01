
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadForm = document.getElementById('upload-form');
const previewImg = document.getElementById('preview-img');
const button = document.getElementById('button');
const modalImgPreview = document.getElementById('modal-imgPreview');
const modalImg = document.getElementById('modal-img');
const option = document.getElementById('select-option');
const optionHorizontalImage = document.getElementById('select-option-horizontal');
const h = document.getElementById('h');
const w = document.getElementById('w');


// Almacena los puntos
let points = [];
const fileModalImageName = '';
const width_resize = 0;
const height_resize = 0;
console.log('SE CARGO EL SCRIPT FILE.JS')
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
        e.stopPropagation();
        fileInput.click();
    });
    // Cuando seleccionas un archivo mediante clic
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showPreview(fileInput.files[0]); // Muestra vista previa de la imagen
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
        //let response = {};
        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append('image', file);

        try{
            const response = await fetch('/resize_image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                this.response = data;
                this.filePathName = data.path;
                this.width_resize = data.ancho
                this.height_resize = data.alto
            } else {
                throw new Error('Respuesta no es JSON válido');
            }
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }

        // Mostrar imagen procesada en el modal
        modalImgPreview.src = 'static/uploads/resized_' + file.name;
        this.fileModalImageName = 'resized_'+file.name;

        // Dibujar puntos sobre la imagen
        points = this.response.position;

        // Esperar a que la imagen se cargue para obtener sus dimensiones
        modalImgPreview.onload = () => {
            $('#previewImageModal').modal('show'); // Mostrar el modal
        };
        fileInput.value = '';
    });


    // Dibujar puntos sobre la imagen usando las dimensiones correctas
    function drawPoints(points, imgW, imgH) {
        const pointContainer = document.getElementById('point-container');
        pointContainer.innerHTML = '';

        pointContainer.style.position = 'absolute';
        pointContainer.style.width = ${imgW}px;
        pointContainer.style.height = ${imgH}px;

        points.forEach((point) => {
            const [index, x, y] = point;
            const pointDiv = document.createElement('div');

            pointDiv.classList.add('point');
            pointDiv.style.position = 'absolute';

            pointDiv.style.left = ${(x / imgW) * imgW}px;
            pointDiv.style.top = ${(y / imgH) * imgH}px;
            pointDiv.style.backgroundColor = 'red';
            pointDiv.style.borderRadius = '100%';
            pointDiv.style.width = '7px';
            pointDiv.style.height = '7px';

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

            newX = Math.max(0, Math.min(newX, pointDiv.parentElement.clientWidth - pointDiv.offsetWidth));
            newY = Math.max(0, Math.min(newY, pointDiv.parentElement.clientHeight - pointDiv.offsetHeight));

            pointDiv.style.left = ${newX}px;
            pointDiv.style.top = ${newY}px;
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
        const data = {
            points_position : this.points,
            file : this.fileModalImageName,
            width : this.width_resize,
            height : this.height_resize
        };

        try{
            const response = fetch('/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data })
            });
        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }
        closeModalImageEditor()
    }

    async function generatePose(){
        closeModal();
        let position_image;
        const fileName = this.fileModalImageName;

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName })
            });

            if (!response.ok) {
                const errorText = await response.text(); // Leer el texto del error para depurar
                console.error('Error en la respuesta del servidor:', errorText);
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            this.response = data;
            this.points = data.position;
            this.position_image = data.image_pos;

            modalImg.src = this.response.path;

            drawPoints(this.response.position, 300, 445);

        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }

        // Esperar a que la imagen se cargue para obtener sus dimensiones
        modalImg.onload = () => {
            $('#imageModal').modal('show'); // Mostrar el modal


            if(this.position_image === "vertical"){
                $('#select-option-horizontal').hide();
                w.textContent = '300px'
                h.textContent = '445px'
            }else{
                $('#select-option').hide();
                w.textContent = '350px'
                h.textContent = '233px'
            }
        };
    }

    function closeModal(){
        $('#previewImageModal').modal('hide');
    }

    function closeModalImageEditor(){
        modalImg.src = '';
        $('#imageModal').modal('hide');
    }

    function openModalImageEditor(){
        $('#imageModal').modal('show');
    }

    //CAMBIO DE OPCIONES EN EL SELECT
    option.addEventListener('change', (event) => {
        this.option = event.target.value;
    });

    optionHorizontalImage.addEventListener('change', (event) => {
        this.optionHorizontalImage = event.target.value;
    });


    async function resizeNewDimension() {
        let data;
        let new_image;
        let width, height;

        if(this.option != null){
            if (this.option === 'option1') {
                width = 175;
                height = 260;
            } else if (this.option === 'option2') {
                width = 225;
                height = 334;
            } else if (this.option === 'option3') {
                width = 300;
                height = 445;
            } else {
                console.error('Opción no válida');
                return;
            }
        }

        if(this.optionHorizontalImage != null){
            if (this.optionHorizontalImage === 'option1') {
                width = 250;
                height = 167;
            } else if (this.optionHorizontalImage === 'option2') {
                width = 300;
                height = 200;
            } else if (this.optionHorizontalImage === 'option3') {
                width = 350;
                height = 233;
            } else {
                console.error('Opción no válida');
                return;
            }
        }

        this.new_image = '';
        this.width_resize = width;
        this.height_resize = height;

        const formData = new FormData();
        formData.append('image', this.fileModalImageName);
        formData.append('width', this.width_resize);
        formData.append('height', this.height_resize);

        try {
            const response = await fetch('/resize_image_params', {
                method: 'POST',
                body: formData
            });

            // Espera a que la respuesta se convierta en JSON
            data = await response.json();

            // Verifica que 'data' contenga el path de la imagen
            if (data.path != null) {
                // Actualiza 'modalImg.src' con la nueva imagen redimensionada
                this.new_image = `${data.path}?timestamp=${new Date().getTime()}`;

                // Dibuja los puntos si están disponibles
                if (data.position != null) {
                    drawPoints(data.position, this.width_resize, this.height_resize);
                    this.points = data.position;
                }
            } else {
                console.error('La respuesta no contiene el path de la imagen');
            }

        } catch (error) {
            console.error('Error al enviar la imagen:', error);
        }

        // Cierra el modal y actualiza el contenido visual
        closeModalImageEditor();

        setTimeout(() => {
            openModalImageEditor();
            w.textContent = `${width}px`;
            h.textContent = `${height}px`;
            modalImg.src = this.new_image;
        }, 2000);

        console.log("OPT:", this.option);
    }





