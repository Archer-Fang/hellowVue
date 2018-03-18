# 仿知乎日报学习笔记与优化
		[单页网页应用项目原地址（有些小BUG）](https://github.com/pomelo-chuan/Zhihu-Daily-Vue.js)<br />
		[知乎日报api查询](https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90)<br />
		如果想看完整的API的json数据的话，推荐使用sublime，网上搜索sublime json格式化。<br />
## 1.vuex跨域访问
###  1.1定义api：const urlBase = '/api/';
###  1.2在config中配置api的HTTP代理表： HTTP代理表，指定规则，将某些API请求代理到相应的服务器
		proxyTable: {
	      '/api': {
	        target: 'https://news-at.zhihu.com/api/4',
	        changeOrigin: true,
	        pathRewrite: {
	          '^/api': '/'
	        }
	      }
	    }
###  1.3配置API请求node-file.js:
		以该项目首页点击加载更多内容为例
		router.get('/before/:time', function (req, res, next) {
		   var time = req.params.time;
		   var options = {
		       method: "GET",
		       url: "http://news-at.zhihu.com/api/4/news/before/" + time
		   };
		    request(options, function (error, response, body) {
		        if (error) throw new Error(error);
		        res.json(JSON.parse(body))
		    });
		});
### 1.4访问顺序
		1.点击链接---被router接收---返回一个组件--组件在created时通过dispatch动作去fetch数据--通过axios进行跨域访问---定义的/api/被代理表转化为https://news-at.zhihu.com/api/4/****--****被router.get捕获--获取api的json数据--完成以后commit到mutation对数组进行处理赋值---.vue通过计算属性获取数值
		这里,因为将API请求代理到相应的服务器所以router.get中的 url: "http://news-at.zhihu.com/api/4/news/before/" + time才会有效的，即通过服务器进行跨域访问
		优化设置axios的baseURL='/api'，这样就不用每次手工加api了
		2.点击链接---被router接收---返回一个组件--组件在mouted时通过回调函数this.axios.get()进行伪跨域访问，在http.js为axios的baseUrl赋值如：
		axios.defaults.baseURL = 'https://api.github.com';
		再使用拦截器进行一系列参数赋值等等最后返回response,即api的json数据对.vue中的date进行赋值。拦截器拦截所有的请求与响应。这个具体实现步骤可以参照项目：https://github.com/superman66/vue-axios-github。
		这里跟跨域很像，但是我觉得不是跨域，是根据header的标识来返回github上我的资源的。这个项目是没有配置proxytable的
## 2.关于首页点击加载更多内容，点击一次，天数减少一天的实现：
###  2.1在state中定义当前时间：time: moment()
### 2.2在action中讲当前时间格式化:var now = state.time.format("YYYYMMDD")
###  2.3在把要更改的数据放入mutation中，同时对天数进行减一操作：
		[types.TOGGLE_NEWS_LATEST_MORE](state, all) {
	        state.NewsListRoot.push(all)
	        state.time.subtract(1, "days")
	        state.LoadingOne = false
	    }
## 3.首页数据未获取前加载动画效果，结束动画效果以及数据获取显示的操作
	mutations与actions：
	mutations是用来处理同步的事情的，比如给state中的变量赋值
	actions是用来处理异步的事情，比如网络请求（axios）；
	但是actions也是可以做同步的事情的，但最好按照vuex的建议来做：在mutations中处理同步操作
### 3.1create函数中判断首页数据是否加载
			if (!!this.DONE_NEWS_LATEST.stories && this.DONE_NEWS_LATEST.stories.length > 0) {} else {
				this.$store.dispatch('FECTH_NEWS_LATEST')
			}
### 3.2如果未加载则执行dispatch到actions，state完成改变时，动画结束
			 [types.FECTH_NEWS_LATEST]({commit}) {
		        state.LoadingTwo = true
		        commit('showLoding');
		        axios.get(urlBase + 'news/latest')
		            .then(res => {
		                commit(types.TOGGLE_NEWS_LATEST, res.data);
		                commit('hideLoading');
		            }).catch(err => console.log(err))
		    }
### 3.3在mutations中写Loading的状态，同时在把要更改的数据放入mutation中(更改 Vuex 的 store 中的状态的唯一方法是提交 mutation)：
#### 3.3.1写Loading的状态
				showLoding(state) {
			        state.LoadingTwo = true;
			    },
			    hideLoading(state) {
			        state.LoadingTwo = false;
			    }
#### 3.3.2把要更改的数据放入mutation中
				[types.TOGGLE_NEWS_LATEST](state, all) {
			        state.NewsListRoot.push(all)
			        state.NewsLatest = all
			        // state.LoadingTwo = false
			    }
### 3.4把state通过getter返回，同时在APP.vue中通过计算属性的mapGetters辅助函数获取数据
			3.4.1返回state
				[types.TOGGLE_NEWS_LATEST](state, all) {
			        state.NewsListRoot.push(all)
			        state.NewsLatest = all
			        // state.LoadingTwo = false
			    }
	### 		3.4.2获取getter
				computed: {
					...mapGetters(['DONE_NEWS_LATEST', 'DONE_LOADING_ONE', 'DONE_LOADING_TWO', 'DONE_NEWS_LIST_ROOT'])
				}
	### 	3.5在vue.app的html里显示数据
## 4.状态判断决定是否显示组件
### 4.1判断状态显示
	如果首页两个动画都没有加载的话显示首页的更多按钮
		<button v-show="!DONE_LOADING_ONE && !DONE_LOADING_TWO" @click="LoadMoreNews()" class="load-more-button pl2 pr2 pt1 pb1 mb2 mt1">更多</button>
### 4.2监听显示//1.setInterval 2.状态值BackToTopIsShow
		1.组件<button @click="backToTop" v-show="BackToTopIsShow" class="back-to-top p1">//返回顶部的按钮
		2.页面创建时就创建监听函数：
			created: function() {
				var _this = this
				// 监听页面已滑动的位置，当页面滑动了400px之后，显示“返回顶部”按钮，跟固定在顶部的导航栏
				function backToTop(){
					setInterval(function(){
						if(window.scrollY>400) {
							_this.BackToTopIsShow = true
							_this.ZhihuHeadFixClass= 'ZhihuHeadFixClass-on'
						} else {
							_this.BackToTopIsShow = false
							_this.ZhihuHeadFixClass= 'ZhihuHeadFixClass-none'
						}
					},500)
				}
				backToTop()
				if (!!this.DONE_NEWS_LATEST.stories && this.DONE_NEWS_LATEST.stories.length > 0) {} else {
					this.$store.dispatch('FECTH_NEWS_LATEST')
				}
			}
## 5.路由传值传id
### 5.1设置id值，显示到url
	<router-link :to="{name: 'themes-list', params: {id: item.id}}">
### 5.2到router中查询组件并且返回
### 5.3组件根据url中的id值去fetch数据，通过router，proxy跨域访问获取json数据
	其中const urlBase = '/api/'等效于const urlBase = 'http://news-at.zhihu.com/api/4'前面已经在proxy中配置过了。
			created: function() {
				this.$store.dispatch('FETCH_NEWS_DETAIL', this.$route.params.id)
			}
### 5.3mutation对数据进行处理
### 	5.4通过getter返回数据
## 6.原项目的bug修改
### 	6.1首页点击更多无法加载更多消息（已改）
### 	6.2专题页面点击消息无法加载详情页（已改）
### 	6.3图片加载问题，以NewsDetail为例，原项目图片无法加载，我判断是因为http的缓存问题，点击了url的链接，链接显示错误，我判断原作者加  all.body = all.body.replaceAll('src=\"', 'src=\"http://lovestreet.leanapp.cn/zhihu/resource?url=')
	是为了在别的网页缓存这些图片以便用户端直接显示图片，但是
    http://lovestreet.leanapp.cn/zhihu/resource?url=“图片链接”现在已经失效了我把它去掉了，如果要显示图片需要先打开一下图片的url如专题第一个日常心理学的url：http://pic3.zhimg.com/0e71e90fd6be47630399d63c58beebfc.jpg
    然后刷新页面，那个图片正常显示。但是修复打开页面就直接显示图片我没改好。
## 7.项目简化
### 	7.1修改了ThemeList中的type判断，根据API分析，type作用未知，但是目前我查到的类型type都是为0，所以对原代码进行了判断的简化，即只存在type为0的情况
### 	7.2ZhihuHeadFix我把它去掉了。
### 	7.3刚刚接触webpack肯定对那些代码很陌生，所以我给build config这两个文件夹里的代码加了很多的注释，关于页面热更新，loader处理器，http代理表等等
	详情参照：http://blog.csdn.net/hongchh/article/details/55113751
## 8.vue-cli架构
	参照vue命令行工具
	# 全局安装 vue-cli
	$ npm install --global vue-cli
	# 创建一个基于 webpack 模板的新项目
	$ vue init webpack my-project
	# 安装依赖，走你
	$ cd my-project
	$ npm run dev
	我是直接通过yeoman上的模板创建项目的，结构都差不多吧，该项目因为需要跨域访问知乎api，所以需要配置一下proxy---http代理表，当然了，我觉得用JQuery的JSONP也是可以的。至此该项目学习完毕。
## 9.对webpack作了详细的说明，可看文件夹build和config中的注释
    刚刚接触webpack肯定对那些代码很陌生，所以我给build config这两个文件夹里的代码加了很多的注释，关于页面热更新，loader处理器，http代理表等等
    详情参照：http://blog.csdn.net/hongchh/article/details/55113751
## 10.运行方法/install dependencies(个人比较推荐cnpm，速度快)
	git clone https://github.com/Archer-Fang/hellowVue
	npm install
	npm run dev














