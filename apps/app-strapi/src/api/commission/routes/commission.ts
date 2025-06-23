import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::commission.commission', {
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