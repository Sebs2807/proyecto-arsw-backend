import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dtos/createEvent.dto';
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
    const { events } = await this.calendarService.getEventsForUser(user.id, start, end);
    return { events };
  }

  @UseGuards(JwtAuthGuard)
  @Post('google-events')
  async createGoogleEvent(@Req() req: Request, @Body() body: CreateEventDto) {
    const user = req.user as { id: string; email: string };

    let attendees: string[] = [];
    if (Array.isArray(body.attendees)) {
      attendees = body.attendees.map((a: any) => (typeof a === 'string' ? a : a.email));
    }

    let start: { dateTime: string } | { date: string } | undefined;
    let end: { dateTime: string } | { date: string } | undefined;

    if (body.startDateTime) start = { dateTime: body.startDateTime };
    else if (body.startDate) start = { date: body.startDate };
    else if (body.start && typeof body.start.dateTime === 'string')
      start = { dateTime: body.start.dateTime };
    else if (body.start && typeof body.start.date === 'string') start = { date: body.start.date };

    if (body.endDateTime) end = { dateTime: body.endDateTime };
    else if (body.endDate) end = { date: body.endDate };
    else if (body.end && typeof body.end.dateTime === 'string')
      end = { dateTime: body.end.dateTime };
    else if (body.end && typeof body.end.date === 'string') end = { date: body.end.date };

    if (!start || !end) {
      throw new BadRequestException('Se requiere startDateTime/startDate y endDateTime/endDate');
    }

    const created = await this.calendarService.createEventForUser(user.id, {
      summary: body.summary,
      description: body.description,
      start,
      end,
      attendees,
    });

    return { created };
  }
}
