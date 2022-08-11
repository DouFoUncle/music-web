import Vue from "vue";
import Vuex from "vuex";
import { getCache, setCache } from "@/utils/cache.js";
import { login } from "@/api/modules/user.js";
import { getMusicUrl } from "@/api/modules/search.js";
import { saveHistoryInfo } from "@/api/modules/user.js";
import { audio } from "@/plugins/audio/index.js";
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    userInfo: getCache("USER_INFO"),
    cookie: getCache("COOKIE"),
    historyList: getCache("HISTORY") || [],
    paused: true,
    playInfo: getCache("PLAY_INFO") || {},
  },
  mutations: {
    SET_USERINFO(state, val) {
      state.userInfo = val;
      setCache("USER_INFO", val);
    },
    SET_COOKIE(state, cookie) {
      state.cookie = cookie;
    },
    SET_HISROTY(state, val) {
      if (state.historyList.indexOf(val) == -1) {
        state.historyList.unshift(val);
        setCache("HISTORY", state.historyList);
      }
    },
    CLEAR_HISTORY(state) {
      state.historyList = [];
      setCache("HISTORY", []);
    },
    SET_PLAY_INFO(state, playInfo) {
      state.playInfo = playInfo;
      setCache("PLAY_INFO", playInfo);
    },
    SET_PASUED(state, paused) {
      state.paused = paused;
    },
  },
  actions: {
    login({ commit }, userInfo) {
      const timestamp = new Date().getTime();
      return new Promise((resolve, reject) => {
        login({
          phone: "15272345792",
          password: "+qq123456789",
          timestamp: timestamp,
        })
          .then((res) => {
            commit("SET_USERINFO", res.account);
            setCache("COOKIE", res.cookie);
            commit("SET_COOKIE", res.cookie);
            resolve();
          })
          .catch((err) => {
            console.log(err);
            reject(err);
          });
      });
    },
    addHistoryList({ commit }, val) {
      commit("SET_HISROTY", val);
    },
    clearHistoryList({ commit }) {
      commit("CLEAR_HISTORY");
    },
    changePlay({ state, commit, dispatch }, count) {
      if (audio.audiolist.length == 1) {
        audio.operate(0);
        commit("SET_PASUED", false);
        return;
      }
      // audio.changeplay(count);
	  
      let playIndex = audio.audiolist.findIndex(
        (item) => item.id == state.playInfo.id
      );
      let tempIndex = -1;
      if (count === 1) {
        //下一首
        if (playIndex == audio.audiolist.length - 1) {
          tempIndex = 0;
        } else {
          tempIndex = playIndex + 1;
        }
      } else {
        if (playIndex == 0) {
          tempIndex = audio.audiolist.length - 1;
        } else {
          tempIndex = playIndex - 1;
        }
      }
      dispatch("playMusic", audio.audiolist[tempIndex]);
    },
    //从对应歌曲列表中删除 当前歌曲
    removeMusic({ state, commit }, val) {
      let audioList = [...audio.audiolist];
      let index = audioList.findIndex((item) => item.id == val.id);
      audioList.splice(index, 1);
      audio.setAudio(audioList);
      setCache("PLAY_LIST", audioList);
      if (audioList.length == 0) {
        commit("SET_PASUED", true);
        commit("SET_PLAY_INFO", {});
      }
    },

    //播放全部
    async playAllMUsic({ state, commit }, list) {
      audio.setAudio(list);
      setCache("PLAY_LIST", list);
	  if(list[0].id!=state.playInfo.id){
		  audio.operate(0);
		  commit("SET_PLAY_INFO", list[0]);
		  commit("SET_PASUED", false);
	  }
    },

    //点击播放
    async playMusic({ state, commit }, val) {
      let audioList = [...audio.audiolist];
      let index = audioList.findIndex((item) => item.id === val.id);
      //如果当前播放列表不存在当前音乐
      if (index === -1) {
		let userId = uni.getStorageSync('userId')
		saveHistoryInfo({userId,musicId:val.id})
		  
        let playIndex = 0;
		
        if (state.playInfo) {
          playIndex = audioList.findIndex(
            (item) => item.id == state.playInfo.id
          );
        }
		audioList.map(item=>{
			item.src = val.src
			return item
		})
        audioList.splice(playIndex + 1, 0, val);
        audio.setAudio(audioList);
		
        setCache("PLAY_LIST", audioList);
        audio.operate(playIndex === -1 ? 0 : playIndex + 1);
        commit("SET_PLAY_INFO", val);
        commit("SET_PASUED", false);
      } else {
        //如果不存在src
		audioList[index] = val;
		audio.setAudio(audioList);
		setCache("PLAY_LIST", audioList);
		
        audio.operate(index);
        commit("SET_PLAY_INFO", audioList[index]);
        commit("SET_PASUED", false);
      }
    },
  },
});

const getMusic = (id) => {
  return new Promise(async (resolve, reject) => {
    let res = await getMusicUrl({
      id: id,
    });
    let musicList = res.data || [];
    if (musicList.length > 0) {
      resolve(musicList[0]);
    } else {
      uni.showToast({
        title: "暂无该音乐版权",
        icon: "none",
        duration: 2000,
      });
      reject();
    }
  });
};

export default store;
