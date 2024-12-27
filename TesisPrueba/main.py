import datetime

from flask import Flask, render_template, request, jsonify, json, redirect, url_for, session, send_file
import pyodbc
import os
import cv2 as cv
import glob
import jwt
from datetime import datetime
from shutil import copyfile
from PIL import Image
import psycopg2
from six import print_

from Resources.Middleware import token_required
from Resources.Middleware import get_key, deserialize_token
from model.PoseModule import poseDetector
from Resources.Conexion import get_connection
from Resources.Encrypt import  encrypt_password

# Inicializar la app Flask
app = Flask(__name__, static_folder="static")
conn = get_connection()

# Crear una carpeta para guardar las imágenes subidas
UPLOAD_FOLDER = 'static/uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Crear el detector de poses
detector = poseDetector()


#ROUTES
@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/upload-image')
def upload():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/create_account')
def create_accountView():
    return render_template('create-account.html')

@app.route('/configuration_path')
def configuration_path():
    return render_template('parametrizacion-rutas.html')

@app.route('/verify-images')
def verify_images():
    return render_template('verify-images.html')

@app.route('/dashboard')
#@token_required
def view_dashboard():
    return render_template('dashboard.html')

@app.route('/gestion-usuarios')
def manage_users():
    return render_template('gestion-usuarios.html')



#ENDPOINTS
@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        # Verificar si se recibió el nombre del archivo
        data = request.get_json()

        if not data or 'fileName' not in data:
            return jsonify({'message': 'No se proporcionó un nombre de archivo válido.'}), 400

        filename = data['fileName']
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Verificar si el archivo existe
        if not os.path.isfile(filepath):
            return jsonify({'message': 'El archivo no existe.'}), 404

        with Image.open(filepath) as image:
            original_width, original_height = image.size
            if original_width > original_height:
                image_position = 'horizontal'
            else:
                image_position = 'vertical'

        # Procesar la imagen y detectar la pose
        img = cv.imread(filepath)

        img_with_pose = detector.findPose(img)

        # Guardar la imagen con los puntos detectados
        output_path = os.path.join(UPLOAD_FOLDER, 'points_' + filename)
        cv.imwrite(output_path, img_with_pose)

        # Coordenadas de los puntos
        position = detector.findPosition(img_with_pose)

        return jsonify({
            'message': 'Imagen procesada exitosamente.',
            'path': output_path,
            'image_pos':image_position,
            'position': position
        }), 200

    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500

@app.route('/resize_image', methods=['POST'])
def resizeImage():
    try:

        # Verificar si el archivo está en la solicitud
        if 'image' not in request.files:
            return jsonify({'error': 'No se encontró ninguna imagen'}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({'error': 'Nombre de archivo vacío'}), 400

        # Guardar el archivo temporalmente
        filepath = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(filepath)

        # Obtener dimensiones de la imagen antes de redimensionar
        with Image.open(filepath) as img:
            original_width, original_height = img.size  # Obtiene ancho y alto

            if original_width > original_height:
                #Si la Imagen es horizontal
                with Image.open(filepath) as img:
                    resized_img = img.resize((350, 233))
                    resized_img_w = 350
                    resized_img_h = 233
                    resized_image_name = 'resized_' + image.filename
                    output_path_file = os.path.join(UPLOAD_FOLDER, resized_image_name)

                    # Guardar la imagen redimensionada
                    resized_img.save(output_path_file, format='JPEG', quality=90)

            else:
                #Si la Imagen es vertical
                with Image.open(filepath) as img:
                    resized_img = img.resize((300, 445))
                    resized_img_w = 300
                    resized_img_h = 445
                    resized_image_name = 'resized_' + image.filename
                    output_path_file = os.path.join(UPLOAD_FOLDER, resized_image_name)

                    # Guardar la imagen redimensionada
                    resized_img.save(output_path_file, format='JPEG', quality=90)


        return jsonify({'Imagen_Redimensionada': output_path_file, 'alto':resized_img_h, 'ancho':resized_img_w}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/resize_image_params', methods=['POST'])
def resize_image_params():
    print("LLEGO AL ENDPOINT")
    try:
        width = request.form.get('width')
        height = request.form.get('height')
        image = request.form.get('image')

        # Guardar el archivo temporalmente
        filepath = os.path.join(UPLOAD_FOLDER, image)

        # Obtener dimensiones de la imagen antes de redimensionar
        with Image.open(filepath) as img:
            original_width, original_height = img.size  # Obtiene ancho y alto
            if original_width > original_height:
                # Si la Imagen es horizontal
                with Image.open(filepath) as img:
                    resized_img = img.resize((int(width), int(height)))
                    resized_img_w = width
                    resized_img_h = height
                    resized_image_name = 'new_' + image
                    output_path_file = os.path.join(UPLOAD_FOLDER, resized_image_name)

                    # Guardar la imagen redimensionada
                    resized_img.save(output_path_file, format='JPEG', quality=90)
                    img = cv.imread(output_path_file)
                    img_with_pose = detector.findPose(img)

                    # Coordenadas de los puntos
                    position = detector.findPosition(img_with_pose)

                    return jsonify({
                        'message': 'Imagen procesada exitosamente.',
                        'path': output_path_file,
                        'position': position
                    }), 200

            else:
                # Si la Imagen es vertical
                with Image.open(filepath) as img:
                    resized_img = img.resize((int(width), int(height)))
                    resized_img_w = width
                    resized_img_h = height
                    resized_image_name = 'new_' + image
                    output_path_file = os.path.join(UPLOAD_FOLDER, resized_image_name)

                    # Guardar la imagen redimensionada
                    resized_img.save(output_path_file, format='JPEG', quality=90)
                    img = cv.imread(output_path_file)
                    img_with_pose = detector.findPose(img)

                    # Coordenadas de los puntos
                    position = detector.findPosition(img_with_pose)

                    return jsonify({
                        'message': 'Imagen procesada exitosamente.',
                        'path': output_path_file,
                        'position': position
                    }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/save', methods=['POST'])
def saveImageData():
    try:
        data = request.get_json()
        file_name = data['data']['file']
        points_position = data['data']['points_position']
        width_file = data['data']['width']
        heigth_file = data['data']['height']
        file = data['data']['pathToSave']
        center_x = width_file/2
        center_y = heigth_file/2
        local_path = str(file)
        final_path = local_path+'\\Imagen'

        # si la ruta Imagen no existe la crea
        if not os.path.exists(final_path):
            os.makedirs(final_path)

        #obtener archivos totales
        total = get_total_files(final_path)

        #nuevo formato de nombre  000001
        name, ext = os.path.splitext(file_name)
        name_to_save = f"{total}{ext}"

        # Guardar el JSON con los puntos
        json_file_name = "Points_Json.json"
        path_json = os.path.join(local_path, json_file_name)

        new_image_json = {
                        "path":name_to_save,
                        "content":{
                            "points_position": points_position
                        },
                        "size":{
                            "width": width_file,
                            "heigth" : heigth_file
                        },
                        "center": {
                            "x": center_x,
                            "y": center_y
                        }
                    }

        if os.path.exists(path_json):
            with open(path_json,"r") as json_file:
                data = json.load(json_file)
                if not isinstance(data, list):
                    data = [data]
        else:
            data = []
        data.append(new_image_json)

        with open(path_json, "w") as json_file:
            json.dump(data, json_file, indent= 4)

        image_file_path = os.path.join(final_path,name_to_save)
        path_base_image = os.path.join(UPLOAD_FOLDER,f"points_{file_name}")

        print(image_file_path)

        # Crear o copiar la imagen con el nombre indicado
        copyfile(path_base_image, image_file_path)  # Copia una imagen base con el nuevo nombre

        delete_temp_image(UPLOAD_FOLDER)
        return jsonify({'success': True, 'message': 'Imagen y datos guardados exitosamente!'}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
    return jsonify({'success': False, 'message': 'Ocurrió un error al guardar la imagen o los datos.'}), 500



def delete_temp_image(carpeta):
    files = glob.glob(os.path.join(carpeta, "*"))  # Lista todos los archivos
    for file in files:
        if os.path.isfile(file):
            os.remove(file)

def get_total_files(final_path):
    file_count = sum(1 for file in os.listdir(final_path)
                     if os.path.isfile(os.path.join(final_path, file)))
    file_count_str = str(file_count+1)

    if len(file_count_str) == 1:
        final_path = '0000'+file_count_str

    elif len(file_count_str) == 2:
        final_path = '000'+file_count_str
    elif len(file_count_str) == 3:
        final_path = '00'+file_count_str
    elif len(file_count_str) == 4:
        final_path = '0'+file_count_str
    else:
        final_path = file_count_str

    return final_path

#user controllers
@app.route('/validateLogin', methods=['POST'])
def validate_login():
    try:
        mail = request.form.get('mail')
        passw = encrypt_password(request.form.get('pass'))

        with get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT id, pass, nombre FROM Users WHERE mail = %s"
            cursor.execute(query, (mail,))

            # Recorre los resultados
            result = cursor.fetchone()

            if result and result[1] == passw:
                # Usuario autenticaded
                token = jwt.encode({
                    "user_id": result[0]
                }, get_key(), algorithm="HS256")
                return jsonify({'authenticated': True, 'redirect_url': url_for('view_dashboard'), 'user':result[2], 'id':result[0], 'token': token}), 200
            else:
                # Usuario no autenticado
                return jsonify({'authenticated': False, 'message': 'Usuario o contraseña incorrecta'}), 401

    except psycopg2.Error as e:
        print("Error al ejecutar la consulta:", e)
        return jsonify({'authenticated': False, 'message': 'Error interno del servidor'}), 500

@app.route('/createAccount', methods=['POST'])
def createAccount():
    try:
        name = request.form.get('name')
        lastName = request.form.get('lastName')
        identification = request.form.get('identification')
        email = request.form.get('email')
        password = request.form.get('pass')
        passw = encrypt_password(password)

        with get_connection() as conn:
            cursor = conn.cursor()
            query = "INSERT INTO users(nombre,apellido,cedula,pass,mail,stateUser, idrol) VALUES(%s,%s,%s,%s,%s,B'1',1)"
            params = (name,lastName,identification,passw,email)
            cursor.execute(query, params)
            conn.commit()

            return jsonify({'created': True, 'redirect_url': url_for('login')}), 200


    except psycopg2.Error as e:
        print("Error al ejecutar la consulta:", e)
        return jsonify({'authenticated': False, 'message': 'Error interno del servidor'}), 500

@app.route('/users-all', methods=['GET'])
def getUsers():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM Users"
            cursor.execute(query)
            rows = cursor.fetchall()

            # Convertir el resultado en una lista de diccionarios
            usuarios = []
            for row in rows:
                usuarios.append({
                    "id": row[0],
                    "nombre": row[1],
                    "apellido": row[2],
                    "cedula": row[3],
                    "mail": row[5],
                    "stateUser": row[6],
                })

            return jsonify(usuarios), 200

    except pyodbc.Error as e:
        print("Error al ejecutar la consulta:", e)
        return jsonify({'authenticated': False, 'message': 'Error interno del servidor'}), 500


@app.route('/parametrizador-ruta-principal', methods=['POST'])
def save_main_route():
    user_id = request.form.get('id')
    main_path = request.form.get('path')

    with get_connection() as conn:
        cursor = conn.cursor()
        query = "INSERT INTO parametrizador_rutas(ruta, user_id) VALUES(%s,%s)"
        params = (main_path, user_id)
        cursor.execute(query, params)
        conn.commit()

        return jsonify({'created': True, 'message': 'Ruta guardada'}), 200


@app.route('/validate_has_path', methods=['POST'])
def HasPath():
    user_id = request.form.get('id')
    user_id = int(user_id)
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT ruta FROM parametrizador_rutas WHERE user_id = %s"
        params = (user_id,)
        cursor.execute(query, params)
        row = cursor.fetchone()

        if row:
            return jsonify({'ruta': row[0], 'message':'Ruta guardada'}), 200
    return jsonify({'Ocurrio un error al tratar de guardar la ruta'}), 400


@app.route('/getIdMainPath', methods=['POST'])
def get_id_main_path():
    path = request.form.get('main_path')
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT id FROM parametrizador_rutas WHERE ruta = %s"
        params = (path,)
        cursor.execute(query, params)
        row = cursor.fetchone()

        if row:
            print("DATA",row[0])
            return jsonify({'id_path': row[0]}), 200
    return jsonify({'Ocurrio un error al obtener el id de la ruta'}), 400


@app.route('/save_new_folder', methods=['POST'])
def save_new_folder():
    id_main_path = int(request.form.get('id_main_folder'))
    main_path = request.form.get('nameFolder')
    date = datetime.now().strftime('%d-%m-%Y')

    # Se crea la carpeta automaticamente
    if not os.path.exists(main_path):
        os.makedirs(main_path)

        with get_connection() as conn:
            cursor = conn.cursor()
            query = "INSERT INTO parametrizador_ruta_imagen(ruta_imagen, date_created, id_ruta_principal) VALUES(%s,%s,%s)"
            params = (main_path,date,id_main_path)
            cursor.execute(query, params)
            conn.commit()

            return jsonify({'created': True, 'message': 'Ruta creada con exito'}), 200
    else:
        return jsonify({'created': False, 'message': 'Ruta ya existe'}), 400

@app.route('/all_paths', methods=['POST'])
def getPaths():
    id = int(request.form.get('id'))
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT id_ruta_imagen, ruta_imagen, TO_CHAR(date_created, 'DD-MM-YYYY') as fecha  FROM parametrizador_ruta_imagen INNER JOIN parametrizador_rutas pr ON pr.user_id = %s"
            params = (id,)
            cursor.execute(query, params)
            rows = cursor.fetchall()

            rutas = []
            for row in rows:
                rutas.append({
                    "id": row[0],
                    "nombre": row[1],
                    "fechaCreacion":row[2]
                })
            return jsonify(rutas), 200

    except pyodbc.Error as e:
        print("Error al ejecutar la consulta:", e)
        return jsonify({'authenticated': False, 'message': 'Error interno del servidor'}), 500

@app.route('/delete_folder', methods=['POST'])
def delete_folder():
    path_to_delete = request.form.get('path')
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            query = "DELETE FROM parametrizador_ruta_imagen WHERE ruta_imagen = %s"
            params = (path_to_delete,)
            cursor.execute(query, params)
            conn.commit()
            os.rmdir(path_to_delete)

            return jsonify({
                'result':True,
                'message':'Ruta Eliminada'
            })

    except pyodbc.Error as e:
        conn.rollback()
        return jsonify({'result': False, 'message': 'Error interno del servidor'}), 500


@app.route('/getFilesByPathname', methods=['POST'])
def get_files_by_pathname():
    pathName = request.form.get('pathName')

    # Generar la ruta completa para la carpeta 'files'
    files_path = os.path.join(pathName, "Imagen")  # Especificamos la ruta de la carpeta "files"
    print("Ruta de la carpeta 'files':", files_path)  # Imprime la ruta para verificarla

    # Listar los archivos dentro de la carpeta 'files'
    try:
        files = os.listdir(files_path)  # Listar archivos en la carpeta "files"
    except FileNotFoundError:
        return jsonify({"error": "La carpeta 'files' no se encuentra en la ruta proporcionada."}), 404

    # Buscar el archivo JSON en el directorio 'pathName' (no en 'files')
    json_file = next((file for file in os.listdir(pathName) if file.lower().endswith('.json')), None)

    if not json_file:
        return jsonify({"error": "No se encontró un archivo JSON en la ruta proporcionada."}), 404

    # Construir la ruta completa del archivo JSON
    json_file_path = os.path.join(pathName, json_file)  # Ruta del archivo JSON fuera de la carpeta "Imagen"

    try:
        # Abrir y leer el archivo JSON
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Crear la lista de archivos dentro de la carpeta 'files'
        total_files = [{"nombre": file} for file in files]

        return jsonify({'data': data, 'files': total_files})

    except json.JSONDecodeError:
        return jsonify({"error": "Error al leer el archivo JSON."}), 400
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500


@app.route('/getFiles', methods=['POST'])
def get_files():
    pathName = request.form.get('pathName')
    files = os.listdir(pathName)
    json_file = next((file for file in files if file.lower().endswith('.json')), None)

    file_path = os.path.join(pathName, json_file)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except json.JSONDecodeError:
        return jsonify({"error": "Error al leer el archivo JSON."}), 400

@app.route('/getImage', methods=['POST'])
def get_image():
    pathName = request.form.get('path')
    file = request.form.get('file')
    pathImage = os.path.join(pathName, 'Imagen')
    all_path = os.path.join(pathImage, file)
    print(all_path)
    extension = os.path.splitext(file)[-1].lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
    }

    mimetype = mime_types.get(extension)

    return send_file(all_path, mimetype=mimetype)



if __name__ == '__main__':
    app.run(debug=True)
