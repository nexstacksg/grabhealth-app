export default {
  routes: [
    {
      method: 'GET',
      path: '/commission-templates/active',
      handler: 'commission-template.getActiveTemplates',
      config: {
        policies: [],
        middlewares: []
      }
    }
  ]
};