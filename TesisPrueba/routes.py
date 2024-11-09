from flask import Flask, render_template, request, jsonify, json

# Inicializar la app Flask
app = Flask(__name__)

@app.route('/upload-image')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/create-account')
def create_account():
    return render_template('create-account.html')


if __name__ == '__main__':
    app.run(debug=True)