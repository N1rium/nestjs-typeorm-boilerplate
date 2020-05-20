import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column('varchar', { length: 50 })
  username: string;

  @Column('varchar', { length: 50, unique: true })
  email: string;

  @Column('varchar', { length: 50 })
  salt: string;

  @Column('varchar')
  password: string;
}

export class CreateUserInput {
  username: string;
  email: string;
  password: string;
  passwordRepeat: string;
}
