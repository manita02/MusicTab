import { Controller, Get, Post, Body, UsePipes } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { CopilotChatDto } from './dto/copilot-chat.dto';
import { CopilotService } from './copilot.service';
import { copilotValidationPipe } from './copilot.validation';

@UsePipes(copilotValidationPipe)
@Controller('copilot')
export class CopilotController {
  constructor(private readonly copilot: CopilotService) {}

  @Get('quota')
  async quota(@CurrentUser() user: RequestUser) {
    return this.copilot.getQuota(user.id);
  }

  @Post('chat')
  async chat(@CurrentUser() user: RequestUser, @Body() dto: CopilotChatDto) {
    return this.copilot.chat(user.id, dto.message, dto.history ?? []);
  }
}
