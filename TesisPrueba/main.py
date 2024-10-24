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
    # Verificar si se ha enviado un archivo
    if 'image' not in request.files:
        return jsonify({'message': 'No se encontró ninguna imagen.'}), 400

    image = request.files['image']

    # Verificar si se seleccionó un archivo válido
    if image.filename == '':
        return jsonify({'message': 'No se seleccionó ninguna imagen.'}), 400

    # Guardar la imagen en la carpeta 'static/uploads'
    filepath = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(filepath)

    # Cargar la imagen y aplicarle los puntos corporales
    img = cv.imread(filepath)
    img_with_pose = detector.findPose(img)  # Aplicar detección de pose

    # Guardar la nueva imagen con los puntos en 'uploads/'
    output_path = os.path.join(UPLOAD_FOLDER, 'points_' + image.filename)
    cv.imwrite(output_path, img_with_pose)

    #Coordenadas de los puntos
    position = detector.findPosition(img)

    # Enviar una respuesta al cliente
    return jsonify({'message': 'Imagen subida exitosamente.', 'path': filepath, 'position':position}), 200

def resizeImage(image_path, width=300, height=445):
    with Image.open(image_path) as img:
        resized_img = img.resize((width, height))
        resized_img.save(UPLOAD_FOLDER, format='JPEG', quality=90)
        output_path_file = UPLOAD_FOLDER+image_path
    return output_path_file

if __name__ == '__main__':
    app.run(debug=True)