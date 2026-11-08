import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, Roles } from '../common/decorators';
import { isContentKind, type ContentKind } from '../common/kinds';
import { BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';

@ApiTags('admin')
@SkipThrottle({ ai: true })
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private parseKind(raw: string): ContentKind {
    if (!isContentKind(raw)) {
      throw new BadRequestException({
        code: 'UNKNOWN_KIND',
        message: `不支持的内容类型：${raw}`,
      });
    }
    return raw;
  }

  @Get('content/:kind')
  @ApiOperation({ summary: '管理端内容列表（含全部审核状态）' })
  list(
    @Param('kind') kindRaw: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.list(this.parseKind(kindRaw), { page, limit, status });
  }

  @Post('content/:kind')
  @ApiOperation({ summary: '创建内容草稿' })
  create(
    @Param('kind') kindRaw: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.create(this.parseKind(kindRaw), body, user);
  }

  @Patch('content/:kind/:id')
  @ApiOperation({ summary: '更新内容（版本号自增）' })
  update(
    @Param('kind') kindRaw: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.update(this.parseKind(kindRaw), id, body, user);
  }

  @Post('content/:kind/:id/status')
  @ApiOperation({
    summary: '审核状态迁移（draft→pending_review→reviewed→published→retired，带审核规则校验）',
  })
  transition(
    @Param('kind') kindRaw: string,
    @Param('id') id: string,
    @Body() body: { status: string; note?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.transition(this.parseKind(kindRaw), id, body, user);
  }

  @Get('content/:kind/:id/reviews')
  @ApiOperation({ summary: '内容的审核记录' })
  reviews(@Param('kind') kindRaw: string, @Param('id') id: string) {
    return this.adminService.reviews(this.parseKind(kindRaw), id);
  }

  @Get('sources')
  @ApiOperation({ summary: '来源列表' })
  sources() {
    return this.adminService.listSources();
  }

  @Post('sources')
  @ApiOperation({ summary: '登记资料来源' })
  createSource(@Body() body: Record<string, unknown>) {
    return this.adminService.createSource(body);
  }

  @Get('audit')
  @ApiOperation({ summary: '审计日志（分页）' })
  audit(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.adminService.audit({ page, limit });
  }

  @Get('stats')
  @ApiOperation({ summary: '运营统计' })
  stats() {
    return this.adminService.stats();
  }
}
