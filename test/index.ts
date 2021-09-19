import 'dotenv/config';
import { Client, Intents, MessageEmbed } from 'discord.js';

import { sendPaginatedEmbed, Options } from '../src/index';

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand())
    return;

  const options = {
    onPageChange: (i, embed) => embed.setTitle(`This is embed #${i}`),
  } as Options;

  await sendPaginatedEmbed(
    interaction, 
    new MessageEmbed().setTitle('My initial embed'), 
    options,
  );
});

client.login(process.env.DISCORD_BOT_TOKEN);