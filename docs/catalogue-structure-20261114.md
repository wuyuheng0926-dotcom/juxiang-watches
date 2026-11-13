# JUXIANG 商品结构拆分记录

日期：2026-11-14。范围：国内 Render 网站。

规则：仅颜色不同的款式可放入同一商品组。表带材质或结构、表圈装饰、数字/刻度造型、盘面纹理、功能布局、表壳外观、背盖结构不同，分别归组。颜色描述不等于材质认证，装饰石不声明为天然钻石。

原有 42 组、225 个配色记录；现为 115 组、226 个可选款式。组合供图中额外识别出两只普通表圈款，并将一组重复粉色供图并入细节。1651 张原有图片均保留。

品牌分组数量：Piaget 9、Rolex 84、Vacheron Constantin 19、Patek Philippe 3。

旧编号的第一子组保留原编号，其余子组使用 JX111–JX183。catalog.js 中 legacyVariantLinks 保存原编号+配色到新商品的映射；app.js 在打开旧链接时先解析此映射。首页十张轮播的商品链接已迁移至对应子组。

每组价格均为 130–170 美元。原有价格保留；原来待询的条目按既定范围补价。主图与对应细节随配色移动；不能确定选款的原组参考图集中保留在第一子组，并明确标注为参考。

验证：225 个旧配色链接逐项解析通过；全部原有图片引用保留；Chrome 桌面和390像素手机视口完成筛选、详情、配色按钮及无横向溢出检查。

## 分组清单

|编号|品牌|结构|配色数|
|---|---|---|---|
|JX069|Piaget|Emperador长方形装饰款 · 皮革表带|2|
|JX070|Piaget|Polo开窗装饰款 · 皮革表带|2|
|JX071|Piaget|Altiplano超薄经典款 · 皮革表带|1|
|JX072|Piaget|Polo日历款 · 金属表链|1|
|JX073|Piaget|Limelight Gala非对称装饰款 · 橡胶表带|2|
|JX074|Piaget|全铺装饰盘|4|
|JX111|Piaget|素面中心装饰盘|1|
|JX075|Piaget|双针无日历盘|1|
|JX112|Piaget|纹理日历盘|1|
|JX076|Rolex|光圈 · 罗马盘 · 三节表链|2|
|JX113|Rolex|牙圈 · 罗马盘 · 五节表链|1|
|JX114|Rolex|牙圈 · 装饰石刻度 · 五节表链|3|
|JX115|Rolex|牙圈 · 条形刻度 · 五节表链|1|
|JX116|Rolex|牙圈 · 装饰罗马数字 · 五节表链|3|
|JX117|Rolex|牙圈 · 装饰石刻度 · 三节表链|2|
|JX118|Rolex|装饰石圈 · 罗马盘 · 三节表链|1|
|JX119|Rolex|牙圈 · 罗马盘 · 三节表链|1|
|JX120|Rolex|小表壳 · 牙圈 · 装饰石刻度 · 五节表链|3|
|JX121|Rolex|牙圈 · 条形刻度 · 三节表链|2|
|JX122|Rolex|牙圈 · 方形装饰刻度 · 五节表链|1|
|JX123|Rolex|珠光纹理盘 · 装饰石刻度 · 五节表链|1|
|JX124|Rolex|装饰石圈 · 装饰石刻度 · 五节表链|1|
|JX125|Rolex|透底 · 牙圈 · 条形刻度 · 五节表链|1|
|JX126|Rolex|装饰石圈 · 装饰石刻度 · 三节表链|1|
|JX127|Rolex|小表壳 · 牙圈 · 罗马盘 · 五节表链|1|
|JX128|Rolex|小表壳 · 装饰石圈 · 罗马盘 · 五节表链|3|
|JX129|Rolex|小表壳 · 装饰石圈 · 罗马盘 · 三节表链|1|
|JX130|Rolex|小表壳 · 装饰石圈 · 装饰石刻度 · 三节表链|1|
|JX131|Rolex|装饰盘及表圈 · 三节表链|2|
|JX132|Rolex|光圈 · 罗马盘 · 三节表链 · 窄表壳|1|
|JX133|Rolex|潜水数字圈 · 圆点刻度 · 三节表链|1|
|JX134|Rolex|表壳表链全铺装饰 · 条形刻度|1|
|JX135|Rolex|牙圈 · 罗马盘 · 三节表链|1|
|JX136|Rolex|条纹盘 · 条形刻度 · 三节表链|1|
|JX137|Rolex|纹理盘 · 矩形刻度 · 三节表链|1|
|JX138|Rolex|素面盘 · 条形刻度 · 三节表链|1|
|JX139|Rolex|条纹盘 · 矩形刻度 · 三节表链|1|
|JX077|Rolex|游艇名仕型 · 金属表链|3|
|JX078|Rolex|单条形刻度|2|
|JX140|Rolex|双条形主刻度|1|
|JX079|Rolex|金属测速圈 · 条形刻度|5|
|JX141|Rolex|异色测速圈 · 条形刻度|5|
|JX142|Rolex|彩色装饰圈 · 彩色条形刻度 · 装饰表耳|1|
|JX143|Rolex|彩色装饰圈 · 装饰石刻度 · 装饰表耳|2|
|JX144|Rolex|装饰盘及表圈 · 条形刻度|1|
|JX145|Rolex|金属测速圈 · 装饰石刻度|1|
|JX146|Rolex|金属测速圈 · 阿拉伯数字|2|
|JX147|Rolex|装饰石圈 · 装饰石刻度|1|
|JX148|Rolex|彩色装饰圈 · 全铺装饰盘|1|
|JX080|Rolex|牙圈 · 五节表链|1|
|JX149|Rolex|牙圈 · 三节表链|1|
|JX081|Rolex|牙圈 · 装饰石刻度|2|
|JX150|Rolex|装饰石圈 · 条形刻度|1|
|JX151|Rolex|装饰石圈 · 圆形装饰刻度|1|
|JX152|Rolex|装饰石圈 · 长短组合装饰刻度|2|
|JX153|Rolex|纹理盘 · 棱形条状刻度|1|
|JX082|Rolex|海使型 · 金属表链|1|
|JX083|Rolex|潜水数字圈 · 普通表壳表链|8|
|JX154|Rolex|潜水数字圈 · 全铺装饰表壳表链|1|
|JX155|Rolex|立体数字圈 · 三节表链|1|
|JX084|Rolex|空中霸王型 · 金属表链|1|
|JX085|Rolex|立体数字圈|3|
|JX156|Rolex|彩色装饰圈|1|
|JX086|Rolex|异色测速圈 · 条形刻度|9|
|JX157|Rolex|金属测速圈 · 条形刻度|2|
|JX158|Rolex|彩色装饰圈 · 圆形装饰刻度|1|
|JX159|Rolex|彩色装饰圈 · 条状装饰刻度|1|
|JX160|Rolex|金属测速圈 · 阿拉伯数字|1|
|JX161|Rolex|异色测速圈 · 阿拉伯数字|1|
|JX087|Rolex|数字圈 · 五节表链|4|
|JX162|Rolex|数字圈 · 三节表链|7|
|JX163|Rolex|全铺装饰盘、表壳及表链|1|
|JX164|Rolex|彩色装饰圈|1|
|JX088|Rolex|立体数字圈 · 纵纹胶带|1|
|JX165|Rolex|潜水数字圈 · 纵纹胶带|1|
|JX166|Rolex|潜水数字圈 · 平滑一体胶带|1|
|JX167|Rolex|潜水数字圈 · 中线凹槽胶带|3|
|JX089|Rolex|测速圈 · 编织纹表带|1|
|JX090|Rolex|切利尼 · 皮革表带|4|
|JX091|Rolex|红字内圈 · 哑光表链|1|
|JX168|Rolex|标准内圈 · 抛光中节表链|1|
|JX092|Rolex|编织表带 · 中央异色条纹|1|
|JX169|Rolex|编织表带 · 素面中央|1|
|JX093|Rolex|切利尼月相 · 皮革表带|2|
|JX094|Rolex|牙圈 · 条形刻度 · 平滑皮带|1|
|JX170|Rolex|牙圈 · 罗马数字 · 压纹皮带|8|
|JX171|Rolex|牙圈 · 装饰石刻度 · 压纹皮带|1|
|JX172|Rolex|装饰石圈 · 条形刻度 · 压纹皮带|1|
|JX095|Rolex|格磁型 · 金属表链|1|
|JX096|Rolex|迪通拿镂空风格（待确认） · 橡胶表带|5|
|JX097|Rolex|游艇名仕 II · 金属表链|1|
|JX098|Rolex|圆形开窗款 · 系列待确认 · 金属表链|1|
|JX099|Rolex|镂空计时外观 · 系列待确认 · 织物表带|3|
|JX100|Vacheron Constantin|装饰石圈 · 小秒盘|1|
|JX173|Vacheron Constantin|装饰石圈 · 中央秒针日历盘|4|
|JX174|Vacheron Constantin|普通表圈 · 中央秒针日历盘|1|
|JX101|Vacheron Constantin|普通表圈 · 中央秒针日历盘|1|
|JX175|Vacheron Constantin|普通表圈 · 小秒盘|2|
|JX102|Vacheron Constantin|双排装饰圈 · 压纹皮带|4|
|JX176|Vacheron Constantin|双排装饰圈 · 平滑缝线表带|1|
|JX177|Vacheron Constantin|窄装饰圈 · 压纹皮带|2|
|JX178|Vacheron Constantin|窄装饰圈 · 平滑表带|1|
|JX179|Vacheron Constantin|普通表圈 · 压纹皮带|2|
|JX103|Vacheron Constantin|轨道刻度盘 · 装饰表耳 · 压纹皮带|9|
|JX180|Vacheron Constantin|轨道刻度盘 · 装饰表耳 · 平滑表带|4|
|JX181|Vacheron Constantin|珠光纹理盘 · 无分钟轨道 · 压纹皮带|3|
|JX104|Vacheron Constantin|装饰盘 · 透底|1|
|JX182|Vacheron Constantin|装饰盘 · 密底|1|
|JX105|Vacheron Constantin|弧边酒桶表壳 · 中央装饰盘|5|
|JX183|Vacheron Constantin|直边表壳 · 纹理中央盘|1|
|JX106|Vacheron Constantin|传承日历外观 · 女款 · 系列待核实 · 皮革表带|2|
|JX107|Vacheron Constantin|创意时光外观 · 女款 · 系列待核实 · 皮革表带|2|
|JX108|Patek Philippe|鹦鹉螺 · 普通表圈 · 金属表链|4|
|JX109|Patek Philippe|鹦鹉螺 · 长方形装饰表圈 · 金属表链|1|
|JX110|Patek Philippe|Aquanaut Luce · 装饰表圈 · 胶带|2|