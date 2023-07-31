const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const {htmlToText} = require('html-to-text')
const botToken = '6302708887:AAERMlXC1VZ7rcsKcafE2ddiF249Q1qDDn8';
const bot = new TelegramBot(botToken, { polling: true });


const wikiRandomUrl =
  'https://en.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1';


async function getRandomWikiArticle() {
  try {
    const response = await axios.get(wikiRandomUrl);
    const article = response.data.query.random[0];
    return article.title;
  } catch (error) {
    console.error('Error fetching random Wikipedia article:', error.message);
    return null;
  }
}


async function getWikiSummary(title) {
  const wikiSummaryUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&titles=${encodeURIComponent(
    title
  )}`;
  try {
    const response = await axios.get(wikiSummaryUrl)
    const pageId = Object.keys(response.data.query.pages)[0];
    const summaryHTML = response.data.query.pages[pageId].extract;
    const summaryplaintext = htmlToText(summaryHTML,{
      wordwrap: false,
    })
    return summaryplaintext;
  } catch (error) {
    console.error('Error fetching Wikipedia article summary:', error.message);
    return null;
  }
}


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === '/randomwiki') {
    
    const articleTitle = await getRandomWikiArticle(); 
    if (articleTitle) {
      
      const articleSummary = await getWikiSummary(articleTitle);
      if (articleSummary) {
        const escapedTitle = escapeMarkdownV2(articleTitle);
        const escapedSummary = escapeMarkdownV2(articleSummary);
        
        console.log(escapedSummary)
        bot.sendMessage(chatId, `Random Wikipedia Article: ${escapedTitle}\n\n${escapedSummary}`,{ parse_mode:'MarkdownV2'});
      } else {
        bot.sendMessage(chatId, 'Error fetching Wikipedia article summary.');
      }
    } else {
      bot.sendMessage(chatId, 'Error fetching random Wikipedia article.');
    }
  }
});
function escapeMarkdownV2(text) {
        return text.replace(/[-.*+?^${}()|[\]\\<>!&=]/g, (character) => {
          return '\\' + character;
        });
      }

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.message);
});

console.log('Bot is running. Send /randomwiki to get a random Wikipedia article with summary.');