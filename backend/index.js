const express = require("express");
const Moralis = require("moralis/node");
const app = express();
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");
const port = 5001;

const ABI = JSON.parse(fs.readFileSync("./abi.json", "utf8"));

app.use(cors());
app.use(express.json());

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0, 4)}...${transaction[3].slice(0, 4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}

app.get("/getNameAndBalance", async (req, res) => {
  const { userAddress } = req.query;

  try {
    const response = await Moralis.Cloud.run("getMyName", {
      _user: userAddress,
    });

    const jsonResponseName = response;

    const secResponse = await Moralis.Web3API.account.getNativeBalance({
      address: userAddress,
    });
    const jsonResponseBal = (secResponse.balance / 1e18).toFixed(2);

    const thirResponse = await Moralis.Web3API.token.getTokenPrice({
      address: "0x65805F0cc6680D558BEcb6655719735c1dEFEDD7",
    });
    const jsonResponseDollars = (
      thirResponse.usdPrice * jsonResponseBal
    ).toFixed(2);

    const fourResponse = await Moralis.Cloud.run("getMyHistory", {
      _user: userAddress,
    });
    const jsonResponseHistory = fourResponse;

    const fiveResponse = await Moralis.Cloud.run("getMyRequests", {
      _user: userAddress,
    });
    const jsonResponseRequests = fiveResponse;

    res.json({
      name: jsonResponseName,
      balance: jsonResponseBal,
      dollars: jsonResponseDollars,
      history: jsonResponseHistory,
      requests: jsonResponseRequests,
    });
  } catch (error) {
    console.error(error);
    res.json({}); // Return empty response if an error occurs
  }
});

Moralis.initialize(process.env.MORALIS_APP_ID);
Moralis.serverURL = process.env.MORALIS_SERVER_URL;

app.listen(port, () => {
  console.log(`Listening for API Calls on port ${port}`);
});
