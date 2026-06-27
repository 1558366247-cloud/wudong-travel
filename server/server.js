/**
 * 乌东文旅 - 行·线路订票  Express后端
 * 启动: npm install express mysql2 cors uuid && node server.js
 */
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuid } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ===== 数据库配置 =====
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'a1173801',
  database: process.env.DB_NAME || 'wudong_travel',
  waitForConnections: true,
  connectionLimit: 10,
});

// 初始化数据库表
async function initDB() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS t_scenic_spot (
      scenic_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      address VARCHAR(255),
      longitude VARCHAR(100), latitude VARCHAR(100),
      open_time VARCHAR(100) DEFAULT '08:00-18:00',
      description TEXT,
      main_image VARCHAR(500),
      images JSON,
      status TINYINT DEFAULT 1,
      sort_order INT DEFAULT 0,
      merchant_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_ticket_type (
      ticket_type_id INT AUTO_INCREMENT PRIMARY KEY,
      scenic_id INT NOT NULL,
      name VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      market_price DECIMAL(10,2),
      stock INT DEFAULT 999,
      daily_stock INT DEFAULT 500,
      validity_days INT DEFAULT 30,
      usage_note VARCHAR(500),
      image VARCHAR(500),
      status TINYINT DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_route_package (
      route_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      subtitle VARCHAR(200),
      duration VARCHAR(20) NOT NULL,
      themes VARCHAR(200),
      price DECIMAL(10,2) NOT NULL,
      market_price DECIMAL(10,2),
      included_items TEXT,
      departure VARCHAR(100),
      destination VARCHAR(100),
      accommodation_standard VARCHAR(200),
      meal_standard VARCHAR(200),
      notes TEXT,
      main_image VARCHAR(500),
      images JSON,
      details TEXT,
      stock INT DEFAULT 30,
      sold_count INT DEFAULT 0,
      rating FLOAT DEFAULT 5.0,
      review_count INT DEFAULT 0,
      status TINYINT DEFAULT 1,
      sort_order INT DEFAULT 0,
      merchant_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_route_itinerary (
      itinerary_id INT AUTO_INCREMENT PRIMARY KEY,
      route_id INT NOT NULL,
      day INT,
      description VARCHAR(500),
      spots VARCHAR(500),
      meals VARCHAR(200),
      accommodation VARCHAR(200),
      transportation VARCHAR(300),
      image VARCHAR(500),
      sort_order INT DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS t_travel_order (
      order_no VARCHAR(32) PRIMARY KEY,
      user_id INT,
      order_type VARCHAR(10),
      target_id INT,
      target_name VARCHAR(200),
      target_image VARCHAR(500),
      ticket_type_id INT,
      ticket_type_name VARCHAR(50),
      unit_price DECIMAL(10,2),
      quantity INT,
      total_amount DECIMAL(10,2),
      use_date DATE,
      visitors JSON,
      contact_phone VARCHAR(20),
      order_status VARCHAR(20) DEFAULT 'pending_pay',
      paid_at TIMESTAMP NULL,
      transaction_id VARCHAR(64),
      refund_reason VARCHAR(500),
      refunded_at TIMESTAMP NULL,
      verified TINYINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_e_ticket (
      e_ticket_id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(32),
      ticket_type_id INT,
      route_id INT,
      user_id INT,
      qr_code VARCHAR(100),
      use_date DATE,
      expire_date DATE,
      visitor_name VARCHAR(50),
      visitor_id_card VARCHAR(20),
      visitor_phone VARCHAR(20),
      status VARCHAR(20) DEFAULT 'unused',
      verified_at TIMESTAMP NULL,
      verified_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_transport_guide (
      guide_id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200),
      departure VARCHAR(100),
      destination VARCHAR(100),
      transport_type VARCHAR(50),
      duration VARCHAR(50),
      estimated_cost DECIMAL(10,2),
      description TEXT,
      cover_image VARCHAR(500),
      images JSON,
      view_count INT DEFAULT 0,
      fav_count INT DEFAULT 0,
      status TINYINT DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_review (
      review_id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(32),
      user_id INT,
      user_name VARCHAR(50),
      user_avatar VARCHAR(200),
      scenic_id INT,
      route_id INT,
      rating TINYINT,
      content TEXT,
      images JSON,
      reply TEXT,
      reply_at TIMESTAMP NULL,
      status TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS t_favorite (
      fav_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      target_type VARCHAR(20),
      target_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_target (user_id, target_type, target_id)
    )`,
  ];

  const conn = await pool.getConnection();
  try {
    for (const sql of tables) {
      await conn.query(sql);
    }
    console.log('[DB] All tables ready');
  } finally {
    conn.release();
  }
}

// 插入种子数据
async function seedData() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT COUNT(*) as cnt FROM t_scenic_spot');
    if (rows[0].cnt > 0) return; // Already seeded

    await conn.query(`INSERT INTO t_scenic_spot (name,address,open_time,description,sort_order) VALUES
      ('乌东苗寨','贵州省黔东南苗族侗族自治州雷山县乌东村','08:00-18:00','乌东苗寨是中国传统村落，保存完好的苗族木结构建筑群，依山而建，梯田环绕。',1),
      ('雷公山国家森林公园','贵州省黔东南州雷山县','07:30-17:30','雷公山为苗岭主峰，海拔2178.8米，森林覆盖率88%。',2),
      ('西江千户苗寨','贵州省黔东南州雷山县西江镇','08:00-20:00','世界上最大的苗族聚居村寨，万家灯火被誉为苗寨夜景天花板。',3),
      ('郎德上寨','贵州省黔东南州雷山县郎德镇','08:30-17:30','国家重点文物保护单位，中国民间艺术之乡。',4)`);

    await conn.query(`INSERT INTO t_ticket_type (scenic_id,name,price,market_price,stock,daily_stock,validity_days,usage_note,sort_order) VALUES
      (1,'成人票',60,80,500,200,30,'1.2米以上成人适用',1),
      (1,'儿童票',30,40,300,100,30,'1.2米以下儿童适用',2),
      (1,'学生票',40,60,300,100,30,'全日制在校学生',3),
      (1,'家庭套票(2大1小)',130,180,100,50,30,'2名成人+1名儿童',4),
      (2,'成人票',80,100,400,150,30,NULL,1),
      (2,'学生票',50,70,200,80,30,NULL,2),
      (3,'成人票',90,110,600,250,30,NULL,1),
      (3,'学生票',60,80,300,100,30,NULL,2),
      (4,'成人票',50,70,300,100,30,NULL,1)`);

    await conn.query(`INSERT INTO t_route_package (title,subtitle,duration,themes,price,market_price,included_items,departure,destination,stock,rating,review_count,main_image,details,sort_order) VALUES
      ('乌东苗寨·非遗文化一日游','深度体验苗族银饰锻造与蜡染技艺','一日游','亲子,研学',198,268,'["往返交通","景区门票","苗家长桌宴","银饰锻造体验","蜡染体验","导游服务","旅游保险"]','凯里','乌东苗寨',30,4.8,126,'route1','<p>早晨8:00从凯里出发，前往乌东苗寨。上午参观苗寨传统建筑群。中午体验苗家长桌宴。下午参与银饰锻造与蜡染体验课程。</p>',1),
      ('雷公山·自然探索两日游','登苗岭主峰，赏云海日出','两日游','摄影,研学',498,628,'["往返交通","民宿住宿","三正一早","门票","导游","保险"]','凯里','雷公山',20,4.6,89,'route2','<p>D1: 凯里出发→雷公山→响水岩瀑布→森林徒步→山顶民宿。D2: 日出云海→高山草甸→返回。</p>',2),
      ('西江千户苗寨·夜景摄影两日游','万家灯火，苗寨夜景天花板','两日游','摄影,亲子',598,728,'["往返交通","观景客栈","两正一早","门票","苗服旅拍","导游","保险"]','凯里','西江千户苗寨',25,4.9,203,'route3','<p>D1: 凯里出发→西江苗寨→苗族博物馆→观景台→苗服旅拍→夜景。D2: 晨雾苗寨→苗寨集市→返回。</p>',3),
      ('黔东南苗寨深度研学三日游','走访三大苗寨，全景式苗族文化研学','多日游','研学,摄影',1280,1580,'["全程交通","两晚民宿","五正两早","三大苗寨门票","非遗体验","苗药识别","导游","保险"]','凯里','乌东苗寨',15,4.7,67,'route4','<p>D1: 凯里→乌东苗寨→银饰体验→长桌宴。D2: 郎德上寨→蜡染刺绣→苗歌苗舞→宿西江。D3: 西江晨雾→雷公山→返回。</p>',4)`);

    await conn.query(`INSERT INTO t_transport_guide (title,departure,destination,transport_type,duration,estimated_cost,description,sort_order) VALUES
      ('贵阳→凯里→乌东苗寨 交通攻略','贵阳','乌东苗寨','高铁+大巴','约3小时',150,'从贵阳北站乘坐高铁至凯里南站(约40分钟)，出站后换乘旅游大巴(约1.5小时)或包车直达乌东苗寨。',1),
      ('凯里→乌东苗寨 自驾攻略','凯里','乌东苗寨','自驾','约1.5小时',80,'从凯里市区出发，沿G60沪昆高速→雷山出口→S308省道→乌东村。全程约80公里。',2),
      ('广州→凯里→乌东 高铁攻略','广州','乌东苗寨','高铁','约5.5小时',380,'广州南站乘坐高铁直达凯里南站(约4.5小时)，出站后转乘旅游大巴前往乌东苗寨。',3)`);

    console.log('[DB] Seed data inserted');
  } finally {
    conn.release();
  }
}

// ===== API路由 =====

// 景区列表
app.get('/api/scenic/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, sortBy } = req.query;
    const offset = (page - 1) * pageSize;
    let where = 'WHERE s.status = 1';
    const params = [];
    if (keyword) { where += ' AND (s.name LIKE ? OR s.address LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }

    const [list] = await pool.query(
      `SELECT s.*, (SELECT MIN(t.price) FROM t_ticket_type t WHERE t.scenic_id = s.scenic_id AND t.status = 1) as min_price
       FROM t_scenic_spot s ${where}
       ORDER BY s.sort_order ASC, s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_scenic_spot s ${where}`, params);

    res.json({ list: list.map(s => ({ ...s, minPrice: parseFloat(s.min_price || 0) })), total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 景区详情
app.get('/api/scenic/detail/:id', async (req, res) => {
  try {
    const [[scenic]] = await pool.query('SELECT * FROM t_scenic_spot WHERE scenic_id = ? AND status = 1', [req.params.id]);
    if (!scenic) return res.status(404).json({ message: '景区不存在' });
    const [tickets] = await pool.query('SELECT * FROM t_ticket_type WHERE scenic_id = ? AND status = 1 ORDER BY sort_order', [req.params.id]);
    res.json({ ...scenic, tickets });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 票种
app.get('/api/ticket-type/list', async (req, res) => {
  try {
    const { scenicId, page = 1, pageSize = 20 } = req.query;
    let where = 'WHERE status = 1';
    const params = [];
    if (scenicId) { where += ' AND scenic_id = ?'; params.push(scenicId); }
    const offset = (page - 1) * pageSize;
    const [list] = await pool.query(`SELECT * FROM t_ticket_type ${where} ORDER BY sort_order LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_ticket_type ${where}`, params);
    res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/ticket-type/detail/:id', async (req, res) => {
  try {
    const [[ticket]] = await pool.query('SELECT * FROM t_ticket_type WHERE ticket_type_id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ message: '票种不存在' });
    const [[scenic]] = await pool.query('SELECT * FROM t_scenic_spot WHERE scenic_id = ?', [ticket.scenic_id]);
    res.json({ ...ticket, scenicSpot: scenic });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 路线列表
app.get('/api/route/list', async (req, res) => {
  try {
    const { duration, theme, keyword, page = 1, pageSize = 10, sortBy } = req.query;
    let where = 'WHERE status = 1';
    const params = [];
    if (duration) { where += ' AND duration = ?'; params.push(duration); }
    if (theme) { where += ' AND themes LIKE ?'; params.push(`%${theme}%`); }
    if (keyword) { where += ' AND (title LIKE ? OR destination LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
    const offset = (page - 1) * pageSize;
    let orderBy = 'ORDER BY sort_order ASC, sold_count DESC';
    if (sortBy === 'price_asc') orderBy = 'ORDER BY price ASC';
    else if (sortBy === 'price_desc') orderBy = 'ORDER BY price DESC';
    else if (sortBy === 'rating') orderBy = 'ORDER BY rating DESC';
    const [list] = await pool.query(`SELECT * FROM t_route_package ${where} ${orderBy} LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_route_package ${where}`, params);
    res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 路线详情
app.get('/api/route/detail/:id', async (req, res) => {
  try {
    const [[route]] = await pool.query('SELECT * FROM t_route_package WHERE route_id = ? AND status = 1', [req.params.id]);
    if (!route) return res.status(404).json({ message: '路线不存在' });
    const [itineraries] = await pool.query('SELECT * FROM t_route_itinerary WHERE route_id = ? ORDER BY day, sort_order', [req.params.id]);
    res.json({ ...route, itineraries });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 攻略
app.get('/api/guide/list', async (req, res) => {
  try {
    const { departure, page = 1, pageSize = 10 } = req.query;
    let where = 'WHERE status = 1';
    const params = [];
    if (departure) { where += ' AND departure = ?'; params.push(departure); }
    const offset = (page - 1) * pageSize;
    const [list] = await pool.query(`SELECT * FROM t_transport_guide ${where} ORDER BY sort_order LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_transport_guide ${where}`, params);
    res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/guide/departures', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT departure FROM t_transport_guide WHERE status = 1');
    res.json(rows.map(r => r.departure));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/guide/detail/:id', async (req, res) => {
  try {
    const [[guide]] = await pool.query('SELECT * FROM t_transport_guide WHERE guide_id = ?', [req.params.id]);
    if (!guide) return res.status(404).json({ message: '攻略不存在' });
    await pool.query('UPDATE t_transport_guide SET view_count = view_count + 1 WHERE guide_id = ?', [req.params.id]);
    res.json(guide);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 创建门票订单
app.post('/api/order/ticket/create', async (req, res) => {
  try {
    const { ticketTypeId, quantity, useDate, visitors, contactPhone } = req.body;
    const [[ticket]] = await pool.query('SELECT t.*, s.name as scenic_name, s.main_image FROM t_ticket_type t JOIN t_scenic_spot s ON t.scenic_id = s.scenic_id WHERE t.ticket_type_id = ? AND t.status = 1', [ticketTypeId]);
    if (!ticket) return res.status(400).json({ message: '票种不存在或已下架' });

    const totalAmount = ticket.price * quantity;
    const orderNo = 'WD' + new Date().toISOString().slice(0,10).replace(/-/g,'') + uuid().slice(0,8).toUpperCase();

    await pool.query(
      `INSERT INTO t_travel_order (order_no, user_id, order_type, target_id, target_name, target_image, ticket_type_id, ticket_type_name, unit_price, quantity, total_amount, use_date, visitors, contact_phone, order_status)
       VALUES (?, 1, 'ticket', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_pay')`,
      [orderNo, ticket.scenic_id, ticket.scenic_name, ticket.main_image || '', ticketTypeId, ticket.name, ticket.price, quantity, totalAmount, useDate, visitors, contactPhone]
    );
    res.json({ orderNo, totalAmount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 创建路线订单
app.post('/api/order/route/create', async (req, res) => {
  try {
    const { routeId, quantity, useDate, visitors, contactPhone } = req.body;
    // R9-03: 提前1天
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    if (new Date(useDate) <= tomorrow) return res.status(400).json({ message: '路线套餐须提前1天购买（R9-03）' });

    const [[route]] = await pool.query('SELECT * FROM t_route_package WHERE route_id = ? AND status = 1', [routeId]);
    if (!route) return res.status(400).json({ message: '路线不存在或已下架' });

    const totalAmount = route.price * quantity;
    const orderNo = 'WD' + new Date().toISOString().slice(0,10).replace(/-/g,'') + uuid().slice(0,8).toUpperCase();

    await pool.query(
      `INSERT INTO t_travel_order (order_no, user_id, order_type, target_id, target_name, target_image, unit_price, quantity, total_amount, use_date, visitors, contact_phone, order_status)
       VALUES (?, 1, 'route', ?, ?, ?, ?, ?, ?, ?, ?, 'pending_pay')`,
      [orderNo, routeId, route.title, route.main_image || '', route.price, quantity, totalAmount, useDate, visitors, contactPhone]
    );
    res.json({ orderNo, totalAmount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 订单列表
app.get('/api/order/list', async (req, res) => {
  try {
    const { orderType, orderStatus, page = 1, pageSize = 10 } = req.query;
    let where = 'WHERE user_id = 1';
    const params = [];
    if (orderType) { where += ' AND order_type = ?'; params.push(orderType); }
    if (orderStatus) { where += ' AND order_status = ?'; params.push(orderStatus); }
    const offset = (page - 1) * pageSize;
    const [list] = await pool.query(`SELECT * FROM t_travel_order ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_travel_order ${where}`, params);
    res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 订单详情
app.get('/api/order/detail/:orderNo', async (req, res) => {
  try {
    const [[order]] = await pool.query('SELECT * FROM t_travel_order WHERE order_no = ?', [req.params.orderNo]);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    const [eTickets] = await pool.query('SELECT * FROM t_e_ticket WHERE order_no = ?', [req.params.orderNo]);
    res.json({ ...order, eTickets });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 支付回调
app.post('/api/order/pay-callback', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { orderNo, transactionId } = req.body;
    const [[order]] = await conn.query('SELECT * FROM t_travel_order WHERE order_no = ?', [orderNo]);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    if (order.order_status !== 'pending_pay') return res.status(400).json({ message: '订单状态异常' });

    // 扣库存
    if (order.order_type === 'ticket') {
      await conn.query('UPDATE t_ticket_type SET stock = stock - ? WHERE ticket_type_id = ? AND stock >= ?', [order.quantity, order.ticket_type_id, order.quantity]);
    } else {
      await conn.query('UPDATE t_route_package SET stock = stock - ?, sold_count = sold_count + ? WHERE route_id = ? AND stock >= ?', [order.quantity, order.quantity, order.target_id, order.quantity]);
    }

    await conn.query('UPDATE t_travel_order SET order_status = ?, paid_at = NOW(), transaction_id = ? WHERE order_no = ?', ['paid', transactionId, orderNo]);

    // 生成电子票
    const visitors = JSON.parse(order.visitors || '[]');
    const expireDays = order.order_type === 'ticket' ? 30 : 30;
    const expireDate = new Date(order.use_date);
    expireDate.setDate(expireDate.getDate() + expireDays);

    for (const v of visitors) {
      const qrCode = 'TK' + uuid().toUpperCase().replace(/-/g,'').slice(0,12);
      await conn.query(
        `INSERT INTO t_e_ticket (order_no, ticket_type_id, route_id, user_id, qr_code, use_date, expire_date, visitor_name, visitor_id_card, visitor_phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unused')`,
        [orderNo, order.ticket_type_id, order.order_type === 'route' ? order.target_id : null, order.user_id, qrCode, order.use_date, expireDate.toISOString().slice(0,10), v.name, v.idCard || '', v.phone || '']
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
});

// 取消订单
app.put('/api/order/cancel/:orderNo', async (req, res) => {
  try {
    await pool.query("UPDATE t_travel_order SET order_status = 'cancelled' WHERE order_no = ? AND order_status = 'pending_pay'", [req.params.orderNo]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 退款
app.post('/api/order/refund', async (req, res) => {
  try {
    const { orderNo, reason } = req.body;
    const [[order]] = await pool.query('SELECT * FROM t_travel_order WHERE order_no = ?', [orderNo]);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    // R9-03
    if (order.order_type === 'route') {
      const useDate = new Date(order.use_date);
      if ((useDate - new Date()) / (1000*60*60*24) < 3) {
        return res.status(400).json({ message: '出发前3天内不可退款（R9-03）' });
      }
    }
    await pool.query("UPDATE t_travel_order SET order_status = 'refunding', refund_reason = ? WHERE order_no = ?", [reason, orderNo]);
    await pool.query("UPDATE t_e_ticket SET status = 'refunded' WHERE order_no = ? AND status = 'unused'", [orderNo]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 核销电子票
app.post('/api/order/verify', async (req, res) => {
  try {
    const { qrCode } = req.body;
    const [[ticket]] = await pool.query('SELECT * FROM t_e_ticket WHERE qr_code = ?', [qrCode]);
    if (!ticket) return res.status(400).json({ message: '电子票不存在' });
    if (ticket.status === 'used') return res.status(400).json({ message: '电子票已使用（R9-02）' });
    if (ticket.status === 'refunded') return res.status(400).json({ message: '电子票已退款' });
    if (new Date() > new Date(ticket.expire_date)) {
      await pool.query("UPDATE t_e_ticket SET status = 'expired' WHERE e_ticket_id = ?", [ticket.e_ticket_id]);
      return res.status(400).json({ message: '电子票已过期' });
    }
    await pool.query("UPDATE t_e_ticket SET status = 'used', verified_at = NOW(), verified_by = 1 WHERE e_ticket_id = ?", [ticket.e_ticket_id]);
    res.json({ success: true, visitorName: ticket.visitor_name });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 电子票
app.get('/api/e-ticket/list', async (req, res) => {
  const [list] = await pool.query('SELECT * FROM t_e_ticket ORDER BY created_at DESC');
  res.json(list);
});

app.get('/api/e-ticket/detail/:id', async (req, res) => {
  const [[ticket]] = await pool.query('SELECT * FROM t_e_ticket WHERE e_ticket_id = ?', [req.params.id]);
  if (!ticket) return res.status(404).json({ message: '电子票不存在' });
  res.json(ticket);
});

// 评价
app.get('/api/review/list', async (req, res) => {
  const { scenicId, routeId, page = 1, pageSize = 10 } = req.query;
  let where = 'WHERE status = 1';
  const params = [];
  if (scenicId) { where += ' AND scenic_id = ?'; params.push(scenicId); }
  if (routeId) { where += ' AND route_id = ?'; params.push(routeId); }
  const offset = (page - 1) * pageSize;
  const [list] = await pool.query(`SELECT * FROM t_review ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
  const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_review ${where}`, params);
  res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
});

app.post('/api/review/create', async (req, res) => {
  try {
    const { orderNo, scenicId, routeId, rating, content, images } = req.body;
    const [result] = await pool.query(
      'INSERT INTO t_review (order_no, user_id, user_name, scenic_id, route_id, rating, content, images) VALUES (?, 1, ?, ?, ?, ?, ?, ?)',
      [orderNo, '游客', scenicId || null, routeId || null, rating, content, JSON.stringify(images || [])]
    );
    res.json({ success: true, reviewId: result.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 收藏
app.post('/api/favorite/toggle', async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const [existing] = await pool.query('SELECT * FROM t_favorite WHERE user_id = 1 AND target_type = ? AND target_id = ?', [targetType, targetId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM t_favorite WHERE fav_id = ?', [existing[0].fav_id]);
      res.json({ favorited: false });
    } else {
      await pool.query('INSERT INTO t_favorite (user_id, target_type, target_id) VALUES (1, ?, ?)', [targetType, targetId]);
      res.json({ favorited: true });
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/favorite/list', async (req, res) => {
  const { targetType } = req.query;
  let where = 'WHERE user_id = 1';
  const params = [];
  if (targetType) { where += ' AND target_type = ?'; params.push(targetType); }
  const [list] = await pool.query(`SELECT * FROM t_favorite ${where} ORDER BY created_at DESC`, params);
  res.json({ list, total: list.length, page: 1 });
});

app.get('/api/favorite/check', async (req, res) => {
  const { targetType, targetId } = req.query;
  const [rows] = await pool.query('SELECT * FROM t_favorite WHERE user_id = 1 AND target_type = ? AND target_id = ?', [targetType, targetId]);
  res.json({ favorited: rows.length > 0 });
});

// 数据统计
app.get('/api/statistics/dashboard', async (req, res) => {
  try {
    const [[orders]] = await pool.query("SELECT COUNT(*) as cnt, COALESCE(SUM(CASE WHEN order_status IN ('paid','completed') THEN total_amount ELSE 0 END),0) as revenue FROM t_travel_order WHERE DATE(created_at) = CURDATE()");
    const [[pending]] = await pool.query("SELECT COUNT(*) as cnt FROM t_travel_order WHERE order_status = 'refunding'");
    const [[scenics]] = await pool.query('SELECT COUNT(*) as cnt FROM t_scenic_spot WHERE status = 1');
    const [[routes]] = await pool.query('SELECT COUNT(*) as cnt FROM t_route_package WHERE status = 1');
    const [[gmv]] = await pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM t_travel_order WHERE order_status IN ('paid','completed') AND created_at >= DATE_FORMAT(CURDATE(),'%Y-%m-01')");

    const [topScenics] = await pool.query("SELECT target_name as name, COUNT(*) as count FROM t_travel_order WHERE order_type='ticket' AND order_status IN ('paid','completed') GROUP BY target_name ORDER BY count DESC LIMIT 5");
    const [topRoutes] = await pool.query("SELECT target_name as name, COUNT(*) as count FROM t_travel_order WHERE order_type='route' AND order_status IN ('paid','completed') GROUP BY target_name ORDER BY count DESC LIMIT 5");

    res.json({
      todayOrders: orders.cnt, todayRevenue: parseFloat(orders.revenue),
      pendingRefunds: pending.cnt, scenicCount: scenics.cnt, routeCount: routes.cnt,
      monthlyGmv: parseFloat(gmv.total), topScenics, topRoutes
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ===== 管理后台接口 =====

// 所有订单（管理后台，无用户过滤）
app.get('/api/order/admin/list', async (req, res) => {
  try {
    const { orderType, orderStatus, page = 1, pageSize = 10 } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (orderType) { where += ' AND order_type = ?'; params.push(orderType); }
    if (orderStatus) { where += ' AND order_status = ?'; params.push(orderStatus); }
    const offset = (page - 1) * pageSize;
    const [list] = await pool.query(`SELECT * FROM t_travel_order ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, parseInt(pageSize), offset]);
    const [[{total}]] = await pool.query(`SELECT COUNT(*) as total FROM t_travel_order ${where}`, params);
    res.json({ list, total, page: parseInt(page), pageSize: parseInt(pageSize) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 退款审核
app.put('/api/order/admin/refund-audit', async (req, res) => {
  try {
    const { orderNo, approved } = req.body;
    if (approved) {
      await pool.query("UPDATE t_travel_order SET order_status = 'refunded', refunded_at = NOW() WHERE order_no = ?", [orderNo]);
    } else {
      await pool.query("UPDATE t_travel_order SET order_status = 'paid' WHERE order_no = ?", [orderNo]);
      await pool.query("UPDATE t_e_ticket SET status = 'unused' WHERE order_no = ? AND status = 'refunded'", [orderNo]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 景区管理 CRUD
app.post('/api/scenic/create', async (req, res) => {
  try {
    const { name, address, openTime, description, mainImage, longitude, latitude, sortOrder } = req.body;
    await pool.query('INSERT INTO t_scenic_spot (name,address,open_time,description,main_image,longitude,latitude,sort_order) VALUES (?,?,?,?,?,?,?,?)',
      [name, address, openTime, description, mainImage, longitude, latitude, sortOrder || 0]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/scenic/update', async (req, res) => {
  try {
    const { scenicId, name, address, openTime, description, mainImage, longitude, latitude, sortOrder, status } = req.body;
    await pool.query('UPDATE t_scenic_spot SET name=?, address=?, open_time=?, description=?, main_image=?, longitude=?, latitude=?, sort_order=?, status=? WHERE scenic_id=?',
      [name, address, openTime, description, mainImage, longitude, latitude, sortOrder || 0, status !== undefined ? status : 1, scenicId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/scenic/status/:id', async (req, res) => {
  await pool.query('UPDATE t_scenic_spot SET status = ? WHERE scenic_id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/scenic/delete/:id', async (req, res) => {
  await pool.query('DELETE FROM t_scenic_spot WHERE scenic_id = ?', [req.params.id]);
  res.json({ success: true });
});

// 票种管理 CRUD
app.post('/api/ticket-type/create', async (req, res) => {
  try {
    const { scenicId, name, price, marketPrice, stock, dailyStock, validityDays, usageNote, image, sortOrder } = req.body;
    await pool.query('INSERT INTO t_ticket_type (scenic_id,name,price,market_price,stock,daily_stock,validity_days,usage_note,image,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [scenicId, name, price, marketPrice, stock || 999, dailyStock || 500, validityDays || 30, usageNote, image, sortOrder || 0]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/ticket-type/update', async (req, res) => {
  try {
    const { ticketTypeId, scenicId, name, price, marketPrice, stock, dailyStock, validityDays, usageNote, image, sortOrder, status } = req.body;
    await pool.query('UPDATE t_ticket_type SET scenic_id=?, name=?, price=?, market_price=?, stock=?, daily_stock=?, validity_days=?, usage_note=?, image=?, sort_order=?, status=? WHERE ticket_type_id=?',
      [scenicId, name, price, marketPrice, stock, dailyStock, validityDays, usageNote, image, sortOrder || 0, status !== undefined ? status : 1, ticketTypeId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/ticket-type/status/:id', async (req, res) => {
  await pool.query('UPDATE t_ticket_type SET status = ? WHERE ticket_type_id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/ticket-type/delete/:id', async (req, res) => {
  await pool.query('DELETE FROM t_ticket_type WHERE ticket_type_id = ?', [req.params.id]);
  res.json({ success: true });
});

// 路线管理 CRUD
app.post('/api/route/create', async (req, res) => {
  try {
    const { title, subtitle, duration, themes, price, marketPrice, departure, destination, accommodationStandard, mealStandard, notes, mainImage, details, stock, sortOrder } = req.body;
    const [r] = await pool.query(
      'INSERT INTO t_route_package (title,subtitle,duration,themes,price,market_price,departure,destination,accommodation_standard,meal_standard,notes,main_image,details,stock,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [title, subtitle, duration, themes, price, marketPrice, departure, destination, accommodationStandard, mealStandard, notes, mainImage, details, stock || 30, sortOrder || 0]);
    res.json({ success: true, routeId: r.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/route/update', async (req, res) => {
  try {
    const { routeId, title, subtitle, duration, themes, price, marketPrice, departure, destination, accommodationStandard, mealStandard, notes, mainImage, details, stock, sortOrder, status } = req.body;
    await pool.query(
      'UPDATE t_route_package SET title=?,subtitle=?,duration=?,themes=?,price=?,market_price=?,departure=?,destination=?,accommodation_standard=?,meal_standard=?,notes=?,main_image=?,details=?,stock=?,sort_order=?,status=? WHERE route_id=?',
      [title, subtitle, duration, themes, price, marketPrice, departure, destination, accommodationStandard, mealStandard, notes, mainImage, details, stock, sortOrder || 0, status !== undefined ? status : 1, routeId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/route/status/:id', async (req, res) => {
  await pool.query('UPDATE t_route_package SET status = ? WHERE route_id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/route/delete/:id', async (req, res) => {
  await pool.query('DELETE FROM t_route_itinerary WHERE route_id = ?', [req.params.id]);
  await pool.query('DELETE FROM t_route_package WHERE route_id = ?', [req.params.id]);
  res.json({ success: true });
});

// 路线行程管理
app.get('/api/route/itineraries/:id', async (req, res) => {
  const [list] = await pool.query('SELECT * FROM t_route_itinerary WHERE route_id = ? ORDER BY day, sort_order', [req.params.id]);
  res.json(list);
});

app.post('/api/route/itineraries/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM t_route_itinerary WHERE route_id = ?', [req.params.id]);
    for (const item of req.body) {
      await pool.query('INSERT INTO t_route_itinerary (route_id,day,description,spots,meals,accommodation,transportation) VALUES (?,?,?,?,?,?,?)',
        [req.params.id, item.day, item.description, item.spots, item.meals, item.accommodation, item.transportation]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// 交通攻略管理 CRUD
app.post('/api/guide/create', async (req, res) => {
  try {
    const { title, departure, destination, transportType, duration, estimatedCost, description, coverImage, sortOrder } = req.body;
    await pool.query('INSERT INTO t_transport_guide (title,departure,destination,transport_type,duration,estimated_cost,description,cover_image,sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
      [title, departure, destination, transportType, duration, estimatedCost, description, coverImage, sortOrder || 0]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/guide/update', async (req, res) => {
  try {
    const { guideId, title, departure, destination, transportType, duration, estimatedCost, description, coverImage, sortOrder, status } = req.body;
    await pool.query('UPDATE t_transport_guide SET title=?,departure=?,destination=?,transport_type=?,duration=?,estimated_cost=?,description=?,cover_image=?,sort_order=?,status=? WHERE guide_id=?',
      [title, departure, destination, transportType, duration, estimatedCost, description, coverImage, sortOrder || 0, status !== undefined ? status : 1, guideId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/guide/status/:id', async (req, res) => {
  await pool.query('UPDATE t_transport_guide SET status = ? WHERE guide_id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

app.delete('/api/guide/delete/:id', async (req, res) => {
  await pool.query('DELETE FROM t_transport_guide WHERE guide_id = ?', [req.params.id]);
  res.json({ success: true });
});

// 评价管理
app.put('/api/review/reply', async (req, res) => {
  try {
    const { reviewId, reply } = req.body;
    await pool.query('UPDATE t_review SET reply = ?, reply_at = NOW() WHERE review_id = ?', [reply, reviewId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/review/status/:id', async (req, res) => {
  await pool.query('UPDATE t_review SET status = ? WHERE review_id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

// ===== 启动 =====
const PORT = process.env.PORT || 7001;

(async () => {
  try {
    await initDB();
    await seedData();
    app.listen(PORT, () => {
      console.log('='.repeat(55));
      console.log('  [WuDong Travel] Express Server Running');
      console.log(`  URL:      http://localhost:${PORT}`);
      console.log(`  Database: MySQL (wudong_travel)`);
      console.log(`  APIs:     /api/scenic/list, /api/route/list, etc.`);
      console.log('='.repeat(55));
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
})();
