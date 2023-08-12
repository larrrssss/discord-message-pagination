import {
  GuildMember,
  ButtonStyle,
  ActionRowBuilder,
  ComponentEmojiResolvable,
  BaseMessageOptions,
} from 'discord.js';

export enum RestrictionLevel {
  All = 'ALL',
  Author = 'AUTHOR',
}

export type DynamicPaginationOptions = {
  /**
   * Function which will run if the page changed
   */
  onPageChange: (
    event: 'next' | 'previous' | string,
    lastMessageOptions: BaseMessageOptions,
  ) => BaseMessageOptions | Promise<BaseMessageOptions>;
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

export type StaticPaginationOptions = {
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
   * How long the buttons will work (defaults to 10min)
   */
  time?: number;
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
   * Specifiy a restriction for pagination buttons
   */
  restriction?:
    | RestrictionLevel
    | ((member: GuildMember) => boolean | Promise<boolean>);
  /**
   * Set a start index. Default index is 0
   */
  startIndex?: number;
  /**
   * Send ephemeral response
   */
  ephemeral?: boolean;
};
