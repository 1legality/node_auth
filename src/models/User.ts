import { Column, Entity, OneToMany, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Length, IsNotEmpty, IsEmail, IsOptional } from "class-validator";
import * as bcrypt from "bcryptjs";

import { Recipe } from './Recipe';
import { Rating } from './Rating';

@Entity()
export class User {
  @PrimaryColumn({ generated: 'increment' })
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true, unique: true })
  @IsOptional()
  facebookId?: string;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ nullable: true })
  @Length(4, 100)
  @IsOptional()
  password?: string;

  @Column()
  @IsNotEmpty()
  role: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Recipe, recipe => recipe.creator)
  recipes: Promise<Array<Recipe>>;

  @OneToMany(() => Rating, rating => rating.creator)
  ratings: Promise<Array<Rating>>;

  hashPassword(): void {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string): boolean {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}