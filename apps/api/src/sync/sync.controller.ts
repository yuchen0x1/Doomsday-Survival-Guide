import { BadRequestException, Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../common/decorators';
import { SYNC_RESOURCES, SyncService } from './sync.service';

@ApiTags('sync')
@SkipThrottle({ ai: true })
@ApiBearerAuth()
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  private parseResource(raw: string): string {
    if (!SYNC_RESOURCES.includes(raw)) {
      throw new BadRequestException({
        code: 'UNKNOWN_RESOURCE',
        message: `未知同步资源：${raw}`,
      });
    }
    return raw;
  }

  @Get(':resource')
  @ApiOperation({ summary: '拉取个人数据（按登录用户隔离）' })
  get(@Param('resource') resourceRaw: string, @CurrentUser() user: AuthUser) {
    return this.syncService.get(user.sub, this.parseResource(resourceRaw));
  }

  @Put(':resource')
  @ApiOperation({ summary: '批量上传个人数据（事务内整包覆盖）' })
  put(
    @Param('resource') resourceRaw: string,
    @Body() body: unknown,
    @CurrentUser() user: AuthUser,
  ) {
    return this.syncService.put(user.sub, this.parseResource(resourceRaw), body);
  }
}
