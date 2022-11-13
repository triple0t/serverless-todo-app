import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodoCreator')

// Create TODO item for the current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.log('event: ', event)

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    const item = await createTodo(userId, newTodo)

    logger.log('item: ', item)

    return {
      statusCode: 201,
      body: JSON.stringify({ item })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
