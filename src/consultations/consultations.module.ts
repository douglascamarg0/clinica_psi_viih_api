import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationsService } from './consultations.service';
import { ConsultationsController } from './consultations.controller';
import { Consultation } from './consultations.entity';
import { GoogleMeetService } from './google-meet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Consultation])],
  providers: [ConsultationsService, GoogleMeetService],
  controllers: [ConsultationsController],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}



