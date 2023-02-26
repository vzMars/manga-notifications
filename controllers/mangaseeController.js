const puppeteer = require('puppeteer');
const baseUrl = 'https://mangasee123.com';

const searchManga = async (title) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const newTitle = title.replaceAll(' ', '%20');
    const url = `${baseUrl}/search/?sort=v&desc=true&name=${newTitle}`;
    await page.goto(url);

    const results = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.top-15.ng-scope > .row'), (e) => ({
        title: e.querySelector('.SeriesName.ng-binding').textContent,
        link: e.querySelector('.SeriesName.ng-binding').href,
        author: e.querySelector('i')
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
        year: e.querySelector('i')
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

module.exports = {
  searchManga,
};
