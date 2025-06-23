import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::user-relationship.user-relationship', {
  config: {
    find: {
      auth: {
        scope: ['find']
      }
    },
    findOne: {
      auth: {
        scope: ['findOne']
      }
    },
    create: {
      auth: {
        scope: ['create']
      }
    },
    update: {
      auth: {
        scope: ['update']
      }
    },
    delete: {
      auth: {
        scope: ['delete']
      }
    }
  }
});