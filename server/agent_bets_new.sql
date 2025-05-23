-- Adminer 4.8.1 MySQL 5.5.68-MariaDB dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `agent_bets_new`;
CREATE TABLE `agent_bets_new` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bet_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settlement_time` datetime DEFAULT NULL,
  `time_of_bet` datetime DEFAULT NULL,
  `outlet_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `player_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `game_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `game_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `game_provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `machine_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bet_amount` decimal(10,2) DEFAULT NULL,
  `payout_amount` decimal(10,2) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT '0.00',
  `withdraw_amount` decimal(10,2) DEFAULT '0.00',
  `jackpot_contribution` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jackpot_payout` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seed_contri_amount` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jackpot_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jackpot_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sport` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ticket_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prematch_live` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kiosk_terminal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `platform_code` int(11) DEFAULT NULL,
  `platform_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `game_status_id` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `round_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_admin_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_admin_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_owner_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_owner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_master_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_master_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_golden_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_golden_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agent_user_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `owner_actual_percentage` decimal(10,2) DEFAULT NULL,
  `ownerPercentage` decimal(10,2) DEFAULT NULL,
  `masterAgentPercentage` decimal(10,2) DEFAULT NULL,
  `goldenAgentPercentage` decimal(10,2) DEFAULT NULL,
  `ggr_amount` decimal(10,2) DEFAULT NULL,
  `total_commission` decimal(10,2) DEFAULT NULL,
  `ownercommission` decimal(10,2) DEFAULT NULL,
  `master_agent_commission` decimal(10,2) DEFAULT NULL,
  `golden_agent_commission` decimal(10,2) DEFAULT NULL,
  `deposit_commission` decimal(10,2) DEFAULT '0.00',
  `withdraw_commission` decimal(10,2) DEFAULT '0.00',
  `transaction_type` enum('bet','deposit','withdraw') COLLATE utf8mb4_unicode_ci DEFAULT 'bet',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `settled` varchar(2) COLLATE utf8mb4_unicode_ci DEFAULT 'N',
  `timestamp` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_agent_admin_id` (`agent_admin_id`(191)),
  KEY `idx_agent_owner_id` (`agent_owner_id`(191)),
  KEY `idx_agent_master_id` (`agent_master_id`(191)),
  KEY `idx_agent_golden_id` (`agent_golden_id`(191)),
  KEY `idx_player_id` (`player_id`(191)),
  KEY `idx_bet_id` (`bet_id`(191)),
  KEY `idx_time_of_bet` (`time_of_bet`),
  KEY `idx_status` (`status`),
  KEY `idx_settled` (`settled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2025-04-02 10:38:47
