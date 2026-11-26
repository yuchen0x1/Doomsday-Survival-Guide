import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import type { Response } from 'express';
import { AuthUser, CurrentUser, Public } from '../common/decorators';
import { AIService, type IdentifyResult } from './ai.service';

class ChatMessageDto {
  // system 提示词由服务端注入，禁止客户端覆盖。
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(12000)
  content!: string;
}

class ChatBodyDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}

class IdentifyBodyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8_000_000)
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
  identify(@Body() body: IdentifyBodyDto, @CurrentUser() user?: AuthUser): Promise<IdentifyResult> {
    return this.aiService.identify(body.image, body.kind, user?.sub);
  }
}
