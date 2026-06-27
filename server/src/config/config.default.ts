import { MidwayConfig } from '@midwayjs/core';

export default {
  // 应用端口
  koa: {
    port: 7001,
  },

  // 数据库配置
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'a1173801',
        database: process.env.DB_NAME || 'wudong_travel',
        synchronize: true, // 开发环境自动同步表结构
        logging: false,
        entities: ['**/entity/*.entity{.ts,.js}'],
        timezone: '+08:00',
      },
    },
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'wudong-travel-jwt-secret-key',
    expiresIn: '7d',
  },

  // Redis 配置
  redis: {
    client: {
      port: parseInt(process.env.REDIS_PORT || '6379'),
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD || '',
      db: 0,
    },
  },

  // Swagger 文档
  swagger: {
    title: '乌东文旅 - 行·线路订票 API',
    description: '景区门票、路线套餐、电子票、交通攻略接口文档',
    version: '1.0.0',
    termsOfService: '',
    contact: {
      name: '第4组 - 行·线路订票',
    },
  },

  // CORS 跨域
  cors: {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  },
} as MidwayConfig;
