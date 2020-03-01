import { Rating } from '../models/Rating';
import {
  EntityManager,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent
} from 'typeorm';
import { Recipe } from '../models/Recipe';

async function getAverageRating(manager: EntityManager, recipeId: number): Promise<number> {
  const response = await manager.query(
    `select AVG(rating) as averageRating from rating where rating.recipeId = ${recipeId}`
  );

  return response[0].averageRating;
}

async function recalculateAverageRating(manager: EntityManager, recipeId: number): Promise<void> {
  const recipe = await manager.findOneOrFail(Recipe, recipeId);
  recipe.averageRating = await getAverageRating(manager, recipeId);
  await manager.save(recipe);
}

@EventSubscriber()
export class RecipeRatingSubscriber implements EntitySubscriberInterface<Rating> {
  listenTo() {
    return Rating;
  }

  async afterInsert(event: InsertEvent<Rating>): Promise<void> {
    await recalculateAverageRating(event.manager, event.entity.recipeId);
  }

  async afterUpdate(event: UpdateEvent<Rating>): Promise<void> {
    await recalculateAverageRating(event.manager, event.entity.recipeId);
  }

  async afterRemove(event: RemoveEvent<Rating>): Promise<void> {
    await recalculateAverageRating(event.manager, event.entity.recipeId);
  }
}