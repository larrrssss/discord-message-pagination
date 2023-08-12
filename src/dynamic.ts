import {
  GuildMember,
  InteractionCollector,
  Message,
  ComponentType,
  TextChannel,
  User,
  BaseInteraction,
  BaseMessageOptions,
  ButtonBuilder,
  APIButtonComponent,
  ButtonStyle,
  ButtonComponentData,
} from 'discord.js';

import {
  defaultCollectorTimeout,
  nextButtonCustomId,
  previousButtonCustomId,
} from './constants';
import { DynamicPaginationOptions, PageChangeEvent, RestrictionLevel } from './types';

export const getNextButton = (
  data?: Partial<APIButtonComponent> | Partial<ButtonComponentData>,
): ButtonBuilder => {
  const btn = new ButtonBuilder(data).setCustomId(nextButtonCustomId);

  if (!btn.data.label) btn.setLabel('▶️');

  if (!btn.data.style) btn.setStyle(ButtonStyle.Secondary);

  return btn;
};

export const getPreviousButton = (
  data?: Partial<APIButtonComponent> | Partial<ButtonComponentData>,
): ButtonBuilder => {
  const btn = new ButtonBuilder(data).setCustomId(previousButtonCustomId);

  if (!btn.data.label) btn.setLabel('◀️');

  if (!btn.data.style) btn.setStyle(ButtonStyle.Secondary);

  return btn;
};

export default async (
  target: BaseInteraction | TextChannel | User | GuildMember,
  payload: BaseMessageOptions,
  options: DynamicPaginationOptions,
): Promise<Message> => {
  const targetUserId =
    target instanceof BaseInteraction ? target.user.id : target.id;

  if (
    target instanceof BaseInteraction &&
    (!target.isRepliable() || target.replied)
  )
    throw new Error('Cannot reply to this interaction');

  let message: Message;
  try {
    const messageOptions = {
      ...payload,
      fetchReply: true,
      ephemeral: options?.ephemeral ?? false,
    };
    if (target instanceof BaseInteraction)
      message = (
        target.deferred
          ? ((await target.editReply(messageOptions)) as Message)
          : await target.reply(messageOptions)
      ) as Message;
    else {
      message = await target.send(messageOptions);
    }
  } catch (e) {
    throw new Error(
      'Error sending initial message. Maybe the user disabled direct messages or missing permission for the given channel',
    );
  }

  const collector = new InteractionCollector(target.client, {
    message,
    componentType: ComponentType.Button,
    time: options?.time ?? defaultCollectorTimeout,
  });

  collector.on('collect', async (collectedInteraction) => {
    if (
      !collectedInteraction.isButton() ||
      ![previousButtonCustomId, nextButtonCustomId].includes(
        collectedInteraction.customId,
      )
    )
      return;

    // Check restriction
    if (options?.restriction && options?.restriction !== RestrictionLevel.All) {
      if (
        options.restriction === RestrictionLevel.Author &&
        collectedInteraction.user.id !== targetUserId
      )
        return;

      if (typeof options.restriction === 'function') {
        const result = await options.restriction(
          collectedInteraction.member as GuildMember,
        );
        if (!result) return;
      }
    }

    await collectedInteraction.deferUpdate();

    const newMessagePayload = await options.onPageChange(
      collectedInteraction.customId.split('_')[1] as PageChangeEvent,
      payload,
    );

    await collectedInteraction.editReply(newMessagePayload);
  });

  collector.on('end', async () => {
    if (target instanceof BaseInteraction)
      await target
        .editReply({ components: [] })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    else
      await message
        .edit({ components: [] })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
  });

  return message;
};
