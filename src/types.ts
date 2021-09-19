import { InteractionButtonOptions, MessageEmbed } from 'discord.js';

export interface Options {
  /**
   * Text to be displayed on next button
   */
  nextLabel?: string,
  /**
   * Text to be displayed on previous button
   */
  previousLabel?: string,
  /**
   * How long the buttons will work (defaults to 10min)
   */
  time?: number,
  /**
   * Button style
   */
  style?: InteractionButtonOptions['style'],
  /**
   * Function which will run if the page changed. Only if second argument is not an array. 
   */
  onPageChange?: (event: 'next' | 'previous' | string, embed: MessageEmbed) => MessageEmbed | Promise<MessageEmbed>,
  /**
   * Message content
   */
  content?: string,
}