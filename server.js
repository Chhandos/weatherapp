// server.js
const express = require('express');
const path = require('path');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "ap-south-1" })
);

const TABLE_NAME = "Users";

app.post('/login', async (req, res) => {
  const { email, name } = req.body;

  const user = await client.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { email }
  }));

  if (user.Item) {
    return res.json({ status: 'login', name: user.Item.name });
  }

  if (!name) {
    return res.json({ status: 'new_user' });
  }

  await client.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: { email, name }
  }));

  return res.json({ status: 'signup', name });
});

app.get('/weather', async (req, res) => {
  const { city } = req.query;
  const apiKey = process.env.WEATHER_KEY;

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  );

  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));
