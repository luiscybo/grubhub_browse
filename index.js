const puppeteer = require('puppeteer');
const util =  require('util');
const fs = require('fs');
const { URL } = require('url');
const { Pool } = require('pg');
var _ = require('lodash');

// This line prevents the error below
// (node:18765) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 exit listeners added. Use emitter.setMaxListeners() to increase limit
process.setMaxListeners(0);

// Set postgresql database credentials
const pool = new Pool({
  user: '',
  host: '',
  database: '',
  port: 5432,
  password: ''
});

// A list of the most common user-agents,
// source: https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
const user_agents = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (X11; Linux x86_64; rv:57.0) Gecko/20100101 Firefox/57.0', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36 OPR/48.0.2685.52', 'Mozilla/5.0 (Windows NT 6.1; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (X11; Linux x86_64; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Safari/604.1.38', 'Mozilla/5.0 (iPad; CPU OS 11_0_3 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A432 Safari/604.1', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0', 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/600.5.17 (KHTML, like Gecko) Version/8.0.5 Safari/600.5.17', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.89 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:57.0) Gecko/20100101 Firefox/57.0', 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/61.0.3163.100 Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/62.0.3202.75 Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; Trident/5.0)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:56.0) Gecko/20100101 Firefox/56.0', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36 OPR/48.0.2685.39', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:50.0) Gecko/20100101 Firefox/50.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Safari/537.36', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0; Trident/5.0)', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36']

// A list of proxies to be used in 'ip:port' format
const proxies = [''];

// Simple functions to sleep, select a random element/int, and make a directory
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rand(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function rand_int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mkdir(_path) {
  if (!fs.existsSync(_path)){
    fs.mkdirSync(_path);
  }
}


// Useful traceback print out
async function dumpError(err) {
  if (typeof err === 'object') {
    if (err.message) {
      console.log('\nMessage: ' + err.message)
    }
    if (err.stack) {
      console.log('\nStacktrace:')
      console.log('====================')
      console.log(err.stack);
    }
  } else {
    console.log('dumpError :: argument is not an object');
  }
}

// Found it easier to select certain elements through the xpath
async function xpath(page, path) {
  const resultsHandle = await page.evaluateHandle(path => {
    let results = [];
    let query = document.evaluate(path, document, null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i=0, length = query.snapshotLength; i < length; ++i) {
      results.push(query.snapshotItem(i));
    }
    return results;
  }, path);
  const properties = await resultsHandle.getProperties();
  const result = [];
  const releasePromises = [];
  for (const property of properties.values()) {
    const element = property.asElement();
    if (element)
      result.push(element);
    else
      releasePromises.push(property.dispose());
  }
  await Promise.all(releasePromises);
  return result;
}


// Main function that grabs the grubub page and all it's elements
async function run(url, wait) {
  try {
    console.log('url -> ', url);
    const url_content_dir = dir + '/' +
    url.replace('https://', '').replace(/\//g, '_').replace(/\./g, '-');
    console.log('dir -> ', url_content_dir);
    // creates a directory for every url which will contain screenshot and html
    mkdir(url_content_dir);
    const screenshot_path = url_content_dir + '/screenshot.png';
    const html_path = url_content_dir + '/html.txt';
    const j_path = url_content_dir + '/results.json';
    const sleep_time = rand_int(10000, 15000);
    const proxy = rand(proxies);
    const proxy_arg = util.format('--proxy-server=%s', proxy);
    const user_agent = rand(user_agents);
    const url_parsed = new URL(url);

    if (wait) {
      await sleep(sleep_time);
    }

    const browser = await puppeteer.launch({
      'headless': false,
      'args': [proxy_arg]});
    const page = await browser.newPage();

    page.setUserAgent(user_agent);
    page.setViewport({width: 1152, height: 864});
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 5000000
    });

    // Clicks on the 'About' and 'See full hours' button
    if (url_parsed.host == 'www.grubhub.com') {
      await page.evaluate(() => {
        var el = document.getElementById('goToAbout');
        if (el) {
          el.click();
        }
        var el = document.querySelector('#ghs-restaurant-about > div > div > div > div.restaurantAbout-info > ghs-restaurant-hours > div > div > div.ghs-showFullScheduleLink.s-link.u-inset-squished-4');
        if (el) {
          console.log('clicking hours selector');
          el.click();
          console.log('clicked');
        }
      });
    }

    // All selectors and xpaths
    // const bname_selector = '#navSection-reviews > ghs-restaurant-bread-crumbs > div > ul > li:nth-child(2) > span';
    const bname_xpath = '//*[@id="navSection-reviews"]/ghs-restaurant-bread-crumbs/div/ul/li[2]/span';
    // const address_selector = '#ghs-restaurant-about > div > div.restaurantAbout-info > div > a.restaurantAbout-info-address.u-line-bottom.u-line--thin.u-line--light > div:nth-child(1)';
    const address_xpath = '//*[@id="ghs-restaurant-about"]/div/div/div/div[2]/div/a[2]/div';
    const address2_xpath = '//*[@id="ghs-restaurant-about"]/div/div/div/div[2]/div/a[2]/text()';
    // const cuisines_selector = '#ghs-restaurant-about > div > div.restaurantAbout-details > div';
    // const phone_selector = '#ghs-restaurant-about > div > div.restaurantAbout-info > div > div > ghs-restaurant-phone > a';
    const phone_xpath = '//*[@id="ghs-restaurant-about"]/div/div/div/div[2]/div/div/ghs-restaurant-phone/a';
    // const gmap_selector = '#ghs-restaurant-about > div > div.restaurantAbout-info > div > a:nth-child(1) > ghs-static-map';
    // const gmap_xpath = '//*[@id="ghs-restaurant-about"]/div/div[2]/div/a[1]/ghs-static-map';
    // const price_selector = '#ghs-restaurant-about > div > div.restaurantAbout-details > ghs-price-rating > div > div.priceRating-base';
    const price_xpath = '//*[@id="ghs-restaurant-about"]/div/div/div/div[1]/ghs-price-rating/div/div[2]';
    // const stars_selector = '#ghs-restaurant-summary > div > div.s-row.restaurantSummary-details.u-inset-4 > div.restaurantSummary-info.s-col-md-6.s-col-sm.s-col-xs > div.u-clickable.restaurantSummary-starRatingContainer.u-inline-block > div > ghs-star-rating > div > span > meta:nth-child(1)';
    // const stars_xpath = '//*[@id="ghs-restaurant-summary"]/div/div[2]/div[2]/div[2]/div/ghs-star-rating/div/span/meta[1]';
    // const ratings_selector = '#ghs-restaurant-summary > div > div.s-row.restaurantSummary-details.u-inset-4 > div.restaurantSummary-info.s-col-md-6.s-col-sm.s-col-xs > div.u-clickable.restaurantSummary-starRatingContainer.u-inline-block > div > ghs-star-rating > div > div > div.starRating-countCol > div';
    const ratings_xpath = '//*[@id="ghs-restaurant-summary"]/div/div[2]/div[2]/div[2]/div/ghs-star-rating/div/div/div[2]/span[1]';
    const hours_xpath = '//*[@id="ghs-restaurant-about"]/div/div/div/div[2]/ghs-restaurant-hours/div/div/div[2]'

    const j = {};

    //************************ Gathering content from page ********************
    const [bname_handle1, bname_handle2] = await xpath(page, bname_xpath);
    if (bname_handle1) {
      const bnamex = await page.evaluate(e => e.textContent, bname_handle1);
      // console.log('bname -> ', bname);
      if (bnamex) {
        console.log('bnamex -> ', bnamex);
        j['bname'] = bnamex.trim();
      }
    }

    // const address = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, address_selector);

    const [addr_handle1, addr_handle2] = await xpath(page, address_xpath);
    if (addr_handle1) {
      const addressx = await page.evaluate(e => e.textContent, addr_handle1);
      // console.log('address -> ', address);
      if (addressx) {
        console.log('addressx -> ', addressx);
        j['address'] = addressx.trim();
      }
    }

    const [addr2_handle1, addr2_handle2] = await xpath(page, address2_xpath);
    if (addr2_handle1) {
      const address2 = await page.evaluate(e => e.textContent, addr2_handle1);
      if (address2) {
        console.log('address2 -> ', address2);
        j['address2'] = address2.trim();
      }
    }

    // const cuisines = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, cuisines_selector);
    // console.log('cuisines -> ', cuisines);

    // const phone = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, phone_selector);

    const [phone_handle1, phone_handle2] = await xpath(page, phone_xpath);
    if (phone_handle1) {
      const phonex = await page.evaluate(e => e.textContent, phone_handle1);
      // console.log('phone -> ', phone);
      if (phonex) {
        console.log('phonex -> ', phonex.trim());
        j['phone'] = phonex.trim();
      }
    }

    // const gmap = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, gmap_selector);

    // const [gmap_handle1, gmap_handle2] = await xpath(page, gmap_xpath);
    // const gmapx = await page.evaluate(e => e.textContent, gmap_handle1);
    // console.log('gmap -> ', gmap);
    // console.log('gmapx -> ', gmapx);

    // const price = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, price_selector);

    const [price_handle1, price_handle2] = await xpath(page, price_xpath);
    if (price_handle1) {
      const pricex = await page.evaluate(e => e.textContent, price_handle1);
      // console.log('price -> ', price);
      if (pricex) {
        console.log('pricex -> ', pricex);
        j['price'] = pricex.trim();
      }
    }


    // const stars = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, stars_selector);

    // const [stars_handle1, stars_handle2] = await xpath(page, stars_xpath);
    // const starsx = await page.evaluate(e => e.textContent, stars_handle1);
    // console.log('stars -> ', stars);
    // console.log('starsx -> ', starsx);

    // const ratings = await page.evaluate((sel) => {
    //   let element = document.querySelector(sel);
    //   return element? element.innerHTML: null;
    // }, ratings_selector);

    const [rating_handle1, rating_handle2] = await xpath(page, ratings_xpath);
    if (rating_handle1) {
      const ratingsx = await page.evaluate(e => e.textContent, rating_handle1);
      // console.log('ratings -> ', ratings);
      if (ratingsx) {
        console.log('ratingsx -> ' , ratingsx)
        j['ratings'] = ratingsx.trim();
      }
    }
    // **************************** End of selectors **************************


    // await page.waitForNavigation({waitUntil: 'load'});

    //Writes a json to a file with url, folder for page contents and proxy used
    j['url'] = url;
    j['folder'] = url_content_dir;
    j['proxy'] = proxy;
    console.log(j);
    fs.writeFile(j_path, JSON.stringify(j, undefined, 4), function() {});

    // Saves the html
    const html = await page.content();
    fs.writeFile(html_path, html, function() {});

    // Takes a screenshot of the page
    await page.screenshot({ path: screenshot_path });

    browser.close();

    // Insets page content (business name, address, ratings etc.)
    pool.query('INSERT INTO grubhub_clean VALUES ($1, $2)', [url, JSON.stringify(j, undefined, 4)])
    .catch(e => console.error(e.stack))

  } catch(err) {
    dumpError(err);
  }
}

// Function that starts crawler
function start (grubhub_urls) {
  console.log('starting')
  // define a directory that will contain all page data
  dir = 'source_files';
  mkdir(dir)

  // number of browsers to run asynchronously
  const jobs = 1;
  grubhub_urls = _.chunk(grubhub_urls, jobs)

  function run_set(urllist,cb){
    // set the second parameter to true or false to wait before executing
    return Promise.all(_.map(urllist, (url) => run(url, false))).then(cb);
  }

  function getAll(set){
      if(set.length === 0)
        return
      urllist = set.pop();
      console.log(urllist);
      run_set(urllist,() => {getAll(set)});
  }

  getAll(_.reverse(grubhub_urls));
}

// Create a table that will contain all parsed data from web page
pool.query('CREATE TABLE IF NOT EXISTS grubhub_clean (url TEXT PRIMARY KEY, j JSON)')
  .then(console.log('table grubhub_clean created'))
  .catch(e => console.error(e.stack))

// Select urls from table
pool.query('SELECT url FROM grubhub_urls WHERE url NOT IN (SELECT url FROM grubhub_clean) order by random() limit 3')
  .then(res => {
  urls = _.map(res.rows, (row) => row.url);
  start(urls);
  })
