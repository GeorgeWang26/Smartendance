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
    name = StringField(required=True)
    attendance = BooleanField(default=False)
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
    password = StringField(required=True)
    # currently email is not enabled or used
    email = StringField() 
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


if __name__ == '__main__':

    User.drop_collection()
    LoginReturn.drop_collection()

    print('User', User.objects())
    print('LoginReturn', LoginReturn.objects())

    addUser('d', 'd')
    addUser('b', 'b')
    addUser('c', 'c')

    addUser('a', 'a')
    addGroup('a', 'b')
    addGroup('a', 'c')
    addGroup('a','e')
    addGroup('a', 'a')
    addMember('a', 'a', 'B George')
    addMember('a', 'a', 'A George')
    addMember('a', 'a', 'AZ George')
    addMember('a', 'a', 'membera')
    addDay('a', 'a', '20200101')
    addDay('a', 'a', '20200201')
    addDay('a', 'a', '20200301')
    addDay('a', 'a', '20200401')
    addDay('a', 'a', '20200106')

    markAttendance('a', 'a', '20200101', 'membera')

    print('a', addUser('a', 'a'))

    print('authenticate user a ', authenticate('a', 'a').username)

    removeUser('b')

    print(json.dumps(json.loads(User.objects().to_json()), sort_keys=True, indent=4))
    print(json.dumps(json.loads(LoginReturn.objects().to_json()), sort_keys=True, indent=4))
