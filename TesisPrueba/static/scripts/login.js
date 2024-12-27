const inputMail = document.getElementById('mail');
const inputPassword = document.getElementById('password');

async function getLogin() {
    const form = new FormData();
    let ruta;
    form.append('mail', inputMail.value);
    form.append('pass', inputPassword.value);
    try {
        const response = await fetch('/validateLogin', {
            method: 'POST',
            body: form
        });
        const data = await response.json();
        if (data.authenticated) {
        this.ruta = data.redirect_url;
            localStorage.setItem('token',data.token)
            localStorage.setItem('user', data.user)
            localStorage.setItem('id', data.id)
            let idUser = data.id;
            await getPaths(idUser);

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
    window.location.href = this.ruta;
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
        console.log(response)
        localStorage.setItem('paths', JSON.stringify(response));
    }catch(error){
        console.log(error);
    }
}
