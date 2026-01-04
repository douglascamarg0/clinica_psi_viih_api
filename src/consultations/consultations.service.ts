import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from './consultations.entity';
import { GoogleMeetService } from './google-meet.service';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    private googleMeetService: GoogleMeetService,
  ) {}

  async findOne(id: number): Promise<Consultation> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException(`Consulta com ID ${id} não encontrada`);
    }

    return consultation;
  }

  async create(patientId: number, psychologistId: number, scheduledAt: Date): Promise<Consultation> {
    const consultation = this.consultationsRepository.create({
      patientId,
      psychologistId,
      scheduledAt,
      status: 'scheduled',
    });

    return await this.consultationsRepository.save(consultation);
  }

  async findAll(): Promise<Consultation[]> {
    return this.consultationsRepository.find({
      order: { scheduledAt: 'DESC' },
    });
  }

  async findByPsychologist(psychologistId: number): Promise<Consultation[]> {
    return this.consultationsRepository.find({
      where: { psychologistId },
      order: { scheduledAt: 'DESC' },
    });
  }

  async findByPatient(patientId: number): Promise<Consultation[]> {
    return this.consultationsRepository.find({
      where: { patientId },
      order: { scheduledAt: 'DESC' },
    });
  }

  async getOrCreateMeetLink(consultationId: number): Promise<string> {
    const consultation = await this.findOne(consultationId);

    // Se já tem link, retorna
    if (consultation.meetLink) {
      return consultation.meetLink;
    }

    // Cria novo link do Google Meet
    const meetLink = await this.googleMeetService.createMeetLink(
      consultationId,
      consultation.patientId,
      consultation.psychologistId,
      consultation.scheduledAt,
    );

    // Salva o link no banco
    consultation.meetLink = meetLink;
    await this.consultationsRepository.save(consultation);

    return meetLink;
  }
}


