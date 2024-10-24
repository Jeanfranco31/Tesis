from flask import Flask, render_template, request, jsonify
import os
import cv2 as cv
from PIL import Image
from model.PoseModule import poseDetector

# Inicializar la app Flask
app = Flask(__name__)

# Crear una carpeta para guardar las imágenes subidas
UPLOAD_FOLDER = 'static/uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
        print(f'Datos recibidos: {data}')  # Verificar qué llega


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
        position = detector.findPosition(img)

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
        print("Ruta del archivo guardado:", filepath)

        # Leer la imagen con PIL
        with Image.open(filepath) as img:
            resized_img = img.resize((300, 445))
            resized_image_name = 'resized_' + image.filename
            output_path_file = os.path.join(UPLOAD_FOLDER, resized_image_name)

            # Guardar la imagen redimensionada
            resized_img.save(output_path_file, format='JPEG', quality=90)
            print("Imagen redimensionada guardada en:", output_path_file)

        return jsonify({'Imagen_Redimensionada': output_path_file}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)