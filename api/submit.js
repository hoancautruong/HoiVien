const { google } = require("googleapis");
const keys = require("../service_account.json");

const SPREADSHEET_ID = "1hh-KZ1PzQ6Cp2_grtv-LP7mABBDLq5fiAWJJPKnA8kw";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  await client.authorize();
  const sheets = google.sheets({ version: "v4", auth: client });

  const { name, phone, email, birth, note } = req.body;

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Trang tính1!A2",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[name, phone, email, birth, note]]
    }
  });

  res.status(200).json({ success: true, response });
};