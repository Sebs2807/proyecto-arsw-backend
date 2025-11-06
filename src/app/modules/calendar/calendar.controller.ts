// calendar.controller.ts
import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import type { Request } from 'express';

@Controller({ path: 'calendar', version: '1' })
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @UseGuards(JwtAuthGuard)
  @Get('google-events')
  async getGoogleEvents(
    @Req() req: Request,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const user = req.user as { id: string; email: string };
		const {events} = await this.calendarService.getEventsForUser(user.id, start, end);
    return {events};
  }
}
