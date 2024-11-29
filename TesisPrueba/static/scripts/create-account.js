const inputName = document.getElementById('inputName');
const inputApellido = document.getElementById('inputApellido');
const inputCedula = document.getElementById('inputIdentification');
const inputMail = document.getElementById('inputMail');
const inputPass = document.getElementById('inputPass');


async function createAccount() {
    const form = new FormData();
    form.append('name', inputName.value);
    form.append('lastName', inputApellido.value);
    form.append('identification', inputCedula.value);
    form.append('email'   , inputMail.value);
    form.append('pass'    , inputPass.value);

    try {
        const response = await fetch('/createAccount', {
            method: 'POST',
            body: form
        });
        const data = await response.json();
        console.log(data)
        if (data.created) {
            window.location.href = data.redirect_url;
        } else {
            document.getElementById('message_content').innerHTML =
            `
                <div style="height:50px; display:flex; justify-content:center; align-items:center;background-color:red;">
                    <p style="text-align:center;">${data.message}</p>
                </div>
            `
            setTimeout(() => {
                document.getElementById('message_content').innerHTML = '';
            }, 4000);
        }
    } catch (error) {
        console.error('Error:', error);
    }

}

function redirectLogin(){
    
}