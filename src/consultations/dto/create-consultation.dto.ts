import { IsNotEmpty, IsInt, IsDateString } from 'class-validator';

export class CreateConsultationDto {
  @IsNotEmpty()
  @IsInt()
  patientId: number;

  @IsNotEmpty()
  @IsInt()
  psychologistId: number;

  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;
}



