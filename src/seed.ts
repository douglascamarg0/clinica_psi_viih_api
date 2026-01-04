import { AppDataSource } from './config/datasource';
import { User, UserRole } from './users/users.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Conectado ao banco de dados');

    const userRepository = AppDataSource.getRepository(User);

    // Verificar se os usuários já existem
    const existingPsicologa = await userRepository.findOne({ where: { email: 'psicologa@example.com' } });
    const existingPacient = await userRepository.findOne({ where: { email: 'pacient@example.com' } });

    const password = '123456';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário psicologa
    if (!existingPsicologa) {
      const psicologa = userRepository.create({
        name: 'Psicologa',
        email: 'psicologa@example.com',
        password: hashedPassword,
        role: UserRole.PSICOLOGA,
        isActive: true,
      });
      await userRepository.save(psicologa);
      console.log('✅ Usuário psicologa criado com sucesso');
      console.log('   Email: psicologa@example.com');
      console.log('   Senha: 123456');
    } else {
      console.log('⚠️  Usuário psicologa já existe');
    }

    // Criar usuário pacient
    if (!existingPacient) {
      const pacient = userRepository.create({
        name: 'Pacient',
        email: 'pacient@example.com',
        password: hashedPassword,
        role: UserRole.PACIENT,
        isActive: true,
      });
      await userRepository.save(pacient);
      console.log('✅ Usuário pacient criado com sucesso');
      console.log('   Email: pacient@example.com');
      console.log('   Senha: 123456');
    } else {
      console.log('⚠️  Usuário pacient já existe');
    }

    await AppDataSource.destroy();
    console.log('Seed concluído!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();

