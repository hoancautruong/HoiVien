const { google } = require("googleapis");
const keys = require("./service_account.json"); // File đặt trong thư mục /api cùng submit.js

const SPREADSHEET_ID = "1hh-KZ1PzQ6Cp2_grtv-LP7mABBDLq5fiAWJJPKnA8kw";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
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

    // ✅ Kiểm tra bắt buộc
    if (!full_name || !dob || !id_number || !mobile) {
      return res.status(400).json({ error: "Thiếu trường bắt buộc" });
    }

    if (!gender) {
      return res.status(400).json({ error: "Bạn chưa chọn giới tính" });
    }

    // ✅ Gộp địa chỉ thành 1 dòng
    const full_address = [address, ward, province].filter(Boolean).join(", ");

    // ✅ Lấy thời gian hiện tại (giờ Việt Nam)
    const now = new Date();
    const timeVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const timestamp = timeVN.toLocaleString("vi-VN");

    // ✅ Format mảng checkbox
    const contactStr = Array.isArray(contact_method)
      ? contact_method.join(", ")
      : contact_method || "";

    const occupationStr = Array.isArray(occupation)
      ? occupation.join(", ")
      : occupation || "";

    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await client.authorize();

    const sheets = google.sheets({ version: "v4", auth: client });

    const values = [
      [
        timestamp,
        full_name,
        gender,
        dob,
        id_number,
        full_address,
        mobile,
        contactStr,
        occupationStr,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("❌ Lỗi ghi dữ liệu:", error);
    res.status(500).json({ error: "Lỗi server khi ghi Google Sheets" });
  }
};
