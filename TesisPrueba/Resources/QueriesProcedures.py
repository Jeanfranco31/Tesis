
def validate_login_query():
    return "SELECT id, nombre, apellido, pass, mail, stateuser, idrol FROM Users WHERE mail = %s " #and stateuser <> '0'

def update_session():
    return "UPDATE users set lastentry = %s where id = %s"

def create_account_query():
    return "INSERT INTO users(nombre,apellido,cedula,pass,mail,stateUser, idrol) VALUES(%s,%s,%s,%s,%s,B'1',2)"

def insert_new_frame():
    return "INSERT INTO parametrizador_fps(valor_fps,id_user) values (%s,%s)"

def validate_frame_exists():
    return "select count(*) from parametrizador_fps where id_user = %s"

def update_frame_value():
    return "UPDATE parametrizador_fps SET valor_fps = %s where id_user = %s"

def get_frames_query():
    return "SELECT valor_fps FROM parametrizador_fps WHERE id_user = %s"

def get_users_query():
    return "SELECT id, nombre, apellido, cedula, mail, nombrerol, stateuser FROM Users u INNER JOIN rol r ON r.id_rol = u.idrol"

def check_email_query():
    return "SELECT COUNT(*) FROM USERS WHERE MAIL = %s"

def get_menu_options_query():
    return "select distinct n.nombreoption, u.idrol from menuoption n INNER JOIN users u ON n.rol_id = u.idrol"

def get_all_paths_query():
    return "SELECT id_ruta_imagen, ruta_imagen, TO_CHAR(date_created, 'DD-MM-YYYY') as fecha FROM parametrizador_ruta_imagen pri, parametrizador_rutas pr where pr.user_id = %s and pr.id = pri.id_ruta_principal;"

def get_tutorial_state_query():
    return "select first_tutorial from users where id = %s"

def update_tutorial_state_query():
    return "UPDATE users SET first_tutorial = b'1' where id = %s"

def insert_tutorial_path_query():
    return "INSERT INTO parametrizador_rutas(ruta, user_id) VALUES(%s,%s)"