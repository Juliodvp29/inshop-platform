import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from './app/app.module';
import { User, UserRole } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const adminEmail = 'julionew19@gmail.com';
  const adminPassword = 'Oliverio2*';

  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

  if (existingAdmin) {
    console.log('Super Admin already exists.');
  } else {
    console.log('Creating Super Admin...');
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = userRepository.create({
      email: adminEmail,
      passwordHash,
      firstName: 'Julio',
      lastName: 'Super',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      isActive: true,
    });

    await userRepository.save(admin);
    console.log('Super Admin created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  }

  await app.close();
}

bootstrap();
