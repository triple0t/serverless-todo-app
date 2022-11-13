import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../utils/logger'

if (process.env.IS_OFFLINE) {
  AWSXRay.setContextMissingStrategy('LOG_ERROR')
}

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentUtil')

// The file Storage logic
export class AttachmentUtil {
  constructor(
    private readonly s3Client: AWS.S3 = createS3Client(),
    private readonly bucketName: string = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration: string = process.env.SIGNED_URL_EXPIRATION
  ) {}

  /**
   * Create Attachment Url
   * in format: https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png
   * @param todoId
   * @returns {string} Attachment URL
   */
  createAttachmentUrl(todoId: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  /**
   * It returns a pre-signed URL that can be used to upload an attachment file for a TODO item.
   *
   * @param todoId Todo ID
   * @returns {string} pre-signed URL
   */
  getUploadUrl(todoId: string): string {
    return this.s3Client.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration, 10)
    })
  }

  async getTodoAttachment(todoId: string): Promise<boolean> {
    try {
      const response = await this.s3Client
        .getObject({
          Bucket: this.bucketName,
          Key: todoId
        })
        .promise()

      if (response && response.Body) {
        return !!response.Body
      }
    } catch (error) {
      logger.error('[getTodoAttachment] error fetching s3 object: ', error)
    }
    return false
  }

  async deleteTodoAttachment(todoId: string): Promise<boolean> {
    const response = await this.s3Client
      .deleteObject({
        Bucket: this.bucketName,
        Key: todoId
      })
      .promise()

    return response && response.DeleteMarker
  }
}

function createS3Client() {
  const s3: AWS.S3 = new XAWS.S3({
    signatureVersion: 'v4'
  })
  return s3
}
