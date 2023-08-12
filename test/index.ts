import 'dotenv/config';
import { ActionRowBuilder, ButtonBuilder, Client } from 'discord.js';

import {
  getNextButton,
  getPreviousButton,
  sendDynamicPagination,
} from '../src/index';

const client = new Client({ intents: ['Guilds'] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  sendDynamicPagination(
    interaction,
    {
      content: 'Test Content',
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          getPreviousButton({
            disabled: true,
            label: 'AHHH',
          }),
          getNextButton(),
        ]),
      ],
    },
    {
      onPageChange(event) {
        return {
          content: `Hello World ${event}`,
        };
      },
    },
  );
});

client.login(process.env.DISCORD_BOT_TOKEN);
