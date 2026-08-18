/*
 Navicat Premium Data Transfer

 Source Server         : c5_ciyon
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : schema-mysql

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 16/08/2026 20:24:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for article_collections
-- ----------------------------
DROP TABLE IF EXISTS `article_collections`;
CREATE TABLE `article_collections`  (
  `collection_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `article_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`collection_id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `article_collections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `article_collections_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of article_collections
-- ----------------------------

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `article_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `publish_time` datetime NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `views` int NULL DEFAULT 0,
  PRIMARY KEY (`article_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of articles
-- ----------------------------

-- ----------------------------
-- Table structure for diabetes_types
-- ----------------------------
DROP TABLE IF EXISTS `diabetes_types`;
CREATE TABLE `diabetes_types`  (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `pathogenesis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `manifestation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `treatment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`type_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of diabetes_types
-- ----------------------------

-- ----------------------------
-- Table structure for doctor_information
-- ----------------------------
DROP TABLE IF EXISTS `doctor_information`;
CREATE TABLE `doctor_information`  (
  `info_id` int NOT NULL AUTO_INCREMENT,
  `doctor_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `introduction` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `chat_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`info_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of doctor_information
-- ----------------------------

-- ----------------------------
-- Table structure for life_advice
-- ----------------------------
DROP TABLE IF EXISTS `life_advice`;
CREATE TABLE `life_advice`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of life_advice
-- ----------------------------

-- ----------------------------
-- Table structure for life_plans
-- ----------------------------
DROP TABLE IF EXISTS `life_plans`;
CREATE TABLE `life_plans`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL,
  `time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `life_plans_chk_1` CHECK (`type` in (_utf8mb4'饮食',_utf8mb4'运动',_utf8mb4'其他'))
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of life_plans
-- ----------------------------

-- ----------------------------
-- Table structure for punch_in
-- ----------------------------
DROP TABLE IF EXISTS `punch_in`;
CREATE TABLE `punch_in`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `punch_time` datetime NOT NULL,
  `punch_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completion_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of punch_in
-- ----------------------------

-- ----------------------------
-- Table structure for user_risk_info
-- ----------------------------
DROP TABLE IF EXISTS `user_risk_info`;
CREATE TABLE `user_risk_info`  (
  `userId` int NOT NULL AUTO_INCREMENT,
  `age` int NULL DEFAULT NULL,
  `sex` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `height` double NULL DEFAULT NULL,
  `weight` double NULL DEFAULT NULL,
  `familyHistory` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `waistline` double NULL DEFAULT NULL,
  `systolicPressure` double NULL DEFAULT NULL,
  `isPregnancy` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `disease` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_risk_info
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '昵称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '个人简介',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态：0正常 1已删除',
  PRIMARY KEY (`user_id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'tester01', '一号用户', '智慧控糖', '$2a$10$AiccUCHuyAvfy92iv.n9wewJfzuiRORv.EzOLc/mPMv3HJU9llv0i', '/img/user_icon.png', 'user', '2026-08-12 15:30:55', 0);
INSERT INTO `users` VALUES (2, 'tester02', '二号测试', NULL, '$2a$10$VD2G4DgXW3bqKRbFxx2NvuPca4dfUaf4sbvT77vX/7rUSK/o0wDrS', '/img/user_icon.png', 'user', '2026-08-12 15:32:02', 0);
INSERT INTO `users` VALUES (3, 'lzy', 'lzy', NULL, '$2a$10$302Doa.yZth4BJczLFTQHOP/vBuki.EuxyM5vD3lmyVWLXwWkTcCG', '/img/user_icon.png', 'admin', '2026-08-12 15:43:07', 0);
INSERT INTO `users` VALUES (4, 'hzp', 'hzp', '', '$2a$10$LwSVkHyUAd7JxV8XcMDw6.B88R2A2U7BAOxhiGP/VzVwfs/0jzwve', '/img/user1.png', 'user', '2026-08-12 16:39:28', 0);
INSERT INTO `users` VALUES (5, 'test', '测试用户', NULL, '$2a$10$hBzPCCjF/Z1AkiNtcoZkAeXL6d4N8NWN0zU/HL40ExczmRpf80yVu', '/img/user_icon.png', 'user', '2026-08-13 11:38:07', 0);
INSERT INTO `users` VALUES (6, 'addUser', 'addUser', NULL, '$2a$10$.iachUCJnoXPENNZHI5pC.5OBdE3ymA1aDfezicQjPGCEuNph3bwi', '/img/user_icon.png', 'user', '2026-08-15 19:25:36', 0);

SET FOREIGN_KEY_CHECKS = 1;
