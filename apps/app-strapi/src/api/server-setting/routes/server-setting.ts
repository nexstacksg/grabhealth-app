export default {
  routes: [
    {
      method: 'GET',
      path: '/server-setting',
      handler: 'server-setting.find'
    },
    {
      method: 'PUT',
      path: '/server-setting',
      handler: 'server-setting.update'
    },
    {
      method: 'DELETE',
      path: '/server-setting',
      handler: 'server-setting.delete'
    },
    {
      method: 'GET',
      path: '/server-setting/storage-status',
      handler: 'server-setting.getStorageStatus'
    },
    {
      method: 'POST',
      path: '/server-setting/run-backup',
      handler: 'server-setting.runBackup'
    },
    {
      method: 'GET',
      path: '/server-setting/backups',
      handler: 'server-setting.getBackups'
    },
    {
      method: 'POST',
      path: '/server-setting/storage-settings',
      handler: 'server-setting.updateStorageSettings'
    }
  ]
};