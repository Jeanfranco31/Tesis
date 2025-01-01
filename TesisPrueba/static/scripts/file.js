const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadForm = document.getElementById('upload-form');
const previewImg = document.getElementById('preview-img');
const button = document.getElementById('button');
const modalImgPreview = document.getElementById('modal-imgPreview');
const modalImg = document.getElementById('modal-img');
const option = document.getElementById('select-option');
const selectOptions = document.getElementById('selectOptions');
const optionHorizontalImage = document.getElementById('select-option-horizontal');
const modalEdit = document.getElementById('imageModal');
const containerMiniCards = document.getElementById('content_mini_cards');
const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const name = document.getElementById('name-user');


var selectedOption = '';
const h = document.getElementById('h');
const w = document.getElementById('w');


// Almacena los puntos
let points = [];
var divToPoints = [
                        {'id':'0', 'name':'Nariz', 'divName': document.getElementById('1')},
                        {'id':'11','name':'Hombro Izquierdo' , 'divName': document.getElementById('2')},
                        {'id':'12','name':'Hombro Derecho' , 'divName': document.getElementById('3')},
                        {'id':'13','name':'Codo Izquierdo' , 'divName': document.getElementById('4')},
                        {'id':'14','name':'Codo Derecho' , 'divName': document.getElementById('5')},
                        {'id':'15','name':'Muñeca Izquierda' , 'divName': document.getElementById('6')},
                        {'id':'16','name':'Muñeca Derecha', 'divName': document.getElementById('7')},
                        {'id':'23','name':'Cadera Izquierda', 'divName': document.getElementById('8')},
                        {'id':'24','name':'Cadera Derecha', 'divName': document.getElementById('9')},
                        {'id':'25','name':'Hombro Izquierdo', 'divName': document.getElementById('10')},
                        {'id':'26','name':'Rodilla Izquierda', 'divName': document.getElementById('11')},
                        {'id':'27','name':'Tobillo Izquierdo', 'divName': document.getElementById('12')},
                        {'id':'28','name':'Tobillo Derecho', 'divName': document.getElementById('13')},
                        {'id':'33','name':'Centro Pecho', 'divName': document.getElementById('14')}
                       ]
const fileModalImageName = '';
const width_resize = 0;
const height_resize = 0;
let position = -250;
sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});

document.addEventListener('DOMContentLoaded', async () => {
    const nameCache = localStorage.getItem('user');
    if(nameCache){
        name.textContent = nameCache;
    }
    await cargarRutas();
});

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
        // console.log("Enviar la imagen al servidor"+this.response.position);
        // points = this.response.position;

        // Esperar a que la imagen se cargue para obtener sus dimensiones
        modalImgPreview.onload = () => {
            $('#previewImageModal').modal('show'); // Mostrar el modal
        };
        fileInput.value = '';
    });


    function drawPoints(points, imgW, imgH) {

        drawMiniCards(points);

        const pointContainer = document.getElementById('point-container');
        pointContainer.innerHTML = '';

        pointContainer.style.position = 'absolute';
        pointContainer.style.width = `${imgW}px`;
        pointContainer.style.height = `${imgH}px`;

        points.forEach((point) => {
            const [index, x, y] = point;
            const pointDiv = document.createElement('div');

            pointDiv.classList.add('point');
            pointDiv.style.position = 'absolute';

            pointDiv.style.left = `${(x / imgW) * imgW}px`;
            pointDiv.style.top = `${(y / imgH) * imgH}px`;
            pointDiv.style.backgroundColor = 'red';
            pointDiv.style.borderRadius = '100%';
            pointDiv.style.width = '7px';
            pointDiv.style.height = '7px';

            makePointDraggable(pointDiv, index);

            pointContainer.appendChild(pointDiv);

        });
    }

    function drawMiniCards(points) {
                console.log(points)


        // Restablece todos los divs al color base
        divToPoints.forEach((option) => {
            const card = option.divName;
            if (card) {
                card.style.backgroundColor = 'rgb(255, 105, 105)'; // Color base (rojo)
                card.innerHTML = ''; // Limpia el contenido previo
            }
        });
        // Actualiza solo los divs correspondientes a los puntos encontrados
        points.forEach((point) => {
            const [index] = point; // Desempaqueta el índice del punto

            // Busca el div correspondiente
            const matchedOption = divToPoints.find((option) => option.id === index.toString());
            if (matchedOption && matchedOption.divName) {
                const card = matchedOption.divName;

                card.style.backgroundColor = 'rgb(88, 229, 65)';

                card.addEventListener("mouseenter", () => {
                  card.style.cursor = "pointer";
                  card.style.borderRadius = '10px';
                  card.style.boxShadow =  "0px 2px 4px black";
                });

                card.addEventListener("mouseleave", () => {
                  card.style.cursor = "pointer";
                  card.style.borderRadius = '0px';
                  card.style.transition  = '400ms all ease-in-out';
                  card.style.boxShadow = 'none';
                });

                const indexParagraph = document.createElement('p');
                indexParagraph.textContent = `${matchedOption.name}`;
                indexParagraph.style.color = 'white';
                indexParagraph.style.fontSize = '12px';
                indexParagraph.style.textAlign = 'center';
                indexParagraph.style.height = '30px';
                indexParagraph.style.lineHeight = '30px';

                card.innerHTML = ''; // Limpia el contenido anterior
                card.appendChild(indexParagraph); // Agrega contenido actualizado
            }
        });
    }

    // Hacer que un punto sea arrastrable y actualizar su posición
    function makePointDraggable(pointDiv, index) {
        pointDiv.onmousedown = function (event) {
            const container = document.getElementById('point-container'); // Contenedor de la imagen
            const containerRect = container.getBoundingClientRect(); // Obtener los límites del contenedor
    
            const onMouseMove = (e) => {
                // Coordenadas relativas al contenedor
                let x = e.clientX - containerRect.left;
                let y = e.clientY - containerRect.top;
    
                // Restringir movimiento dentro de los límites del contenedor
                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (x > containerRect.width) x = containerRect.width;
                if (y > containerRect.height) y = containerRect.height;
                
                // Actualizar posición del punto
                pointDiv.style.left = `${x}px`;
                pointDiv.style.top = `${y}px`;

                // Mostrar las coordenadas actuales en la consola
                console.log(`Nueva posición de punto ${index}: x = ${Math.trunc(x)}, y = ${Math.trunc(y)}`);

                const pointIndex = points.findIndex(p => p[0] === index);

                if (pointIndex !== -1) {
                    points[pointIndex][1] = Math.trunc(x);
                    points[pointIndex][2] = Math.trunc(y);
                
                    console.log(`Array actualizado:`, points);
                } else {
                    console.error(`No se encontró el índice para index: ${index}`);
                }                
            };
    
            document.addEventListener('mousemove', onMouseMove);
    
            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null;
            };
        };
    
        pointDiv.ondragstart = () => false;

        // let shiftX, shiftY;
        // const container = document.querySelector("#content_body");

        // const moveAt = (pageX, pageY) => {
        //     const containerRect = container.getBoundingClientRect();

        //     let newX = pageX - shiftX - containerRect.left + window.scrollX;
        //     let newY = pageY - shiftY - containerRect.top + window.scrollY;

        //     newX = Math.max(0, Math.min(newX, pointDiv.parentElement.clientWidth - pointDiv.offsetWidth));
        //     newY = Math.max(0, Math.min(newY, pointDiv.parentElement.clientHeight - pointDiv.offsetHeight));

        //     pointDiv.style.left = `${newX}px`;
        //     pointDiv.style.top = `${newY}px`;
        // }

        // const onMouseMove = (event) => {
        //     moveAt(event.pageX, event.pageY);
        //         console.log("Mouse Move:", event.pageX, event.pageY);

        // }

        // pointDiv.addEventListener('mousedown', (e) => {
        //     console.log("Mouse Down:", e.pageX, e.pageY);
        //     console.log("Point Initial:", pointDiv.getBoundingClientRect().left, pointDiv.getBoundingClientRect().top);

        //    e.preventDefault();
        //    shiftX = e.pageX  - pointDiv.getBoundingClientRect().left;
        //    shiftY = e.pageY  - pointDiv.getBoundingClientRect().top;

        //    document.addEventListener('mousemove', onMouseMove);
        //    document.addEventListener('mouseup', () => {
        //        document.removeEventListener('mousemove', onMouseMove);
        //    },{once : true});
        // });
        // pointDiv.ondragstart = () => false;
    }

    function savePoints(){
        const data = {
            points_position : this.points,
            file : this.fileModalImageName,
            width : this.width_resize,
            height : this.height_resize,
            pathToSave : selectedOption
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

            // Verifica que position sea un array antes de asignarlo
            if (Array.isArray(this.response.position)) {
                points = this.response.position;
            } else {
                console.error('El formato de position no es válido:', this.response.position);
                points = [];
            }
            
            // this.points = data.position;
            this.position_image = data.image_pos;

            modalImg.src = this.response.path;
            console.log('Array points antes de drawPoints:', points); 
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
            fillSelect(optionsToPoints, 'optionsToPoints');
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

    function fillSelect(options, selectId) {
        const selectElement = document.getElementById(selectId);

        // Limpia las opciones existentes (si las hay)
        selectElement.innerHTML = '';

        // Itera sobre el array para crear <option> por cada objeto
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id; // Asigna el id como value
            optionElement.textContent = option.name; // Usa el name como texto
            selectElement.appendChild(optionElement);
        });
    }


    //CAMBIO DE OPCIONES EN EL SELECT
    $('#imageModal').modal({
        backdrop:'static',
        keyboard:false
    });

    option.addEventListener('change', (event) =>{
        this.option = event.target.value;
        console.log(event.target.value);
    });
    document.addEventListener('click', (event) => {
    console.log('Click detectado:', event.target);
    });

    optionHorizontalImage.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    optionHorizontalImage.addEventListener('change', (event) => {
        this.optionHorizontalImage = event.target.value;
    });

    selectOptions.addEventListener('change', (event) => {
        selectedOption = event.target.selectedOptions[0].textContent; // Obtiene la opción seleccionada
        console.log(selectedOption);
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

    async function cargarRutas() {
        try {
            const selectOptions = document.querySelector("#selectOptions");
            if (!selectOptions) {
                throw new Error("El elemento selectOptions no existe en el DOM.");
            }

            let data = new FormData();
            data.append('id', localStorage.getItem('id'));

            const response = await fetch('/all_paths', {
                method: 'POST',
                body: data
            });

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servidor.");
            }

            const datos = await response.json();
            selectOptions.innerHTML = ""; // Limpia opciones previas
            datos.forEach(fila => {
                const option = document.createElement('option');
                option.value = fila.id;
                option.textContent = fila.nombre;
                selectOptions.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    };


