"use strict";
const fs = require('fs');
const asyncs = require("async")
const cheerio = require('cheerio');
const phantom = require('phantom');
const url = fs.readFileSync('./url.txt','utf-8').split('\n')
const Sequelize = require('sequelize')
const config = require('./config')

const sequelize = new Sequelize(config.db);

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

let news_list = []

let q = asyncs.queue((news,callback) => {
  (async () => {
    try{
        console.log("--->"+news.link);
        const instance = await phantom.create(['--load-images=no']);
        const page = await instance.createPage();
        await page.on("onResourceRequested", function(requestData) {
            console.info('Requesting', requestData.url)
        });
        const status = await page.open(news.link);
        const content = await page.property('content');
        const $ = cheerio.load(content)
        //console.log($(".container-content").html())
        news['content'] = $(".container-content").html()
        News.create(news)
        await instance.exit();
        callback()        
    }catch(e){console.log(e)}

  })()
  
})

q.saturated = function() { 
    console.info('all workers to be used'); 
}

q.drain = () => {
    console.log('all urls have been processed');
    fs.writeFile('news.txt', JSON.stringify(news_list), function(err){ if (err) throw err });
    sequelize.close()
}

(async () => {
  try{
    const instance = await phantom.create(['--load-images=no']);
    const page = await instance.createPage();
    await page.property('viewportSize', {width: 1920, height: 1080})
    await page.on("onResourceRequested", function(requestData) {
        console.info('Requesting', requestData.url)
    });
// url.length
    for(let i = 0; i < url.length; i++){
        console.log(url[i])
        const status = await page.open(url[i]);
        // await page.property('scrollPosition', {
        //   top: 100
        // })
        console.log('Status: ' + status);
        const content = await page.property('content');
       // console.log("content=>"+content)
        const $ = cheerio.load(content);
        let article = $('.content')
        //page.render('page'+i+'.jpg',{format: 'jpeg', quality: '60'})
        //article.length
        for(let i = 0; i < article.length; i++) {
            let news = {}
            //console.log("art=>"+article.eq(i).find('.textcontainer.textcontainerQ').html())
            let title = article.eq(i).find('.headline').find('a').html()
            news['title'] = title? title : "no title"
            //console.log("title ->"+news.title)

            let description = article.eq(i).find('.underline').html()
            news['description'] = description? description : 'no description'
            //console.log("description ->"+news.description)

            let link = article.eq(i).find('.headline').find('a').attr('href')
            news['link'] = link? 'https://press.covestro.com/news.nsf/id/'+link : "no link"
            //console.log("link ->"+news.link)

            let cover = article.eq(i).find('img').attr('src')
            news['cover'] = cover? 'https://press.covestro.com/news.nsf/id/'+cover : 'no cover'
            //console.log("cover ->"+news.cover)
            news['author'] = 'covestro'
            news['host'] = 'https://press.covestro.com'
            news_list.push(news)
        }
    }
    await instance.exit();
    //fs.writeFile('news.txt', JSON.stringify(news_list), function(err){ if (err) throw err });
//

    news_list.forEach(news => {
//https://press.covestro.com/news.nsf/id/Trendy-automotive-finish-for-an-evocative-appearance?Open&parent=Home_EN&ccm=000
        q.push(news, err => { if(err) console.log(err) })
    })
    
  }catch(err){
    console.log(err)
  }
  
})()









