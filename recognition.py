import boto3
from botocore.exceptions import ClientError
from os import environ
import botostubs


client = boto3.client('rekognition') # type: botostubs.Rekognition


def detectFaces(b64Decode):
    response = client.detect_faces(
        Image={'Bytes': b64Decode}, Attributes=['ALL'])

    if response['FaceDetails']:
        return True
    else:
        return False


def CreateCollection(collectionId):
    try:
        client.create_collection(CollectionId=collectionId)
        print('success')
    except ClientError as e:
        print('Error occurred: ' + e.response['Error']['Code'])
    print('Done...')


def DelletCollection(collectionId):
    try:
        client.delete_collection(CollectionId=collectionId)
        print('success')
    except ClientError as e:
        print('Error occurred: ' + e.response['Error']['Code'])
    print('Done...')


def searchName(collectionId, b64Decode):
    threshold = 90
    maxFaces = 1

    face = detectFaces(b64Decode)
    if face == False:
        return 'no face in picture'

    response = client.search_faces_by_image(CollectionId=collectionId,
                                            Image={'Bytes': b64Decode},
                                            FaceMatchThreshold=threshold,
                                            MaxFaces=maxFaces)
    print(response)
    faceMatches = response['FaceMatches']

    for match in faceMatches:
        return(match['Face']['ExternalImageId'])

    return 'face not recognized'


def addFace(collectionId, b64Decode, name):
    maxFaces = 1

    result = searchName(collectionId, b64Decode)

    if result == 'no face in picture':
        return result
    elif result != 'face not recognized':
        return 'face already exist'

    # continue if face is not recognized (not in the collection)

    response = client.index_faces(CollectionId=collectionId,
                                  Image={'Bytes': b64Decode},
                                  ExternalImageId=name,
                                  MaxFaces=maxFaces,
                                  QualityFilter="AUTO",
                                  DetectionAttributes=['ALL'])

    if response['FaceRecords']:
        return('success')
    else:
        return('fail to add the face')


def deleteByName(collectionId, name):
    response = client.list_faces(CollectionId=collectionId)
    faces = response['Faces']
    for face in faces:
        print(face['ExternalImageId'])
        if face['ExternalImageId'] == name:
            response = client.delete_faces(CollectionId = collectionId, FaceIds = [face['FaceId']])
            if response['DeletedFaces']:
                return 'deleted'
            else:
                return 'failed deleting'

    return('member not found')
