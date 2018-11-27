'use strict';

const tokenise = module.exports = function(series) {
    const [query, child, chars] = [
        tokenise.query, 
        tokenise.preset.children, 
        tokenise.preset.chars
    ],
    re = new RegExp(`([\\${ child.join('\\') }]|[${ chars }]+|[^\\${
        child.join('\\') + chars
    } ]+)`, 'g'),
    cache = [series.match(re)];
    let cur;
    // 使用循环取代递归，避免在不确定递归深度的情况下使用非尾部递归/非尾部调用
    while(cur = cache.shift()) {
        const ind = cur.index,
            coor = query(cur, ind ? ind : 0);
        if(!coor) return null;
        if(!coor.length) {
            const first = cache[0];
            if(!first) break;
            first.splice(first.index, 0, cur);
            continue;
        }
        const ar = cur.splice(coor[0], coor[1] - coor[0] + 1);
        cur.index = coor[0];
        cache.unshift(ar.slice(1, ar.length - 1), cur);
    }
    return cur ? cur : [];
};

// 匹配第一个(XXXXXX)对应的索引对，内容中可能包含其他分组
tokenise.query = function(ar, start) {
    const [left, right] = tokenise.preset.children,
        coor = [];
    let n = 0;
    for(let i = start; n >= 0 && i < ar.length; i++) {
        const cur = ar[i];
        (cur === left && !n++) && (coor.push(i));
        (cur === right && !--n) && (coor.push(i));
    }
    return n ? null : coor;
};

tokenise.preset = {
    children: ['(', ')'],
    chars: '!#\\$%&\\*\\+-\\/<=>@\\^_\\.,;'
};