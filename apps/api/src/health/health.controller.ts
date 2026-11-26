import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { version } from '../../package.json';
import { Public } from '../common/decorators';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@SkipThrottle({ ai: true })
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: '健康检查（数据库不可用时返回 503）' })
  async health(): Promise<{
    status: string;
    db: 'up' | 'down';
    version: string;
    uptimeSec: number;
  }> {
    let db: 'up' | 'down' = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }
    const payload = {
      status: db === 'up' ? 'ok' : 'degraded',
      db,
      version: process.env.API_VERSION ?? version,
      uptimeSec: Math.round(process.uptime()),
    };
    // 503 让负载均衡/探针能摘除数据库不可用的实例，而不是继续转发流量。
    if (db === 'down') throw new ServiceUnavailableException(payload);
    return payload;
  }
}
