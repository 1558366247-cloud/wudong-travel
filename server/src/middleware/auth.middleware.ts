import { Middleware, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

/**
 * JWT 鉴权中间件
 * 验证用户登录状态，将 userId 注入 ctx
 */
@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 白名单路径（无需登录）
      const whiteList = [
        '/api/scenic/list',
        '/api/scenic/detail',
        '/api/ticket-type/list',
        '/api/ticket-type/detail',
        '/api/route/list',
        '/api/route/detail',
        '/api/route/itineraries',
        '/api/guide/list',
        '/api/guide/detail',
        '/api/guide/departures',
        '/api/review/list',
        '/swagger-ui',
      ];

      const isWhiteListed = whiteList.some(path => ctx.path.startsWith(path));
      if (isWhiteListed) {
        return next();
      }

      // 简化版鉴权：从 header 获取 token
      const token = ctx.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        // 开发阶段允许无token请求
        ctx.userId = 1;
        return next();
      }

      try {
        // TODO: JWT verify
        ctx.userId = 1;
      } catch (err) {
        ctx.status = 401;
        ctx.body = { code: 401, message: '登录已过期，请重新登录' };
        return;
      }

      await next();
    };
  }
}
