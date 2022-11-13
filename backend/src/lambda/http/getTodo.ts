import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodoById } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodoFetchSingle')

// Get a single TODO item for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event)

    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event)

    const items = await getTodoById(userId, todoId)

    logger.info('items: ', items)

    return {
      statusCode: 200,
      body: JSON.stringify({items})
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
