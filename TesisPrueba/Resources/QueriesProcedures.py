
def validate_login_query():
    return "SELECT id, nombre, apellido, pass, mail, stateuser FROM Users WHERE mail = %s"

def update_session():
    return "UPDATE users set lastentry = %s where id = %s"

def create_account_query():
    return "INSERT INTO users(nombre,apellido,cedula,pass,mail,stateUser, idrol) VALUES(%s,%s,%s,%s,%s,B'0',1)"

def insert_new_frame():
    return "INSERT INTO parametrizador_fps(valor_fps,id_user) values (%s,%s)"

def validate_frame_exists():
    return "select count(*) from parametrizador_fps where id_user = %s"

def update_frame_value():
    return "UPDATE parametrizador_fps SET valor_fps = %s where id_user = %s"

def get_frames_query():
    return "SELECT valor_fps FROM parametrizador_fps WHERE id_user = %s"