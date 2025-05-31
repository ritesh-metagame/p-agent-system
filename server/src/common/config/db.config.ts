import mysql from "mysql2/promise";
import ExcelJS from "exceljs";

export async function exportBetsWithAgentCodeToExcel(batchSize = 1000) {
  try {
    console.log("🔐 SSH Tunnel assumed established (via port forwarding)");

    // Connect to remote DB via tunnel
    const remoteDb = await mysql.createConnection({
      host: "127.0.0.1",  // Your SSH tunnel address
      port: 3307,         // Your forwarded port
      user: "agentuser",
      password: "L2hKh6)2a1yK&",
      database: "agentdb",
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bets with Agent Code");

    // We'll fetch in batches if table is large
    let offset = 0;
    let hasMore = true;

    // Flag to write header once
    let headerWritten = false;

    while (hasMore) {
      // Select rows with non-null, non-empty agent_code
      const [rows]: any = await remoteDb.execute(
        "SELECT * FROM bets WHERE agent_code IS NOT NULL AND agent_code != '' ORDER BY id LIMIT ? OFFSET ?",
        [batchSize, offset]
      );

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      // Write header row once, based on keys of first row
      if (!headerWritten) {
        worksheet.columns = Object.keys(rows[0]).map((key) => ({
          header: key,
          key,
          width: 20,
        }));
        headerWritten = true;
      }

      // Add data rows
      worksheet.addRows(rows);

      console.log(`✅ Fetched and added batch with offset ${offset}, count: ${rows.length}`);

      offset += batchSize;
    }

    if (!headerWritten) {
      console.log("⚠️ No rows found with agent_code");
      await remoteDb.end();
      return;
    }

    const filePath = "./bets_with_agent_code.xlsx";
    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file created at: ${filePath}`);

    await remoteDb.end();
  } catch (err: any) {
    console.error("❌ Error exporting bets to Excel:", err.message || err);
  }
}
