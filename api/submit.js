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

    // ✅ Kiểm tra trường bắt buộc
    if (!full_name || !dob || !id_number || !mobile) {
      return res.status(400).json({ error: "Thiếu trường bắt buộc" });
    }

    if (!gender) {
      return res.status(400).json({ error: "Bạn chưa chọn giới tính" });
    }

    // ✅ Kiểm tra định dạng ngày sinh dd/mm/yyyy
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(dob)) {
      return res.status(400).json({ error: "Ngày sinh phải theo định dạng dd/mm/yyyy" });
    }

    // ✅ Kiểm tra CCCD và SĐT là số
    if (isNaN(id_number) || isNaN(mobile)) {
      return res.status(400).json({ error: "CCCD và số điện thoại phải là số" });
    }

    // ✅ Gộp địa chỉ
    const full_address = [address, ward, province].filter(Boolean).join(", ");

    // ✅ Gộp checkbox
    const method = Array.isArray(contact_method) ? contact_method.join(", ") : contact_method || "";
    const job = Array.isArray(occupation) ? occupation.join(", ") : occupation || "";

    // ✅ Google Auth
    const client = new google.auth.JWT(
      keys.client_email,
      null,
      keys.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    await client.authorize();

    const sheets = google.sheets({ version: "v4", auth: client });

    // ✅ Chuẩn bị dữ liệu ghi
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
      method,
      job,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "A:I",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [row],
      },
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Lỗi ghi dữ liệu:", error);
    return res.status(500).json({ error: "Lỗi server khi ghi dữ liệu" });
  }
};
