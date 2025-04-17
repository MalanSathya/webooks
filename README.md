# 📚 Book Collection App – Serverless Deployment Guide

Welcome to your DIY deployment guide for the **Serverless Book Collection App**! This markdown will walk you through all the magic behind getting your CRUD-powered app live using AWS services like **DynamoDB**, **Lambda**, **API Gateway**, and **S3** 🙌

---

## 🚀 What This App Can Do
- **Display** your awesome book collection 📖
- **Add** new books ➕
- **Edit** existing entries 📝
- **Delete** books ❌

And all of it is hosted with ❤️ on AWS.

---

## 🌩️ Serverless Architecture
Here’s what we’re using under the hood:
- **Frontend**: Static HTML, CSS, JS hosted on **S3**
- **Backend**: AWS **Lambda functions** for each CRUD operation
- **API Gateway**: To expose those Lambda functions over HTTP
- **Database**: AWS **DynamoDB** (NoSQL FTW!)

---

## 📝 Step-by-Step Deployment

### 1. 🗃️ Create the DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name Books \
  --attribute-definitions AttributeName=title,AttributeType=S \
  --key-schema AttributeName=title,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```
> ⚠️ "title" must be unique for each book.

Then load initial data:
```bash
cd backend/dynamodb
python3 load_books.py
```

Make sure your `books.json` file is in the same folder!

---

### 2. 📆 Create S3 Bucket for Hosting
```bash
aws s3 mb s3://your-bucket-name
```

```bash
aws s3 website s3://your-bucket-name/ --index-document index.html
```

Upload all static files:
```bash
aws s3 cp . s3://your-bucket-name/ --recursive --exclude "*" --include "*.html" --include "*.css" --include "*.js"
```

---

### 3. 🛡️ S3 Bucket Policy for Public Access
Use the `public-read-policy.json` file in the root directory:
```bash
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://public-read-policy.json
```

---

### 4. 🧙‍♂️ Create IAM Role for Lambda Functions (Optional)
```bash
aws iam create-role \
  --role-name book-app-lambda-role \
  --assume-role-policy-document file://trust-policy.json
```

Attach policies:
```bash
aws iam attach-role-policy --role-name book-app-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam attach-role-policy --role-name book-app-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

---

### 5. 🔀 Create Lambda Functions
Navigate to each Lambda directory and zip them:
```bash
cd backend/lambda/addBookFunction
zip addBookFunction.zip addBookFunction.py
```

Then create function:
```bash
aws lambda create-function \
  --function-name addBookFunction \
  --runtime python3.12 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/book-app-lambda-role \
  --handler addBookFunction.lambda_handler \
  --zip-file fileb://addBookFunction.zip
```

Repeat for:
- `getBookFunction`
- `updateBookFunction`
- `deleteBookFunction`

---

### 6. 🌐 Set Up API Gateway
This is just an example but pay more attention when implementing this, don't copy paste this.
For each Lambda function:
```bash
aws apigatewayv2 create-api --name "BooksAPI" --protocol-type HTTP
```

Create routes:
```bash
aws apigatewayv2 create-route --api-id YOUR_API_ID --route-key 'GET /books' --target integrations/LAMBDA_GET_ID
```
Repeat for `POST /books`, `PUT /books`, `DELETE /books`

Then deploy:
```bash
aws apigatewayv2 create-deployment --api-id YOUR_API_ID --stage-name prod
```

---

### 7. 🌐 Update `app.js` with API URLs
In your `app.js`, set:
```javascript
const API_BASE_URL = 'https://your-api-id.execute-api.region.amazonaws.com';
```

---

### 8. ⛅️ Re-upload Frontend to S3
If you updated `app.js` locally:
```bash
aws s3 cp app.js s3://your-bucket-name/
```

Access your site at:
```
http://your-bucket-name.s3-website-your-region.amazonaws.com
```

---

## ✅ Final Checklist
- [x] DynamoDB created and populated
- [x] S3 bucket with public policy
- [x] Lambda functions zipped and uploaded
- [x] API Gateway routes connected
- [x] Frontend updated and deployed

You’re live! 🎉 Head over to your S3 static site URL and CRUD away.

---

## 🧠 Extras
- Use [Postman](https://www.postman.com/) to test API endpoints.
- Consider enabling **CORS** on API Gateway if issues arise.
- Backup your Lambda zips and code in a `lambda/` folder in your repo.

---

## 💡 Tips
- Want a cleaner UI? Try integrating a CSS framework like Tailwind or Bootstrap.
- For versioning or data safety, you can turn on **DynamoDB backups** as well as in **S3**.


---

**Author:** Malan Venkatesan Sathyanaarayan  
**Student ID:** N01639496
