const { google } = require("googleapis");
const keys = require("../public/service_account.json");

const SPREADSHEET_ID = "1hh-KZ1PzQ6Cp2_grtv-LP7mABBDLq5fiAWJJPKnA8kw";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await client.authorize();
    const sheets = google.sheets({ version: "v4", auth: client });

    const {
      full_name,
      gender,
      dob,
      id_number,
      address,
      mobile,
      contact_method,
      occupation,
    } = req.body;

    // Chuyển checkbox array thành chuỗi
    const contactStr = Array.isArray(contact_method)
      ? contact_method.join(", ")
      : contact_method || "";
    const occupationStr = Array.isArray(occupation)
      ? occupation.join(", ")
      : occupation || "";

    const values = [
      [full_name, gender, dob, id_number, address, mobile, contactStr, occupationStr],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Error writing to sheet:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
