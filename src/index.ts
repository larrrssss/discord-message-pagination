import { 
  GuildMember,
  InteractionCollector,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  ComponentType,
  TextChannel,
  User,
  BaseInteraction,
} from 'discord.js';

import { Options } from './types';

// 10min in milliseconds
const defaultTimeout = 10 * 60 * 1000;

export async function sendPaginatedEmbed(
  target: BaseInteraction | TextChannel | User | GuildMember,
  payload: EmbedBuilder | EmbedBuilder[],
  options?: Options,
): Promise<Message> {
  let i = options?.startIndex || 0;
  const buttonStyle = options?.style ?? ButtonStyle.Secondary;
  const targetUserId = target instanceof BaseInteraction
    ? target.user.id
    : target.id;

  if (target instanceof BaseInteraction && (!target.isRepliable() || target.replied))
    throw new Error('Cannot reply to this interaction');

  if (!Array.isArray(payload) && !options?.onPageChange) 
    throw new Error('onPageChange should be defined if payload is not an array');

  if (Array.isArray(payload) && (i < 0 || i > payload.length - 1))
    throw new Error('startIndex not in array range');

  if (options?.components && (!Array.isArray(options.components) || options.components.length > 4))
    throw new Error('options.components must be an array with length less than 4');

  function buildMessageOptions(embed?: EmbedBuilder) {
    const nextButton = new ButtonBuilder()
      .setLabel(options?.nextLabel ?? '▶️')
      .setCustomId('next_button')
      .setStyle(buttonStyle);

    if (Array.isArray(payload) && i === payload.length - 1) 
      nextButton.setDisabled(true);

    const previousButton = new ButtonBuilder()
      .setLabel(options?.previousLabel ?? '◀️')
      .setCustomId('previous_button')
      .setStyle(buttonStyle);
    
    if (Array.isArray(payload) && i === 0)
      previousButton.setDisabled(true);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([ previousButton, nextButton ]);

    if (Array.isArray(payload) && !payload[i])
      throw new Error('Array out of bound');
    
    return {
      embeds: [embed || (Array.isArray(payload) ? payload[i] : payload)],
      components: [...(options?.components || []), row],
      content: options?.content ?? undefined,
    };
  }

  let message: Message;
  try {
    const messageOptions = { 
      ...buildMessageOptions(), 
      fetchReply: true,
      ephemeral: options?.ephemeral ?? false,
    };
    if (target instanceof BaseInteraction)
      message = (target.deferred
        ? await target.editReply(messageOptions) as Message
        : await target.reply(messageOptions)) as Message;
    else {
      message = await target.send(messageOptions);
    }
  } catch (e) {
    throw new Error('Error sending initial message. Maybe the user disabled direct messages or missing permission for the given channel');
  }

  const collector = new InteractionCollector(target.client, { 
    message,
    componentType: ComponentType.Button,
    time: options?.time ?? defaultTimeout,
  });

  collector.on('collect', async (collectedInteraction) => {
    if (!collectedInteraction.isButton() || !['next_button', 'previous_button'].includes(collectedInteraction.customId))
      return;

    // Check restriction
    if (options?.restriction && options?.restriction !== 'ALL') {
      if (options.restriction === 'AUTHOR' && collectedInteraction.user.id !== targetUserId)
        return;

      if (typeof options.restriction === 'function') {
        const result = await options.restriction(collectedInteraction.member as GuildMember);
        if (!result)
          return;
      }
    }
    
    await collectedInteraction.deferUpdate();

    if (collectedInteraction.customId === 'next_button')
      i++;

    if (collectedInteraction.customId === 'previous_button')
      i--;

    const newEmbed = Array.isArray(payload)
      ? payload[i]
      : options && options.onPageChange ? await options.onPageChange(collectedInteraction.customId.split('_')[0], payload) : undefined;    

    if (!newEmbed)
      throw new Error('Error creating new embed. Make sure to return a MessageEmbed');

    await collectedInteraction.editReply({ ...buildMessageOptions(newEmbed) });
  });

  collector.on('end', async () => {
    if (target instanceof BaseInteraction)
      await target.editReply({ components: options?.components ?? [] })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    else 
      await message.edit({ components: options?.components ?? [] })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
  });

  return message;
} 

export * from './types';
