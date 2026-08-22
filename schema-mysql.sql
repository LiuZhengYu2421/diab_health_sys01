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

 Date: 21/08/2026 20:33:49
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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
  `publish_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `views` int NULL DEFAULT 0,
  PRIMARY KEY (`article_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (1, '糖尿病饮食指南：这5种食物要少吃', 'img/a1.jpg', '张医生', '2026-08-19 08:55:13', '糖尿病患者在饮食上需要特别注意，以下5种食物尽量少吃：1. 含糖饮料；2. 精制白米面；3. 油炸食品；4. 高糖水果；5. 加工肉制品。合理饮食有助于控制血糖。', '饮食', 1024);
INSERT INTO `articles` VALUES (2, '如何正确监测血糖？', 'img/a2.jpg', '李医生', '2026-08-19 08:55:13', '正确监测血糖是糖尿病管理的重要环节。建议选择正规血糖仪，注意采血部位轮换，记录每次测量结果，并在复诊时带上记录，方便医生调整方案。', '日常护理', 856);
INSERT INTO `articles` VALUES (3, '1型糖尿病与2型糖尿病的区别', 'img/a_show.jpg', '王医生', '2026-08-19 08:55:13', '1型糖尿病多发于青少年，胰岛β细胞被破坏，需依赖胰岛素治疗；2型糖尿病多见于中老年，与胰岛素抵抗相关，可通过口服药物和生活方式干预。两者病因和治疗方法都有明显区别。', '科普', 320);
INSERT INTO `articles` VALUES (4, '运动对糖尿病患者的益处', 'img/a3.jpg', '赵医生', '2026-08-19 08:55:13', '规律运动能帮助糖尿病患者控制体重、降低血糖、改善胰岛素敏感性。建议每周至少进行150分钟中等强度有氧运动，如快走、慢跑、游泳等，运动前后注意监测血糖。', '运动', 678);
INSERT INTO `articles` VALUES (5, '妊娠期糖尿病的注意事项', 'img/a1.jpg', '刘医生', '2026-08-19 08:55:13', '妊娠期糖尿病会影响母婴健康，要注意控制饮食总热量，少食多餐，适当运动，并按要进行血糖监测。必要时在医生指导下使用胰岛素治疗，产后也需复查血糖。', '特殊人群', 452);
INSERT INTO `articles` VALUES (6, '糖尿病足部护理小贴士', 'img/a3.jpg', '陈医生', '2026-08-19 08:55:13', '糖尿病患者要每天检查双足是否有破损、水泡或红肿，保持足部清洁干燥，穿宽松舒适的鞋子。如发现异常应及时就医，避免小伤口发展成严重感染。', '日常护理', 235);

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of doctor_information
-- ----------------------------
INSERT INTO `doctor_information` VALUES (1, '张明华', '内分泌科', '主任医师', '2型糖尿病个体化治疗', NULL, NULL);
INSERT INTO `doctor_information` VALUES (2, '李秀芬', '内分泌科', '副主任医师', '糖尿病前期干预、妊娠糖尿病', NULL, NULL);
INSERT INTO `doctor_information` VALUES (3, '王建国', '内分泌科', '主任医师', '1型糖尿病、糖尿病肾病', NULL, NULL);
INSERT INTO `doctor_information` VALUES (4, '陈雅琴', '营养科', '副主任医师', '糖尿病医学营养治疗', NULL, NULL);
INSERT INTO `doctor_information` VALUES (5, '刘志远', '内分泌科', '主治医师', '青少年糖尿病、动态血糖监测', NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

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
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of punch_in
-- ----------------------------
INSERT INTO `punch_in` VALUES (1, 3, '2026-08-16 08:30:00', '血糖监测', '已完成', '空腹血糖 5.6 mmol/L，正常');
INSERT INTO `punch_in` VALUES (2, 3, '2026-08-16 19:00:00', '运动', '已完成', '晚饭后快走 40 分钟');
INSERT INTO `punch_in` VALUES (3, 3, '2026-08-15 12:20:00', '饮食', '已完成', '午餐：杂粮饭 + 清炒时蔬 + 鸡胸肉');
INSERT INTO `punch_in` VALUES (5, 3, '2026-08-05 08:00:00', '血糖监测', '已完成', '空腹血糖 5.8 mmol/L');
INSERT INTO `punch_in` VALUES (6, 3, '2026-07-28 18:30:00', '运动', '已完成', '慢跑 30 分钟');

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
  `diabetesType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '糖尿病类型',
  `updated_at` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`userId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user_risk_info
-- ----------------------------
INSERT INTO `user_risk_info` VALUES (1, 45, '男', 165, 98, '爷爷有糖尿病', 186.09, 135, '否', '1787104563227.result', '无', NULL, NULL);
INSERT INTO `user_risk_info` VALUES (2, 28, '男', 176, 82, '爷爷患有糖尿病', 119.71, 125, '否', '【低风险】您的糖尿病风险评分为22分，低于25分，目前属于低风险人群。建议您保持健康生活方式，定期体检，关注血糖、血压和体重变化。您的腰围较大，建议适当控制体重，增加运动，减少腹部脂肪堆积。', '否', NULL, NULL);
INSERT INTO `user_risk_info` VALUES (3, 28, '男', 150, 98, '否', 83.66, 115, '否', '【低风险】“风险较低，但建议定期体检并保持健康生活方式。”]', '否', NULL, '2026-08-21 19:31:13');
INSERT INTO `user_risk_info` VALUES (4, 50, '男', 182, 58, '否', 85.54, 115, '否', '【低风险】您的糖尿病风险评分为23分，低于25分，属于低风险。建议您继续保持健康生活方式，定期体检，关注血糖、血压等指标，并维持合理饮食和适量运动。', '否', NULL, '2026-08-21 19:37:36');
INSERT INTO `user_risk_info` VALUES (9, 52, '男', 172, 78, '有', 92, 138, '否', NULL, '是', '2型糖尿病', '2026-08-19 16:50:08');

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
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'tester01', '一号用户', '智慧控糖', '$2a$10$AiccUCHuyAvfy92iv.n9wewJfzuiRORv.EzOLc/mPMv3HJU9llv0i', '/img/user_icon.png', 'user', '2026-08-12 15:30:55', 0);
INSERT INTO `users` VALUES (2, 'tester02', '二号测试', NULL, '$2a$10$VD2G4DgXW3bqKRbFxx2NvuPca4dfUaf4sbvT77vX/7rUSK/o0wDrS', '/img/user_icon.png', 'user', '2026-08-12 15:32:02', 0);
INSERT INTO `users` VALUES (3, 'lzy', 'lzy', NULL, '$2a$10$302Doa.yZth4BJczLFTQHOP/vBuki.EuxyM5vD3lmyVWLXwWkTcCG', '/img/user_icon.png', 'admin', '2026-08-12 15:43:07', 0);
INSERT INTO `users` VALUES (4, 'hzp', 'hzp', '', '$2a$10$LwSVkHyUAd7JxV8XcMDw6.B88R2A2U7BAOxhiGP/VzVwfs/0jzwve', '/img/user1.png', 'user', '2026-08-12 16:39:28', 0);
INSERT INTO `users` VALUES (5, 'test', '测试用户', NULL, '$2a$10$hBzPCCjF/Z1AkiNtcoZkAeXL6d4N8NWN0zU/HL40ExczmRpf80yVu', '/img/user_icon.png', 'user', '2026-08-13 11:38:07', 0);
INSERT INTO `users` VALUES (6, 'addUser', 'addUser', NULL, '$2a$10$.iachUCJnoXPENNZHI5pC.5OBdE3ymA1aDfezicQjPGCEuNph3bwi', '/img/user_icon.png', 'user', '2026-08-15 19:25:36', 0);
INSERT INTO `users` VALUES (7, 'mcptest', 'mcptest', NULL, '123456', NULL, 'admin', '2026-08-18 21:43:14', 0);
INSERT INTO `users` VALUES (9, 'apitest6738', 'apitest', NULL, '$2a$10$tGLhUAXs2.FBVfv6zn3GPuG8n3ZOtXugqSI/jxvuhnvLe6Nqk6qgi', '/img/user_icon.png', 'user', '2026-08-19 16:50:08', 0);
INSERT INTO `users` VALUES (10, 'apitest3680', 'apitest', NULL, '$2a$10$0L4Ad6dfEmIB22R.Ok4tIOoPX9ufsQ4JpvWA9slz4W50oIq3Jn2ki', '/img/user_icon.png', 'user', '2026-08-19 16:50:20', 0);
INSERT INTO `users` VALUES (11, 'apitest7482', 'apitest', NULL, '$2a$10$EMLOZjTRVNXAGpc7ElJn6.wmyyuB.YlL6gni8bBDnRd2I3uHXdMGy', '/img/user_icon.png', 'user', '2026-08-19 16:53:25', 0);
INSERT INTO `users` VALUES (12, 'jwq', '麻辣小麻花', NULL, '$2a$10$vCUC2zN6A7OePtxqtiF13uvMPg5ke1M5nz6.yt2Jrd9Ue3Xc.7f8S', '/img/user_icon.png', 'user', '2026-08-19 20:02:01', 0);

SET FOREIGN_KEY_CHECKS = 1;
