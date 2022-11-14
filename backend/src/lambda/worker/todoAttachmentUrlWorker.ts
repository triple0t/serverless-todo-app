import 'source-map-support/register'

import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'

import { TodosAccess } from '../../data/todosAcess'
import { AttachmentUtil } from '../../fileManagement/attachmentUtils'
import { createLogger } from '../../utils/logger'

const todosAccess = new TodosAccess()
const attachmentUtil = new AttachmentUtil()

const logger = createLogger('TodoAttachmentUrlWorker')

// On attachment upload, update the todo link
export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info({msg: '[handler] Processing SNS event ', event})
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    logger.info({msg: '[handler] Processing S3 event', s3EventStr})
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }
}

async function processS3Event(s3Event: S3Event) {
  try {
    logger.info({msg: '[processS3Event] s3Event: ', s3Event})

    for (const record of s3Event.Records) {
      const key = decodeURIComponent(record.s3.object.key);

      logger.info({msg: '[processS3Event] Processing S3 item with key: ', key})
  
      const [userId, todoId] = attachmentUtil.extractUserIdAndTodoId(key)
  
      logger.info({msg: '[processS3Event] Got userId and todoId: ', userId, todoId })
  
      if (!userId || !todoId) return;
  
      // confirm a todo exist
      const currentTodo = await todosAccess.getTodoById(userId, todoId);
      if (!currentTodo) {
        logger.error('[processS3Event] Todo does not exist: ', { userId, todoId, currentTodo });
        return;
      }
  
      const attachmentUrl = attachmentUtil.createAttachmentUrl(userId, todoId);

      // we are double encoding it here because AWS S3 re-encode the auth0| part of the userid (which is already encoded)
      const encodedAttachmentUrl = encodeURI(attachmentUrl);
  
      await todosAccess.updateTodoForAttachmentUrl(userId, todoId, encodedAttachmentUrl)
    }
  } catch (error) {
    logger.error('[processS3Event] Error with processing: ', error);
  }
}
