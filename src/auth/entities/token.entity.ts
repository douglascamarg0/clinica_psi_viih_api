
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/users.entity';

@Entity('tokens')
@Index(['userId'])
@Index(['expiresAt'])
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'varchar', length: 500 })
    token: string;

    @Column({ type: 'varchar', length: 100 })
    type: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    blacklisted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
