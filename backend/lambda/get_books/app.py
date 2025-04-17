
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

def lambda_handler(event, context):
    response = table.scan()
    return {
    'statusCode': 200,
    'headers' : {
        "Access-Control-Allow-Origin": "http://book-collection-frontend.s3-website-us-east-1.amazonaws.com",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    },
    'body': json.dumps(response['Items'], default=str)
}