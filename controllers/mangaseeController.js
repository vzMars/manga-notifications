const puppeteer = require('puppeteer');
const baseUrl = 'https://mangasee123.com';

const searchManga = async (title) => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      Pragma: 'no-cache',
    });

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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      Pragma: 'no-cache',
    });

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
  let link = '';

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      Pragma: 'no-cache',
    });

    await page.goto(url);

    const items = await page.evaluate(() => [
      ...document.querySelectorAll('item'),
    ]);

    if (items?.length) {
      link = await page.evaluate(
        () => document.querySelectorAll('link')[1].textContent
      );
      const chapterLink = await page.evaluate(
        () => document.querySelectorAll('item link')[0].textContent
      );
      const guid = await page.evaluate(
        () => document.querySelectorAll('guid')[0].textContent
      );

      const latestChapterArr = guid.split('-');
      latestChapterUrl = chapterLink;
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
