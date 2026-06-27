import { Configuration } from '@midwayjs/core';
import * as express from '@midwayjs/web';

@Configuration({
  imports: [express],   // 引入 Express 框架
  // 其他配置，如 global prefix 等
})
export class MainConfiguration {
  // 可以添加生命周期钩子，如 onReady
}