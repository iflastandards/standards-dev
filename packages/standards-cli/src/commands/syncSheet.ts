import { Command } from 'commander';
import { execa } from 'execa';
import { join } from 'path';

export const syncSheet = new Command('sync-sheet')
  .description('Sync CSV files with Google Sheets for IFLA standards')
  .addCommand(
    new Command('pull')
      .description('Pull data from Google Sheets to CSV files')
      .argument('<standard>', 'Standard name (e.g., ISBDM, LRM, fr, isbd, muldicat, unimarc)')
      .action(async (standard: string) => {
        try {
          const sheetSyncPath = join(process.cwd(), 'tools', 'sheet-sync', 'index.ts');
          await execa('npx', ['ts-node', sheetSyncPath, 'pull', standard], {
            stdio: 'inherit',
            cwd: process.cwd()
          });
        } catch (error) {
          console.error('❌ Failed to pull sheets:', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('push')
      .description('Push CSV files to Google Sheets')
      .argument('<standard>', 'Standard name (e.g., ISBDM, LRM, fr, isbd, muldicat, unimarc)')
      .action(async (standard: string) => {
        try {
          const sheetSyncPath = join(process.cwd(), 'tools', 'sheet-sync', 'index.ts');
          await execa('npx', ['ts-node', sheetSyncPath, 'push', standard], {
            stdio: 'inherit',
            cwd: process.cwd()
          });
        } catch (error) {
          console.error('❌ Failed to push sheets:', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('status')
      .description('Show status and configuration for a standard')
      .argument('<standard>', 'Standard name (e.g., ISBDM, LRM, fr, isbd, muldicat, unimarc)')
      .action(async (standard: string) => {
        try {
          const sheetSyncPath = join(process.cwd(), 'tools', 'sheet-sync', 'index.ts');
          await execa('npx', ['ts-node', sheetSyncPath, 'status', standard], {
            stdio: 'inherit',
            cwd: process.cwd()
          });
        } catch (error) {
          console.error('❌ Failed to get status:', error);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all available standards')
      .action(async () => {
        try {
          const sheetSyncPath = join(process.cwd(), 'tools', 'sheet-sync', 'index.ts');
          await execa('npx', ['ts-node', sheetSyncPath, 'list'], {
            stdio: 'inherit',
            cwd: process.cwd()
          });
        } catch (error) {
          console.error('❌ Failed to list standards:', error);
          process.exit(1);
        }
      })
  );
