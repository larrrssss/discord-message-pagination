import 'dotenv/config';
import { Client, EmbedBuilder } from 'discord.js';

import { sendPaginatedEmbed, Options } from '../src/index';

const client = new Client({ intents: ['Guilds'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand())
    return;

  let i = 1;
  const options = {
    onPageChange: (event, embed) => {
      i = event === 'next' 
        ? i + 1 
        : i - 1;
      return embed.setTitle(`This is embed #${i}`);
    },
    time: 10 * 1000,
  } as Options;

  await sendPaginatedEmbed(
    interaction, 
    new EmbedBuilder().setTitle('My initial embed'), 
    options,
  );
});

client.login(process.env.DISCORD_BOT_TOKEN);