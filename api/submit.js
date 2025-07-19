
const { google } = require("googleapis");
const keys = require("./service_account.json");

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

    if (!full_name || !dob || !id_number || !mobile) {
      return res.status(400).json({ error: "Thiếu trường bắt buộc" });
    }

    if (!gender) {
      return res.status(400).json({ error: "Bạn chưa chọn giới tính" });
    }

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dob)) {
      return res.status(400).json({ error: "Ngày sinh phải theo định dạng dd/mm/yyyy" });
    }

    if (isNaN(id_number) || isNaN(mobile)) {
      return res.status(400).json({ error: "CCCD và số điện thoại phải là số" });
    }

    const full_address = [address, ward, province].filter(Boolean).join(", ");
    const contactStr = Array.isArray(contact_method) ? contact_method.join(", ") : contact_method || "";
    const occupationStr = Array.isArray(occupation) ? occupation.join(", ") : occupation || "";

    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await client.authorize();
    const sheets = google.sheets({ version: "v4", auth: client });

    const now = new Date();
    const timestamp = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const row = [
      timestamp,
      full_name,
      gender,
      dob,
      id_number,
      full_address,
      mobile,
      contactStr,
      occupationStr,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:I",
      valueInputOption: "USER_ENTERED",
      resource: { values: [row] },
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Lỗi ghi dữ liệu:", error);
    console.error("Lỗi ghi dữ liệu:", error.response?.data || error.message || error);
    return res.status(500).json({ error: "Lỗi server khi ghi dữ liệu" });
  }
};
