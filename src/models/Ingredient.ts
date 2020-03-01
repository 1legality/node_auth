import {Entity, Column, ManyToOne, PrimaryColumn, Unique} from 'typeorm';
import { Recipe } from './Recipe';

@Entity()
@Unique(['recipeId', 'name'])
export class Ingredient {
  @PrimaryColumn({ generated: 'increment' })
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'integer' })
  priceInCents: number;

  @Column()
  recipeId: number;

  @ManyToOne(() => Recipe, recipe => recipe.ingredients)
  recipe: Promise<Recipe>;
}