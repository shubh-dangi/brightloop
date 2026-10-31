import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client?: S3Client;
  private bucket: string;

  constructor(@Optional() private configService?: ConfigService) {
    this.bucket = this.configService?.get<string>('s3.bucket', 'brightloop-saas-uploads') || 'brightloop-saas-uploads';
    const region = this.configService?.get<string>('s3.region', 'us-east-1') || 'us-east-1';
    const accessKeyId = this.configService?.get<string>('s3.accessKeyId');
    const secretAccessKey = this.configService?.get<string>('s3.secretAccessKey');

    if (accessKeyId && accessKeyId !== 'placeholder') {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey: secretAccessKey || '',
        },
      });
    }
  }

  async createPresignedUploadUrl(
    orgId: string,
    filename: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `orgs/${orgId}/uploads/${Date.now()}-${sanitizedFilename}`;

    if (this.s3Client) {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });

      return {
        uploadUrl,
        fileUrl: `https://${this.bucket}.s3.amazonaws.com/${key}`,
        key,
      };
    }

    // Local / Dev Fallback simulation
    this.logger.log(`Generated dev mock presigned URL for key: ${key}`);
    return {
      uploadUrl: `http://localhost:4000/api/v1/storage/mock-upload/${key}`,
      fileUrl: `http://localhost:4000/api/v1/storage/mock-files/${key}`,
      key,
    };
  }
}
