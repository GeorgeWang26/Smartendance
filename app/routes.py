from app import app
from flask import render_template, request, jsonify, redirect, url_for, abort
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
import base64
import recognition as rec
import db

app.config['SECRET_KEY'] = 'itssecretkey'

loginManager = LoginManager()
loginManager.init_app(app)

# 
# 
# 
# 
# customize the 404 page here
#
# 
# 
# 
#  

def checkUser(username):
    if current_user.username != username:
        print('no such user', username, '\nabort 404')
        abort(404)


def checkGroup(username, groupname):
    for i in db.getGroups(username):
        if groupname == i[0]:
            return
    print('no such group', groupname, 'for user', username, '\nabort 404')
    abort(404)

@loginManager.user_loader
def load_user(user_id):
    print('\n\nLOAD USER', type(user_id), user_id)
    user = db.getFromId(user_id)
    if type(user) == str:
        return None
    return user


@loginManager.unauthorized_handler
def unauthorized():
    return redirect('/')


@app.route('/checkStatus')
def checkStatus():
    if current_user.is_authenticated:
        return jsonify(status = True)
    else:
        return jsonify(status = False)


@app.route('/logout')
def logout():
    logout_user()
    return redirect('/login')



# only the render template urls need  login_required
# the ajax request urls don't need it since they all will have checkStatus included in the htmls


# make /login and /signup complex routing
# having both GET and POST

@app.route('/')
@app.route('/signup')
def signup():
    if current_user.is_authenticated:
        print('authenticated already  -signup')
        return redirect('/userhome')
    return render_template('home.html')

# add new user here
@app.route('/newUser', methods = ['POST'])
def newUser():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    print(username, email, password)
    result = db.addUser(username, email, password)
    return jsonify(result = result)



@app.route('/login')
def login():
    if current_user.is_authenticated:
        print('authenticated already  -login')
        return redirect('/userhome')
    return render_template('login.html')


@app.route('/authenticate', methods = ['POST'])
def authenticate():
    print('hello')
    username = request.form['username']
    password = request.form['password']
    result = db.authenticate(username, password)
    if type(result) == str:
        return jsonify(result = result)
    else:
        login_user(result)
        return jsonify(result = 'success')


# embed ajax auto login ajax request in /signup and /login
# customize the ajax call back function
# if /checkStatus returns true, it should be redirected to /userhome


@app.route('/userhome')
@login_required
def redirectUerhome():
    return redirect('/userhome/' + current_user.username)


@app.route('/userhome/<string:username>')
@login_required
def userhome(username):
    checkUser(username)
    print('entered userhome for user: ', username)
    return render_template('userhome.html')


@app.route('/getGroups', methods = ['POST'])
def getGroups():
    username = request.form['username']
    print('getting group information for user:', username)
    groups = db.getGroups(username)
    print(groups)
    return jsonify(result = groups)


@app.route('/createGroup', methods = ['POST'])
def createGroup():
    username = request.form['username']
    groupname = request.form['groupname']
    print('adding new group:', groupname, '  for:', username)
    result = db.addGroup(username, groupname)
    print(result)
    if result == 'success':
        collectionID = username + '_' + groupname
        print('creating new collection', collectionID)
        createCollectionresult = rec.CreateCollection(collectionID)
        print(createCollectionresult)
    return jsonify(result = result)


@app.route('/deleteGroup', methods = ['POST'])
def deleteGroup():
    username = request.form['username']
    groupname = request.form['groupname']
    print('deleting group:', groupname, '  for:', username)
    result = db.removeGroup(username, groupname)
    print(result)
    if result == 'success':
        collectionID = username + '_' + groupname
        print('deleting collection', collectionID)
        deleteCollectionResult = rec.DeleteCollection(collectionID)
        print(deleteCollectionResult)
    return jsonify(result = result)




@app.route('/userhome/<string:username>/group/<string:groupname>')
@login_required
def grouphome(username, groupname):
    checkUser(username)
    checkGroup(username, groupname)
    return render_template('grouphome.html')

@app.route('/getMembers', methods = ['POST'])
def getMembers():
    username = request.form['username']
    groupname = request.form['groupname']
    memberList = db.getMembers(username, groupname)
    return jsonify(result = memberList)

@app.route('/newMember', methods = ['POST'])
def newMember():
    username = request.form['username']
    groupname = request.form['groupname']
    imageURL = request.form['imageURL']
    memberName = request.form['membername']
    image = imageURL.split(',')[1]
    result = db.addMember(username, groupname, memberName, imageURL)
    if result == 'success':
        collectionID = username + "_" + groupname
        addFaceResult = rec.addFace(collectionID, base64.b64decode(image), memberName)
        print(addFaceResult)
    return jsonify(result = result)



@app.route('/userhome/<string:username>/group/<string:groupname>/calendar')
@login_required
def calendar(username, groupname):
    checkUser(username)
    checkGroup(username, groupname)
    return render_template('calendar.html')



@app.route('/userhome/<string:username>/group<string:groupname>/live')
@login_required
def liveAttendance(username, groupname):
    checkUser(username)
    checkGroup(username, groupname)
    return render_template('live-attendance.html')



@app.route('/userhome/<string:username>/group/<string:groupname>/capture')
@login_required
def capture(username, groupname):
    checkUser(username)
    checkGroup(username, groupname)
    return render_template('capture.html')



@app.route('/userhome/<string:username>/group/<string:groupname>/calendar/<string:weeknumber>')
@login_required
def week(username, groupname, weeknumber):
    checkUser(username)
    checkGroup(username, groupname)
    # check week number here
    return render_template('week.html')


# add face will be done in group homepage
# delete face will done by member name instead of taking pictures in group homepage
# detect face will be done in capture page