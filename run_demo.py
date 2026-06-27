# -*- coding: utf-8 -*-
"""
乌东文旅 - 行·线路订票  Python演示服务器
无需安装Node.js/MySQL，直接用Python运行
启动: python run_demo.py
访问: http://localhost:7001
"""
import json
import uuid
import http.server
import urllib.parse
from datetime import datetime, timedelta, date

# ===== 模拟数据 =====
SCENICS = [
    {"scenicId":1,"name":"乌东苗寨","address":"贵州省黔东南苗族侗族自治州雷山县乌东村","openTime":"08:00-18:00","description":"乌东苗寨是中国传统村落，保存完好的苗族木结构建筑群。寨内银饰锻造、蜡染刺绣等非遗技艺传承至今，是体验苗族文化的绝佳目的地。","mainImage":"🏔️","minPrice":30,"longitude":"108.2436","latitude":"26.4825","status":1},
    {"scenicId":2,"name":"雷公山国家森林公园","address":"贵州省黔东南州雷山县","openTime":"07:30-17:30","description":"雷公山为苗岭主峰，海拔2178.8米，森林覆盖率88%。景区内有原始森林、高山瀑布、云海日出等自然景观。","mainImage":"⛰️","minPrice":50,"longitude":"108.1789","latitude":"26.3923","status":1},
    {"scenicId":3,"name":"西江千户苗寨","address":"贵州省黔东南州雷山县西江镇","openTime":"08:00-20:00","description":"西江千户苗寨是世界上最大的苗族聚居村寨，万家灯火被誉为苗寨夜景天花板。","mainImage":"🏘️","minPrice":60,"longitude":"108.174","latitude":"26.498","status":1},
    {"scenicId":4,"name":"郎德上寨","address":"贵州省黔东南州雷山县郎德镇","openTime":"08:30-17:30","description":"郎德上寨是国家重点文物保护单位，被誉为中国民间艺术之乡。","mainImage":"🏡","minPrice":50,"longitude":"108.089","latitude":"26.471","status":1},
]

TICKETS = [
    {"ticketTypeId":1,"scenicId":1,"name":"成人票","price":60,"marketPrice":80,"stock":500,"dailyStock":200,"validityDays":30,"usageNote":"1.2米以上成人适用"},
    {"ticketTypeId":2,"scenicId":1,"name":"儿童票","price":30,"marketPrice":40,"stock":300,"dailyStock":100,"validityDays":30,"usageNote":"1.2米以下儿童适用"},
    {"ticketTypeId":3,"scenicId":1,"name":"学生票","price":40,"marketPrice":60,"stock":300,"dailyStock":100,"validityDays":30,"usageNote":"全日制在校学生"},
    {"ticketTypeId":4,"scenicId":1,"name":"家庭套票(2大1小)","price":130,"marketPrice":180,"stock":100,"dailyStock":50,"validityDays":30,"usageNote":"2名成人+1名1.2米以下儿童"},
    {"ticketTypeId":5,"scenicId":2,"name":"成人票","price":80,"marketPrice":100,"stock":400,"dailyStock":150,"validityDays":30},
    {"ticketTypeId":6,"scenicId":2,"name":"学生票","price":50,"marketPrice":70,"stock":200,"dailyStock":80,"validityDays":30},
    {"ticketTypeId":7,"scenicId":3,"name":"成人票","price":90,"marketPrice":110,"stock":600,"dailyStock":250,"validityDays":30},
    {"ticketTypeId":8,"scenicId":3,"name":"学生票","price":60,"marketPrice":80,"stock":300,"dailyStock":100,"validityDays":30},
    {"ticketTypeId":9,"scenicId":4,"name":"成人票","price":50,"marketPrice":70,"stock":300,"dailyStock":100,"validityDays":30},
]

ROUTES = [
    {"routeId":1,"title":"乌东苗寨·非遗文化一日游","subtitle":"深度体验苗族银饰锻造与蜡染技艺","duration":"一日游","themes":"亲子,研学","price":198,"marketPrice":268,"includedItems":'["往返交通","景区门票","苗家长桌宴","银饰锻造体验","蜡染体验","导游服务","旅游保险"]',"departure":"凯里","destination":"乌东苗寨","stock":30,"rating":4.8,"reviewCount":126,"mainImage":"🗺️"},
    {"routeId":2,"title":"雷公山·自然探索两日游","subtitle":"登苗岭主峰，赏云海日出","duration":"两日游","themes":"摄影,研学","price":498,"marketPrice":628,"includedItems":'["往返交通","民宿住宿","三正一早","雷公山门票","导游服务","旅游保险"]',"departure":"凯里","destination":"雷公山","stock":20,"rating":4.6,"reviewCount":89,"mainImage":"⛺"},
    {"routeId":3,"title":"西江千户苗寨·夜景摄影两日游","subtitle":"万家灯火，苗寨夜景天花板","duration":"两日游","themes":"摄影,亲子","price":598,"marketPrice":728,"includedItems":'["往返交通","观景客栈","两正一早","西江门票","苗服旅拍","导游","保险"]',"departure":"凯里","destination":"西江千户苗寨","stock":25,"rating":4.9,"reviewCount":203,"mainImage":"📷"},
    {"routeId":4,"title":"黔东南苗寨深度研学三日游","subtitle":"走访乌东+西江+郎德，全景式苗族文化研学","duration":"多日游","themes":"研学,摄影","price":1280,"marketPrice":1580,"includedItems":'["全程交通","两晚民宿","五正两早","三大苗寨门票","非遗体验","苗药识别","苗歌苗舞","导游","保险"]',"departure":"凯里","destination":"乌东苗寨","stock":15,"rating":4.7,"reviewCount":67,"mainImage":"🎓"},
]

GUIDES = [
    {"guideId":1,"title":"贵阳→凯里→乌东苗寨 交通攻略","departure":"贵阳","destination":"乌东苗寨","transportType":"高铁+大巴","duration":"约3小时","estimatedCost":150,"description":"从贵阳北站乘坐高铁至凯里南站(约40分钟)，出站后换乘旅游大巴(约1.5小时)或包车直达乌东苗寨。","coverImage":"🚄","viewCount":1520,"favCount":89},
    {"guideId":2,"title":"凯里→乌东苗寨 自驾攻略","departure":"凯里","destination":"乌东苗寨","transportType":"自驾","duration":"约1.5小时","estimatedCost":80,"description":"从凯里市区出发，沿G60沪昆高速→雷山出口→S308省道→乌东村。全程约80公里，建议白天行驶。","coverImage":"🚗","viewCount":980,"favCount":45},
    {"guideId":3,"title":"广州→凯里→乌东 高铁攻略","departure":"广州","destination":"乌东苗寨","transportType":"高铁","duration":"约5.5小时","estimatedCost":380,"description":"广州南站乘坐高铁直达凯里南站(约4.5小时)，出站后转乘旅游大巴前往乌东苗寨。","coverImage":"🚅","viewCount":2340,"favCount":156},
]

# 内存存储
orders = {}
etickets = {}
reviews = []
favorites = {}

def json_response(data, status=200):
    return {"body": json.dumps(data, ensure_ascii=False, indent=2), "status": status, "content_type": "application/json; charset=utf-8"}

def parse_path(path):
    """解析URL路径和查询参数"""
    if '?' in path:
        path_part, qs = path.split('?', 1)
        params = dict(urllib.parse.parse_qsl(qs))
    else:
        path_part = path
        params = {}
    return path_part, params

class APIHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode('utf-8'))

    def do_GET(self):
        path, params = parse_path(self.path)

        # ===== 景区接口 =====
        if path == '/api/scenic/list':
            keyword = params.get('keyword', '').lower()
            page = int(params.get('page', 1))
            page_size = int(params.get('pageSize', 10))
            result = [s for s in SCENICS if keyword in s['name'].lower() or keyword in s.get('address','').lower()]
            total = len(result)
            start = (page-1)*page_size
            return self.send_json({"list": result[start:start+page_size], "total": total, "page": page, "pageSize": page_size})

        elif path.startswith('/api/scenic/detail/'):
            scenic_id = int(path.split('/')[-1])
            scenic = next((s for s in SCENICS if s['scenicId'] == scenic_id), None)
            if not scenic: return self.send_json({"message":"景区不存在"}, 404)
            scenic_tickets = [t for t in TICKETS if t['scenicId'] == scenic_id]
            return self.send_json({**scenic, "tickets": scenic_tickets})

        # ===== 票种接口 =====
        elif path == '/api/ticket-type/list':
            scenic_id = params.get('scenicId')
            page = int(params.get('page', 1))
            page_size = int(params.get('pageSize', 20))
            result = [t for t in TICKETS if not scenic_id or t['scenicId'] == int(scenic_id)]
            total = len(result)
            start = (page-1)*page_size
            return self.send_json({"list": result[start:start+page_size], "total": total, "page": page, "pageSize": page_size})

        elif path.startswith('/api/ticket-type/detail/'):
            tid = int(path.split('/')[-1])
            ticket = next((t for t in TICKETS if t['ticketTypeId'] == tid), None)
            if not ticket: return self.send_json({"message":"票种不存在"}, 404)
            scenic = next((s for s in SCENICS if s['scenicId'] == ticket['scenicId']), None)
            return self.send_json({**ticket, "scenicSpot": scenic})

        # ===== 路线接口 =====
        elif path == '/api/route/list':
            duration = params.get('duration', '')
            theme = params.get('theme', '')
            keyword = params.get('keyword', '').lower()
            page = int(params.get('page', 1))
            page_size = int(params.get('pageSize', 10))
            result = ROUTES.copy()
            if duration: result = [r for r in result if r['duration'] == duration]
            if theme: result = [r for r in result if theme in r.get('themes','')]
            if keyword: result = [r for r in result if keyword in r['title'].lower() or keyword in r.get('destination','').lower()]
            total = len(result)
            start = (page-1)*page_size
            # 简易排序
            sort = params.get('sortBy','default')
            if sort == 'price_asc': result.sort(key=lambda x: x['price'])
            elif sort == 'price_desc': result.sort(key=lambda x: -x['price'])
            elif sort == 'rating': result.sort(key=lambda x: -x.get('rating',0))
            return self.send_json({"list": result[start:start+page_size], "total": total, "page": page, "pageSize": page_size})

        elif path.startswith('/api/route/detail/'):
            rid = int(path.split('/')[-1])
            route = next((r for r in ROUTES if r['routeId'] == rid), None)
            if not route: return self.send_json({"message":"路线不存在"}, 404)
            itineraries = [
                {"itineraryId":1,"day":1,"description":"上午参观苗寨传统建筑群，了解苗族历史。中午体验苗家长桌宴。下午参与非遗体验课程。","spots":"苗寨建筑群,非遗工坊","meals":"苗家长桌宴","accommodation":"","transportation":"旅游大巴"},
                {"itineraryId":2,"day":2,"description":"清晨拍摄晨雾苗寨，上午自由探索苗寨集市，下午返回。","spots":"苗寨观景台,苗寨集市","meals":"早餐,午餐","accommodation":"","transportation":"旅游大巴"},
            ] if rid == 1 else [
                {"itineraryId":3,"day":1,"description":"早上出发→景区→午餐→瀑布→森林徒步→日落→宿山顶民宿","spots":"雷公山,响水岩瀑布","meals":"午餐,晚餐","accommodation":"山顶民宿","transportation":"旅游大巴"},
                {"itineraryId":4,"day":2,"description":"凌晨看日出云海→早餐→高山草甸→苗药识别→午餐→返回","spots":"日出观景台,高山草甸","meals":"早餐,午餐","accommodation":"","transportation":"旅游大巴"},
            ]
            return self.send_json({**route, "itineraries": itineraries})

        # ===== 攻略接口 =====
        elif path == '/api/guide/list':
            departure = params.get('departure', '')
            page = int(params.get('page', 1))
            page_size = int(params.get('pageSize', 10))
            result = [g for g in GUIDES if not departure or g['departure'] == departure]
            total = len(result)
            start = (page-1)*page_size
            return self.send_json({"list": result[start:start+page_size], "total": total, "page": page, "pageSize": page_size})

        elif path == '/api/guide/departures':
            return self.send_json(list(set(g['departure'] for g in GUIDES)))

        elif path.startswith('/api/guide/detail/'):
            gid = int(path.split('/')[-1])
            guide = next((g for g in GUIDES if g['guideId'] == gid), None)
            if not guide: return self.send_json({"message":"攻略不存在"}, 404)
            return self.send_json(guide)

        # ===== 评价接口 =====
        elif path == '/api/review/list':
            page = int(params.get('page', 1))
            page_size = int(params.get('pageSize', 10))
            return self.send_json({"list": reviews, "total": len(reviews), "page": page, "pageSize": page_size})

        # ===== 收藏接口 =====
        elif path == '/api/favorite/check':
            target = f"{params.get('targetType')}_{params.get('targetId')}"
            return self.send_json({"favorited": target in favorites})

        elif path == '/api/favorite/list':
            return self.send_json({"list": [{"targetType":k.split('_')[0],"targetId":int(k.split('_')[1]),"createdAt":v} for k,v in favorites.items()], "total": len(favorites), "page": 1})

        # ===== 订单接口 =====
        elif path == '/api/order/list':
            order_type = params.get('orderType', '')
            order_status = params.get('orderStatus', '')
            result = list(orders.values())
            if order_type: result = [o for o in result if o['orderType'] == order_type]
            if order_status: result = [o for o in result if o['orderStatus'] == order_status]
            result.sort(key=lambda x: x['createdAt'], reverse=True)
            return self.send_json({"list": result, "total": len(result), "page": 1, "pageSize": 20})

        elif path.startswith('/api/order/detail/'):
            order_no = path.split('/')[-1]
            order = orders.get(order_no)
            if not order: return self.send_json({"message":"订单不存在"}, 404)
            order_etickets = [t for t in etickets.values() if t['orderNo'] == order_no]
            return self.send_json({**order, "eTickets": order_etickets})

        elif path.startswith('/api/e-ticket/list'):
            return self.send_json(list(etickets.values()))

        elif path.startswith('/api/e-ticket/detail/'):
            eid = int(path.split('/')[-1])
            ticket = next((t for t in etickets.values() if t['eTicketId'] == eid), None)
            if not ticket: return self.send_json({"message":"电子票不存在"}, 404)
            return self.send_json(ticket)

        # ===== 统计接口 =====
        elif path == '/api/statistics/dashboard':
            return self.send_json({
                "todayOrders": len(orders),
                "todayRevenue": sum(o['totalAmount'] for o in orders.values() if o['orderStatus'] in ('paid','completed')),
                "pendingRefunds": sum(1 for o in orders.values() if o['orderStatus'] == 'refunding'),
                "scenicCount": len(SCENICS),
                "routeCount": len(ROUTES),
                "monthlyGmv": sum(o['totalAmount'] for o in orders.values()),
                "topScenics": [{"name":"乌东苗寨","count":45},{"name":"西江千户苗寨","count":38},{"name":"雷公山","count":22},{"name":"郎德上寨","count":15}],
                "topRoutes": [{"name":"非遗文化一日游","count":28},{"name":"夜景摄影两日游","count":22},{"name":"深度研学三日游","count":12},{"name":"自然探索两日游","count":8}],
            })

        else:
            return self.send_json({"message":"接口不存在", "available":["/api/scenic/list","/api/route/list","/api/guide/list","/api/order/list","/api/statistics/dashboard"]}, 404)

    def do_POST(self):
        path, params = parse_path(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(content_length).decode('utf-8')) if content_length > 0 else {}

        # 创建门票订单
        if path == '/api/order/ticket/create':
            ticket = next((t for t in TICKETS if t['ticketTypeId'] == body.get('ticketTypeId')), None)
            if not ticket: return self.send_json({"message":"票种不存在"}, 400)
            scenic = next((s for s in SCENICS if s['scenicId'] == ticket['scenicId']), None)
            quantity = body.get('quantity', 1)
            total = ticket['price'] * quantity
            order_no = f"WD{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
            order = {
                "orderNo": order_no, "userId": 1, "orderType": "ticket",
                "targetId": ticket['scenicId'], "targetName": scenic['name'] if scenic else '',
                "ticketTypeId": ticket['ticketTypeId'], "ticketTypeName": ticket['name'],
                "unitPrice": ticket['price'], "quantity": quantity, "totalAmount": total,
                "useDate": body.get('useDate', str(date.today())), "visitors": body.get('visitors','[]'),
                "contactPhone": body.get('contactPhone',''), "orderStatus": "pending_pay",
                "createdAt": datetime.now().isoformat()
            }
            orders[order_no] = order
            return self.send_json({"orderNo": order_no, "totalAmount": total})

        # 创建路线订单
        elif path == '/api/order/route/create':
            route = next((r for r in ROUTES if r['routeId'] == body.get('routeId')), None)
            if not route: return self.send_json({"message":"路线不存在"}, 400)
            use_date = datetime.strptime(body.get('useDate', str(date.today())), '%Y-%m-%d')
            if use_date <= datetime.now() + timedelta(days=1):
                return self.send_json({"message":"路线套餐须提前1天购买（R9-03）"}, 400)
            quantity = body.get('quantity', 1)
            total = route['price'] * quantity
            order_no = f"WD{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
            order = {
                "orderNo": order_no, "userId": 1, "orderType": "route",
                "targetId": route['routeId'], "targetName": route['title'],
                "unitPrice": route['price'], "quantity": quantity, "totalAmount": total,
                "useDate": body.get('useDate', str(date.today())), "visitors": body.get('visitors','[]'),
                "contactPhone": body.get('contactPhone',''), "orderStatus": "pending_pay",
                "createdAt": datetime.now().isoformat()
            }
            orders[order_no] = order
            return self.send_json({"orderNo": order_no, "totalAmount": total})

        # 支付回调
        elif path == '/api/order/pay-callback':
            order_no = body.get('orderNo')
            order = orders.get(order_no)
            if not order: return self.send_json({"message":"订单不存在"}, 404)
            order['orderStatus'] = 'paid'
            order['paidAt'] = datetime.now().isoformat()
            order['transactionId'] = body.get('transactionId', '')
            # 生成电子票
            visitors = json.loads(order.get('visitors', '[]'))
            for v in visitors:
                eid = len(etickets) + 1
                etickets[eid] = {
                    "eTicketId": eid, "orderNo": order_no,
                    "ticketTypeId": order.get('ticketTypeId'), "routeId": order.get('targetId') if order['orderType']=='route' else None,
                    "userId": 1, "qrCode": f"TK{uuid.uuid4().hex[:12].upper()}",
                    "useDate": order['useDate'],
                    "expireDate": (datetime.strptime(order['useDate'],'%Y-%m-%d')+timedelta(days=30)).strftime('%Y-%m-%d'),
                    "visitorName": v.get('name',''), "visitorIdCard": v.get('idCard',''),
                    "visitorPhone": v.get('phone',''), "status": "unused",
                    "createdAt": datetime.now().isoformat()
                }
            return self.send_json({"success": True})

        # 核销电子票
        elif path == '/api/order/verify':
            qr_code = body.get('qrCode', '')
            ticket = next((t for t in etickets.values() if t['qrCode'] == qr_code), None)
            if not ticket: return self.send_json({"message":"电子票不存在"}, 400)
            if ticket['status'] == 'used': return self.send_json({"message":"电子票已使用（R9-02）"}, 400)
            if ticket['status'] == 'refunded': return self.send_json({"message":"电子票已退款"}, 400)
            ticket['status'] = 'used'
            ticket['verifiedAt'] = datetime.now().isoformat()
            return self.send_json({"success":True, "visitorName": ticket['visitorName']})

        # 退款
        elif path == '/api/order/refund':
            order_no = body.get('orderNo')
            order = orders.get(order_no)
            if not order: return self.send_json({"message":"订单不存在"}, 404)
            if order['orderType'] == 'route':
                use_date = datetime.strptime(order['useDate'], '%Y-%m-%d')
                if (use_date - datetime.now()).days < 3:
                    return self.send_json({"message":"出发前3天内不可退款（R9-03）"}, 400)
            order['orderStatus'] = 'refunding'
            order['refundReason'] = body.get('reason', '')
            # 标记电子票为已退款
            for t in etickets.values():
                if t['orderNo'] == order_no:
                    t['status'] = 'refunded'
            return self.send_json({"success": True})

        # 取消订单
        elif path.startswith('/api/order/cancel/'):
            order_no = path.split('/')[-1]
            order = orders.get(order_no)
            if not order: return self.send_json({"message":"订单不存在"}, 404)
            if order['orderStatus'] != 'pending_pay':
                return self.send_json({"message":"仅待支付订单可取消"}, 400)
            order['orderStatus'] = 'cancelled'
            return self.send_json({"success": True})

        # 收藏切换
        elif path == '/api/favorite/toggle':
            target = f"{body.get('targetType')}_{body.get('targetId')}"
            if target in favorites:
                del favorites[target]
                return self.send_json({"favorited": False})
            else:
                favorites[target] = datetime.now().isoformat()
                return self.send_json({"favorited": True})

        # 评价
        elif path == '/api/review/create':
            review = {**body, "reviewId": len(reviews)+1, "userId": 1, "userName":"测试用户", "status":1, "createdAt": datetime.now().isoformat()}
            reviews.append(review)
            return self.send_json({"success": True, "reviewId": review['reviewId']})

        else:
            return self.send_json({"message":"接口不存在"}, 404)

    def do_PUT(self):
        path, _ = parse_path(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(content_length).decode('utf-8')) if content_length > 0 else {}

        if path == '/api/order/admin/refund-audit':
            order_no = body.get('orderNo')
            order = orders.get(order_no)
            if not order: return self.send_json({"message":"订单不存在"}, 404)
            if body.get('approved'):
                order['orderStatus'] = 'refunded'
                order['refundedAt'] = datetime.now().isoformat()
            else:
                order['orderStatus'] = 'paid'
                for t in etickets.values():
                    if t['orderNo'] == order_no: t['status'] = 'unused'
            return self.send_json({"success": True})

        elif path.startswith('/api/review/reply'):
            return self.send_json({"success": True, "message":"回复功能需要数据库支持"})

        return self.send_json({"message":"接口不存在"}, 404)


if __name__ == '__main__':
    import sys, io
    # Fix Windows GBK encoding issue
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    port = 7001
    server = http.server.HTTPServer(('0.0.0.0', port), APIHandler)
    print("=" * 60)
    print("  [WuDong Travel] Route & Ticket Booking - Python Demo Server")
    print(f"  Server started! Visit: http://localhost:{port}")
    print()
    print("  API Endpoints:")
    print(f"     GET  /api/scenic/list")
    print(f"     GET  /api/route/list")
    print(f"     GET  /api/guide/list")
    print(f"     GET  /api/order/list")
    print(f"     GET  /api/statistics/dashboard")
    print()
    print("  Business Flow Demo:")
    print(f"     1. Browse: GET /api/scenic/list")
    print(f"     2. Detail: GET /api/scenic/detail/1")
    print(f"     3. Order:  POST /api/order/ticket/create")
    print(f"     4. Pay:    POST /api/order/pay-callback")
    print(f"     5. Verify: POST /api/order/verify")
    print()
    print("  Press Ctrl+C to stop")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
