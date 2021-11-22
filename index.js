const axios = require("axios");
const https = require("https");
const express = require("express");
const Vonage = require("@vonage/server-sdk");
const app = express();
const { JSDOM } = require("jsdom");
require("dotenv").config();

let counter = 0;
let c;
let id;
const bigData = 27;
const Geni = 28;
const daily = 1200000;
const port = process.env.PORT || 5000;
const from = "Vonage APIs";
const to = "212770218827";

const vonage = new Vonage({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
});

async function getHtml() {
  try {
    const { data } = await axios.get(
      "https://fs.uit.ac.ma/preselection-master-2021-2022/",
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }
    );
    c = initJsDom(data);
    console.log("requset send ...");
  } catch (e) {
    console.log(e);
  }
  if (c == 2) {
    clearInterval(id);
    process.exit(0);
  }
}

function initJsDom(html) {
  const dom = new JSDOM(html);
  const $ = (selector) => dom.window.document.querySelector(selector);
  const table = Array.from($("table").querySelectorAll("tr"));
  const bigdata = table[13].textContent.toString().trim();
  const geni = table[14].textContent.toString().trim();

  if (parseInt(bigdata.length) > bigData) {
    sendSMS(bigdata);
    counter++;
  }
  if (parseInt(geni.length) > Geni) {
    sendSMS(geni);
    counter++;
  }
  return counter;
}

function sendSMS(sms) {
  vonage.message.sendSms(from, to, sms, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.messages[0]["status"] === "0") {
        console.log("Message sent successfully.");
      } else {
        console.log(
          `Message failed with error: ${responseData.messages[0]["error-text"]}`
        );
      }
    }
  });
}

id = setInterval(() => {
  getHtml();
}, daily);

app.get("/", (req, res) => {
  res.send("counter");
});

app.listen(port, () => {
  console.log(`server running in port ${port}`);
});
