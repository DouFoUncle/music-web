<template>
	<view class="recommend-container page-background">
		<view class="bg-white">
			<cu-custom bgColor="#fff">
				<view slot="content" style="color: #000">Homic 音乐</view>
			</cu-custom>
			<view class="cu-bar search">
				<view class="search-form round">
					<text class="cuIcon-search"></text>
					<input type="text" placeholder="搜索音乐 / 歌词" confirm-type="search" @click="toSearch" />
				</view>
			</view>
		</view>
		<scroll-view :style="{ height: height }" class="main-container" scroll-y>
			<view class="bg-white">
				<view class="banner-wrapper">
					<swiper class="screen-swiper square-dot" style="min-height: 317upx;" :indicator-dots="true"
						:circular="true" :autoplay="true" interval="5000" duration="500">
						<swiper-item v-for="item in swiperList" :key="item.id">
							<image :src="item.fileUrl" mode="scaleToFill" class="banner-img"></image>
						</swiper-item>
					</swiper>
				</view>
				<view class="list-wrapper flex">
					<view class="cu-item flex-sub list-item" v-for="(item, index) in listOption" :key="item.ico"
						@click="handleNative(item.url)">
						<view :class="'iconfont list-ico basic-icon-color icon-' + item.ico"></view>
						<text class="list-title basic-weight-color">{{ item.name }}</text>
					</view>
				</view>
			</view>
			<view class="musicList">
				<box-title title="单曲" buttonName="播放全部" iconName="kaishi2" @handlePlay="handlePlayAllMusic"></box-title>
				<scroll-view scroll-y scroll-with-animation @scrolltolower="reachBottom()"
					:style="{ height: height, 'margin-top': '10px' }">
					<view class="music-item flex" :class="{ active: item.id == playInfo.id }"
						v-for="(item, index) in musicList" :key="index" @click="handlePlayMusic(item)">
						<image
							:src="item.imgUrl"
							mode="widthFix" class="music-img"></image>
						<view class="music-info">
							<view class="music-name text-overflow">{{ item.musicName }}</view>
							<view class="music-singer text-overflow flex">
								<span class="small-icon">{{ item.id % 2 == 0 ? 'SQ' : 'HD' }}</span>
								{{ item.musicName }} - {{ item.singerName }}
							</view>
						</view>
					</view>
					<view class="loading" v-if="status == 'loading' || status == 'notMore'">
						{{ status == 'notMore' ? '没有更多了' : '努力加载中...' }}
					</view>
				</scroll-view>
			</view>
		</scroll-view>
		<tab-bar currentPage="home" />
	</view>
</template>

<script>
	import {
		checkLogin
	} from '@/utils/mixin.js'
	import {
		getImage,
		getName
	} from '@/utils/index.js';
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				//轮播图
				swiperList: [],
				recommendList: [],
				dayRecommendList: [],
				dayRecommendMusicList: [],
				newSongList: [],
				hotSingerList: [],
				selectData: [],

				musicList: [],
				listOption: [{
						name: '全部歌曲',
						ico: 'xihuan',
						url: '../dayRecommend/index'
					},
					{
						name: '热门歌手',
						ico: 'maikefeng',
						url: '../singer/index'
					}
				]
			};
		},
		computed: {
			...mapState({
				playInfo: state => state.playInfo
			}),
			cookie() {
				return this.$store.state.cookie;
			},
			height() {
				let height = this.CustomBar / (uni.upx2px(this.CustomBar) / this.CustomBar) + 220;
				return `calc(100%  - ${height}rpx)`;
			}
		},
		created() {
			this.getData();
		},
		onPullDownRefresh() {
			this.getData();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		mixins: [checkLogin],
		methods: {
			getData() {
				this.getBannerData();
				this.getMusicLists()
			},

			handleNative(val) {
				uni.getStorage({
					key: "userId",
					success: () => {
						uni.navigateTo({
							url: val
						});
					},
					fail: () => {
						this.userLogins().then(res => {
							uni.navigateTo({
								url: val
							});
						})
					}
				})

			},

			// 获取轮播图数据
			async getBannerData() {
				const data = await this.$api.getBanner();
				this.swiperList = data.data || [];
			},

			// 获取音乐列表
			async getMusicLists() {
				const data = await this.$api.getMusicList();
				this.musicList = data.data || [];
				this.status = 'notMore'
			},


			//播放全部
			handlePlayAllMusic() {
				uni.getStorage({
					key: "userId",
					success: () => {
						const list = this.musicList.map(item => {
							return {
								src: item.fileUrl,
								title: item.musicName,
								singer: getName(item),
								coverImgUrl: getImage(item),
								id: item.id
							};
						});
						this.$store.dispatch('playAllMUsic', list);
					},
					fail: () => {
						this.userLogins().then(res => {
							const list = this.musicList.map(item => {
								return {
									src: item.fileUrl,
									title: item.musicName,
									singer: getName(item),
									coverImgUrl: getImage(item),
									id: item.id
								};
							});
							this.$store.dispatch('playAllMUsic', list);
						})
					}
				})
			},
			//点击播放
			handlePlayMusic(val) {
				uni.getStorage({
					key: "userId",
					success: () => {
						if (this.playInfo.id == val.id) {
							uni.navigateTo({
								url: '../play/index'
							});
							return;
						}
						this.$store.dispatch('playMusic', {
							src: val.fileUrl,
							title: val.musicName,
							singer: getName(val),
							coverImgUrl: getImage(val),
							id: val.id
						});
					},
					fail: () => {
						this.userLogins().then(res => {
							if (this.playInfo.id == val.id) {
								uni.navigateTo({
									url: '../play/index'
								});
								return;
							}
							this.$store.dispatch('playMusic', {
								src: val.fileUrl,
								title: val.musicName,
								singer: getName(val),
								coverImgUrl: getImage(val),
								id: val.id
							});
						})
					}
				})
			},
			toSearch() {
				uni.getStorage({
					key: "userId",
					success: () => {
						uni.navigateTo({
							url: '../search/index'
						});
					},
					fail: () => {
						this.userLogins().then(res => {

							uni.navigateTo({
								url: '../search/index'
							});
						})
					}
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	.recommend-container {
		position: relative;
		height: 100%;

		.main-container {
			position: relative;

			.banner-wrapper {
				box-sizing: border-box;
				padding: 10px;

				.banner-img {
					height: 158px;
					border-radius: 6px;
				}
			}

			.list-wrapper {
				margin-top: 8px;
				padding-bottom: 12px;

				.list-item {
					text-align: center;
					font-size: 24rpx;
				}

				.list-ico {
					font-size: 72rpx;
					margin-bottom: 6px;
				}

				.list-title {
					font-size: 28rpx;
				}
			}

			.music-wrapper {
				margin-top: 5px;
				background: #fff;
				box-sizing: border-box;
				padding: 10px;

				&:last-of-type {
					margin-bottom: 0;
				}
			}
		}
	}

	.musicList {
		width: 100%;
		position: relative;
		margin-top: 20rpx;
		padding-bottom: 20rpx;
		background-color: #fff;
		.music-item {
			height: 70px;
			box-sizing: border-box;
			padding: 0 20px;
			align-items: center;
			margin-bottom: 10px;

			&:last-of-type {
				margin-bottom: 0;
			}

			&.active {
				.music-info {

					.music-name,
					.small-icon,
					.music-singer {
						color: #f84e51 !important;
					}
				}
			}

			.music-img {
				width: 58px;
				border-radius: 6px;
			}

			.music-info {
				margin-left: 15px;
				max-width: calc(100% - 80px);

				.music-name {
					font-size: 30rpx;
					margin-bottom: 7px;
					color: #000;
				}

				.music-singer {
					color: rgba(0, 0, 0, 0.5);
					font-size: 24rpx;
					align-items: center;
					width: 100%;

					.small-icon {
						margin-right: 6px;
						transform: scale(0.9);
						color: rgba(0, 0, 0, 0.5);
						font-size: 12px;
						padding: 1px 3px;
						border: 1px solid rgba(0, 0, 0, 0.2);
						border-radius: 4px;
					}
				}
			}
		}
	}


	.music-control {
		position: relative;
		bottom: 170rpx;
	}
</style>
