import json
from flask_login import UserMixin
from mongoengine import (connect, Document, EmbeddedDocument,
                         EmbeddedDocumentListField, StringField, BooleanField)

# print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
# to print the whole db in formated json style

connect('test')


class Member(EmbeddedDocument):
    name = StringField(required=True)
    attendance = BooleanField(default=False)


class Day(EmbeddedDocument):
    date = StringField(required=True)
    members = EmbeddedDocumentListField(Member)


class Group(EmbeddedDocument):
    groupName = StringField(required=True)
    allMembers = EmbeddedDocumentListField(Member)
    days = EmbeddedDocumentListField(Day)


class User(Document):
    username = StringField(unique=True, required=True)
    password = StringField(required=True)
    groups = EmbeddedDocumentListField(Group)


class LoginReturn(Document, UserMixin):
    username = StringField(unique=True, required=True)


#
#
#
#


def addUser(username, password):
    duplicate = User.objects(username=username).first()
    if duplicate:
        return 'user already exist'
    User(username=username, password=password).save()
    LoginReturn(username=username).save()
    return 'success'


def removeUser(username):
    user = User.objects(username=username).first()
    if not user:
        return 'user not found'
    user.delete()
    LoginReturn.objects(username=username).first().delete()
    return 'success'


def authenticate(username, password):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    if user.password != password:
        return 'password incorrect'
    return LoginReturn.objects(username=username).first()


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


def addMember(username, group, name):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if group == g.groupName:
            for member in g.allMembers:
                if member.name == name:
                    return 'member already exist'
            member = Member(name=name)
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
            for day in g.days:
                if date == day.date:
                    return 'date already exist'
            members = []
            for member in g.allMembers:
                newMember = Member(name=member.name)
                members.append(newMember)
            day = Day(date=date, members=members)
            g.days.append(day)
            user.save()
            return 'success'
    return 'no such group'


def markAttendance(username, group, date, name):
    user = User.objects(username=username).first()
    if not user:
        return 'no such user'
    for g in user.groups:
        if g.groupName == group:
            for day in g.days:
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
            for day in g.days:
                if date == day.date:
                    return day
            return 'no such date'
    return 'no such group'


if __name__ == '__main__':

    User.drop_collection()
    LoginReturn.drop_collection()

    print('User', User.objects())
    print('LoginReturn', LoginReturn.objects())

    addUser('a', 'a')
    addGroup('a', 'a')
    addMember('a', 'a', 'a')
    addDay('a', 'a', 'a')
    markAttendance('a', 'a', 'a', 'a')
    addUser('d', 'd')
    addUser('b', 'b')
    addUser('c', 'c')

    print('a', addUser('a', 'a'))

    print('authenticate user a ', authenticate('a', 'a').username)

    removeUser('b')

    print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
    print(json.dumps(json.loads(LoginReturn.objects().to_json()),
                     sort_keys=True, indent=4))
