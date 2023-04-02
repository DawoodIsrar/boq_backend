const express = require('express');
const cheerio = require('cheerio');
const request = require('request');
const app = express();
const router = express.Router()
// Define the route for the API
router.get('/product', async(req, res) => {
  const productName = 'iphone 14 pro max'; // Get the product name from the query parameter

  // Create the URL of the e-commerce website based on the product name
  const url = `https://offer.alibaba.com/trade/search?spm=a2700.product_home_l0.fy23_pc_search_bar_historyItem.0&tab=all&searchText=iphone+14+pro+max`;

  // Make a request to the website and get the HTML content
   request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
     

      const $ = cheerio.load(html); // Load the HTML content into Cheerio

      // Find the elements containing the product price and description
      const price = $('span.price').text();
      const description = $('div.description').text();

      // Create an object with the product details and send it back as the response
      const product = {
        name: productName,
        price: price,
        description: description
      };
      res.status(200).send(product);
    } else {
      res.status(404).send('Product not found');
    }
  });
});




router.get('/scrape/:productname', (req, res) => {
  const productname = req.params.productname;
  const url = `https://offer.alibaba.com/trade/search?spm=a2700.product_home_l0.fy23_pc_search_bar_historyItem.0&tab=all&searchText=${productname}`;

  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      const products = $('.product-item');
      const productList = [];

      products.each((index, product) => {
        const title = $(product).find('.product-title').text().trim();
        const price = $(product).find('.product-price').text().trim();
        const description = $(product).find('.product-description').text().trim();

        productList.push({ title, price, description });
      });

      res.json(productList);
    } else {
      res.status(500).json({ error: 'Failed to scrape product details' });
    }
  });
});



module.exports = router;
