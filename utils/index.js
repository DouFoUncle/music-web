/**
 * 防抖
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
}

/**
 * 将数字显示为 xx万或xx亿
 * @param {String} 
 * @return {String}
 */

export function filterPlayCount(val) {
	if (!val || val <= 0) return 0;
	else if (val < 1000) return val;
	else if (val >= 1000 && val < 10000) return Math.ceil(val / 1000) + '千';
	else if (val >= 10000 && val < 100000000) return Math.ceil(val / 10000) + '万';
	return Math.ceil(val / 100000000) + '亿';
}

/**
 * 图片路径
 * @param {Object} 
 * @return {String}
 */

export function getImage(val) {
	// let img = '';
	// if ((val.imgUrl || '') !='') {
	// 	img = val.imgUrl;
	// } else {
	// 	img = 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic.51yuansu.com%2Fpic3%2Fcover%2F02%2F03%2F25%2F599da0aef2dd1_610.jpg&refer=http%3A%2F%2Fpic.51yuansu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1653215196&t=d4afe213c897e52698bc78c6e6cf068c';
	// }
	return val.imgUrl
}

/**
 * 作者
 * @param {Object} 
 * @return {String}
 */

export function getName(val) {
	if (val.singerName) {
		return val.singerName;
	}else{
		return val.singer;
	}
}
