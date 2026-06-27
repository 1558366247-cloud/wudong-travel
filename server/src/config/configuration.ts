import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as typeorm from '@midwayjs/typeorm';
import * as jwt from '@midwayjs/jwt';
import * as redis from '@midwayjs/redis';
import * as swagger from '@midwayjs/swagger';
import * as validate from '@midwayjs/validate';
import { join } from 'path';

@Configuration({
  imports: [
    koa,
    typeorm,
    jwt,
    redis,
    swagger,
    validate,
  ],
  importConfigs: [join(__dirname, './config.default')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    console.log('🚀 乌东文旅 - 行·线路订票服务已启动');
    console.log('📖 Swagger文档: http://localhost:7001/swagger-ui/index.html');
  }
}
