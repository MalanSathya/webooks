import json
import boto3
import urllib.parse
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))

    if event.get('httpMethod') == 'DELETE':
        return delete_book(event)
    
    return {
        'statusCode': 405,
        'body': json.dumps({'error': 'Method Not Allowed'})
    }

def delete_book(event):
    try:
        if 'pathParameters' not in event or 'title' not in event['pathParameters']:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing path parameter: title'})
            }

        title = urllib.parse.unquote(event['pathParameters']['title'])
        print(f"Decoded title to delete: {title}")

        response = table.delete_item(
            Key={'Title': title},
            ReturnValues='ALL_OLD'
        )

        if 'Attributes' in response:
            # Custom encoder for Decimal
            def decimal_encoder(obj):
                if isinstance(obj, Decimal):
                    return float(obj)
                raise TypeError

            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Book deleted',
                    'book': response['Attributes']
                }, default=decimal_encoder)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps({'message': 'Book not found'})
            }

    except ClientError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': str(e)})
        }