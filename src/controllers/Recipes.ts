import { Request, Response }  from 'express';
import { getManager } from 'typeorm';

import { Recipe } from '../models/Recipe';
import { IExpressWithJson, JsonErrorResponse } from 'express-with-json/dist';
import { User } from '../models/User';

function isRecipeCreatedBy(recipe: Recipe, user: User) {
  return recipe.creatorId === user.id;
}

export async function createRecipe(req: Request): Promise<Recipe> {
  const { address, description, name, } = req.body;

  const recipe = new Recipe();
  // recipe.creatorId = req.user.id;
  recipe.creatorId = 0;
  recipe.address = address;
  recipe.description = description;
  recipe.name = name;

  const manager = getManager();
  return await manager.save(recipe);
}

export async function removeRecipe(req: Request) {
  const { id } = req.params;
  const manager = getManager();
  const recipe = await manager.findOneOrFail(Recipe, id);

//   if (!isRecipeCreatedBy(recipe, req.user)) {
//     throw new JsonErrorResponse({ error: 'Forbidden' }, { statusCode: 403 });
//   }
  await manager.remove(recipe);
  return { ok: true };
}

export async function getAllRecipes() {
  const manager = getManager();

  return await manager.find(Recipe);
}

export async function getRecipe(req: Request) {
  const { id } = req.params;
  const manager = getManager();

  return await manager.findOneOrFail(Recipe, id);
}

export async function updateRecipe(req: Request) {
  const { id } = req.params;
  const { address, description, name, } = req.body;
  const manager = getManager();

  const recipe = await manager.findOneOrFail(Recipe, id);
//   if (!isRecipeCreatedBy(recipe, req.user)) {
//     throw new JsonErrorResponse({ error: 'Forbidden' }, { statusCode: 403 });
//   }

  recipe.address = address;
  recipe.description = description;
  recipe.name = name;

  return await manager.save(recipe);
}

export default (app: IExpressWithJson): void => {
  app.postJson('/recipes', createRecipe);
  app.deleteJson('/recipes/:id', removeRecipe);
  app.getJson('/recipes', getAllRecipes);
  app.getJson('/recipes/:id', getRecipe);
  app.patchJson('/recipes/:id', updateRecipe);
}