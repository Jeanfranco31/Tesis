const optionsPaths = document.getElementById('paths');
const optionsFiles = document.getElementById('files');
const name = document.getElementById('name-user');
const sidebar = document.getElementById('toggle_button');
const nav = document.getElementById('nav');
const imageContent = document.getElementById('image_result');
const select_image = document.getElementById('select_image');
var position = -250;
var optionPath = '';
var optionFile = '';
var ArrayJsonData = [];


document.addEventListener("DOMContentLoaded", async function () {
   await loadPaths();
   await loadUserName();
});

sidebar.addEventListener('click', () =>{
    if(position === -250){
        position = 0;
    } else {
        position = -250;
    }
    nav.style.left = `${position}px`;
});


async function loadPaths(){
    let options = localStorage.getItem('paths');
    let pathsArray = JSON.parse(options);

    pathsArray.forEach((option) => {
        let opt = document.createElement("option");
        opt.value = option.id;
        opt.textContent = option.nombre;
        optionsPaths.appendChild(opt);
    });
}

async function loadUserName(){
    const nameCache = localStorage.getItem('user');
    if(nameCache){
        name.textContent = nameCache;
    }
}

optionsPaths.addEventListener('change', function () {
    const selectedOption = optionsPaths.options[optionsPaths.selectedIndex];
    const selectedValue = selectedOption.textContent;
    optionPath = selectedValue;

    if (selectedValue) {
        getFilesByPathName(selectedValue);
    }
});

optionsFiles.addEventListener('change', function () {
    const selectedOption = optionsFiles.options[optionsFiles.selectedIndex];
    const selectedValue = selectedOption.textContent;
    optionFile = selectedValue;
});



async function getFilesByPathName(selectedValue){
    let form = new FormData();
    form.append('pathName',selectedValue);
    const request = await fetch('/getFilesByPathname', {
        method: 'POST',
        body: form
    });

    let response = await request.json();
    let files = response.files;
        console.log(response)
    ArrayJsonData = response.data;
    console.log(ArrayJsonData);

    files.forEach((option) => {
        let opt = document.createElement("option");
        opt.textContent = option.nombre;
        optionsFiles.appendChild(opt);
    });
}

async function showImage() {
    console.log(optionPath, ' -Y- ', optionFile);
    for (const data of ArrayJsonData) {
        if (data.path === optionFile) {
            try {
                let form = new FormData();
                form.append('path', optionPath);
                form.append('file', data.path);

                let request = await fetch('/getImage', {
                    method: 'POST',
                    body: form
                });

                if (request.ok) {
                    const blob = await request.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    imageContent.src = imageUrl;
                    imageContent.style.width = `${data.size.width}px`;
                    imageContent.style.height = `${data.size.heigth}px`;
                    select_image.innerHTML = '';

                    let points = data.content.points_position
                    displayPoints(points);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}

function displayPoints(points) {
    const image = document.getElementById('image_result');
    const container = document.querySelector('.content_image');

    imageContent.onload = () => {
        document.querySelectorAll('.point').forEach(point => point.remove());

        points.forEach(([id, x, y]) => {
            const point = document.createElement('div');
            point.className = 'point';

            point.style.left = `${x}px`;
            point.style.top = `${y}px`;

            container.appendChild(point);
        });
    };
}
