import {
  GuildMember,
  ButtonStyle,
  ActionRowBuilder,
  ComponentEmojiResolvable,
  BaseMessageOptions,
  CollectedInteraction,
  ButtonInteraction,
} from 'discord.js';

export enum RestrictionLevel {
  All = 'ALL',
  Author = 'AUTHOR',
}

export enum PageChangeEvent {
  Previous = 'previous',
  Next = 'next',
}

type Options = {
  /**
   * How long the buttons will work (defaults to 10min)
   */
  time?: number;
  /**
   * Specifiy a restriction for pagination buttons
   */
  restriction?:
    | RestrictionLevel
    | ((member: GuildMember) => boolean | Promise<boolean>);
  /**
   * Send ephemeral response
   */
  ephemeral?: boolean;
};

export type DynamicPaginationOptions = Options & {
  /**
   * Function which will run if the page changed
   */
  onPageChange: (data: {
    event: PageChangeEvent;
    lastMessageOptions: BaseMessageOptions;
    interaction: ButtonInteraction;
  }) => BaseMessageOptions | Promise<BaseMessageOptions>;
  /**
   * Function to handle component interaction except pagination buttons
   */
  onComponentInteraction?: (
    interaction: CollectedInteraction,
    options: {
      updatePagination: (messageOptions: BaseMessageOptions) => Promise<void>;
    },
  ) => any;
};

export type StaticPaginationOptions = Options & {
  /**
   * Text to be displayed on next button
   */
  nextLabel?: string;
  /**
   * Emoji to be displayed on next button
   */
  nextButtonEmoji?: ComponentEmojiResolvable;
  /**
   * Text to be displayed on previous button
   */
  previousLabel?: string;
  /**
   * Emoji to be displayed on previous button
   */
  previousButtonEmoji?: ComponentEmojiResolvable;
  /**
   * Button style
   */
  style?: ButtonStyle;
  /**
   * Message content
   */
  content?: string;
  /**
   * Add custom components to render above the pagination buttons
   */
  components?: ActionRowBuilder<any>[];
  /**
   * Set a start index. Default index is 0
   */
  startIndex?: number;
};
