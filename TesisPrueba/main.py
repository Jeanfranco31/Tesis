from flask import Flask, render_template, request, jsonify, json
import os
import cv2 as cv
import glob
from shutil import copyfile
from PIL import Image
from model.PoseModule import poseDetector

# Inicializar la app Flask
app = Flask(__name__)

# Crear una carpeta para guardar las imágenes subidas
UPLOAD_FOLDER = 'static/uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
path_save_json = 'C:/Users/Dell/Desktop/archivo_generado/';

# Crear el detector de poses
detector = poseDetector()

# Ruta para el index
@app.route('/')
def index():
    return render_template('index.html')

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
                    resized_img = img.resize((400, 267))
                    resized_img_w = 400
                    resized_img_h = 267
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
                    print(f"Imagen guardada en {output_path_file}")
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

    # Guardar el JSON con los puntos
    json_file_name = f"{file_name}.json"
    path_json = os.path.join(path_save_json, json_file_name)
    with open(path_json, "w") as json_file:
        json.dump({"points_position": points_position}, json_file)

    path_base_image = os.path.join(UPLOAD_FOLDER,f"points_{file_name}")

    # Crear o copiar la imagen con el nombre indicado
    image_file_path = os.path.join(path_save_json,file_name)
    copyfile(path_base_image, image_file_path)  # Copia una imagen base con el nuevo nombre

    delete_temp_image(UPLOAD_FOLDER)

def delete_temp_image(carpeta):
    files = glob.glob(os.path.join(carpeta, "*"))  # Lista todos los archivos
    for file in files:
        if os.path.isfile(file):
            os.remove(file)

if __name__ == '__main__':
    app.run(debug=True)