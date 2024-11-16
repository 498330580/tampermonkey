'use strict';   //严格模式

// @match        *://www.sis001.com/forum/forum-*-*.html
// @match        *://www.sis001.com/bbs/forum-*-*.html
// @match        *://www.sis001.com/forum/thread-*-*-*.html
// @match        *://www.sis001.com/forum/search.php*
// @match        *://www.sis001.com/forum/index.php
// @match        *://www.sis001.com/forum/forumdisplay.php?fid=*&page=*

// 公共变量
// const host = "http://sis001.yaoling.ltd:8000/"     // 这里填写你后端的地址
// const host = "http://127.0.0.1:8000/"     // 这里填写你后端的地址
const host = "http://192.168.200.3:8000/"     // 这里填写你后端的地址
const token = "27171cc46f6bda2668ca755810635e577f600fa4"      // 这里填写你后端的token
const url = window.location.href;     // 获取当前页网址
const xiaosuo_list = ["人妻意淫区", "文学作者区", "原创人生区", "原创人生区（征文主题发布区）", "旧文展览馆", "乱伦迷情区", "武侠玄幻区", "重口另类区", "长篇收藏区", "征文活动区"]   // 小说板块名称列表  "藏书管理区", 
const img_list = [""]   // 图片板块名称列表

// 去除头顶广告
function ad_del() {
    $(".ad_text").remove();
    $(".legend").remove();
    // document.getElementById("ad_text").remove();
}

// 判断是否为详情页
async function is_thread() {
    if (url.indexOf("thread-") != -1) {
        console.log("当前为详情页")
    }
    return url.indexOf("thread-") != -1
}

// 判断是否为列表页
async function is_forum() {
    if (url.indexOf("forum-") != -1) {
        console.log("当前为列表页")
    }
    return url.indexOf("forum-") != -1
}

// 判断是否为搜索页
async function is_search() {
    if (url.indexOf("search.php") != -1) {
        let gjz = document.querySelector("#wrapper > div:nth-child(1) > form > div > table:nth-child(3) > tbody > tr:nth-child(1) > th > label")    // 查找“关键字”文本是否存在
        if (gjz) {
            console.log("当前为搜索请求页")
            return false
        } else {
            console.log("当前为搜索结果页")
            return true
        }
    } else {
        return false
    }
}

// 判断板块类型
// 内容页类型的判断
async function is_thread_type() {
    // 判断是否为二级板块
    let name = ""
    let leve2 = document.querySelector("#nav > a:nth-child(3)")
    if (leve2) {
        console.log(`当前为二级板块${leve2.textContent}`)
        name = leve2.textContent
    } else {
        leve1 = document.querySelector("#nav > a:nth-child(2) > span")
        if (leve1) {
            name = leve1.textContent
        } else {
            name = document.querySelector("#nav > a:nth-child(2)").textContent
        }
        console.log(`当前为一级板块${name}`)
    }

    if (xiaosuo_list.indexOf(name) >= 0) {
        return "xiaosuo"
    }
    if (img_list.indexOf(name) >= 0) {
        return "img"
    }
    return false
}
// 列表页类型的判断
async function is_forum_type() {
    let data = document.querySelector("#nav > p:nth-child(1)")

    for (let index = data.childNodes.length - 1; index < data.childNodes.length; index--) {
        const element = data.childNodes[index].textContent.replace("»", "").replace(/(^\s*)|(\s*$)/g, "");
        if (xiaosuo_list.indexOf(element) >= 0 || img_list.indexOf(element) >= 0) {
            return true
        }
    }
    return false
}

// 列表页识别
async function list() {
    var content = document.getElementsByName("moderate");   //获取内容
    var tables = content[0].getElementsByTagName("table");  //获取所有table标签

    for (let i = 0; i < tables.length; i++) {
        if (tables[i].id) {
            let table = tables[i];
            let bs = table.getElementsByTagName("b");
            if (bs.length) {
                if (bs[0].innerText == "推荐主题" || bs[0].innerText == "版块主题") {
                    let spans = tables[i].getElementsByTagName("span");
                    for (let index = 0; index < spans.length; index++) {
                        if (spans[index].id) {
                            let a_data = spans[index].getElementsByTagName("a")[0]
                            let get_url = a_data.href
                            GM_xmlhttpRequest({
                                url: host + "api/panduan?type=xiaosuo&url=" + get_url,
                                method: "GET",
                                anonymous: true,
                                headers: {
                                    "Content-type": "application/json",
                                    "Authorization": "Token " + token
                                },
                                onload: function (xhr) {
                                    // console.log(xhr)
                                    let data = JSON.parse(xhr.responseText)
                                    if (data["mess"] != "错误，未传递URL") {
                                        let xs = data["data"]["xiaosuo"]
                                        let ls = data["data"]["lishi"]
                                        if (xs) {
                                            a_data.innerHTML += '<i class="iconfont icon-yikanwan" style="color:#43CD80;font-size:75%;" title="已保存"></i>';
                                        } else {
                                            a_data.innerHTML += '<i class="iconfont icon-bianzu24" style="color:#000000;font-size:75%;" title="未保存"></i>';
                                        }
                                        if (ls) {
                                            a_data.innerHTML += '<i class="iconfont icon-yikan" style="color:#43CD80;font-size:75%;" title="已浏览"></i>';
                                        } else {
                                            a_data.innerHTML += '<i class="iconfont icon-weikan" style="color:#000000;font-size:75%;" title="未浏览"></i>';
                                        }
                                    } else {
                                        console.log("错误，未传递URL");
                                    }
                                }
                            });
                        }
                    }
                }
            }

        }
    }
}

// 搜索页识别
async function search() {
    var tbodys = document.getElementsByTagName("tbody");
    for (let i = 0; i < tbodys.length; i++) {
        let tbody = tbodys[i];
        let a = tbody.getElementsByTagName("th")[0].getElementsByTagName("a")[0]
        let url = a.href
        let bankuai_name = tbody.querySelector("tbody > tr > td.forum > a").textContent
        if (xiaosuo_list.indexOf(bankuai_name) >= 0 || img_list.indexOf(bankuai_name) >= 0) {
            GM_xmlhttpRequest({
                url: host + "api/panduan?type=xiaosuo&url=" + url,
                method: "GET",
                anonymous: true,
                headers: {
                    "Content-type": "application/json",
                    "Authorization": "Token " + token
                },
                onload: function (xhr) {
                    let data = JSON.parse(xhr.responseText)
                    if (data["mess"] != "错误，未传递URL") {
                        let xs = data["data"]["xiaosuo"]
                        let ls = data["data"]["lishi"]
                        if (xs) {
                            a.innerHTML += '<i class="iconfont icon-yikanwan" style="color:#43CD80;font-size:75%;" title="已保存"></i>';
                        } else {
                            a.innerHTML += '<i class="iconfont icon-bianzu24" style="color:#000000;font-size:75%;" title="未保存"></i>';
                        }
                        if (ls) {
                            a.innerHTML += '<i class="iconfont icon-yikan" style="color:#43CD80;font-size:75%;" title="已浏览"></i>';
                        } else {
                            a.innerHTML += '<i class="iconfont icon-weikan" style="color:#000000;font-size:75%;" title="未浏览"></i>';
                        }
                    } else {
                        console.log("错误，未传递URL");
                    }
                }
            });
        }
    }
}

// 判断详情页是否保存、与浏览
function is_save_thread(h1) {
    GM_xmlhttpRequest({
        url: host + "api/panduan?type=xiaosuo&url=" + url,
        method: "GET",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: async function (xhr) {
            let data = JSON.parse(xhr.responseText)
            if (data["mess"] != "错误，未传递URL") {
                let xs = data["data"]["xiaosuo"]
                let ls = data["data"]["lishi"]

                // 判断当前账户是否收藏过该书籍
                if (xs) {
                    console.log("书籍已收藏");
                    h1.innerHTML += '<i class="iconfont icon-yikanwan" style="color:#43CD80;font-size:75%;" title="已保存"></i>';
                    document.getElementById("save").remove();
                } else {
                    console.log("书籍未收藏");
                    h1.innerHTML += '<i class="iconfont icon-bianzu24" style="color:#000000;font-size:75%;" title="未保存"></i>';
                    await addbook()
                }

                // 判断当前账户是否已浏览过该网址
                if (ls) {
                    h1.innerHTML += '<i class="iconfont icon-yikan" style="color:#43CD80;font-size:75%;" title="已浏览"></i>';
                    console.log("浏览记录已存在");
                } else {
                    console.log("浏览记录不存在");
                    await add_lishi(h1)
                }
            } else {
                console.log("错误，未传递URL");
            }
        }
    });
}

// 判断book是否已存在于数据库中
async function addbook() {
    //检查数据库中该章节记录是否存在
    GM_xmlhttpRequest({
        url: host + "api/v1/zhangjie?url=" + url,
        method: "GET",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            if (JSON.parse(xhr.responseText)["count"] == 0) {
                // 数据库中该章节记录不存在（显示提交按钮的情况）
                console.log("数据库中不存在章节记录", url);
                if (document.getElementById("book")) {
                    document.getElementById("book").remove();
                }
            } else {
                // 数据库中该章节记录存在(显示收藏按钮的情况)
                console.log("数据库中已存在章节记录");
                if (document.getElementById("zhangjie")) {
                    document.getElementById("zhangjie").remove();
                }
            }
        }
    })
}

// 章节保存
function savexiaosuo(title_name) {
    let type = document.getElementById("select_type").value
    let index = document.getElementById("indexdata").value
    let book_name = document.getElementById("book1").value

    GM_xmlhttpRequest({
        url: host + "api/add_zhangjie?type=save",
        method: "POST",
        data: JSON.stringify({ "book_name": book_name, "index": index, "url": url, "type": type, "title_name": title_name }),
        dataType: "json",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            let data = JSON.parse(xhr.responseText)
            if (data["data"]) {
                console.log("章节：", title_name, `保存成功---${data["mess"]}`);
                alert("保存成功！");
                document.getElementById("save").remove();
                document.getElementsByClassName("iconfont icon-bianzu24")[0].remove()
                document.getElementsByName("modactions")[0].getElementsByTagName("h1")[0].innerHTML += '<i class="iconfont icon-yikanwan" style="color:#43CD80;font-size:75%;" title="已保存"></i>';
            } else {
                console.log("章节：", title_name, `保存失败---${data["mess"]}`);
                alert("保存失败！");
            }
        }
    })
}

// 收藏章节
function shoucang() {
    let book_name = document.getElementById("book1").value
    GM_xmlhttpRequest({
        url: host + "api/add_zhangjie?type=save",
        method: "POST",
        data: JSON.stringify({ "url": url }),
        dataType: "json",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            let data = JSON.parse(xhr.responseText)
            if (data["data"]) {
                console.log("书籍：", book_name, `收藏成功---${data["mess"]}`);
                alert("收藏成功！");
                document.getElementById("save").remove();
                document.getElementsByClassName("iconfont icon-bianzu24")[0].remove()
                document.getElementsByName("modactions")[0].getElementsByTagName("h1")[0].innerHTML += '<i class="iconfont icon-yikanwan" style="color:#43CD80;font-size:75%;" title="已保存"></i>';
            } else {
                console.log("书籍：", book_name, `收藏失败---${data["mess"]}`);
                alert("收藏失败！");
            }
        }
    })
}

// 判断并添加浏览记录
async function add_lishi(html) {
    GM_xmlhttpRequest({
        url: host + "api/add_lishi?url=" + url,
        method: "GET",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            let data = JSON.parse(xhr.responseText)
            if (data["data"]) {
                html.innerHTML += '<i class="iconfont icon-weikan" id="not_look" style="color:#000000;font-size:75%;" title="未浏览"></i>';
                console.log("添加历史记录成功：", data["mess"])
            } else {
                console.log("添加历史记录失败：", data["mess"])
            }
        }
    })
}

// 处理标题中的数字(异步转同步)
function get_cn2an(title_name) {
    return new Promise(res => {
        GM_xmlhttpRequest({
            url: host + "api/cn2an?text=" + title_name,
            method: "GET",
            anonymous: true,
            headers: {
                "Content-type": "application/json",
                "Authorization": "Token " + token
            },
            onload: function (xhr) {
                res(xhr)
            }
        })
    })
}


// 以下部分还未修改
// 章节储存
function zhangjiesave(data, b_id) {
    // 书籍加入用户收藏
    GM_xmlhttpRequest({
        url: host + "api/v1/user_coll?collect=true&collection=" + b_id,
        method: "GET",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            if (JSON.parse(xhr.responseText)["count"] == 0) {



            }
        }
    })


    // 章节储存
    GM_xmlhttpRequest({
        url: host + "api/v1/zhangjie?url=" + url,
        method: "GET",
        anonymous: true,
        headers: {
            "Content-type": "application/json",
            "Authorization": "Token " + token
        },
        onload: function (xhr) {
            if (JSON.parse(xhr.responseText)["count"] == 0) {

            } else {
                console.log("章节已存在");
            }
        }
    })
}

(async function () {
    console.log("sis001脚本运行")
    let is_xq = await is_thread()        // 详情页判断
    let is_list = await is_forum()      // 列表页判断
    let is_sousuo = await is_search()      // 搜索页判断

    document.getElementsByTagName("head")[0].innerHTML += '<link rel="stylesheet" href="//at.alicdn.com/t/font_2616980_8iw3dgaotf4.css">';  // 加入样式

    // 列表页部分
    if (is_list) {
        let is_list = await is_forum_type()
        if (is_list) {
            console.log("开始识别列表");
            await list();
            console.log("列表页识别完成");
        }
    }

    // 搜索页部分
    if (is_sousuo) {
        console.log("开始识别搜索结果");
        await search();
        console.log("搜索结果识别完成");
    }

    // 内容页部分
    if (is_xq) {
        ad_del();   // 去除头部广告
        let type = await is_thread_type()    // 判断页面类型
        let book_name = ""  // 标题初始化
        let index_int = 1   // 序号初始化
        if (type) {
            console.log("开始识别内容")
            // 添加按钮
            // console.log("添加按钮")
            document.getElementById("foruminfo").innerHTML += `<br><div id="save" style="border: 2px solid lightblue;text-align:center;border-style: outset;background-color: lightblue;padding: 5px;">
            <div id="zhangjie">
            <i class="iconfont icon-leibie" title="保存的数据类别">类别：</i>
            <select name="public-choice" id="select_type" style="width:149px;height:25px;text-align:center;text-align-last:center;"><option value=0>无</option></select>
            <i class="iconfont icon-xuhao" title="建议填写当前的开始章号">序号:</i>
            <input type="number" id="indexdata" style="text-align:center;text-align-last:center;">
            <i class="iconfont icon-book" title="想要收集到那本书下面">书籍：</i>
            <input id="book1" type="text" style="width:200x;">
            <button id="but_save" class="iconfont icon-baocun" style="font-size:100%;">提交</button>
            </div>
            <div id="book">
            <i class="iconfont icon-book" title="想要收集到那本书下面">书籍：</i>
            <input id="book2" type="text" style="width:200x;" disabled="disabled">
            <button class="iconfont icon-baocun" style="font-size:100%;" id="shouchang">收藏</button>
            </div>
            </div>`

            // 添加类别
            // console.log("添加类别")
            var select_type = document.getElementById("select_type")
            select_type.options.add(new Option("小说", 1))
            select_type.options.add(new Option("图片", 2))
            if (type == "xiaosuo") {
                select_type.value = 1
            }
            if (type == "img") {
                select_type.value = 2
            }
            
            // 获取章节标题、标签
            // let title = document.querySelector("#wrapper > div:nth-child(1) > form:nth-child(9) > div:nth-child(2) > h1")
            let title = document.querySelector("#wrapper > div:nth-child(1) > form > div:nth-child(2) > h1")
            // 标签
            // let title_tag = title.childNodes[0].textContent.replace(/(^\s*)|(\s*$)/g, "").replace("[", "").replace("]", "")
            // 标题
            let title_name = "未识别"
            try {
                title_name = title.childNodes[1].textContent.replace(/(^\s*)|(\s*$)/g, "")
            } catch (error) {
                title_name = title.textContent.replace(/(^\s*)|(\s*$)/g, "")
            }
            
            // 转换标题中的序号
            // let title_name_to_data = await get_cn2an(title_name)
            // console.log(title_name_to_data)
            // if (title_name_to_data.status == 200) {
            //     title_name = JSON.parse(title_name_to_data.responseText)["data"]
            // }
            // 提取标题中的书本名，并写入页面
            if (/【(.*?)】/ig.exec(title_name)) {
                book_name = /【(.*?)】/ig.exec(title_name)[1];
            }
            document.getElementById("book1").value = book_name
            document.getElementById("book2").value = book_name
            // 提取标题中的序号，并写入页面
            if (/\d+[\.]\d+|\d+/ig.exec(title_name)) {
                index_int = parseInt(/(\d+[\.]\d+|\d+)/ig.exec(title_name)[1])
            }
            document.getElementById("indexdata").value = index_int

            // 绑定提交按钮
            console.log("绑定提交按钮")
            document.getElementById("but_save").addEventListener("click", () => {
                savexiaosuo(title_name)
            })
            console.log("绑定收藏按钮")
            document.getElementById("shouchang").addEventListener("click", () => {
                shoucang()
            })

            let h1 = document.getElementsByName("modactions")[0].getElementsByTagName("h1")[0];     // 获取要添加图标区域(表示是否浏览和保存的区域)
            await is_save_thread(h1)    // 判断当前页面是否浏览与保存，如未浏览则加入浏览，未保存则保存，如其他人已保存，则加入自己的收藏
            console.log("内容识别完成")
        }
    }

})();