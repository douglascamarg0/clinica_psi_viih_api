import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleMeetService {
  private readonly logger = new Logger(GoogleMeetService.name);
  private calendar: any;

  constructor(private configService: ConfigService) {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
      const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
      const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');

      if (!clientId || !clientSecret || !refreshToken) {
        this.logger.warn(
          'Credenciais do Google não configuradas. Google Meet não funcionará até que as variáveis de ambiente sejam configuradas.',
        );
        return;
      }

      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      this.logger.log('Google Calendar API inicializada com sucesso');
    } catch (error) {
      this.logger.error('Erro ao inicializar Google Auth:', error);
    }
  }

  async createMeetLink(
    consultationId: number,
    patientId: number,
    psychologistId: number,
    scheduledAt: Date,
  ): Promise<string> {
    if (!this.calendar) {
      throw new Error(
        'Google Calendar API não está configurada. Configure as variáveis de ambiente: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN',
      );
    }

    try {
      // Calcula data de término (1 hora após o início)
      const endTime = new Date(scheduledAt);
      endTime.setHours(endTime.getHours() + 1);

      const event = {
        summary: `Consulta Psicológica - ID ${consultationId}`,
        description: `Consulta online via Google Meet\n\nID da Consulta: ${consultationId}\nID do Paciente: ${patientId}\nID do Psicólogo: ${psychologistId}`,
        start: {
          dateTime: scheduledAt.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Sao_Paulo',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${consultationId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const meetLink = response.data.conferenceData.entryPoints[0].uri;

      this.logger.log(`Google Meet criado com sucesso para consulta ${consultationId}`);

      return meetLink;
    } catch (error) {
      this.logger.error('Erro ao criar Google Meet:', error);
      throw new Error(`Falha ao criar reunião do Google Meet: ${error.message}`);
    }
  }
}


