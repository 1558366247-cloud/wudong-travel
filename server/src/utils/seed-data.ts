/**
 * 乌东文旅 - 行·线路订票模块种子数据
 * 用于初始化开发环境的测试数据
 */

export const seedScenicSpots = [
  {
    name: '乌东苗寨',
    address: '贵州省黔东南苗族侗族自治州雷山县乌东村',
    longitude: '108.2436',
    latitude: '26.4825',
    openTime: '08:00-18:00',
    description: '乌东苗寨是中国传统村落，保存完好的苗族木结构建筑群，依山而建，梯田环绕。寨内银饰锻造、蜡染刺绣等非遗技艺传承至今，是体验苗族文化的绝佳目的地。',
    mainImage: 'https://example.com/images/wudong-village.jpg',
    images: ['https://example.com/images/wudong-1.jpg', 'https://example.com/images/wudong-2.jpg'],
    sortOrder: 1
  },
  {
    name: '雷公山国家森林公园',
    address: '贵州省黔东南州雷山县',
    longitude: '108.1789',
    latitude: '26.3923',
    openTime: '07:30-17:30',
    description: '雷公山为苗岭主峰，海拔2178.8米，森林覆盖率达88%，是国家级自然保护区和森林公园。景区内有原始森林、高山瀑布、云海日出等自然景观。',
    mainImage: 'https://example.com/images/leigongshan.jpg',
    sortOrder: 2
  },
  {
    name: '西江千户苗寨',
    address: '贵州省黔东南州雷山县西江镇',
    longitude: '108.174',
    latitude: '26.498',
    openTime: '08:00-20:00',
    description: '西江千户苗寨是世界上最大的苗族聚居村寨，由十余个自然村寨相连成片。夜幕降临时万家灯火如繁星点点，被誉为"苗寨夜景天花板"。',
    mainImage: 'https://example.com/images/xijiang.jpg',
    sortOrder: 3
  },
  {
    name: '郎德上寨',
    address: '贵州省黔东南州雷山县郎德镇',
    longitude: '108.089',
    latitude: '26.471',
    openTime: '08:30-17:30',
    description: '郎德上寨是国家重点文物保护单位，被誉为"中国民间艺术之乡"。寨内保存完整的苗族古建筑群与非物质文化遗产，是苗族文化的活态博物馆。',
    mainImage: 'https://example.com/images/langde.jpg',
    sortOrder: 4
  }
];

export const seedTicketTypes = [
  { scenicId: 1, name: '成人票', price: 60, marketPrice: 80, stock: 500, dailyStock: 200, validityDays: 30, usageNote: '1.2米以上成人适用', sortOrder: 1 },
  { scenicId: 1, name: '儿童票', price: 30, marketPrice: 40, stock: 300, dailyStock: 100, validityDays: 30, usageNote: '1.2米以下儿童适用，需成人陪同', sortOrder: 2 },
  { scenicId: 1, name: '学生票', price: 40, marketPrice: 60, stock: 300, dailyStock: 100, validityDays: 30, usageNote: '全日制在校学生，凭学生证入园', sortOrder: 3 },
  { scenicId: 1, name: '家庭套票(2大1小)', price: 130, marketPrice: 180, stock: 100, dailyStock: 50, validityDays: 30, usageNote: '2名成人+1名1.2米以下儿童', sortOrder: 4 },
  { scenicId: 2, name: '成人票', price: 80, marketPrice: 100, stock: 400, dailyStock: 150, validityDays: 30, sortOrder: 1 },
  { scenicId: 2, name: '学生票', price: 50, marketPrice: 70, stock: 200, dailyStock: 80, validityDays: 30, sortOrder: 2 },
  { scenicId: 3, name: '成人票', price: 90, marketPrice: 110, stock: 600, dailyStock: 250, validityDays: 30, sortOrder: 1 },
  { scenicId: 3, name: '学生票', price: 60, marketPrice: 80, stock: 300, dailyStock: 100, validityDays: 30, sortOrder: 2 },
  { scenicId: 4, name: '成人票', price: 50, marketPrice: 70, stock: 300, dailyStock: 100, validityDays: 30, sortOrder: 1 },
];

export const seedRoutes = [
  {
    title: '乌东苗寨·非遗文化一日游',
    subtitle: '深度体验苗族银饰锻造与蜡染技艺',
    duration: '一日游',
    themes: '亲子,研学',
    price: 198,
    marketPrice: 268,
    includedItems: '["往返交通","景区门票","午餐(苗家长桌宴)","银饰锻造体验","蜡染体验","导游服务","旅游保险"]',
    departure: '凯里',
    destination: '乌东苗寨',
    accommodationStandard: '',
    mealStandard: '苗家长桌宴(午餐)',
    notes: '1. 请穿着舒适运动鞋；2. 银饰锻造需听从师傅指导；3. 蜡染体验约2小时',
    mainImage: 'https://example.com/images/route-wudong-1day.jpg',
    details: '<p>早晨8:00从凯里出发，前往乌东苗寨(约1.5小时车程)。上午参观苗寨传统建筑群，了解苗族历史文化。中午体验苗家长桌宴。下午参与银饰锻造与蜡染体验课程。傍晚返回凯里。</p>',
    stock: 30
  },
  {
    title: '雷公山·自然探索两日游',
    subtitle: '登苗岭主峰，赏云海日出',
    duration: '两日游',
    themes: '摄影,研学',
    price: 498,
    marketPrice: 628,
    includedItems: '["往返交通","一晚民宿住宿","三正一早","雷公山门票","导游服务","旅游保险"]',
    departure: '凯里',
    destination: '雷公山',
    accommodationStandard: '苗寨特色民宿(标准间)',
    mealStandard: '含3正餐1早餐',
    notes: '1. 海拔较高，请备保暖衣物；2. 日出需凌晨4:30起床；3. 山区天气多变，请备雨具',
    mainImage: 'https://example.com/images/route-leigong-2day.jpg',
    details: '<p>D1: 早上8:00凯里出发→雷公山景区→午餐→响水岩瀑布→原始森林徒步→山顶日落→宿山顶民宿。D2: 凌晨看日出云海→早餐→高山草甸→苗药识别→午餐→返回凯里。</p>',
    stock: 20
  },
  {
    title: '西江千户苗寨·夜景摄影两日游',
    subtitle: '万家灯火，苗寨夜景天花板',
    duration: '两日游',
    themes: '摄影,亲子',
    price: 598,
    marketPrice: 728,
    includedItems: '["往返交通","一晚住宿(观景客栈)","两正一早","西江门票","苗服旅拍(1套)","导游服务","旅游保险"]',
    departure: '凯里',
    destination: '西江千户苗寨',
    accommodationStandard: '观景客栈(含阳台)',
    mealStandard: '含2正餐1早餐',
    notes: '1. 夜景拍摄建议携带三脚架；2. 苗服旅拍含1套服装；3. 景区内需步行较多台阶',
    mainImage: 'https://example.com/images/route-xijiang-2day.jpg',
    details: '<p>D1: 上午凯里出发→西江千户苗寨→午餐→苗族博物馆→观景台→苗服旅拍→傍晚拍摄全景→夜景拍摄。D2: 清晨拍摄晨雾苗寨→早餐→苗寨集市→银饰村参观→午餐→返回凯里。</p>',
    stock: 25
  },
  {
    title: '黔东南苗寨深度研学三日游',
    subtitle: '走访乌东+西江+郎德，全景式苗族文化研学',
    duration: '多日游',
    themes: '研学,摄影',
    price: 1280,
    marketPrice: 1580,
    includedItems: '["全程交通","两晚特色民宿","五正两早","三大苗寨门票","非遗体验(银饰+蜡染+刺绣)","苗药识别","苗歌苗舞表演","导游服务","旅游保险"]',
    departure: '凯里(可接贵阳)',
    destination: '乌东苗寨',
    accommodationStandard: '苗寨特色民宿(标准间)，2晚',
    mealStandard: '含5正餐2早餐(其中1餐为苗族长桌宴)',
    notes: '1. 适合对苗族文化有深度兴趣的游客；2. 部分体验项目需动手操作；3. 建议携带笔记本记录',
    mainImage: 'https://example.com/images/route-miaozhai-3day.jpg',
    details: '<p>D1: 凯里接站→乌东苗寨→银饰锻造体验→苗家长桌宴→宿乌东民宿。D2: 乌东出发→郎德上寨→苗族古建筑参观→蜡染刺绣体验→苗歌苗舞表演→宿西江。D3: 西江晨雾拍摄→苗寨集市→雷公山苗药识别→结营仪式→返回凯里。</p>',
    stock: 15
  }
];

export const seedTransportGuides = [
  {
    title: '贵阳→凯里→乌东苗寨 交通攻略',
    departure: '贵阳',
    destination: '乌东苗寨',
    transportType: '高铁+大巴',
    duration: '约3小时',
    estimatedCost: 150,
    description: '从贵阳北站乘坐高铁至凯里南站(约40分钟，票价约58元)，出站后换乘凯里至雷山/乌东的旅游大巴(约1.5小时，票价约30元)，或包车直达(约1小时，费用约100-150元)。',
    coverImage: 'https://example.com/images/guide-guiyang.jpg',
    sortOrder: 1
  },
  {
    title: '凯里→乌东苗寨 自驾攻略',
    departure: '凯里',
    destination: '乌东苗寨',
    transportType: '自驾',
    duration: '约1.5小时',
    estimatedCost: 80,
    description: '从凯里市区出发，沿G60沪昆高速→雷山出口下→沿S308省道→乌东村。全程约80公里，山路弯道较多，建议白天行驶。村口有免费停车场。',
    coverImage: 'https://example.com/images/guide-zijia.jpg',
    sortOrder: 2
  },
  {
    title: '广州→凯里→乌东 高铁攻略',
    departure: '广州',
    destination: '乌东苗寨',
    transportType: '高铁',
    duration: '约5.5小时',
    estimatedCost: 380,
    description: '广州南站乘坐高铁直达凯里南站(约4.5小时，二等座约320元)，出站后转乘旅游大巴或包车前往乌东苗寨。建议乘坐早班高铁，下午可抵达苗寨。',
    coverImage: 'https://example.com/images/guide-guangzhou.jpg',
    sortOrder: 3
  }
];
