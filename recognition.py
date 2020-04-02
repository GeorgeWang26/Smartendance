import boto3
from botocore.exceptions import ClientError
from os import environ

client = boto3.client('rekognition')


def detectFaces(photoFile):
    img = open(photoFile, 'rb')
    response = client.detect_faces(
        Image={'Bytes': img.read()}, Attributes=['ALL'])
    img.close()

    if response['FaceDetails']:
        return True
    else:
        return False


def CreateCollection(collectionId):
    # Create a collection
    print('Creating collection:' + collectionId)
    response = client.create_collection(CollectionId=collectionId)
    print('Collection ARN: ' + response['CollectionArn'])
    print('Status code: ' + str(response['StatusCode']))
    print('Done...')


def DescribeCollection(collectionId):
    print('Attempting to describe collection ' + collectionId)

    try:
        response = client.describe_collection(CollectionId=collectionId)
        print("Collection Arn: " + response['CollectionARN'])
        print("Face Count: " + str(response['FaceCount']))
        print("Face Model Version: " + response['FaceModelVersion'])
        print("Timestamp: " + str(response['CreationTimestamp']))
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print('The collection ' + collectionId + ' was not found ')
        else:
            print('Error other than Not Found occurred: ' +
                  e.response['Error']['Message'])
    print('Done...')


def DelletCollection(collectionId):
    print('Attempting to delete collection ' + collectionId)
    statusCode = ''
    try:
        response = client.delete_collection(CollectionId=collectionId)
        statusCode = response['StatusCode']
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print('The collection ' + collectionId + ' was not found ')
        else:
            print('Error other than Not Found occurred: ' +
                  e.response['Error']['Message'])
        statusCode = e.response['ResponseMetadata']['HTTPStatusCode']

    print('Operation returned Status Code: ' + str(statusCode))
    print('Done...')


def ListFaces(collectionId):
    maxResults = 1
    tokens = True

    response = client.list_faces(CollectionId=collectionId,
                                 MaxResults=maxResults)

    facesIds = []

    while tokens:

        faces = response['Faces']

        for face in faces:
            facesIds.append(face['FaceId'])
            print(face)
        if 'NextToken' in response:
            nextToken = response['NextToken']
            response = client.list_faces(CollectionId=collectionId,
                                         NextToken=nextToken,
                                         MaxResults=maxResults)
        else:
            tokens = False


def DeleteFaces(collectionId, facesIds):
    response = client.delete_faces(CollectionId=collectionId,
                                   FaceIds=facesIds)
    if(response['DeletedFaces']):
        return 'deleted'
    else:
        return 'fail deleting'


# bellow are the functions used in routs.py
# above is for debug uses
# see ownFunctions.py in top levle for more info


def searchName(collectionId, photoFile):
    face = detectFaces(photoFile)
    if face is False:
        return 'no face in picture'

    threshold = 90
    maxFaces = 1

    img = open(photoFile, 'rb')
    response = client.search_faces_by_image(CollectionId=collectionId,
                                            Image={'Bytes': img.read()},
                                            FaceMatchThreshold=threshold,
                                            MaxFaces=maxFaces)

    img.close()

    faceMatches = response['FaceMatches']
    name = ''

    for match in faceMatches:
        name = match['Face']['ExternalImageId']

    if name:
        return name
    else:
        return 'face not recognized'


def addFace(collectionId, photoFile, name):
    result = searchName(collectionId, photoFile)

    if result == 'no face in picture':
        return result
    elif result != 'face not recognized':
        return 'face already exist'

    # continue if face is not recognized (not in the collection)

    maxFaces = 1

    img = open(photoFile, 'rb')

    response = client.index_faces(CollectionId=collectionId,
                                  Image={'Bytes': img.read()},
                                  ExternalImageId=name,
                                  MaxFaces=maxFaces,
                                  QualityFilter="AUTO",
                                  DetectionAttributes=['ALL'])

    img.close()

    if response['FaceRecords']:
        return('success')
    else:
        return('fail')


def searchId(collectionId, photoFile):
    face = detectFaces(photoFile)
    if face is False:
        return 'no face in picture'

    threshold = 90
    maxFaces = 1

    img = open(photoFile, 'rb')
    response = client.search_faces_by_image(CollectionId=collectionId,
                                            Image={'Bytes': img.read()},
                                            FaceMatchThreshold=threshold,
                                            MaxFaces=maxFaces)

    img.close()

    faceMatches = response['FaceMatches']
    faceId = []

    for match in faceMatches:
        faceId.append(match['Face']['FaceId'])

    if faceId:
        return faceId
    else:
        return 'face not recognized'


def deleteByImg(collectionId, photoFile):
    result = searchId(collectionId, photoFile)
    if result == 'no face in picture':
        return 'no face in picture'
    elif result == 'face not recognized':
        return 'face not in the group'

    # continue when face is recognized
    # result is the face id that recognized

    response = client.delete_faces(CollectionId=collectionId,
                                   FaceIds=result)
    if(response['DeletedFaces']):
        return 'deleted'
    else:
        # should always pass because returned faceId is valid
        # use else for unexpected situations
        return 'fail deleting'
