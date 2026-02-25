## 1. Prerequisites

### Check AWS CLI installation
```bash
aws --version
```

### Verify credentials
```bash
aws sts get-caller-identity
```

### Configure AWS (if needed)
```bash
aws configure
```

---

## 2. DynamoDB

### Create table
```bash
aws dynamodb create-table --table-name goobiez-food --attribute-definitions AttributeName=food_id,AttributeType=S --key-schema AttributeName=food_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1
```

### List tables
```bash
aws dynamodb list-tables --region eu-north-1
```

### Delete table (careful!)
```bash
aws dynamodb delete-table --table-name TABLE_NAME --region eu-north-1
```

---

## 3. IAM Role Setup

### Create trust policy file (trust-policy.json)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Create role
```bash
aws iam create-role --role-name goobiez-lambda-role --assume-role-policy-document file://trust-policy.json
```

### Attach Lambda basic execution policy
```bash
aws iam attach-role-policy --role-name goobiez-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Create DynamoDB policy file (dynamodb-policy.json)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-north-1:*:table/goobiez-users",
        "arn:aws:dynamodb:eu-north-1:*:table/goobiez-creatures",
        "arn:aws:dynamodb:eu-north-1:*:table/goobiez-config"
      ]
    }
  ]
}
```

### Attach DynamoDB policy
```bash
aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json
```

### List role policies
```bash
aws iam list-role-policies --role-name goobiez-lambda-role
aws iam list-attached-role-policies --role-name goobiez-lambda-role
```

---


### Create Zip file

cp consumeFood.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip consumeFood.zip index.mjs && rm index.mjs
cp initConfig.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip initConfig.zip index.mjs && rm index.mjs
cp processCreatureStats.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip processCreatureStats.zip index.mjs && rm index.mjs 
cp registerCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerCreature.zip index.mjs && rm index.mjs


cp getConfig.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getConfig.zip index.mjs && rm index.mjs
cp getCreatureStats.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getCreatureStats.zip index.mjs && rm index.mjs
cp initConfig.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip initConfig.zip index.mjs && rm index.mjs
cp processCreatureStats.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip processCreatureStats.zip index.mjs && rm index.mjs 
cp registerCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerCreature.zip index.mjs && rm index.mjs
cp registerFood.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerFood.zip index.mjs && rm index.mjs
cp renameCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip renameCreature.zip index.mjs && rm index.mjs
cp createVerificationCode.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip createVerificationCode.zip index.mjs && rm index.mjs
cp verifySlLink.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip verifySlLink.zip index.mjs && rm index.mjs
cp getUserStatus.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getUserStatus.zip index.mjs && rm index.mjs
cp registerUser.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerUser.zip index.mjs && rm index.mjs
cp createMailbox.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip createMailbox.zip index.mjs && rm index.mjs
cp getMailbox.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getMailbox.zip index.mjs && rm index.mjs
cp claimMailboxItem.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip claimMailboxItem.zip index.mjs && rm index.mjs


cp cancelBreeding.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip cancelBreeding.zip index.mjs && rm index.mjs
cp checkBreedingCompletion.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip checkBreedingCompletion.zip index.mjs && rm index.mjs
cp startBreeding.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip startBreeding.zip index.mjs && rm index.mjs
cp getBreedingSessions.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getBreedingSessions.zip index.mjs && rm index.mjs



# For processCreatureStats with delivery helper, need to include helper:
mkdir -p temp_build && cp processCreatureStats.js temp_build/index.mjs && mkdir -p temp_build/helpers && cp helpers/deliveryHelper.js temp_build/helpers/deliveryHelper.js && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../processCreatureStats.zip . && cd .. && rm -rf temp_build


###  Create function

aws lambda create-function --function-name cancelBreeding --runtime nodejs24.x --role arn:aws:iam::623581626126:role/goobiez-lambda-role --handler index.handler --zip-file fileb://cancelBreeding.zip --environment "Variables={FOOD_TABLE=goobiez-food,CONFIG_TABLE=goobiez-config}" --region eu-north-1


## 2. Update function
aws lambda update-function-code --function-name consumeFood --zip-file fileb://consumeFood.zip


## triger the functions
aws lambda invoke --function-name initConfig --payload '{}' response.json && cat response.json
aws lambda invoke --function-name processCreatureStats --payload '{}' response.json && cat response.json

## processcreature timer
aws events put-rule --name "processCreatureStats-daily" --schedule-expression "rate(1 minute)" --state ENABLED --description "Creature stats processing - TEST MODE"                                  

To change back to daily after testing:
aws events put-rule --name "processCreatureStats-daily" --schedule-expression "cron(0 0 * * ? *)" --state ENABLED --description "Daily creature stats processing"

# breeding-completion-check timer
  aws events put-rule --name goobiez-breeding-completion-check \
    --schedule-expression "rate(1 minute)" \
    --state ENABLED --region eu-north-1

  aws events put-rule --name goobiez-breeding-completion-check \
    --schedule-expression "rate(1 hour)" \
    --state ENABLED --region eu-north-1


# CREATE INTEGRATION API

aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:registerUser --payload-format-version 2.0 --region eu-north-1


# Create routes (should use integration id from above api)

aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /user/register" --target integrations/t0so0t4 --region eu-north-1


# Grant lambda permission to the routes

aws lambda add-permission --function-name registerFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1


# Update consumeFood to TEST MODE
aws lambda update-function-configuration --function-name consumeFood --environment "Variables={SECONDS_PER_DAY=60}"
aws lambda update-function-configuration --function-name getCreatureStats --environment "Variables={SECONDS_PER_DAY=60}"
aws lambda update-function-configuration --function-name processCreatureStats --environment "Variables={SECONDS_PER_DAY=60}"
aws lambda update-function-configuration --function-name registerCreature --environment "Variables={SECONDS_PER_DAY=60}"


# Update to PRODUCTION MODE
aws lambda update-function-configuration --function-name consumeFood --environment "Variables={SECONDS_PER_DAY=86400}"












---



### Create Mailbox Lambda Functions

```bash
# createMailbox
aws lambda create-function \
  --function-name createMailbox \
  --runtime nodejs24.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://createMailbox.zip \
  --environment "Variables={MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config}" \
  --region eu-north-1

# getMailbox
aws lambda create-function \
  --function-name getMailbox \
  --runtime nodejs24.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://getMailbox.zip \
  --environment "Variables={MAILBOX_TABLE=goobiez-mailbox,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config}" \
  --region eu-north-1

# claimMailboxItem
aws lambda create-function \
  --function-name claimMailboxItem \
  --runtime nodejs24.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://claimMailboxItem.zip \
  --environment "Variables={MAILBOX_TABLE=goobiez-mailbox,USERS_TABLE=goobiez-users}" \
  --region eu-north-1

aws lambda update-function-configuration \
  --function-name processCreatureStats \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=86400}" \
  --region eu-north-1


```

### Update processCreatureStats with Mailbox Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name processCreatureStats \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=86400}" \
  --region eu-north-1
```

### Create API Gateway Integrations for Mailbox

```bash
# createMailbox integration
aws apigatewayv2 create-integration \
  --api-id 3w4cqxw8y1 \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:createMailbox \
  --payload-format-version 2.0 \
  --region eu-north-1

# getMailbox integration
aws apigatewayv2 create-integration \
  --api-id 3w4cqxw8y1 \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getMailbox \
  --payload-format-version 2.0 \
  --region eu-north-1

# claimMailboxItem integration
aws apigatewayv2 create-integration \
  --api-id 3w4cqxw8y1 \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:claimMailboxItem \
  --payload-format-version 2.0 \
  --region eu-north-1
```

### Create API Gateway Routes for Mailbox
(Replace INTEGRATION_ID with the actual integration IDs returned from above commands)

```bash
# POST /mailbox/create
aws apigatewayv2 create-route \
  --api-id 3w4cqxw8y1 \
  --route-key "POST /mailbox/create" \
  --target integrations/INTEGRATION_ID \
  --region eu-north-1

# POST /mailbox/get
aws apigatewayv2 create-route \
  --api-id 3w4cqxw8y1 \
  --route-key "POST /mailbox/get" \
  --target integrations/4qspm7k \
  --region eu-north-1

# POST /mailbox/claim
aws apigatewayv2 create-route \
  --api-id 3w4cqxw8y1 \
  --route-key "POST /mailbox/claim" \
  --target integrations/INTEGRATION_ID \
  --region eu-north-1
```

### Add Lambda Permissions for Mailbox Functions

```bash
aws lambda add-permission --function-name createMailbox --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name getMailbox --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name claimMailboxItem --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1
```

### Update Mailbox Functions

```bash
aws lambda update-function-code --function-name createVerificationCode --zip-file fileb://createVerificationCode.zip
aws lambda update-function-code --function-name getUserStatus --zip-file fileb://getUserStatus.zip
aws lambda update-function-code --function-name registerUser --zip-file fileb://registerUser.zip
aws lambda update-function-code --function-name verifySlLink --zip-file fileb://verifySlLink.zip
```

---

## 5. Breeding System Lambda Functions

### Create Zip Files for Breeding Functions

```bash
# Simple breeding functions (no helpers needed)
cp cancelBreeding.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip cancelBreeding.zip index.mjs && rm index.mjs
cp getBreedingSessions.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getBreedingSessions.zip index.mjs && rm index.mjs

# Breeding functions WITH helpers (breedingHelper.mjs, pedestalHelper.mjs)
mkdir -p temp_build/helpers && cp startBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../startBreeding.zip . && cd .. && rm -rf temp_build

mkdir -p temp_build/helpers && cp checkBreedingCompletion.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../checkBreedingCompletion.zip . && cd .. && rm -rf temp_build

mkdir -p temp_build/helpers && cp autoBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../autoBreeding.zip . && cd .. && rm -rf temp_build
```

### Create autoBreeding Lambda Function

```bash
aws lambda create-function \
  --function-name autoBreeding \
  --runtime nodejs24.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://autoBreeding.zip \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" \
  --timeout 30 \
  --region eu-north-1
```

### Update Breeding Lambda Functions (Code + Environment)

```bash
# startBreeding - update code and env
aws lambda update-function-code --function-name startBreeding --zip-file fileb://startBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name startBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

# checkBreedingCompletion - update code and env
aws lambda update-function-code --function-name checkBreedingCompletion --zip-file fileb://checkBreedingCompletion.zip --region eu-north-1 && aws lambda update-function-configuration --function-name checkBreedingCompletion --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

# cancelBreeding - update code and env
aws lambda update-function-code --function-name cancelBreeding --zip-file fileb://cancelBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name cancelBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

# getBreedingSessions - update code and env
aws lambda update-function-code --function-name getBreedingSessions --zip-file fileb://getBreedingSessions.zip --region eu-north-1 && aws lambda update-function-configuration --function-name getBreedingSessions --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

# autoBreeding - update code and env
aws lambda update-function-code --function-name autoBreeding --zip-file fileb://autoBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name autoBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1
```

### Create API Gateway Integration for autoBreeding

```bash
aws apigatewayv2 create-integration \
  --api-id 3w4cqxw8y1 \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:autoBreeding \
  --payload-format-version 2.0 \
  --region eu-north-1
```

### Create API Gateway Route for autoBreeding
(Replace INTEGRATION_ID with actual ID from above command)

```bash
aws apigatewayv2 create-route \
  --api-id 3w4cqxw8y1 \
  --route-key "POST /breeding/auto" \
  --target integrations/INTEGRATION_ID \
  --region eu-north-1
```

### Add Lambda Permission for autoBreeding

```bash
aws lambda add-permission \
  --function-name autoBreeding \
  --statement-id apigateway-access \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" \
  --region eu-north-1
```

### Update Breeding Functions Environment (TEST MODE - 60 seconds per day)

```bash
aws lambda update-function-configuration --function-name startBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-configuration --function-name checkBreedingCompletion --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-configuration --function-name autoBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1
```

### Update Breeding Functions Environment (PRODUCTION MODE - 86400 seconds per day)

```bash
aws lambda update-function-configuration --function-name startBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=86400}" --region eu-north-1

aws lambda update-function-configuration --function-name checkBreedingCompletion --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=86400}" --region eu-north-1

aws lambda update-function-configuration --function-name autoBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
```


  Create Integrations:
  # autoBreeding
  aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:autoBreeding --payload-format-version 2.0 --region eu-north-1

  20aa5kh

  # startBreeding
  aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:startBreeding --payload-format-version 2.0 --region eu-north-1

  u3fgv7d

  # checkBreedingCompletion
  aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:checkBreedingCompletion --payload-format-version 2.0 --region eu-north-1

  eidzjp7

  # cancelBreeding
  aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:cancelBreeding --payload-format-version 2.0 --region eu-north-1

  9p4xh4r

  # getBreedingSessions
  aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getBreedingSessions --payload-format-version 2.0 --region eu-north-1

  rucntp9


  ------------------------------

aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /breeding/auto" --target integrations/20aa5kh --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /breeding/start" --target integrations/u3fgv7d --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /breeding/check" --target integrations/eidzjp7 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /breeding/{id}/cancel" --target integrations/9p4xh4r --region eu-north-1   
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "GET /breeding" --target integrations/rucntp9 --region eu-north-1

-----------------------------------

aws lambda add-permission --function-name autoBreeding --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

aws lambda add-permission --function-name startBreeding --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

aws lambda add-permission --function-name checkBreedingCompletion --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

aws lambda add-permission --function-name cancelBreeding --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

aws lambda add-permission --function-name getBreedingSessions --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1


-------------

cd G:/My_repository/_/Goobiez/goobiez-backend/lamda_functions && mkdir -p temp_build && cp consumeFood.js temp_build/index.mjs && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../consumeFood.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build && cp getCreatureStats.js temp_build/index.mjs && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getCreatureStats.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build && cp initConfig.js temp_build/index.mjs && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../initConfig.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build && cp registerCreature.js temp_build/index.mjs && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../registerCreature.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build && cp getBreedingSessions.js temp_build/index.mjs && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getBreedingSessions.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build/helpers && cp processCreatureStats.js temp_build/index.mjs && cp helpers/deliveryHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../processCreatureStats.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build/helpers && cp autoBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../autoBreeding.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build/helpers && cp cancelBreeding.js temp_build/index.mjs && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../cancelBreeding.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build/helpers && cp checkBreedingCompletion.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../checkBreedingCompletion.zip . && cd .. && rm -rf temp_build && mkdir -p temp_build/helpers && cp startBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../startBreeding.zip . && cd .. && rm -rf temp_build

aws lambda update-function-code --function-name consumeFood --zip-file fileb://consumeFood.zip --region eu-north-1 && aws lambda update-function-configuration --function-name consumeFood --environment "Variables={FOOD_TABLE=goobiez-food,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name getCreatureStats --zip-file fileb://getCreatureStats.zip --region eu-north-1 && aws lambda update-function-configuration --function-name getCreatureStats --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name initConfig --zip-file fileb://initConfig.zip --region eu-north-1 && aws lambda update-function-configuration --function-name initConfig --environment "Variables={CONFIG_TABLE=goobiez-config}" --region eu-north-1

aws lambda update-function-code --function-name registerCreature --zip-file fileb://registerCreature.zip --region eu-north-1 && aws lambda update-function-configuration --function-name registerCreature --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name getBreedingSessions --zip-file fileb://getBreedingSessions.zip --region eu-north-1 && aws lambda update-function-configuration --function-name getBreedingSessions --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name processCreatureStats --zip-file fileb://processCreatureStats.zip --region eu-north-1 && aws lambda update-function-configuration --function-name processCreatureStats --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name autoBreeding --zip-file fileb://autoBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name autoBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name cancelBreeding --zip-file fileb://cancelBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name cancelBreeding --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name checkBreedingCompletion --zip-file fileb://checkBreedingCompletion.zip --region eu-north-1 && aws lambda update-function-configuration --function-name checkBreedingCompletion --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name startBreeding --zip-file fileb://startBreeding.zip --region eu-north-1 && aws lambda update-function-configuration --function-name startBreeding --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=60}" --region eu-north-1

# ============================================
# CRITICAL FIXES - BREEDING SYSTEM
# ============================================

# Fix #1: Update IAM Policy to include goobiez-pedestals table
# IMPORTANT: Run this to fix Access Denied errors on pedestal operations
aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json

# Fix #2: Create getPedestalStatus Lambda function
# This endpoint is called by heartPedestal.lsl on initialization

# Build getPedestalStatus Lambda (includes pedestalHelper.mjs)
cd G:/My_repository/_/Goobiez/goobiez-backend/lamda_functions && mkdir -p temp_build/helpers && cp getPedestalStatus.js temp_build/index.mjs && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getPedestalStatus.zip . && cd .. && rm -rf temp_build

# Create Lambda function
aws lambda create-function --function-name getPedestalStatus --runtime nodejs20.x --role arn:aws:iam::623581626126:role/goobiez-lambda-role --handler index.handler --zip-file fileb://getPedestalStatus.zip --environment "Variables={PEDESTALS_TABLE=goobiez-pedestals}" --region eu-north-1

# Create API Gateway integration for getPedestalStatus
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getPedestalStatus --payload-format-version 2.0 --region eu-north-1

# Note: Save the integration ID from the above command, then use it in the next command
# Example: If integration ID is "abc123", use --target integrations/abc123

# Create route for GET /pedestal/{id}/status
# Replace INTEGRATION_ID with the actual integration ID from the previous command
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "GET /pedestal/{id}/status" --target integrations/INTEGRATION_ID --region eu-north-1

# Grant Lambda permission for API Gateway
aws lambda add-permission --function-name getPedestalStatus --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# Fix #3: Fix route mismatch - /breeding/check should be /breeding/check-completion
# The heartPedestal.lsl calls /breeding/check-completion but the route is /breeding/check
# Option A: Delete old route and create new one with correct path

# First, get the route ID for /breeding/check
aws apigatewayv2 get-routes --api-id 3w4cqxw8y1 --region eu-north-1

# Delete the old route (replace ROUTE_ID with actual route ID from above)
# aws apigatewayv2 delete-route --api-id 3w4cqxw8y1 --route-id ROUTE_ID --region eu-north-1

# Create the correct route
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /breeding/check-completion" --target integrations/eidzjp7 --region eu-north-1

# ============================================
# VERIFICATION COMMANDS
# ============================================

# Test getPedestalStatus endpoint
# curl -X GET "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/pedestal/TEST_PEDESTAL_ID/status"

# Test breeding check-completion endpoint
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/breeding/check-completion" -H "Content-Type: application/json" -d '{"breeding_id": "test-id"}'


# ============================================
# FULL DEPLOYMENT - ALL 16 CHANGED LAMBDA FUNCTIONS
# Death/Afterlife fixes + Great Beyond + Breeding fixes + Resurrect Booster
# ============================================
#
# CHANGED FILES:
#   Modified: autoBreeding.js, checkBreedingCompletion.js, claimMailboxItem.js,
#             getCreatureList.js, getCreatureStats.js, getFoodList.js,
#             getUserStatus.js, initConfig.js, registerCreature.js,
#             sendToGreatBeyond.js, startBreeding.js
#   New:      resurrectCreature.js, getPointsHistory.js, getPedestalList.js,
#             sendToGreatBeyond.js (if not yet created)
#   Helper-only: cancelBreeding.js, getPedestalStatus.js (pedestalHelper changed)
#
# CHANGED HELPERS:
#   Modified: breedingHelper.mjs, pedestalHelper.mjs
#   New:      memorialHelper.mjs, pointsHelper.mjs
#
# NOT CHANGED (skip): processCreatureStats.js, deliveryHelper.mjs
#

# ==================================================
# STEP 0: Create new DynamoDB tables (skip if exist)
# ==================================================

aws dynamodb create-table --table-name goobiez-pending-memorials --attribute-definitions AttributeName=memorial_id,AttributeType=S --key-schema AttributeName=memorial_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

aws dynamodb create-table --table-name goobiez-pending-deliveries --attribute-definitions AttributeName=pending_id,AttributeType=S --key-schema AttributeName=pending_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

aws dynamodb create-table --table-name goobiez-points-transactions --attribute-definitions AttributeName=transaction_id,AttributeType=S --key-schema AttributeName=transaction_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

# Add GSI for querying points history by user_id (required by getPointsHistory.js)
aws dynamodb update-table --table-name goobiez-points-transactions --attribute-definitions AttributeName=user_id,AttributeType=S AttributeName=created_at,AttributeType=S --global-secondary-indexes '[{"IndexName":"user_id-created_at-index","KeySchema":[{"AttributeName":"user_id","KeyType":"HASH"},{"AttributeName":"created_at","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]' --billing-mode PAY_PER_REQUEST --region eu-north-1

# Enable 30-day TTL on pending tables (auto-cleanup expired items)
aws dynamodb update-time-to-live --table-name goobiez-pending-memorials --time-to-live-specification "Enabled=true, AttributeName=ttl_expiry" --region eu-north-1

aws dynamodb update-time-to-live --table-name goobiez-pending-deliveries --time-to-live-specification "Enabled=true, AttributeName=ttl_expiry" --region eu-north-1


# ==================================================
# STEP 1: Update IAM policy (add 3 new tables)
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend

aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json


# ==================================================
# STEP 2: Build ALL 16 zip files
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend/lamda_functions

# --- 8 SIMPLE FUNCTIONS (no helpers) ---

cp getCreatureList.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getCreatureList.zip index.mjs && rm index.mjs

cp getCreatureStats.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getCreatureStats.zip index.mjs && rm index.mjs

cp getFoodList.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getFoodList.zip index.mjs && rm index.mjs

cp getUserStatus.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getUserStatus.zip index.mjs && rm index.mjs

cp initConfig.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip initConfig.zip index.mjs && rm index.mjs

cp registerCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerCreature.zip index.mjs && rm index.mjs

cp resurrectCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip resurrectCreature.zip index.mjs && rm index.mjs

# --- 8 FUNCTIONS WITH HELPERS ---

# sendToGreatBeyond (helpers: deliveryHelper, pointsHelper, memorialHelper)
mkdir -p temp_build/helpers && cp sendToGreatBeyond.js temp_build/index.mjs && cp helpers/deliveryHelper.mjs temp_build/helpers/ && cp helpers/pointsHelper.mjs temp_build/helpers/ && cp helpers/memorialHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../sendToGreatBeyond.zip . && cd .. && rm -rf temp_build

# claimMailboxItem (helpers: deliveryHelper, memorialHelper, breedingHelper)
mkdir -p temp_build/helpers && cp claimMailboxItem.js temp_build/index.mjs && cp helpers/deliveryHelper.mjs temp_build/helpers/ && cp helpers/memorialHelper.mjs temp_build/helpers/ && cp helpers/breedingHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../claimMailboxItem.zip . && cd .. && rm -rf temp_build

# checkBreedingCompletion (helpers: breedingHelper, pedestalHelper)
mkdir -p temp_build/helpers && cp checkBreedingCompletion.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../checkBreedingCompletion.zip . && cd .. && rm -rf temp_build

# autoBreeding (helpers: breedingHelper)
mkdir -p temp_build/helpers && cp autoBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../autoBreeding.zip . && cd .. && rm -rf temp_build

# startBreeding (helpers: breedingHelper, pedestalHelper)
mkdir -p temp_build/helpers && cp startBreeding.js temp_build/index.mjs && cp helpers/breedingHelper.mjs temp_build/helpers/ && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../startBreeding.zip . && cd .. && rm -rf temp_build

# cancelBreeding (helper: pedestalHelper — helper was modified)
mkdir -p temp_build/helpers && cp cancelBreeding.js temp_build/index.mjs && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../cancelBreeding.zip . && cd .. && rm -rf temp_build

# getPedestalStatus (helper: pedestalHelper — helper was modified)
mkdir -p temp_build/helpers && cp getPedestalStatus.js temp_build/index.mjs && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getPedestalStatus.zip . && cd .. && rm -rf temp_build

# getPedestalList (helper: pedestalHelper)
mkdir -p temp_build/helpers && cp getPedestalList.js temp_build/index.mjs && cp helpers/pedestalHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getPedestalList.zip . && cd .. && rm -rf temp_build

# getPointsHistory (helper: pointsHelper)
mkdir -p temp_build/helpers && cp getPointsHistory.js temp_build/index.mjs && cp helpers/pointsHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../getPointsHistory.zip . && cd .. && rm -rf temp_build


# ==================================================
# STEP 3: Update 12 EXISTING Lambda function code
# ==================================================

aws lambda update-function-code --function-name getCreatureList --zip-file fileb://getCreatureList.zip --region eu-north-1
aws lambda update-function-code --function-name getCreatureStats --zip-file fileb://getCreatureStats.zip --region eu-north-1
aws lambda update-function-code --function-name getFoodList --zip-file fileb://getFoodList.zip --region eu-north-1
aws lambda update-function-code --function-name getUserStatus --zip-file fileb://getUserStatus.zip --region eu-north-1
aws lambda update-function-code --function-name initConfig --zip-file fileb://initConfig.zip --region eu-north-1
aws lambda update-function-code --function-name registerCreature --zip-file fileb://registerCreature.zip --region eu-north-1
aws lambda update-function-code --function-name claimMailboxItem --zip-file fileb://claimMailboxItem.zip --region eu-north-1
aws lambda update-function-code --function-name checkBreedingCompletion --zip-file fileb://checkBreedingCompletion.zip --region eu-north-1
aws lambda update-function-code --function-name autoBreeding --zip-file fileb://autoBreeding.zip --region eu-north-1
aws lambda update-function-code --function-name startBreeding --zip-file fileb://startBreeding.zip --region eu-north-1
aws lambda update-function-code --function-name cancelBreeding --zip-file fileb://cancelBreeding.zip --region eu-north-1
aws lambda update-function-code --function-name getPedestalStatus --zip-file fileb://getPedestalStatus.zip --region eu-north-1


# ==================================================
# STEP 4: Create 4 NEW Lambda functions
# (Skip any that already exist — use update-function-code instead)
# ==================================================

# resurrectCreature (NEW)
aws lambda create-function \
  --function-name resurrectCreature \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://resurrectCreature.zip \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" \
  --timeout 30 \
  --region eu-north-1

# sendToGreatBeyond (NEW — if not yet created; if exists use update-function-code above)
aws lambda create-function \
  --function-name sendToGreatBeyond \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://sendToGreatBeyond.zip \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=60}" \
  --timeout 30 \
  --region eu-north-1

# getPedestalList (NEW — if not yet created)
aws lambda create-function \
  --function-name getPedestalList \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://getPedestalList.zip \
  --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,PEDESTALS_TABLE=goobiez-pedestals}" \
  --timeout 30 \
  --region eu-north-1

# getPointsHistory (NEW)
aws lambda create-function \
  --function-name getPointsHistory \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://getPointsHistory.zip \
  --environment "Variables={USERS_TABLE=goobiez-users}" \
  --timeout 30 \
  --region eu-north-1


# ==================================================
# STEP 5: Update environment variables (where needed)
# ==================================================

# claimMailboxItem — needs CREATURES_TABLE, CONFIG_TABLE, SECONDS_PER_DAY for new helpers
aws lambda update-function-configuration --function-name claimMailboxItem --environment "Variables={MAILBOX_TABLE=goobiez-mailbox,USERS_TABLE=goobiez-users,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" --region eu-north-1


# ==================================================
# STEP 6: API Gateway — integrations + routes for NEW functions
# (Save integration IDs from output, replace INTEGRATION_ID in route commands)
# ==================================================

# --- resurrectCreature ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:resurrectCreature --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/resurrect" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name resurrectCreature --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- sendToGreatBeyond (if not yet routed) ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:sendToGreatBeyond --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/send-to-beyond" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name sendToGreatBeyond --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- getPedestalList (if not yet routed) ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getPedestalList --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /pedestal/list" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name getPedestalList --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- getPointsHistory ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getPointsHistory --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "GET /points/history" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name getPointsHistory --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1


# ==================================================
# STEP 7: Verify
# ==================================================

# Test resurrectCreature
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/creature/resurrect" -H "Content-Type: application/json" -d '{"creature_id":"test","owner_key":"test","booster_id":"test"}'

# Test sendToGreatBeyond
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/creature/send-to-beyond" -H "Content-Type: application/json" -d '{"creature_id":"test","owner_key":"test"}'

# Test getPointsHistory
# curl "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/points/history?owner_key=test"


# ==================================================
# PRODUCTION MODE — change SECONDS_PER_DAY to 86400
# ==================================================
# aws lambda update-function-configuration --function-name resurrectCreature --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name sendToGreatBeyond --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name claimMailboxItem --environment "Variables={MAILBOX_TABLE=goobiez-mailbox,USERS_TABLE=goobiez-users,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name getCreatureStats --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name registerCreature --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name autoBreeding --environment "Variables={CREATURES_TABLE=goobiez-creatures,BREEDINGS_TABLE=goobiez-breedings,MAILBOX_TABLE=goobiez-mailbox,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name checkBreedingCompletion --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name startBreeding --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,PEDESTALS_TABLE=goobiez-pedestals,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name initConfig --environment "Variables={CONFIG_TABLE=goobiez-config}" --region eu-north-1
# aws lambda update-function-configuration --function-name processCreatureStats --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,MAILBOX_TABLE=goobiez-mailbox,SECONDS_PER_DAY=86400}" --region eu-north-1


# ============================================
# FOREVER BOOSTER & ETERNALZ POTION DEPLOYMENT
# New Lambda functions + API Gateway routes
# ============================================

# ==================================================
# STEP 1: Build zip files
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend/lamda_functions

# applyForeverBooster (no helpers needed)
cp applyForeverBooster.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip applyForeverBooster.zip index.mjs && rm index.mjs

# applyEternalz (no helpers needed)
cp applyEternalz.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip applyEternalz.zip index.mjs && rm index.mjs

# Also rebuild modified functions (registerCreature, getCreatureStats, sendToGreatBeyond)
cp registerCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerCreature.zip index.mjs && rm index.mjs

cp getCreatureStats.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getCreatureStats.zip index.mjs && rm index.mjs

mkdir -p temp_build/helpers && cp sendToGreatBeyond.js temp_build/index.mjs && cp helpers/deliveryHelper.mjs temp_build/helpers/ && cp helpers/pointsHelper.mjs temp_build/helpers/ && cp helpers/memorialHelper.mjs temp_build/helpers/ && cd temp_build && "C:\Program Files\7-Zip\7z.exe" a -tzip ../sendToGreatBeyond.zip . && cd .. && rm -rf temp_build

# ==================================================
# STEP 2: Create NEW Lambda functions
# ==================================================

# applyForeverBooster (NEW)
aws lambda create-function \
  --function-name applyForeverBooster \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://applyForeverBooster.zip \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" \
  --timeout 30 \
  --region eu-north-1

# applyEternalz (NEW)
aws lambda create-function \
  --function-name applyEternalz \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://applyEternalz.zip \
  --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60}" \
  --timeout 30 \
  --region eu-north-1

# ==================================================
# STEP 3: Update MODIFIED Lambda function code
# ==================================================

aws lambda update-function-code --function-name registerCreature --zip-file fileb://registerCreature.zip --region eu-north-1
aws lambda update-function-code --function-name getCreatureStats --zip-file fileb://getCreatureStats.zip --region eu-north-1
aws lambda update-function-code --function-name sendToGreatBeyond --zip-file fileb://sendToGreatBeyond.zip --region eu-north-1

# ==================================================
# STEP 4: API Gateway — integrations + routes
# (Save integration IDs from output, replace INTEGRATION_ID in route commands)
# ==================================================

# --- applyForeverBooster ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:applyForeverBooster --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/apply-forever" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name refillFood --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

aws lambda add-permission --function-name sendFoodToBeyond --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- applyEternalz ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:applyEternalz --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/apply-eternalz" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name applyEternalz --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# ==================================================
# STEP 5: Verify
# ==================================================

# Test applyForeverBooster
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/creature/apply-forever" -H "Content-Type: application/json" -d '{"creature_id":"test","owner_key":"test","booster_id":"test"}'

# Test applyEternalz
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/creature/apply-eternalz" -H "Content-Type: application/json" -d '{"creature_id":"test","owner_key":"test","potion_id":"test"}'

# ==================================================
# PRODUCTION MODE — change SECONDS_PER_DAY to 86400
# ==================================================
# aws lambda update-function-configuration --function-name applyForeverBooster --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name applyEternalz --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=86400}" --region eu-north-1


# ============================================
# BOOSTER INVENTORY SYSTEM DEPLOYMENT
# New: registerBooster, getBoosterList Lambdas
# Updated: applyForeverBooster, applyEternalz, resurrectCreature (add BOOSTERS_TABLE)
# ============================================

# ==================================================
# STEP 0: Create goobiez-boosters DynamoDB table
# ==================================================

aws dynamodb create-table --table-name goobiez-boosters --attribute-definitions AttributeName=booster_id,AttributeType=S --key-schema AttributeName=booster_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

# ==================================================
# STEP 1: Build zip files
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend/lamda_functions

# registerBooster (no helpers needed)
cp registerBooster.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip registerBooster.zip index.mjs && rm index.mjs

# getBoosterList (no helpers needed)
cp getBoosterList.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip getBoosterList.zip index.mjs && rm index.mjs

# Rebuild modified functions that now include BOOSTERS_TABLE
cp applyForeverBooster.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip applyForeverBooster.zip index.mjs && rm index.mjs
cp applyEternalz.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip applyEternalz.zip index.mjs && rm index.mjs
cp resurrectCreature.js index.mjs && "C:\Program Files\7-Zip\7z.exe" a -tzip resurrectCreature.zip index.mjs && rm index.mjs

# ==================================================
# STEP 2: Create NEW Lambda functions
# ==================================================

# registerBooster (NEW)
aws lambda create-function \
  --function-name registerBooster \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://registerBooster.zip \
  --environment "Variables={BOOSTERS_TABLE=goobiez-boosters}" \
  --timeout 30 \
  --region eu-north-1

# getBoosterList (NEW)
aws lambda create-function \
  --function-name getBoosterList \
  --runtime nodejs20.x \
  --role arn:aws:iam::623581626126:role/goobiez-lambda-role \
  --handler index.handler \
  --zip-file fileb://getBoosterList.zip \
  --environment "Variables={BOOSTERS_TABLE=goobiez-boosters}" \
  --timeout 30 \
  --region eu-north-1

# ==================================================
# STEP 3: Update MODIFIED Lambda function code + env (add BOOSTERS_TABLE)
# ==================================================

aws lambda update-function-code --function-name applyForeverBooster --zip-file fileb://applyForeverBooster.zip --region eu-north-1
aws lambda update-function-configuration --function-name applyForeverBooster --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name applyEternalz --zip-file fileb://applyEternalz.zip --region eu-north-1
aws lambda update-function-configuration --function-name applyEternalz --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=60}" --region eu-north-1

aws lambda update-function-code --function-name resurrectCreature --zip-file fileb://resurrectCreature.zip --region eu-north-1
aws lambda update-function-configuration --function-name resurrectCreature --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=60}" --region eu-north-1

# ==================================================
# STEP 4: API Gateway — integrations + routes
# (Save integration IDs from output, replace INTEGRATION_ID in route commands)
# ==================================================

# --- registerBooster ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:retrieveFromVorest --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/retrieve-from-vorest" --target integrations/fsuf4ug --region eu-north-1

aws lambda add-permission --function-name retrieveFromVorest --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- getBoosterList ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:getBoosterList --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /booster/list" --target integrations/3vzyoi9 --region eu-north-1

aws lambda add-permission --function-name getBoosterList --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# ==================================================
# STEP 5: Update IAM policy (add goobiez-boosters table)
# ==================================================

# Make sure dynamodb-policy.json includes:
#   "arn:aws:dynamodb:eu-north-1:*:table/goobiez-boosters"
# Then run:
aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json

# ==================================================
# STEP 6: Verify
# ==================================================

# Test registerBooster
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/booster/register" -H "Content-Type: application/json" -d '{"owner_key":"test","booster_type":"resurrect","sl_object_key":"test-obj-key","sl_region":"Test Region"}'

# Test getBoosterList
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/booster/list" -H "Content-Type: application/json" -d '{"owner_key":"test"}'

# ==================================================
# PRODUCTION MODE — change SECONDS_PER_DAY to 86400
# ==================================================
# aws lambda update-function-configuration --function-name applyForeverBooster --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name applyEternalz --environment "Variables={CREATURES_TABLE=goobiez-creatures,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name resurrectCreature --environment "Variables={CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config,BOOSTERS_TABLE=goobiez-boosters,SECONDS_PER_DAY=86400}" --region eu-north-1


# ============================================
# ASSET ID / ANTI-COPYBOT SYSTEM DEPLOYMENT
# New DynamoDB table + 2 Lambda functions + API Gateway routes
# ============================================

# ==================================================
# STEP 1: Update IAM policy (add goobiez-assets table)
# ==================================================

# dynamodb-policy.json already updated with:
#   "arn:aws:dynamodb:eu-north-1:*:table/goobiez-assets"

aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json

# ==================================================
# STEP 2: Create DynamoDB table
# ==================================================

aws dynamodb create-table --table-name goobiez-assets --attribute-definitions AttributeName=asset_id,AttributeType=S --key-schema AttributeName=asset_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

# ==================================================
# STEP 3: Deploy Lambda functions (from project root)
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend

# registerAsset (standalone — no helpers)
./deploy-create.sh registerAsset --env "ASSETS_TABLE=goobiez-assets"

# verifyAsset (standalone — no helpers)
./deploy-create.sh verifyAsset --env "ASSETS_TABLE=goobiez-assets"

# ==================================================
# STEP 4: API Gateway — integrations + routes
# (Save integration IDs from output, replace INTEGRATION_ID in route commands)
# ==================================================

# --- registerAsset ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:registerAsset --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /asset/register" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name registerAsset --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# --- verifyAsset ---
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:verifyAsset --payload-format-version 2.0 --region eu-north-1

# Replace INTEGRATION_ID with the ID from above
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /asset/verify" --target integrations/INTEGRATION_ID --region eu-north-1

aws lambda add-permission --function-name verifyAsset --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*" --region eu-north-1

# ==================================================
# STEP 5: Verify
# ==================================================

# Test registerAsset (first rez → 201)
curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/asset/register" -H "Content-Type: application/json" -d '{"owner_key":"test-owner","sl_object_key":"test-prim-001","creator_key":"test-creator","asset_type":"creature","asset_name":"Test Goobiez"}'

# Test verifyAsset with returned asset_id (re-rez → 200)
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/asset/verify" -H "Content-Type: application/json" -d '{"asset_id":"ASSET_ID_FROM_REGISTER","sl_object_key":"test-prim-001","owner_key":"test-owner"}'

# Test idempotent re-register (same sl_object_key → 200 existing)
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/asset/register" -H "Content-Type: application/json" -d '{"owner_key":"test-owner","sl_object_key":"test-prim-001","creator_key":"test-creator","asset_type":"creature","asset_name":"Test Goobiez"}'

# Test copybot mismatch (different sl_object_key within 60s → warn/403 after threshold)
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/asset/verify" -H "Content-Type: application/json" -d '{"asset_id":"ASSET_ID_FROM_REGISTER","sl_object_key":"DIFFERENT-PRIM-KEY","owner_key":"test-owner"}'

# Test transfer (new owner, different sl_object_key → 200, owner_changed:true)
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/asset/verify" -H "Content-Type: application/json" -d '{"asset_id":"ASSET_ID_FROM_REGISTER","sl_object_key":"new-prim-key","owner_key":"new-owner"}'


# ============================================
# VOREST (VIRTUAL FOREST) SYSTEM DEPLOYMENT
# 11 new Lambda functions + 3 DynamoDB tables + API Gateway routes
# ============================================

# ==================================================
# STEP 1: Create DynamoDB tables
# ==================================================

# goobiez-vorest-food (PK: food_id)
aws dynamodb create-table --table-name goobiez-vorest-food --attribute-definitions AttributeName=food_id,AttributeType=S --key-schema AttributeName=food_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

# goobiez-vorest-boosters (PK: booster_id)
aws dynamodb create-table --table-name goobiez-vorest-boosters --attribute-definitions AttributeName=booster_id,AttributeType=S --key-schema AttributeName=booster_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1

# goobiez-creature-transfers (PK: transfer_id) — audit trail for send/retrieve transfers
aws dynamodb create-table --table-name goobiez-creature-transfers --attribute-definitions AttributeName=transfer_id,AttributeType=S --key-schema AttributeName=transfer_id,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1


# ==================================================
# STEP 2: Update IAM policy (add 3 new tables)
# ==================================================

# dynamodb-policy.json should include these NEW table ARNs:
#   "arn:aws:dynamodb:eu-north-1:*:table/goobiez-vorest-food"
#   "arn:aws:dynamodb:eu-north-1:*:table/goobiez-vorest-boosters"
#   "arn:aws:dynamodb:eu-north-1:*:table/goobiez-creature-transfers"

aws iam put-role-policy --role-name goobiez-lambda-role --policy-name DynamoDBAccess --policy-document file://dynamodb-policy.json


# ==================================================
# STEP 3: Create 11 Lambda functions (via deploy-create.sh)
# ==================================================

cd G:/My_repository/_/Goobiez/goobiez-backend

# 1. listVorestCreatures
./deploy-create.sh listVorestCreatures --env "CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60"

# 2. listVorestFood
./deploy-create.sh listVorestFood --env "VOREST_FOOD_TABLE=goobiez-vorest-food"

# 3. listVorestBoosters
./deploy-create.sh listVorestBoosters --env "VOREST_BOOSTERS_TABLE=goobiez-vorest-boosters"

# 4. fetchVbucksBalance
./deploy-create.sh fetchVbucksBalance --env "USERS_TABLE=goobiez-users"

# 5. purchaseVorestFood
./deploy-create.sh purchaseVorestFood --env "VOREST_FOOD_TABLE=goobiez-vorest-food,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config"

# 6. purchaseVorestBooster
./deploy-create.sh purchaseVorestBooster --env "VOREST_BOOSTERS_TABLE=goobiez-vorest-boosters,USERS_TABLE=goobiez-users,CONFIG_TABLE=goobiez-config"

# 7. consumeVorestFood
./deploy-create.sh consumeVorestFood --env "VOREST_FOOD_TABLE=goobiez-vorest-food,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60"

# 8. applyVorestBooster
./deploy-create.sh applyVorestBooster --env "VOREST_BOOSTERS_TABLE=goobiez-vorest-boosters,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60"

# 9. startVorestBreeding (has helper: breedingHelper.mjs — auto-detected by deploy-create.sh)
./deploy-create.sh startVorestBreeding --env "BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,SECONDS_PER_DAY=60"

# 10. sendToVorest
./deploy-create.sh sendToVorest --env "CREATURES_TABLE=goobiez-creatures,USERS_TABLE=goobiez-users,TRANSFERS_TABLE=goobiez-creature-transfers"

# 11. retrieveFromVorest
./deploy-create.sh retrieveFromVorest --env "CREATURES_TABLE=goobiez-creatures,TRANSFERS_TABLE=goobiez-creature-transfers,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=60"


# ==================================================
# STEP 4: API Gateway — Create integrations
# (Save integration IDs from output for Step 5)
# ==================================================

# 1. listVorestCreatures
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestCreatures --payload-format-version 2.0 --region eu-north-1

# 2. listVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestFood --payload-format-version 2.0 --region eu-north-1

# 3. listVorestBoosters
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestBoosters --payload-format-version 2.0 --region eu-north-1

# 4. fetchVbucksBalance
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:fetchVbucksBalance --payload-format-version 2.0 --region eu-north-1

# 5. purchaseVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:purchaseVorestFood --payload-format-version 2.0 --region eu-north-1

# 6. purchaseVorestBooster
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:purchaseVorestBooster --payload-format-version 2.0 --region eu-north-1

# 7. consumeVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:consumeVorestFood --payload-format-version 2.0 --region eu-north-1

# 8. applyVorestBooster
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:applyVorestBooster --payload-format-version 2.0 --region eu-north-1

# 9. startVorestBreeding
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:startVorestBreeding --payload-format-version 2.0 --region eu-north-1

# 10. sendToVorest
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:sendToVorest --payload-format-version 2.0 --region eu-north-1

# 11. retrieveFromVorest
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:retrieveFromVorest --payload-format-version 2.0 --region eu-north-1


# ==================================================
# STEP 5: API Gateway — Create routes
# (Replace INTEGRATION_ID with actual IDs from Step 4)
# ==================================================

# 1. POST /vorest/creatures/list → listVorestCreatures
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/creatures/list" --target integrations/INTEGRATION_ID --region eu-north-1

# 2. POST /vorest/food/list → listVorestFood
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/list" --target integrations/INTEGRATION_ID --region eu-north-1

# 3. POST /vorest/food/purchase → purchaseVorestFood
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/purchase" --target integrations/INTEGRATION_ID --region eu-north-1

# 4. POST /vorest/food/consume → consumeVorestFood
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/consume" --target integrations/INTEGRATION_ID --region eu-north-1

# 5. POST /vorest/booster/list → listVorestBoosters
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/list" --target integrations/INTEGRATION_ID --region eu-north-1

# 6. POST /vorest/booster/purchase → purchaseVorestBooster
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/purchase" --target integrations/INTEGRATION_ID --region eu-north-1

# 7. POST /vorest/booster/apply → applyVorestBooster
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/apply" --target integrations/INTEGRATION_ID --region eu-north-1

# 8. POST /vorest/breeding/start → startVorestBreeding
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/breeding/start" --target integrations/INTEGRATION_ID --region eu-north-1

# 9. POST /vbucks/balance → fetchVbucksBalance
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vbucks/balance" --target integrations/INTEGRATION_ID --region eu-north-1

# 10. POST /creature/send-to-vorest → sendToVorest
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/send-to-vorest" --target integrations/INTEGRATION_ID --region eu-north-1

# 11. POST /creature/retrieve-from-vorest → retrieveFromVorest
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /creature/retrieve-from-vorest" --target integrations/INTEGRATION_ID --region eu-north-1


# ==================================================
# STEP 6: Lambda permissions for API Gateway
# ==================================================

aws lambda add-permission --function-name listVorestCreatures --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name listVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name listVorestBoosters --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name fetchVbucksBalance --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name purchaseVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name purchaseVorestBooster --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name consumeVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name applyVorestBooster --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name startVorestBreeding --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name sendToVorest --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

aws lambda add-permission --function-name retrieveFromVorest --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1


# ==================================================
# STEP 7: Verify
# ==================================================

# Test listVorestCreatures
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/vorest/creatures/list" -H "Content-Type: application/json" -d '{"owner_key":"test"}'

# Test fetchVbucksBalance
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/vbucks/balance" -H "Content-Type: application/json" -d '{"owner_key":"test"}'

# Test purchaseVorestFood
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/vorest/food/purchase" -H "Content-Type: application/json" -d '{"owner_key":"test","currency":"vbucks","quantity":1}'

# Test sendToVorest
# curl -X POST "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev/creature/send-to-vorest" -H "Content-Type: application/json" -d '{"creature_id":"test","owner_key":"test"}'


# ==================================================
# PRODUCTION MODE — change SECONDS_PER_DAY to 86400
# ==================================================

# aws lambda update-function-configuration --function-name listVorestCreatures --environment "Variables={CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name consumeVorestFood --environment "Variables={VOREST_FOOD_TABLE=goobiez-vorest-food,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name applyVorestBooster --environment "Variables={VOREST_BOOSTERS_TABLE=goobiez-vorest-boosters,CREATURES_TABLE=goobiez-creatures,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name startVorestBreeding --environment "Variables={BREEDINGS_TABLE=goobiez-breedings,CREATURES_TABLE=goobiez-creatures,SECONDS_PER_DAY=86400}" --region eu-north-1
# aws lambda update-function-configuration --function-name retrieveFromVorest --environment "Variables={CREATURES_TABLE=goobiez-creatures,TRANSFERS_TABLE=goobiez-creature-transfers,CONFIG_TABLE=goobiez-config,SECONDS_PER_DAY=86400}" --region eu-north-1


# ============================================
# VOREST API GATEWAY — INTEGRATIONS + ROUTES + PERMISSIONS
# ============================================

# ENDPOINT 1: POST /vorest/creatures/list → listVorestCreatures
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestCreatures --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/creatures/list" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name listVorestCreatures --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 2: POST /vorest/food/list → listVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestFood --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/list" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name listVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 3: POST /vorest/food/purchase → purchaseVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:purchaseVorestFood --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/purchase" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name purchaseVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 4: POST /vorest/food/consume → consumeVorestFood
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:consumeVorestFood --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/food/consume" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name consumeVorestFood --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 5: POST /vorest/booster/list → listVorestBoosters
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:listVorestBoosters --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/list" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name listVorestBoosters --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 6: POST /vorest/booster/purchase → purchaseVorestBooster
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:purchaseVorestBooster --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/purchase" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name purchaseVorestBooster --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 7: POST /vorest/booster/apply → applyVorestBooster
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:applyVorestBooster --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/booster/apply" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name applyVorestBooster --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 8: POST /vorest/breeding/start → startVorestBreeding
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:startVorestBreeding --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vorest/breeding/start" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name startVorestBreeding --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1

# ENDPOINT 9: POST /vbucks/balance → fetchVbucksBalance
aws apigatewayv2 create-integration --api-id 3w4cqxw8y1 --integration-type AWS_PROXY --integration-uri arn:aws:lambda:eu-north-1:623581626126:function:fetchVbucksBalance --payload-format-version 2.0 --region eu-north-1
aws apigatewayv2 create-route --api-id 3w4cqxw8y1 --route-key "POST /vbucks/balance" --target integrations/INTEGRATION_ID --region eu-north-1
aws lambda add-permission --function-name fetchVbucksBalance --statement-id apigateway-access --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-north-1:623581626126:3w4cqxw8y1/*/*" --region eu-north-1