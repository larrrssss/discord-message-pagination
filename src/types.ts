import { GuildMember, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';

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
  style?: ButtonStyle,
  /**
   * Function which will run if the page changed. Only if second argument is not an array. 
   */
  onPageChange?: (event: 'next' | 'previous' | string, embed: EmbedBuilder) => EmbedBuilder | Promise<EmbedBuilder>,
  /**
   * Message content
   */
  content?: string,
  /**
   * Add custom components to render above the pagination buttons
   */
  components?: ActionRowBuilder<any>[],
  /**
   * Specifiy a restriction for pagination buttons
   */
  restriction?: 'ALL' | 'AUTHOR' | ((member: GuildMember) => boolean | Promise<boolean>),
  /**
   * Set a start index. Default index is 0
   */
  startIndex?: number,  
  /**
   * Send ephemeral response
   */
  ephemeral?: boolean
}