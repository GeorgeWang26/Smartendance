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


@LoginManager.unauthorized_handler
def unauthorized():
    return redirect('/')


@app.route("/checkStatus")
def checkStatus():
    if current_user.is_authenticated:
        return jsonify(status = True)
    else:
        return jsonify(status = False)


# only the render template urls need  login_required
# the ajax request urls don't need it since they all will have checkStatus included in them


# this function should be done through a ajax request
# no need to send suceess and let page redirect to '/' 
# because that will be done by '/checkStatus'
@app.route("/logout")
def logout():
    logout_user()



@app.route('/')
@app.route('/signup')
def signup():
    if current_user.is_authenticated:
        redirect('/userhome')
    return render_template('Home.html')



@app.route('/login')
def login():
    if current_user.is_authenticated:
        redirect('/userhome')
    return render_template('Login.html')



@app.route('/userhome')
@login_required
def userhome():
    return render_template('Userhome.html')



@app.route('/userhome/group/<string:groupname>')
@login_required
def grouphome(groupname):
    return render_template('Grouphome.html')



@app.route('userhome/group/<string:groupname>/calendar')
@login_required
def calendar(groupname):
    return render_template('Calendar.html')



@app.route('userhome/group<string:groupname>/live')
@login_required
def liveAttendance(groupname):
    return render_template('Live-attendance.html')



@app.route('userhome/group/<string:groupname>/capture')
@login_required
def capture(groupname):
    return render_template('Capture.html')



@app.route('/userhome/group/<string:groupname>/calendar/<string:weeknumber>')
@login_required
def week(groupname, weeknumber):
    return render_template('Week.html')



# # delete face will done by member name instead of taking pictures
