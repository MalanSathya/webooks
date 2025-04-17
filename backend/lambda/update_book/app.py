import json
import boto3
import urllib.parse  # 👈 Needed for decoding URL-encoded titles
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

# Helper function to convert Decimal to int for JSON response
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Debug logging

    if 'pathParameters' not in event or 'title' not in event['pathParameters']:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "http://book-collection-frontend.s3-website-us-east-1.amazonaws.com"
            },
            'body': json.dumps({'error': 'Missing path parameter: title'})
        }

    if 'body' not in event:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "http://book-collection-frontend.s3-website-us-east-1.amazonaws.com"
            },
            'body': json.dumps({'error': 'Missing body in request'})
        }

    # Decode URL-encoded title
    encoded_title = event['pathParameters']['title']
    title = urllib.parse.unquote(encoded_title)
    print("Decoded title:", title)

    # Parse body
    body = event['body']
    if isinstance(body, str):
        data = json.loads(body)
    else:
        data = body

    try:
        response = table.update_item(
            Key={'Title': title},
            UpdateExpression="set Authors=:a, Publisher=:p, #yr=:yr",
            ExpressionAttributeValues={
                ':a': data['Authors'],
                ':p': data['Publisher'],
                ':yr': Decimal(str(data['Year']))
            },
            ExpressionAttributeNames={
                '#yr': 'Year'
            },
            ReturnValues="UPDATED_NEW"
        )
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "http://book-collection-frontend.s3-website-us-east-1.amazonaws.com",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
            },
            'body': json.dumps({
                'message': 'Book updated',
                'updated': response['Attributes']
            }, cls=DecimalEncoder)
        }

    except ClientError as e:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin": "http://book-collection-frontend.s3-website-us-east-1.amazonaws.com"
            },
            'body': json.dumps({'error': str(e)})
        }
