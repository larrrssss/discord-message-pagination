import { 
  CommandInteraction,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';

import { Options } from './types';

// 10min in milliseconds
const defaultTimeout = 10 * 60 * 1000;

export async function sendPaginatedEmbed(
  interaction: CommandInteraction,
  payload: MessageEmbed | MessageEmbed[],
  options?: Options,
): Promise<Message> {
  let i = 0;
  const buttonStyle = options?.style ?? 'SECONDARY';

  if (interaction.replied)
    throw new Error('You already replied to this interaction');

  if (!Array.isArray(payload) && !options?.onPageChange) 
    throw new Error('onPageChange should be defined if payload is not an array');

  function buildMessageOptions(embed?: MessageEmbed) {
    const nextButton = new MessageButton()
      .setLabel(options?.nextLabel ?? '▶️')
      .setCustomId('next_button')
      .setStyle(buttonStyle);

    if (Array.isArray(payload) && i === payload.length - 1) 
      nextButton.disabled = true;

    const previousButton = new MessageButton()
      .setLabel(options?.previousLabel ?? '◀️')
      .setCustomId('previous_button')
      .setStyle(buttonStyle);
    
    if (Array.isArray(payload) && i === 0)
      previousButton.disabled = true;

    const row = new MessageActionRow()
      .addComponents([ previousButton, nextButton ]);

    if (Array.isArray(payload) && !payload[i])
      throw new Error('Array out of bound');
    
    return {
      embeds: [embed || (Array.isArray(payload) ? payload[i] : payload)],
      components: [row],
      content: options?.content ?? undefined,
    };
  }

  const messageOptions = { ...buildMessageOptions(), fetchReply: true };
  const message = (interaction.deferred
    ? (await interaction.followUp(messageOptions))
    : (await interaction.reply(messageOptions))) as Message;

  const collector = new InteractionCollector(interaction.client, { 
    message,
    componentType: 'BUTTON',
    time: options?.time ?? defaultTimeout,
  });

  collector.on('collect', async (collectedInteraction) => {
    if (!collectedInteraction.isButton())
      return;
    
    await collectedInteraction.deferUpdate();

    if (collectedInteraction.customId === 'next_button')
      i++;

    if (collectedInteraction.customId === 'previous_button')
      i--;

    // Only to avoid typescript error
    if (!options?.onPageChange)
      return;

    const newEmbed = Array.isArray(payload)
      ? payload[i]
      : await options.onPageChange(collectedInteraction.customId.split('_')[0], payload);

    if (!newEmbed)
      throw new Error('Error creating new embed. Make sure to return a MessageEmbed');

    await collectedInteraction.editReply({ ...buildMessageOptions(newEmbed) });
  });

  collector.on('end', async () => {
    await interaction.editReply({ components: [] });
  });

  return message;
} 

export * from './types';
