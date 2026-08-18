-- =====================================================
-- 糖尿病健康管理平台 数据库表结构
-- 数据库类型：MySQL 5.7+ / 8.0
-- 生成日期：2026-08-12
-- 说明：Navicat 中直接运行；存储引擎 InnoDB，字符集 utf8mb4
-- =====================================================

-- 创建用户表
-- role 字段：user=普通用户 / doctor=医生 / admin=管理员（注册默认 user）
CREATE TABLE IF NOT EXISTS `users` (
    `user_id`    INT AUTO_INCREMENT PRIMARY KEY,
    `username`   VARCHAR(100) NOT NULL UNIQUE,
    `password`   VARCHAR(255) NOT NULL,
    `avatar_url` VARCHAR(255),
    `role`       VARCHAR(20) NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建医生资讯表
CREATE TABLE IF NOT EXISTS `doctor_information` (
    `info_id`      INT AUTO_INCREMENT PRIMARY KEY,
    `doctor_name`  VARCHAR(100) NOT NULL,
    `department`   VARCHAR(100),
    `title`        VARCHAR(100),
    `introduction` TEXT,
    `image_url`    VARCHAR(255),
    `chat_token`   VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建文章科普表
CREATE TABLE IF NOT EXISTS `articles` (
    `article_id`   INT AUTO_INCREMENT PRIMARY KEY,
    `title`        VARCHAR(255) NOT NULL,
    `cover_url`    VARCHAR(255),
    `author`       VARCHAR(100) NOT NULL,
    `publish_time` DATETIME NOT NULL,
    `content`      LONGTEXT NOT NULL,
    `category`     VARCHAR(100),
    `views`        INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建糖尿病种类表
CREATE TABLE IF NOT EXISTS `diabetes_types` (
    `type_id`       INT AUTO_INCREMENT PRIMARY KEY,
    `type_name`     VARCHAR(100) NOT NULL,
    `img`           VARCHAR(255),
    `pathogenesis`  TEXT,
    `manifestation` TEXT,
    `treatment`     TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建文章收藏表
CREATE TABLE IF NOT EXISTS `article_collections` (
    `collection_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`       INT,
    `article_id`    INT,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`article_id`) REFERENCES `articles`(`article_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建用户风险信息表
CREATE TABLE IF NOT EXISTS `user_risk_info` (
    `userId`           INT AUTO_INCREMENT PRIMARY KEY,
    `age`              INT,
    `sex`              VARCHAR(10),
    `height`           DOUBLE,
    `weight`           DOUBLE,
    `familyHistory`    TEXT,
    `waistline`        DOUBLE,
    `systolicPressure` DOUBLE,
    `isPregnancy`      VARCHAR(10),
    `message`          TEXT,
    `disease`          TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建生活方案表
CREATE TABLE IF NOT EXISTS `life_plans` (
    `id`      INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `type`    VARCHAR(20) CHECK (`type` IN ('饮食', '运动', '其他')) NOT NULL,
    `order`   INT NOT NULL,
    `time`    VARCHAR(100) NOT NULL,
    `title`   VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建生活建议表
CREATE TABLE IF NOT EXISTS `life_advice` (
    `id`      INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title`   VARCHAR(255),
    `tags`    VARCHAR(255),
    `content` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建打卡记录表
CREATE TABLE IF NOT EXISTS `punch_in` (
    `id`                INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`           INT NOT NULL,
    `punch_time`        DATETIME NOT NULL,
    `punch_type`        VARCHAR(50) NOT NULL,
    `completion_status` VARCHAR(50) NOT NULL,
    `message`           VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 以下为【老库升级】语句：仅当 users 表已存在且没有 role 字段时执行
-- =====================================================
-- ALTER TABLE `users` ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user';

-- =====================================================
-- 以下为【初始数据】示例（可选执行）
-- =====================================================

-- 初始管理员账号：admin / admin123（密码请部署后自行修改）
-- INSERT INTO `users` (`username`, `password`, `avatar_url`, `role`)
-- VALUES ('admin', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '/img/user_icon.png', 'admin');

-- 初始医生示例
-- INSERT INTO `doctor_information` (`doctor_name`, `department`, `title`, `introduction`, `image_url`, `chat_token`)
-- VALUES
-- ('李建华', '内分泌科', '主任医师', '从事糖尿病临床诊疗 25 年，擅长 2 型糖尿病综合管理。', '/img/doc1.jpg', ''),
-- ('王芳', '营养科', '副主任医师', '专注糖尿病医学营养治疗（MNT），个性化饮食方案制定。', '/img/doc2.jpg', '');

-- 初始糖尿病种类示例
-- INSERT INTO `diabetes_types` (`type_name`, `img`, `pathogenesis`, `manifestation`, `treatment`)
-- VALUES
-- ('1型糖尿病', '/img/t1.jpg', '胰岛素绝对缺乏，多由自身免疫破坏胰岛 β 细胞所致。', '多饮多尿多食、体重下降，起病急。', '终身胰岛素替代治疗。'),
-- ('2型糖尿病', '/img/t2.jpg', '胰岛素抵抗合并相对分泌不足，与遗传、肥胖、缺乏运动相关。', '起病隐匿，多无明显症状，常体检发现。', '生活方式干预 + 口服药或胰岛素。');
