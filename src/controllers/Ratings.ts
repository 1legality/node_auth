import { getManager } from 'typeorm';
import express from 'express';
import { IExpressWithJson, JsonErrorResponse } from 'express-with-json';
import { Rating } from '../models/Rating';

export async function createRating(req: express.Request) {
  const { recipeId } = req.params;
  const { rating: ratingString, text } = req.body;

  const ratingNumber = parseInt(ratingString);
  if (ratingNumber < 0 || ratingNumber > 5) {
    throw new JsonErrorResponse({ error: 'Rating must be between 1 and 5' }, { statusCode: 400 });
  }

  const rating = new Rating();
  // rating.creatorId = req.user.id;
  rating.rating = ratingNumber;
  rating.recipeId = parseInt(recipeId);
  rating.text = text;

  return await getManager().save(rating);
}

export async function getRestaurantRatings(req: express.Request) {
  const { recipeId } = req.params;

  return await getManager().find(Rating, { where: { recipeId } });
}

export default function(app: IExpressWithJson): void  {
  app.postJson('/recipes/:recipeId/ratings', createRating);
  app.getJson('/recipes/:recipeId/ratings', getRestaurantRatings);
}