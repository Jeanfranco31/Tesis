import datetime

from flask import Flask, render_template, request, jsonify, json, redirect, url_for
import pyodbc
import os
import cv2 as cv
import glob
import jwt
from shutil import copyfile
from PIL import Image


from Resources.Middleware import token_required
from Resources.Middleware import get_key
from model.PoseModule import poseDetector
from Resources.Conexion import get_connection
from Resources.Encrypt import  encrypt_password

# Inicializar la app Flask
app = Flask(__name__)
conn = get_connection()

# Crear una carpeta para guardar las imágenes subidas
UPLOAD_FOLDER = 'static/uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
path_save_json = 'C:/Users/Dell/Desktop/archivo_generado/'
path_save_images = 'C:/Users/Dell/Desktop/archivo_generado/Imagen/'


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
    data = request.get_json()
    file_name = data['data']['file']
    points_position = data['data']['points_position']
    width_file = data['data']['width']
    heigth_file = data['data']['height']
    center_x = width_file/2
    center_y = heigth_file/2

    #obtener archivos totales
    total = get_total_files() + 1

    #nuevo formato de nombre  000001
    name, ext = os.path.splitext(file_name)
    name_to_save = f"{total}{ext}"

    # Guardar el JSON con los puntos
    json_file_name = "Points_Json.json"
    path_json = os.path.join(path_save_json, json_file_name)
    with open(path_json, "w") as json_file:
        json.dump(
            {
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
                }, json_file)

    image_file_path = os.path.join(path_save_images,name_to_save)
    path_base_image = os.path.join(UPLOAD_FOLDER,f"points_{file_name}")

    # Crear o copiar la imagen con el nombre indicado
    copyfile(path_base_image, image_file_path)  # Copia una imagen base con el nuevo nombre

    delete_temp_image(UPLOAD_FOLDER)

def delete_temp_image(carpeta):
    files = glob.glob(os.path.join(carpeta, "*"))  # Lista todos los archivos
    for file in files:
        if os.path.isfile(file):
            os.remove(file)

def get_total_files():
    file_count = sum(1 for file in os.listdir(path_save_images)
                     if os.path.isfile(os.path.join(path_save_images, file)))
    return file_count

#user controllers
@app.route('/validateLogin', methods=['POST'])
def validate_login():
    try:
        mail = request.form.get('mail')
        passw = encrypt_password(request.form.get('pass'))

        with get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT id, pass, nombre FROM Users WHERE mail = ?"
            cursor.execute(query, (mail,))

            # Recorre los resultados
            result = cursor.fetchone()

            if result and result[1] == passw:
                # Usuario autenticaded
                token = jwt.encode({
                    "user_id": result[0]
                }, get_key(), algorithm="HS256")
                return jsonify({'authenticated': True, 'redirect_url': url_for('view_dashboard'), 'user':result[2], 'token': token}), 200
            else:
                # Usuario no autenticado
                return jsonify({'authenticated': False, 'message': 'Usuario o contraseña incorrecta'}), 401

    except pyodbc.Error as e:
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
            query = "INSERT INTO Users(nombre,apellido,cedula,pass,mail,stateUser) VALUES(?,?,?,?,?,1)"
            params = (name,lastName,identification,passw,email)
            result = cursor.execute(query, params)

            if result:
                # Usuario creado
                return jsonify({'created': True, 'redirect_url': url_for('login')}), 200
            else:
                # Usuario no creado
                return jsonify({'created': False, 'message': 'Usuario no registrado'}), 401

    except pyodbc.Error as e:
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


if __name__ == '__main__':
    app.run(debug=True)