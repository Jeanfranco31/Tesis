const txtPath = document.getElementById('txtPath');
const txtFPS = document.getElementById('txtFPS');
const modal_first_session = document.getElementById('modal_first_session');

var stateTutorial = '';

document.addEventListener("DOMContentLoaded", async function () {
    await validateHasTutorial();
    if(stateTutorial === '0'){
        modal_first_session.style.display = 'block';
    }
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
        console.log(response)
        modal_first_session.style.display = 'none';

    }else{
        console.log('Verifica que ambos campos contengan datos')
    }



}

async function validateHasTutorial(){

    const form = new FormData();
    form.append('id', localStorage.getItem('id'));
    const request = await fetch('/getTutorialState',{
         method: 'POST',
         body: form
    });

    const response = await request.json();
    console.log(response);
    stateTutorial = response.state_tutorial;
}