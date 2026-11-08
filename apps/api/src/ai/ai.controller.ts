import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { IsArray, IsIn, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { AIService, type IdentifyResult } from './ai.service';

class ChatMessageDto {
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content!: string;
}

class ChatBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}

class IdentifyBodyDto {
  @IsString()
  @IsNotEmpty()
  image!: string;

  @IsIn(['plant', 'animal'])
  kind!: 'plant' | 'animal';
}

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'AI 服务健康检查（不外呼）' })
  health(): { available: boolean; model?: string } {
    return this.aiService.health();
  }

  @Public()
  @Post('chat')
  @ApiOperation({ summary: 'SSE 流式对话（服务端持有密钥）' })
  async chat(@Body() body: ChatBodyDto, @Res() res: Response, @CurrentUser() user?: AuthUser) {
    await this.aiService.chat(body.messages, res, user?.sub);
  }

  @Public()
  @Post('identify')
  @ApiOperation({ summary: '植物/动物图片识别' })
  identify(
    @Body() body: IdentifyBodyDto,
    @CurrentUser() user?: AuthUser,
  ): Promise<IdentifyResult> {
    return this.aiService.identify(body.image, body.kind, user?.sub);
  }
}
