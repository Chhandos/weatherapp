// server.js
require('dotenv').config();
const express = require('express');
const fetch = globalThis.fetch || require('node-fetch');
const path = require('path');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const TABLE_NAME = "users";
const WEATHER_KEY = process.env.WEATHER_KEY || "YOUR_KEY_HERE";
const REGION = process.env.AWS_REGION || "ap-south-1";

// DynamoDB auth via EC2 IAM Role
const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: REGION })
);

/* SIGNUP */
app.post("/signup", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.json({ error: "Email and Name required" });

  try {
    const result = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { email }
    }));

    if (result.Item) return res.json({ status: "exists" });

    await client.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: { email, name }
    }));

    return res.json({ status: "created", name });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Signup failed" });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ error: "Email required" });

  try {
    const result = await client.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { email }
    }));

    if (!result.Item) return res.json({ status: "no_user" });

    return res.json({ status: "login", name: result.Item.name });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Login failed" });
  }
});

/* WEATHER API */
app.get("/weather", async (req, res) => {
  const { city } = req.query;
  if (!city) return res.json({ error: "City query required" });

  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_KEY}&q=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.json({ error: data.error.message });

    return res.json({
      city: data.location.name,
      temp_c: data.current.temp_c,
      condition: data.current.condition.text,
      icon: "https:" + data.current.condition.icon,
      is_day: data.current.is_day
    });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Weather fetch failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running http://0.0.0.0:${PORT}`)
);
