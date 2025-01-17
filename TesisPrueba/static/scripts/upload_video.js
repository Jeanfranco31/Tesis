const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const buttonGenerateImagesFromVideo = document.getElementById('button');
const modelImages = document.getElementById('imageModal');
const loader = document.getElementById('loader_container');
const saveButton = document.getElementById('saveButton');
const option = document.getElementById('select-option');
const optionHorizontalImage = document.getElementById('select-option-horizontal');
const close_icon = document.getElementById('closeIcon');
const selectFrames = document.getElementById('frames');
const modalImage = document.getElementById('modal-img');


let points = [];
let fileName = "";
let width_resize = 0;
let height_resize = 0;
let currentIndex = 0;
let imagesArray = [];
let opcionActual = '';

var divToPoints =
    [
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

    document.addEventListener('DOMContentLoaded', async () => {
        const nameCache = localStorage.getItem('user');
        let width, height;
        let frame = localStorage.getItem('frames');

        selectFrames.disabled = true;

        if(nameCache){
            name.textContent = nameCache;
        }
        await cargarRutas();
        /*option.addEventListener('change', (event) => {
            selectedOption = event.target.value;

            if (selectedOption === 'option1') {
                width = 175;
                height = 260;
            } else if (selectedOption === 'option2') {
                width = 225;
                height = 334;
            } else if (selectedOption === 'option3') {
                width = 300;
                height = 445;
            } else {
                console.error('Opción no válida');
                return;
            }
            this.width_resize = width;
            this.height_resize = height;
        });
        */
        if (selectOptions.options.length > 0) {
            selectOptions.selectedIndex = 0;
            selectedOption = selectOptions.options[0].textContent;
            console.log(selectedOption)
        }
        selectOptions.addEventListener('change', (event) => {
            selectedOption = event.target.selectedOptions[0].textContent;
            console.log(selectedOption)
        });

        if (frame) {
            for (let i = 0; i < selectFrames.options.length; i++) {
                if (selectFrames.options[i].value === frame) {
                    selectFrames.selectedIndex = i;
                    break;
                }
            }
       } else {
            if (selectFrames.options.length > 0) {
                selectFrames.selectedIndex = 0;
            }
       }

       selectFrames.addEventListener('change', (event) => {
           opcionActual = event.target.value;
       });

       const modalImage = document.getElementById('modal-img');
        console.log(modalImage);

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
        buttonGenerateImagesFromVideo.style.opacity = '1' ;

        // Obtiene el archivo y lo asigna al input
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            fileInput.files = e.dataTransfer.files; // Asignar al input
            showPreviewVideo(file); // Mostrar la imagen
        }
    });

    dropZone.addEventListener('click', () => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            showPreview(fileInput.files[0]);
        }
    });

    function showPreviewVideo(file) {
        const videoPreview = document.getElementById('video-preview');
        const videoURL = URL.createObjectURL(file);

        let videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.src = videoURL;

        // Agrega la clase para limitar el alto
        videoElement.classList.add('video-preview-video');

        videoPreview.innerHTML = '';
        videoPreview.appendChild(videoElement);
        button.style.display = 'block';

    }

    async function GenerateImagesFromVideo() {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('video', file);
        formData.append('fps_value',localStorage.getItem('frames'))

        loader.style.display = 'block';

        try {
            const response = await fetch('/generate_images_from_videos', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }

            const data = await response.json();
            imagesArray = Object.keys(data).map((key) => data[key]);

            const modal = new bootstrap.Modal(document.getElementById('imageModal'));

            loader.style.display = 'none';
            modal.show();

            const previewContainer = document.getElementById('modal_footer_images');
            previewContainer.innerHTML = '';

            imagesArray.forEach((imageData) => {
                const img = document.createElement('img');
                img.src = `data:image/jpeg;base64,${imageData}`;
                img.style.maxWidth = '50px';
                img.style.maxHeight = '50px';
                img.style.margin = '10px';
                previewContainer.appendChild(img);
            });

            const updatePreviewContainer = () => {
                previewContainer.innerHTML = '';
                imagesArray.forEach((imageData) => {
                    const img = document.createElement('img');
                    img.src = `data:image/jpeg;base64,${imageData}`;
                    img.style.maxWidth = '50px';
                    img.style.maxHeight = '50px';
                    img.style.margin = '10px';
                    previewContainer.appendChild(img);
                });
            };

            if (imagesArray.length > 0) {
                const currentImageData = imagesArray[0];

                // Aquí procesas la imagen actual, por ejemplo:
                generatePoseFromBlob(currentImageData);

                saveButton.addEventListener('click', async () => {
                    const data = {
                        'points_position': points,
                        'file': fileName,
                        'width': width_resize,
                        'height': height_resize,
                        'pathToSave': selectedOption
                    };
                    console.log(data);

                    modal.hide();
                    try {
                        const response = await fetch('/save_image_from_video', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ data })
                        });

                        // Eliminar la imagen guardada del array y actualizar el contenedor de vista previa
                        imagesArray.shift();
                        updatePreviewContainer();

                        if (imagesArray.length > 0) {
                            generatePoseFromBlob(imagesArray[0]);
                        } else {
                            alert("Todas las imágenes han sido procesadas y guardadas.");
                        }
                    } catch (error) {
                        console.error('Error al enviar la imagen:', error);
                    } finally {
                        setTimeout(() => modal.show(), 1000);
                    }
                });
            } else {
                alert("No hay más imágenes para procesar.");
            }
        } catch (error) {
            console.error('Error al enviar el video:', error);
        }
    }

    async function generatePoseFromBlob(imageBase64) {
        try {
            const blob = await fetch(`data:image/jpeg;base64,${imageBase64}`).then((res) => res.blob());

            const formData = new FormData();
            formData.append('image', blob, 'image.jpg');

            const response = await fetch('/upload_image_video', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.statusText}`);
            }

            const result = await response.json();
            points = result.position;
            width_resize  = result.width;
            height_resize = result.height;
            fileName = result.filename;

console.log(result)
            /*
            if(result.image_pos === 'vertical'){
                optionHorizontalImage.style.display = 'none';
            }else{
                option.style.display = 'none';
            }
            */

            if (result.path) {
                const modalImage = document.getElementById('modal-img');

                modalImage.src = '';
                modalImage.style.width = '300px';
                modalImage.style.height = '445px';

                console.log('RESULT PATH:',result.path)

                modalImage.src = `${result.path}?${Math.random()}`;
            }
            drawPoints(points, 300, 445);


        } catch (error) {
            console.error('Error al enviar la imagen para generar la pose:', error);
        }
    }

    function drawPoints(points, imgW, imgH) {
        drawMiniCards(points);

        const pointContainer = document.getElementById('point-container');
        pointContainer.innerHTML = '';

        // Configurar el contenedor
        pointContainer.style.position = 'absolute';
        pointContainer.style.width = `${imgW}px`;
        pointContainer.style.height = `${imgH}px`;

        //console.log("Puntos recibidos:", points);

        points.forEach((point) => {
            const [index, x, y] = point;
            console.log(`Punto ${index}:`, point);

            const pointDiv = document.createElement('div');

            pointDiv.classList.add('point');
            pointDiv.style.position = 'absolute';

            // Ajustar las posiciones al tamaño del contenedor
            const normalizedX = Math.min(Math.max(x, 0), imgW); // Mantener dentro de [0, imgW]
            const normalizedY = Math.min(Math.max(y, 0), imgH); // Mantener dentro de [0, imgH]

            pointDiv.style.left = `${normalizedX}px`;
            pointDiv.style.top = `${normalizedY}px`;

            console.log(`Punto ${index}: left=${normalizedX}px, top=${normalizedY}px`);

            // Estilo del punto
            pointDiv.style.backgroundColor = 'red';
            pointDiv.style.borderRadius = '50%'; // Para círculos
            pointDiv.style.width = '7px';
            pointDiv.style.height = '7px';

            // Hacer el punto arrastrable
            makePointDraggable(pointDiv, index);

            // Agregar el punto al contenedor
            pointContainer.appendChild(pointDiv);
        });
    }


    function drawMiniCards(points) {

        divToPoints.forEach((option) => {
            const card = option.divName;
            if (card) {
                card.style.backgroundColor = 'rgb(255, 105, 105)';
                card.innerHTML = '';
            }
        });
        points.forEach((point) => {
            const [index] = point;

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

                card.innerHTML = '';
                card.appendChild(indexParagraph);
            }
        });
    }

    function makePointDraggable(pointDiv, index) {
        pointDiv.onmousedown = function (event) {
            const container = document.getElementById('point-container');
            const containerRect = container.getBoundingClientRect();

            const onMouseMove = (e) => {
                let x = e.clientX - containerRect.left;
                let y = e.clientY - containerRect.top;

                if (x < 0) x = 0;
                if (y < 0) y = 0;
                if (x > containerRect.width) x = containerRect.width;
                if (y > containerRect.height) y = containerRect.height;

                pointDiv.style.left = `${x}px`;
                pointDiv.style.top = `${y}px`;

                //console.log(`Nueva posición de punto ${index}: x = ${Math.trunc(x)}, y = ${Math.trunc(y)}`);

                const pointIndex = points.findIndex(p => p[0] === index);

                if (pointIndex !== -1) {
                    points[pointIndex][1] = Math.trunc(x);
                    points[pointIndex][2] = Math.trunc(y);

                    console.log(`Array actualizado:`, points);
                } else {
                    console.error(`No se encontró el índice para index: ${index}`);
                }
            };

            //console.log("ARRAY FINAL:",points)

            document.addEventListener('mousemove', onMouseMove);

            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null;
            };
        };
        pointDiv.ondragstart = () => false;
    }

    function closeModalImageEditor(){
        $('#imageModal').modal('hide');
        $(document).ready(function() {
            $('#video-preview').empty();
        });
        buttonGenerateImagesFromVideo.style.opacity = '0' ;
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
