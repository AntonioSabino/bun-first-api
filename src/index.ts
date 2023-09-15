import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";
import { swagger } from "@elysiajs/swagger";

const setup = (app: Elysia) => app.decorate('db', new PrismaClient())

const app = new Elysia()
  .use(swagger({
    path: '/v1/docs',
  }))
  .use(setup)
  .group('/search', (app) =>
    app
      .get('/', async ({ db }) => db.movie.findMany())
      .guard({
        query: t.Object({
          q: t.String(),
        })
      }, (app) => app

        .get('/movie', async ({ query, db }) => db.movie.findMany({
          where: {
            title: {
              contains: query.q
            }
          }
        }))
        .get('/tv', async ({ query, db }) => db.movie.findMany({
          where: {
            title: {
              contains: query.q
            },
            type: 'series'
          }
        }))
        .get('/person', async ({ query, db }) => db.person.findMany({
          where: {
            name: {
              contains: query.q
            }
          }
        }))
        // .get('/company', ({ query }) => `query: ${query.q}`)
        .get('/episode', async ({ query, db }) => db.episode.findMany({
          where: {
            title: {
              contains: query.q
            }
          }
        }))
        .get('/review', async ({ query, db }) => db.review.findMany({
          where: {
            comment: {
              contains: query.q
            }
          }
        }))
        .get('/award', async ({ query, db }) => db.award.findMany({
          where: {
            name: {
              contains: query.q
            }
          }
        }))
      )
  )
  .group('title', (app) => {
    return app
      .get('/:id', async ({ params, db }) => db.movie.findUnique({
        where: {
          id: parseInt(params.id, 10)
        }
      }))
      .get('/:id/episodes', async ({ params, db }) => db.episode.findMany({
        where: {
          movieId: parseInt(params.id, 10)
        }
      }))
      .get('/:id/cast', async ({ params, db }) => db.person.findMany({
        where: {
          movies: {
            some: {
              id: parseInt(params.id, 10)
            }
          }
        }
      }))
      .get('/:id/reviews', async ({ params, db }) => db.review.findMany({
        where: {
          movieId: parseInt(params.id, 10)
        }
      }))
      .get('/:id/awards', async ({ params, db }) => db.award.findMany({
        where: {
          movieId: parseInt(params.id, 10)
        }
      }))
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
