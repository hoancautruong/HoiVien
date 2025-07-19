const { google } = require("googleapis");

// Đọc JSON từ biến môi trường
const keys = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const SPREADSHEET_ID = "1hh-KZ1PzQ6Cp2_grtv-LP7mABBDLq5fiAWJJPKnA8kw";

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const {
    full_name,
    gender,
    dob,
    id_number,
    address,
    ward,
    province,
    mobile,
    contact_method,
    occupation,
  } = req.body;

  if (!full_name || !gender || !dob || !id_number || !mobile) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }

  const client = new google.auth.JWT(
    keys.client_email,
    null,
    keys.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  try {
    await client.authorize();
    const sheets = google.sheets({ version: "v4", auth: client });

    const address_full = `${address || ""}, ${ward || ""}, ${province || ""}`;
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          now, full_name, gender, dob, id_number,
          address_full, mobile, contact_method, occupation
        ]]
      }
    });

    res.status(200).json({ message: "Ghi dữ liệu thành công" });

  } catch (err) {
    console.error("Lỗi ghi dữ liệu:", err);
    res.status(500).json({ error: "Lỗi ghi dữ liệu", detail: err });
  }
};
