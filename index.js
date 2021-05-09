const express = require("express");
const axios = require("axios");
const app = express();
const day = require("dayjs");
const cron = require("node-schedule");
require("dotenv").config({ path: "./.env" });
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
cron.scheduleJob("0 */5 * * * *", async () => {
  console.log("running cron");
  await getVaccine();
});
const getVaccine = async () => {
  const date = `${day().date()}-${day().month() + 1}-${day().year()}`;
  const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${process.env.pincode}&date=${date}`;
  try {
    const data = await axios.get(url, {
      headers: {
        authority: "cdn-api.co-vin.in",
        pragma: "no-cache",
        "cache-control": "no-cache",
        "sec-ch-ua":
          '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
        accept: "application/json, text/plain, /",
        "sec-ch-ua-mobile": "?0",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
        origin: "https://www.cowin.gov.in",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        referer: "https://www.cowin.gov.in/",
        "accept-language": "en",
      },
    });
    const centerData = data.data.centers[0];
    centerData.sessions.map((session) => {
      if (session.min_age_limit === 18 && session.available_capacity > 1) {
        console.log(process.env.TWILIO_ACCOUNT_SID);
        const client = require("twilio")(accountSid, authToken);

        client.messages
          .create({
            body: `${session.available_capacity} Vaccines are available book fast`,
            from: `${process.env.NUMBER}`,
            to: `${process.env.to}`,
          })
          .then((message) => console.log(message.sid));
      }
    });
  } catch (err) {
    console.log(err);
  }
};
