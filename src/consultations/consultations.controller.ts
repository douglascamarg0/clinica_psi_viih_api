import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ResultDTO } from '../shared/result.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('consultations')
export class ConsultationsController {
  constructor(private consultationsService: ConsultationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createConsultationDto: CreateConsultationDto, @Request() req: any): Promise<ResultDTO> {
    try {
      // Usa o ID do usuário logado como psychologistId
      const psychologistId = req.user.userId || createConsultationDto.psychologistId;
      
      if (!psychologistId) {
        return {
          status: false,
          message: 'ID do psicólogo não encontrado',
          data: null,
        };
      }

      const consultation = await this.consultationsService.create(
        createConsultationDto.patientId,
        psychologistId,
        new Date(createConsultationDto.scheduledAt),
      );

      return {
        status: true,
        message: 'Consulta agendada com sucesso',
        data: consultation,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Erro ao agendar consulta',
        data: null,
      };
    }
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() req: any): Promise<ResultDTO> {
    try {
      const userId = req.user.userId;
      const consultations = await this.consultationsService.findByPsychologist(userId);

      return {
        status: true,
        message: 'Consultas recuperadas com sucesso',
        data: consultations,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Erro ao buscar consultas',
        data: null,
      };
    }
  }

  @Get(':id/meet-link')
  @UseGuards(AuthGuard('jwt'))
  async getMeetLink(@Param('id', ParseIntPipe) id: number): Promise<ResultDTO> {
    try {
      const meetLink = await this.consultationsService.getOrCreateMeetLink(id);

      return {
        status: true,
        message: 'Link do Google Meet gerado com sucesso',
        data: { meetLink },
      };
    } catch (error) {
      return {
        status: false,
        message: error.message || 'Erro ao gerar link do Google Meet',
        data: null,
      };
    }
  }
}


