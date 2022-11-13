import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodoUploadUrl')

/**
 * Return a presigned URL to upload a file for a TODO item with the provided id
 */
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const body = {
      uploadUrl: await createAttachmentPresignedUrl(userId, todoId)
    }

    logger.info('body: ', body)

    return {
      statusCode: 200,
      body: JSON.stringify(body)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
