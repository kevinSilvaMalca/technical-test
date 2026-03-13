import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Liveness check', description: 'Returns API status, current timestamp and process uptime in seconds.' })
  @ApiResponse({ status: 200, description: 'API is healthy', schema: { example: { status: 'ok', timestamp: '2026-03-13T00:00:00.000Z', uptime: 42.3 } } })
  check(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
