const txtPath = document.getElementById('txtPath');
const txtFPS = document.getElementById('txtFPS');
const modal_first_session = document.getElementById('modal_first_session');

var stateTutorial = '';

document.addEventListener("DOMContentLoaded", async function () {
    const token = localStorage.getItem('token');
    await validateHasTutorial(token);

    setTimeout(() => {
        if (!token) {
            window.location.href = '/login';
            return;
        }

        const nameCache = localStorage.getItem('user');
        if (nameCache) {
            const name_m = document.getElementById('userTutorial');
            if (name_m) {
                name_m.textContent = nameCache;
            } else {
                console.log('No se pudo encontrar el elemento con id="name-user"');
            }
        } else {
            console.log('No se encontró el valor "user" en localStorage');
        }



        if(stateTutorial === '0'){
            modal_first_session.style.display = 'block';
        }
    }, 100);
});

async function saveFirstTutorial(){

    if(txtPath.value != null && txtPath.value != "" && txtFPS.value != null && txtFPS.value != ""){

        const form = new FormData();
        form.append('id_user',localStorage.getItem('id'));
        form.append('main_path',txtPath.value);
        form.append('fps_value',txtFPS.value);

        const request = await fetch('/saveFirstTutorialInfo',{
             method: 'POST',
             body: form
        });

        const response = await request.json();
        modal_first_session.style.display = 'none';
        localStorage.setItem('frames',txtFPS.value);

    }else{
        console.log('Verifica que ambos campos contengan datos')
    }
}

async function validateHasTutorial(token){

    const form = new FormData();
    form.append('id', localStorage.getItem('id'));

    const request = await fetch('/getTutorialState',{
         method: 'POST',
         headers: {
             'Authorization': `Bearer ${token}`,
         },
         body: form
    });

    if (request.status === 401) {
        alert('Tu sesión ha expirado o el token no es válido. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
    }

    const response = await request.json();
    stateTutorial = response.state_tutorial;
}