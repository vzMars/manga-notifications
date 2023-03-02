const puppeteer = require('puppeteer');
const Parser = require('rss-parser');
const parser = new Parser();
const baseUrl = 'https://mangasee123.com';

const searchManga = async (title) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();

    const newTitle = title.replaceAll(' ', '%20');
    const url = `${baseUrl}/search/?sort=v&desc=true&name=${newTitle}`;
    await page.goto(url);

    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.top-15.ng-scope > .row'), (e) => ({
        title: e.querySelector('.SeriesName.ng-binding').textContent,
        link: e.querySelector('.SeriesName.ng-binding').href,
        author:
          e.children[1].children[1].tagName === 'I'
            ? [
                ...e.children[1].children[2].querySelectorAll(
                  'span.ng-binding.ng-scope'
                ),
              ].map((author) => author.children[0].textContent)
            : [
                ...e.children[1].children[1].querySelectorAll(
                  'span.ng-binding.ng-scope'
                ),
              ].map((author) => author.children[0].textContent),
        year:
          e.children[1].children[1].tagName === 'I'
            ? e.children[1].children[2].lastElementChild.textContent
            : e.children[1].children[1].lastElementChild.textContent,
      }))
    );

    await browser.close();

    return results.length > 10 ? results.slice(0, 10) : results;
  } catch (error) {
    console.log(error);
  }
};

const getMangaDetails = async (url) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();

    await page.goto(url);

    const title = await page.evaluate(
      () => document.querySelector('h1').textContent
    );

    const description = await page.evaluate(
      () => document.querySelector('.top-5.Content').textContent
    );

    const cover = await page.evaluate(
      () => document.querySelector('.img-fluid.bottom-5').src
    );

    const source_id = await page.evaluate(
      () => document.querySelector('a[href$=".xml"]').href
    );

    await browser.close();

    return { title, description, cover, source_id };
  } catch (error) {
    console.log(error);
  }
};

const getLatestChapter = async (url) => {
  let latestChapterUrl = '';
  let latestChapter = 0;
  try {
    const feed = await parser.parseURL(url);
    const link = feed.link;

    if (feed.items?.length) {
      const latestChapterArr = feed.items[0].guid.split('-');
      latestChapterUrl = feed.items[0].link;
      latestChapter = +latestChapterArr[latestChapterArr.length - 1];
    }

    return { latestChapterUrl, latestChapter, link };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  searchManga,
  getMangaDetails,
  getLatestChapter,
};
