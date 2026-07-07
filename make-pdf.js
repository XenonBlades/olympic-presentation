// make-pdf.js
// npm install puppeteer pdf-lib
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const BASE_URL = 'https://xenonblades.github.io/olympic-presentation/'; // <-- change this to your Pages URL
const SLIDES = [
  'cover.html','intro-quiz-q.html','intro-quiz-a.html','part1-emblem-what.html',
  'sano-scandal.html','tokolo-emblem.html','ichimatsu-history.html','quiz1-q.html',
  'quiz1-a.html','part2-pictogram-what.html','opening-ceremony.html','pictogram-1964.html',
  'pictogram-legacy.html','quiz2-q.html','quiz2-a.html','conclusion.html'
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const merged = await PDFDocument.create();

  for (const slide of SLIDES) {
    console.log('Rendering', slide);
    await page.goto(`${BASE_URL}/${slide}`, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready); // make sure Noto Serif/Sans JP finished loading

    const pdfBytes = await page.pdf({
      width: '1920px',
      height: '1080px',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const singlePage = await PDFDocument.load(pdfBytes);
    const [copied] = await merged.copyPages(singlePage, [0]);
    merged.addPage(copied);
  }

  await browser.close();
  fs.writeFileSync('presentation.pdf', await merged.save());
  console.log('Done → presentation.pdf');
})();
