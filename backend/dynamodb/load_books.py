
import boto3, json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Books')

with open('books.json') as f:
    books = json.load(f)

for book in books:
    table.put_item(Item=book)

print("Books loaded successfully.")
