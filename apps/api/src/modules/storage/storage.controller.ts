import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '../../common/guards/tenant.guard';

@ApiTags('Storage (S3 Signed URLs)')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-upload-url')
  @ApiOperation({ summary: 'Generate a presigned S3 URL for direct client file uploads' })
  async getPresignedUploadUrl(
    @CurrentTenant() tenant: TenantContext,
    @Body() body: { filename: string; contentType: string },
  ) {
    return this.storageService.createPresignedUploadUrl(
      tenant.id,
      body.filename,
      body.contentType,
    );
  }
}
