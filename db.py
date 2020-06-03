import json
from flask_login import UserMixin
from mongoengine import connect, Document, EmbeddedDocument,EmbeddedDocumentListField, StringField, BooleanField, SortedListField, EmbeddedDocumentField, IntField

# print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
# to print the whole db in formated json style

connect('test')


# as for db, dont use  unique  other than in main(top) document
# it will cause collisions if want to save more than one instance
# just do a manual check


class Member(EmbeddedDocument):
    name = StringField(required = True)
    dataURL = StringField(required = True)
    attendance = StringField(default = 'A')
    # sort by name


class Day(EmbeddedDocument):
    date = IntField(required=True)
    status = StringField(default = 'P')
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
        return 'username already exists'
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
            return 'group already exists'
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


def addAttendance(username, group, date):
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
                newMember = Member(name=member.name, dataURL = member.dataURL)
                members.append(newMember)
            day = Day(date=date, members=members)
            g.calendar.append(day)
            user.save()
            return 'success'
    return 'no such group'


def discardAttendance(username, group, date):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if group == g.groupName:
            for i in len(g.calendar):
                if g.calendar[i].date == date:
                    g.pop(i)
                    user.save()
                    return 'success'
            return 'no such date'
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
                            member.attendance = day.status
                            user.save()
                            return 'success'
                    return 'no such member'
            return 'no such date'
    return 'no such group'

# passed in parameter  newStatus should be P,L,A

def updateStatus(username, group, date, newStatus):
    # should only need to change status for the group once,
    # since the default day.status = P
    # and the default member.status = A
    # 
    # should only need to change status of the day into L
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            for day in g.calendar:
                if date == day.date:
                    day.date.status = newStatus
                    user.save()
            return 'no such date'
    return 'no such group'

# passed in parameter  newStatus should be P,L,A

def updateIndividualAttendance(username, group, date, name, newStatus):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            for day in g.calendar:
                if date == day.date:
                    for member in day.members:
                        if name == member.name:
                            member.attendance = newStatus
                            user.save()
                            return 'success'
                    return 'no such member'
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


# return the entire document here because it is the lowest layer already
# it doesnt contain any extra info that is not needed for the purpose of updaing attendance
# 
# however, could be changed into the custom format like above if needed
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


if __name__ == '__main__':

    User.drop_collection()
    LoginReturn.drop_collection()

    print('User', User.objects())
    print('LoginReturn', LoginReturn.objects())

    addUser('a', 'a@email', 'pass')
    addGroup('a', 'group1')
    addGroup('a', 'group2')
    addGroup('a', 'group3')
    addGroup('a', 'group4')
    addMember('a', 'group1', 'George', 'George_dataURL')
    addMember('a', 'group1', 'Fred', 'Fred_dataURL')
    addMember('a', 'group2', 'Yang', 'Yang_dataURL')


    addAttendance('a', 'group1', 20200428)
    addAttendance('a', 'group1', 20200505)
    print(markAttendance('a', 'group1', 20200428, 'George'))
    updateStatus('a', 'group1', '20200505', 'P')
    print(markAttendance('a', 'group1', 20200505, 'George'))
    updateStatus('a', 'group1', '20200505', 'L')
    print(markAttendance('a', 'group1', 20200505, 'Fred'))


    attendance = getAttendance('a', 'group1', 20200505)
    print(type(attendance))

    print(attendance.to_json())
    
    for i in attendance:
        print(i, attendance[i])
        