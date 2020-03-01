import { Entity, Column, OneToMany, PrimaryColumn, ManyToOne } from 'typeorm';
import { Ingredient } from './Ingredient';
import { User } from './User';
import { Rating } from './Rating';

@Entity()
export class Recipe {
  @PrimaryColumn({ generated: 'increment' })
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @OneToMany(() => Ingredient, ingredient => ingredient.recipe)
  ingredients: Promise<Array<Ingredient>>;

  @Column()
  creatorId: number;

  @ManyToOne(() => User, user => user.recipes)
  creator: Promise<User>;

  @OneToMany(() => Rating, rating => rating.recipe)
  ratings: Promise<Array<Recipe>>;

  @Column({ nullable: true })
  averageRating: number;
}
