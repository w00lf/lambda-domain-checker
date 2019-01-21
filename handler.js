'use strict';

const {
  TELEGRAM_TOKEN,
  NOTIFY_CHAT_ID,
  NODE_ENV = 'development'
} = process.env;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_TOKEN, {
  polling: false
});

const DATABASE_CONFIG = require('./config/database.js')[NODE_ENV];
const Sequelize = require('sequelize');

const axios = require('axios');

async function sendMessage(message) {
  return bot.sendMessage(NOTIFY_CHAT_ID, message).then((e) => {
    console.log(e);
    console.log(message);
  });
}

async function domainsToCheck() {
  console.log(DATABASE_CONFIG);
  const sequelize = new Sequelize(
    DATABASE_CONFIG.database,
    DATABASE_CONFIG.username,
    DATABASE_CONFIG.password,
    {
      host: DATABASE_CONFIG.host,
      dialect: 'postgres'
    }
  );
  const Domain = require('./models/domain.js')(sequelize, Sequelize);
  return Domain.findAll();
}

async function checkDomains() {
  let resultPromise;
  let domains = await domainsToCheck();
  await axios.
    all(domains.map(domain => {
      console.log(domain.host);
      return axios.get(`http://${domain.host}`);
    })).
    catch(error => {
      console.log('An error!');
      resultPromise = sendMessage(`Master, domain ${error.config.url} is down!`);
    });
  if (!resultPromise) resultPromise = Promise.resolve();
  console.log(resultPromise);
  return resultPromise;
}

module.exports.main = async (event, _context, _callback) => {
  console.log(event);
  await checkDomains();
};
