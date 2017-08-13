"use strict";
const fs = require('fs');
const he = require("he");
const asyncs = require("async")
const cheerio = require('cheerio');
//const html = fs.readFileSync('./index.htm')
const Sequelize = require('sequelize')
const config = require('./config')
const article = require('./article')
const sequelize = new Sequelize(config.db);

let news_list = [];

const News = sequelize.define('news', {
    title: { type: Sequelize.STRING, allowNull: false},
    description: { type: Sequelize.STRING(500), allowNull: false},
    cover: { type: Sequelize.STRING, allowNull: false},
    content: { type: Sequelize.TEXT, allowNull: false},
    link: { type: Sequelize.STRING, allowNull: false},
    host: { type: Sequelize.STRING, allowNull: false},
    author: { type: Sequelize.STRING, allowNull: false},
},{
  timestamps: false,
  tableName: 'sz_news_gather'
});

News.sync();

(async () => {
  try{
    let news = {}
    news['title'] = 
'Collaborative intelligence to shape the future of mobility'
    news['description'] = 
'Every 3 years, a wide scope of companies from around the world gather at Movin’On to discuss the future of mobility.'
    news['link'] = 
'http://www.solvay.com/en/asking-more/movinon.html'
    news['cover'] = 
'https://media.solvay.com/medias/domain1446/media284/43339-1s479i4r0s-xlarge.jpg'
    news['content'] = article.content

    news['author'] = 'solvay'
    news['host'] = 'www.solvay.com'

    await News.create(news)
    sequelize.close()
  }catch(err){
    console.log(err)
  }
})()









