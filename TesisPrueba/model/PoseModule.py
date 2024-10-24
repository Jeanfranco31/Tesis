import cv2
import mediapipe as mp
import time

class poseDetector():
    def __init__(self,
                 mode=False,
                 modelComplexity=1,
                 smooth=True,
                 detectionCon=0.5,
                 trackCon=0.5 ):
        self.mode = mode
        self.modelComplexity = modelComplexity
        self.smooth = smooth
        self.detectionCon = detectionCon
        self.trackCon = trackCon

        self.mpDraw = mp.solutions.drawing_utils
        self.mpPose = mp.solutions.pose
        self.pose = self.mpPose.Pose(
            static_image_mode=self.mode,
            model_complexity=self.modelComplexity,
            smooth_landmarks=self.smooth,
            min_detection_confidence=self.detectionCon,
            min_tracking_confidence=self.trackCon
        )

    def findPose(self, img, draw=True):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convertir a RGB porque MediaPipe trabaja en RGB
        self.results = self.pose.process(imgRGB) # Procesar la imagen para encontrar poses
        #if self.results.pose_landmarks: # Si hay detección de landmarks
            #if draw:
                # Dibujar las conexiones entre los puntos de la pose
                #self.mpDraw.draw_landmarks(img, self.results.pose_landmarks, self.mpPose.POSE_CONNECTIONS)
        return img

    def findPosition(self, img, draw=False):
        lmList = []
        if self.results.pose_landmarks:
            for id, lm in enumerate(self.results.pose_landmarks.landmark):
                h, w, c = img.shape  # Obtener las dimensiones de la imagen
                cx, cy = int(lm.x * w), int(lm.y * h) # Coordenadas del landmark en píxeles
                lmList.append([id, cx, cy])  # Añadir el ID y las coordenadas a la lista
                print(f'ID: {id}, X: {cx}, Y: {cy}')  # Imprimir las coordenadas

                if draw:
                    cv2.circle(img, (cx, cy), 0, (255, 8, 248), cv2.FILLED)  # Dibujar un círculo en cada articulación
        return lmList
