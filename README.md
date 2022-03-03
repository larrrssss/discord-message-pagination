# Discord Message Pagination

Discord Message Pagination is an addon for [Discord.js](https://discord.js.org/). It helps you to create paginated messages using slash commands and message components (Buttons) if your content is too long for one message.

## Installation

Node.js v16.6.0 or newer is required.

```sh-session
npm install discord-msg-pagination
```

## Optional packages

* [discord-embed-colors](https://www.npmjs.com/package/discord-embed-colors) to easily convert hex colors to decimal numbers used in discord embeds

## Usage

### Quick start using embed array

```ts
import { sendPaginatedEmbed } from 'discord-msg-pagination';

sendPaginatedEmbed(interaction, embeds);
```

### Using a custom function to update message embed dynamically

`onPageChange` will be called whenever a button interaction happens.

```ts
import { sendPaginatedEmbed } from 'discord-msg-pagination';

function onPageChange(pageNumber, embed) {
  return embed
    .setTitle(`This is page #${pageNumber}`);
}

sendPaginatedEmbed(interaction, initialEmbed, { onPageChange });
```

## Options

```ts
interface Options {
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
  onPageChange?: (pageNumber: number, embed: MessageEmbed) => MessageEmbed | Promise<MessageEmbed>,
  /**
   * Message content
   */
  content?: string,
  /**
   * Add custom components to render above the pagination buttons
   */
  components?: MessageActionRow[],
}
```

## Local test

Set your `DISCORD_BOT_TOKEN` to your `.env`.

```sh-session
cp .env.sample .env

npm run test:bot
```