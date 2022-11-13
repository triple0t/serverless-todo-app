import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { QxtraQueryParam } from '../models/ExtraQueryParam'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

/*
if (process.env.IS_OFFLINE) {
    AWSXRay.setContextMissingStrategy("LOG_ERROR");
}
const XAWS = AWSXRay.captureAWS(AWS)
*/

const logger = createLogger('TodosAccess')

// The dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodosByUser(
    userId: string,
    extraQueryParam: QxtraQueryParam
  ): Promise<DocumentClient.QueryOutput> {
    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    if (extraQueryParam && extraQueryParam.limit) {
      params['Limit'] = extraQueryParam.limit
    }

    if (extraQueryParam && extraQueryParam.nextKey) {
      params['ExclusiveStartKey'] = extraQueryParam.nextKey
    }

    const result = await this.docClient.query(params).promise()

    logger.info('[TodosAccess > getAllTodosByUser] result: ', result)

    return result
  }

  async getTodoById(userId: string, todoId: string): Promise<TodoItem> {
    const params = {
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      }
    }

    const newResult = await this.docClient.get(params).promise()
    const item = newResult && newResult.Item ? newResult.Item : {}

    logger.info('[TodosAccess > getTodoById] newResult: ', { newResult, item })

    return item as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todoTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodo(userId: string, todoId: string, todoUpdateItem: TodoUpdate) {
    const params = {
      TableName: this.todoTable,
      Key: {
        todoId,
        userId
      },
      ExpressionAttributeNames: { '#n': 'name' },
      UpdateExpression: 'SET #n = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdateItem.name,
        ':dueDate': todoUpdateItem.dueDate,
        ':done': todoUpdateItem.done
      }
    }

    const result = await this.docClient.update(params).promise()

    logger.info('[TodosAccess > updateTodo] result of update: ', result)
  }

  async deleteTodo(userId: string, todoId: string) {
    const res = await this.docClient
      .delete({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    logger.info('[TodosAccess > deleteTodo] res: ', res)
    
    return res
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  //   return new XAWS.DynamoDB.DocumentClient()
  return new AWS.DynamoDB.DocumentClient()
}
