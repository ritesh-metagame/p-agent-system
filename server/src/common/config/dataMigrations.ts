import mysql from "mysql2/promise";
import { PrismaClient } from "../../../prisma/generated/prisma";

const prisma = new PrismaClient();

export async function syncRemoteBetsToLocal(batchSize = 100) {
  try {
    console.log("🔐 SSH Tunnel assumed established (via port forwarding)");

    const remoteDb = await mysql.createConnection({
      host: "127.0.0.1", // Assumes tunnel is forwarding
      port: 3307,
      user: "agentuser",
      password: "L2hKh6)2a1yK&",
      database: "agentdb",
    });

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const [rows]: any = await remoteDb.execute(
        "SELECT * FROM bets ORDER BY id LIMIT ? OFFSET ?",
        [batchSize, offset]
      );

      if (rows.length === 0) {
        hasMore = false;
        break;
      }

      for (const row of rows) {
        try {
          await prisma.gameTransaction.create({
            data: {
              id: row.id,
              bet_amount: row.bet_amount,
              bet_id: row.bet_id,
              brand: row.brand,
              channel_type: row.channel_type,
              game_id: row.game_id,
              game_name: row.game_name,
              game_provider: row.game_provider,
              game_status_id: row.game_status_id,
              game_type: row.game_type,
              jackpot_contribution: row.jackpot_contribution,
              jackpot_details: row.jackpot_details,
              jackpot_payout: row.jackpot_payout,
              jackpot_type: row.jackpot_type,
              kiosk_terminal: row.kiosk_terminal,
              machine_id: row.machine_id,
              outlet_id: row.outlet_id,
              payout_amount: row.payout_amount,
              platform_code: row.platform_code,
              platform_name: row.platform_name,
              player_id: row.player_id,
              prematch_live: row.prematch_live,
              refund_amount: row.refund_amount,
              round_id: row.round_id,
              seed_contri_amount: row.seed_contri_amount,
              settlement_time: row.settlement_time,
              site: row.site,
              sport: row.sport,
              status: row.status,
              ticket_status: row.ticket_status,
              time_of_bet: row.time_of_bet,
              createdAt: row.createdAt,
              updatedAt: row.updatedAt,
              timestamp: row.timestamp,
              transaction_id: row.transaction_id,
            },
          });
          console.log(`✅ Inserted bet_id: ${row.bet_id}`);

        } catch (err) {
          console.error("Insert failed for bet_id:", row.bet_id, err.message);
        }
      }

      console.log(`✅ Synced batch offset ${offset}`);
      offset += batchSize;
    }

    console.log("✅ All data synced.");
    await remoteDb.end();
    await prisma.$disconnect();
  } catch (err: any) {
    console.error("❌ Sync error:", err.message);
  }
}
