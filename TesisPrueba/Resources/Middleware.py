from flask import request, json, jsonify
import jwt
from pycparser.ply.yacc import token

KEY = "@JustD0I7_2024X"

def token_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message":"Token es requerido"}), 401

        try:
            token = token.split(" ")[1]
            decoded = jwt.decode(token, KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message":"Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message":"Token invalido"}), 401

        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper

def get_key():
    return KEY

def deserialize_token():
    decoded_data = jwt.decode(token, KEY, algorithms=["HS256"])
    print(decoded_data)
    return decoded_data