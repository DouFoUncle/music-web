export const checkLogin = {
	methods: {
		userLogins(){
			return new Promise((resolve,reject)=>{
				uni.getUserProfile({
					desc: '登陆后使用',
					success: async (obj) => {
						uni.showToast({
							icon: 'loading',
							title: "正在登陆",
							duration: 1000 * 60
						})
						uni.login({
							provider: 'weixin',
							success: (res) => {
								if (res.errMsg == 'login:ok') {
									this.$api.login({
										code: res.code
									}).then(loginRes => {
										this.$api.insertOrUpdateUserInfo({
											name: obj.userInfo
												.nickName,
											openId: loginRes.data
												.openid,
											headImg: obj.userInfo
												.avatarUrl
										}).then(res => {
											uni.hideToast()
											resolve(res.data)
											uni.setStorage({
												key:"userId",
												data:res.data.id
											})
											uni.setStorage({
												key:"openId",
												data:res.data.openId
											})
											uni.setStorage({
												key:"name",
												data:res.data.name
											})
											uni.setStorage({
												key:"headImg",
												data:res.data.headImg
											})
											uni.setStorage({
												key:"USER_INFO",
												data:JSON.stringify(res.data)
											})
										})
									})
								}
							}
						})
				
					},
					fail() {
						uni.showToast({
							icon:"error",
							title:'授权取消！',
							duration:2000
						})
					}
				})
			})
			
			
		}
	}
}