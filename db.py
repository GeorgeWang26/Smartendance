import json
from flask_login import UserMixin
from mongoengine import connect, Document, EmbeddedDocument,EmbeddedDocumentListField, StringField, BooleanField, SortedListField, EmbeddedDocumentField

# print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
# to print the whole db in formated json style

connect('test')


# as for db, dont use  unique  other than in main(top) document
# it will cause collisions if want to save more than one instance
# just do a manual check


class Member(EmbeddedDocument):
    name = StringField(required = True)
    dataURL = StringField(required = True)
    attendance = BooleanField(default = False)
    # sort by name


class Day(EmbeddedDocument):
    date = StringField(required=True)
    members = SortedListField(EmbeddedDocumentField(Member), ordering = 'name')
    # sort by data


class Group(EmbeddedDocument):
    groupName = StringField(required=True)
    allMembers = SortedListField(EmbeddedDocumentField(Member), ordering = 'name')
    calendar = SortedListField(EmbeddedDocumentField(Day), ordering = 'date')
    # sort by groupname 


class User(Document):
    username = StringField(unique=True, required=True)
    email = StringField(unique = True, required = True)
    password = StringField(required=True)
    # currently email is enabled
    groups = SortedListField(EmbeddedDocumentField(Group), ordering = 'groupName')
    meta = {
        'ordering': ['+username']
    }
    # sort by username


class LoginReturn(Document, UserMixin):
    username = StringField(unique=True, required=True)
    meta = {
        'ordering': ['+username']
    }
    # sort by username


#
#
#
#


def addUser(username, email, password):
    # duplicate = User.objects(username=username).first()
    if User.objects(username=username).first():
        return 'username already exist'
    elif User.objects(email=email).first():
        return 'email already used'
    User(username=username, email = email, password=password).save()
    LoginReturn(username=username).save()
    return 'success'


def removeUser(username):
    user = User.objects(username=username).first()
    if not user:
        return 'user not found'
    user.delete()
    LoginReturn.objects(username=username).first().delete()
    return 'success'


def authenticate(input, password):
    if '@' in input:
        # this is email address
        user = User.objects(email=input).first()
    else:
        # using username
        user = User.objects(username=input).first()
    if not user:
        return 'no such user'
    if user.password != password:
        return 'password incorrect'
    return LoginReturn.objects(username=user.username).first()


def getFromId(user_id):
    user = LoginReturn.objects(id=user_id).first()
    if not user:
        return 'no such user id'
    return user


def addGroup(username, group):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            return 'group already exist'
    newGroup = Group(groupName=group)
    user.groups.append(newGroup)
    user.save()
    return 'success'


def removeGroup(username, group):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for i in range(len(user.groups)):
        if user.groups[i].groupName == group:
            user.groups.pop(i)
            user.save()
            return 'success'
    return 'no such group'


def addMember(username, group, name, dataURL):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if group == g.groupName:
            for member in g.allMembers:
                if member.name == name:
                    return 'member already exist'
            member = Member(name = name, dataURL = dataURL)
            g.allMembers.append(member)
            user.save()
            return 'success'
    return 'no such group'


def removeMember(username, group, name):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if group == g.groupName:
            for i in range(len(g.allMembers)):
                if name == g.allMembers[i].name:
                    g.allMembers.pop(i)
                    user.save()
                    return 'success'
            return 'no such member'
    return 'no such group'


def addDay(username, group, date):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if group == g.groupName:
            for day in g.calendar:
                if date == day.date:
                    return 'date already exist'
            members = []
            for member in g.allMembers:
                newMember = Member(name=member.name)
                members.append(newMember)
            day = Day(date=date, members=members)
            g.calendar.append(day)
            user.save()
            return 'success'
    return 'no such group'


def markAttendance(username, group, date, name):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            for day in g.calendar:
                if date == day.date:
                    for member in day.members:
                        if name == member.name:
                            member.attendance = True
                            user.save()
                            return 'success'
                    return 'no such member'
            return 'no such date'
    return 'no such group'


def getAttendance(username, group, date):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            for day in g.calendar:
                if date == day.date:
                    return day
            return 'no such date'
    return 'no such group'


def getGroups(username):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    groups = []
    for group in user.groups:
        groups.append([group.groupName, len(group.allMembers)])
    return groups

def getMembers(username, groupName):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    members = []
    for group in user.groups:
        if group.groupName == groupName:
            for member in group.allMembers:
                members.append([member.name, member.dataURL])
            return(members)
    return 'no such group'

if __name__ == '__main__':

    User.drop_collection()
    LoginReturn.drop_collection()

    print('User', User.objects())
    print('LoginReturn', LoginReturn.objects())

    addUser('a', 'a@email', 'pass')
    addGroup('a','group1')
    addGroup('a','group2')
    addGroup('a','group3')
    addGroup('a','group4')
    addMember('a', 'group1', 'George', 'George_dataURL')
    addMember('a', 'group1', 'Fred', 'Fred_dataURL')
    addMember('a', 'group2', 'Yang', 'Yang_dataURL')

    print('username ', authenticate('a', 'pass').to_json())
    print('email ', authenticate('a@email', 'pass').to_json())

    print(getGroups('a'))
    print(getMembers('a', 'group1'))
    print(getMembers('a', 'group2'))


    # print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
    # print(json.dumps(json.loads(LoginReturn.objects().to_json()), sort_keys=True, indent=4))
