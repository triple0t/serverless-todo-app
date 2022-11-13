import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentUtil')

// The file Storage logic
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export class AttachmentUtil {
  constructor(
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
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
    return s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration, 10)
    })
  }

  async getTodoAttachment(todoId: string): Promise<boolean> {
    try {
      const response = await s3
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
    const response = await s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: todoId
      })
      .promise()

    return response && response.DeleteMarker
  }
}
