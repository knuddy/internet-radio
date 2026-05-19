import { Command } from 'commander';

const program = new Command();

program
  .name("backend-management")
  .description("Management CLI utilities for the backend system.")
  .version('1.0.0')

program
  .command('download')
  .description("Provide a YouTube video URL to enqueue a download request. Playlists are not accepted.")
  .argument('<url>', 'The YouTube video URL')
  .action(async (url: string) => {
    console.log(url);
  });

program.parse(process.argv);