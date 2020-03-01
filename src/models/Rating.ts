import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { Recipe } from './Recipe';
import { User } from './User';

@Entity()
@Unique(['recipeId', 'creatorId'])
export class Rating {
  @PrimaryColumn({ generated: 'increment' })
  id: number;

  @Column({ type: 'integer' })
  rating: number;

  @Column()
  text: string;

  @Column()
  recipeId: number;

  @ManyToOne(() => Recipe, recipe => recipe.ratings)
  recipe: Promise<Recipe>;

  @Column()
  creatorId: number;

  @ManyToOne(() => User, user => user.ratings)
  creator: Promise<User>;
}