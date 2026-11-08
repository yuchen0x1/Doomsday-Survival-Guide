import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { isContentKind, type ContentKind } from '../common/kinds';
import type { ViewerRole } from '../common/visibility';
import { ContentService, type ListQuery } from './content.service';
import { BadRequestException } from '@nestjs/common';

@ApiTags('content')
@SkipThrottle({ ai: true })
@Public()
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  private role(user?: AuthUser): ViewerRole {
    if (!user) return 'GUEST';
    return user.role === 'ADMIN' ? 'ADMIN' : 'USER';
  }

  private parseKind(raw: string): ContentKind {
    if (!isContentKind(raw)) {
      throw new BadRequestException({
        code: 'UNKNOWN_KIND',
        message: `不支持的内容类型：${raw}`,
      });
    }
    return raw;
  }

  @Get('home/stats')
  @ApiOperation({ summary: '首页统计（真实计数）' })
  async homeStats(@CurrentUser() user?: AuthUser) {
    return this.contentService.homeStats(this.role(user), user?.sub);
  }

  @Get('search')
  @ApiOperation({ summary: '全文搜索（ILIKE）' })
  async search(
    @Query('q') q = '',
    @Query('limit') limitRaw?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const limit = Math.min(50, Math.max(1, Number(limitRaw) || 20));
    const items = await this.contentService.search(q, this.role(user), limit);
    return { q, items, total: items.length };
  }

  @Get(':kind')
  @ApiOperation({ summary: '内容列表（分页/分类/危险等级/审核状态过滤）' })
  async list(
    @Param('kind') kindRaw: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('danger') danger?: string,
    @Query('status') status?: string,
    @Query('tag') tag?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const kind = this.parseKind(kindRaw);
    const query: ListQuery = { page, limit, category, danger, status, tag };
    return this.contentService.list(kind, query, this.role(user));
  }

  @Get(':kind/:id')
  @ApiOperation({ summary: '内容详情' })
  async detail(
    @Param('kind') kindRaw: string,
    @Param('id') id: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const kind = this.parseKind(kindRaw);
    return this.contentService.detail(kind, id, this.role(user));
  }
}
