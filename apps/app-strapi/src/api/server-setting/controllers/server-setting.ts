import { factories } from '@strapi/strapi';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Helper functions
async function getStorageStatus(strapiInstance) {
  try {
    // Try to read the storage status file created by the monitoring script
    const statusFile = path.join(strapiInstance.dirs.app.root, 'storage-status.json');
    
    if (fs.existsSync(statusFile)) {
      const data = fs.readFileSync(statusFile, 'utf8');
      return JSON.parse(data);
    }
    
    // If file doesn't exist, get current status
    const { stdout } = await execAsync('df -h / | awk \'NR==2 {print $5}\' | sed \'s/%//\'');
    const usage = parseInt(stdout.trim());
    
    return {
      usage,
      threshold: 70,
      timestamp: new Date().toISOString(),
      disk_info: await getDiskInfo()
    };
  } catch (error) {
    strapiInstance.log.error('Error getting storage status:', error);
    return {
      error: 'Failed to get storage status',
      usage: 0,
      threshold: 70
    };
  }
}

async function getDiskInfo() {
  try {
    const { stdout } = await execAsync('df -h / | awk \'NR==2\'');
    const parts = stdout.trim().split(/\s+/);
    
    return {
      filesystem: parts[0],
      size: parts[1],
      used: parts[2],
      available: parts[3],
      usePercent: parts[4],
      mountedOn: parts[5]
    };
  } catch (error) {
    return null;
  }
}

export default factories.createCoreController('api::server-setting.server-setting', ({ strapi }) => ({
  async find(ctx) {
    const settings = await super.find(ctx);
    
    // Get current storage status
    const storageStatus = await getStorageStatus(strapi);
    
    return {
      ...settings,
      storageStatus
    };
  },

  async getStorageStatus(ctx) {
    const status = await getStorageStatus(strapi);
    return status;
  },

  async runBackup(ctx) {
    try {
      const backupScript = path.join(strapi.dirs.app.root, 'scripts', 'backup-all.sh');
      
      if (!fs.existsSync(backupScript)) {
        return ctx.badRequest('Backup script not found');
      }
      
      // Run backup in background
      exec(backupScript, (error, stdout, stderr) => {
        if (error) {
          strapi.log.error('Backup error:', error);
        } else {
          strapi.log.info('Backup completed successfully');
        }
      });
      
      return {
        message: 'Backup started in background',
        status: 'running'
      };
    } catch (error) {
      strapi.log.error('Error running backup:', error);
      return ctx.badRequest('Failed to start backup');
    }
  },

  async getBackups(ctx) {
    try {
      const backupDir = path.join(strapi.dirs.app.root, 'backups', 'database');
      
      if (!fs.existsSync(backupDir)) {
        return { backups: [] };
      }
      
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql.gz'))
        .map(file => {
          const stats = fs.statSync(path.join(backupDir, file));
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified.getTime() - a.modified.getTime());
      
      return { backups: files };
    } catch (error) {
      strapi.log.error('Error getting backups:', error);
      return ctx.badRequest('Failed to get backup list');
    }
  },

  async updateStorageSettings(ctx) {
    try {
      const { storageThreshold, adminEmail } = ctx.request.body;
      
      // Update environment variables in .env file
      const envPath = path.join(strapi.dirs.app.root, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update or add environment variables
      const updates = {
        STORAGE_THRESHOLD: storageThreshold,
        ADMIN_EMAIL: adminEmail
      };
      
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const regex = new RegExp(`^${key}=.*$`, 'm');
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
          } else {
            envContent += `\n${key}=${value}`;
          }
        }
      }
      
      fs.writeFileSync(envPath, envContent);
      
      // Also update in database
      const settings = await super.update(ctx);
      
      return settings;
    } catch (error) {
      strapi.log.error('Error updating storage settings:', error);
      return ctx.badRequest('Failed to update settings');
    }
  }
}));