const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/data/books-free.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const asinMap = {
  "atomic-habits": { amazon: { default: "0735211299", UK: { asin: "0735211299" }, CA: { asin: "0735211299" }, AU: { asin: "0735211299" }, JP: { asin: "0735211299" } }, audible: { default: "B07LC91PHL" } },
  "sapiens": { amazon: { default: "0062316095", UK: { asin: "0099590085" }, CA: { asin: "0771038508" }, AU: { asin: "0099590085" }, JP: { asin: "430922671X" } }, audible: { default: "B00ICN066A" } },
  "thinking-fast-slow": { amazon: { default: "0374533555", UK: { asin: "0141033576" }, CA: { asin: "0385676530" }, AU: { asin: "0141033576" }, JP: { asin: "4309247760" } }, audible: { default: "B00555VU7K" } }
};

const updated = data.map(book => {
  const affiliate = asinMap[book.id];
  if (!affiliate) return book;
  return {
    ...book,
    asin: affiliate.amazon.default,
    affiliate
  };
});

fs.writeFileSync(inputPath, JSON.stringify(updated, null, 2));
console.log('Updated free books with affiliate data');
