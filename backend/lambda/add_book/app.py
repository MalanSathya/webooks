import json
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))

    # Safely parse the body
    try:
        if isinstance(event['body'], dict):
            data = event['body']
        else:
            data = json.loads(event['body'], parse_float=Decimal)
    except Exception as e:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': 'http://book-collection-frontend.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'error': f'Invalid body format: {str(e)}'})
        }

    # Add book to DynamoDB
    try:
        table.put_item(
            Item=data,
            ConditionExpression="attribute_not_exists(Title)"
        )
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': 'http://book-collection-frontend.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'message': 'Book added'})
        }
    except ClientError as e:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': 'http://book-collection-frontend.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Methods': 'OPTIONS, POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'error': str(e)})
        }
