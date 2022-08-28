import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async GetTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todo items')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    return result.Items as TodoItem[]
  }

  async CreateTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Creating a todo item')
    const newTodoItem = {
      ...todoItem,
      attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${todoItem.todoId}`
    }

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodoItem
      })
      .promise()

    return newTodoItem
  }

  async UpdateTodo(todoItem: TodoItem): Promise<string> {
    logger.info(`Updating a todo with ID ${todoItem.todoId}`)

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: todoItem.userId,
          todoId: todoItem.todoId
        },
        ConditionExpression: 'todoId = :todoId',
        UpdateExpression:
          'set #n = :name, createdAt = :createdAt, done = :done',
        ExpressionAttributeValues: {
          ':name': todoItem.name,
          ':createdAt': todoItem.createdAt,
          ':done': todoItem.done,
          ':todoId': todoItem.todoId
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return 'success'
  }

  async DeleteTodo(todoId: string, userId: string): Promise<string> {
    logger.info(`Updating a todo with ID ${todoId}`)
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()

    return userId
  }

  async GenerateUploadUrl(todoId: string): Promise<string> {
    logger.info(`Generating an upload url for ID ${todoId}`)
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration)
    }) as string
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}