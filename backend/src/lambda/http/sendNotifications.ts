import 'source-map-support/register'

import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
// import * as AWS  from 'aws-sdk'
/*
import * as AWSXRay from 'aws-xray-sdk'

import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodoById } from '../../helpers/todos'
import { getUserId } from '../utils'
*/

// const XAWS = AWSXRay.captureAWS(AWS)

// const docClient = new AWS.DynamoDB.DocumentClient()

// On attachment upload, update the todo link
export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records) {
      const s3EventStr = snsRecord.Sns.Message
      console.log('Processing S3 event', s3EventStr)
      const s3Event = JSON.parse(s3EventStr)
  
      await processS3Event(s3Event)
    }
  }
  
  async function processS3Event(s3Event: S3Event) {
    console.log('[processS3Event] Processing S3 item with key: ', s3Event);
    /*
    for (const record of s3Event.Records) {
      const key = record.s3.object.key
      console.log('Processing S3 item with key: ', key)
  
      const connections = await docClient.scan({
          TableName: connectionsTable
      }).promise()
  
      const payload = {
          imageId: key
      }
  
      for (const connection of connections.Items) {
          const connectionId = connection.id
          await sendMessageToClient(connectionId, payload)
      }
    }
    */
  }
