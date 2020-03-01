import express from 'express';
import { getManager, EntityManager } from 'typeorm';
import { IExpressWithJson } from 'express-with-json';
import { Ingredient } from '../models/Ingredient';
import { Recipe } from '../models/Recipe';

export async function createIngredient(req: express.Request): Promise<Ingredient> {
  const { Recipe } = req.params;
  const manager = getManager();
  // await manager.findOneOrFail(Recipe, recipeId);

  const { description, name, priceInCents } = req.body;

  const ingredient = new Ingredient();
  ingredient.description = description;
  ingredient.name = name;
  ingredient.priceInCents = parseInt(priceInCents);
  //ingredient.recipe = parseInt(recipeId);

  return manager.save(ingredient);
}

export async function getRestaurantIngredients(req: express.Request) {
  const { recipeId } = req.params;

  return await getManager().find(Ingredient, { where: { recipeId } });
}

export default (app: IExpressWithJson): void => {
  app.postJson('/recipes/:recipeId/ingredient', createIngredient);
  app.getJson('/recipes/:recipeId/ingredient', getRestaurantIngredients);
}