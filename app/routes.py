from app import app
from flask import render_template, request, jsonify, redirect, url_for
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
import base64
import recognition as rec
import db

app.config['SECRET_KEY'] = 'itssecretkey'

loginManager = LoginManager()
loginManager.init_app(app)


@loginManager.user_loader
def load_user(user_id):
    print('\n\nLOAD USER', type(user_id), user_id)
    user = db.getFromId(user_id)
    if type(user) == str:
        return None
    return user


@app.route("/checkStatus")
def checkStatus():
    if current_user.is_authenticated:
        return jsonify(status = True)
    else:
        return jsonify(status = False)

@app.route("/logout")
def logout():
    logout_user()

@app.route("/")
@app.route("/login")
def login():
    return render_template("login.html")
# should stop user from log in to a second user account here

@app.route("/signup")
def signup():
    return render_template("signup.html")


@app.route("userhome")
def userhome():
    return render_template("userhome.html")


@app.route('/capture')
def capture():
    return render_template('capture.html')


@app.route('/search')
def search():
    dataURL = request.args.get('dataURL')
    data = dataURL.split(',')[1]
    with open("app/static/img/image.png", "wb") as fh:
        fh.write(base64.b64decode(data))
        fh.close()
    result = rec.searchName('Family', 'app/static/img/image.png')
    return jsonify(result=result)


@app.route('/upload')
def upload():
    return render_template('upload.html')


@app.route('/add')
def add():
    dataURL = request.args.get('dataURL')
    name = request.args.get('name')
    data = dataURL.split(',')[1]
    with open("app/static/img/image.png", "wb") as fh:
        fh.write(base64.b64decode(data))
        fh.close()
    result = rec.addFace('Family', 'app/static/img/image.png', name)
    return jsonify(result=result)


@app.route('/delete')
def delete():
    return render_template('delete.html')


@app.route('/deleteFace')
def deleteFace():
    dataURL = request.args.get('dataURL')
    data = dataURL.split(',')[1]
    with open("app/static/img/image.png", "wb") as fh:
        fh.write(base64.b64decode(data))
        fh.close()
    result = rec.deleteByImg('Family', 'app/static/img/image.png')
    return jsonify(result=result)
