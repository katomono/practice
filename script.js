function main() {
    $(window).resize(function () {
        $("#CardList").tabulator("redraw");
    });

    baseTime = new Date();
    var tsvUrl = "yugioh_card_db.tsv"

    d3.tsv(tsvUrl, function (error, data) {
        $("#CardList").tabulator({
            //height:"320px",
            fitColumns: true,
            columns: getColumns(data)
        });
        $("#CardList").tabulator("setData", data);

        plotSmallWorld(data.filter(function (card) {
            return card["分類"] == "効果";
        }).slice(1, 20))

    });


}

$.get("https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=1&cgid=47d27d3bf59d0cfe3945a4f7cf5ede94&dno=1&request_locale=ja", function(html) { 
	console.log(html); 
});

let nameText = document.getElementById('deckURL')
nameText.value = 'https://www.db.yugioh-card.com/yugiohdb/member_deck.action?ope=1&cgid=47d27d3bf59d0cfe3945a4f7cf5ede94&dno=1&request_locale=ja'
let checkButton = document.getElementById('checkButton')
$(document).ready(function () {
    $("#checkButton").click(function () {
        console.log("data")
        console.log(nameText.value)
        $.ajax({
            type: "GET",
            url: nameText.value,
            dataType: "text"
        }).done(function (res) {
            // Your `success` code
            console.log("aaa")
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("AJAX call failed: " + textStatus + ", " + errorThrown);
        });
    });
});


function plotSmallWorld(data) {

    let size = data.length
    var relation = {}
    for (let i = 0; i < size; i++) {
        relation[i] = []
    }
    for (let i = 0; i < size; i++) {
        for (let k = i + 1; k < size; k++) {
            var count = 0
            if (data[i]["属性"] == data[k]["属性"]) {
                count += 1
            }
            if (data[i]["種族"] == data[k]["種族"]) {
                count += 1
            }
            if (data[i]["レベル"] == data[k]["レベル"]) {
                count += 1
            }
            if (data[i]["攻撃力"] == data[k]["攻撃力"]) {
                count += 1
            }
            if (data[i]["守備力"] == data[k]["守備力"]) {
                count += 1
            }
            if (count == 1) {
                relation[i].push(k)
                relation[k].push(i)
            }
        }
    }
    var tickvals1 = []
    var tickvals2 = []
    var tickvals3 = []
    for (let t1 = 0; t1 < size; t1++) {
        var rsize1 = relation[t1].length
        for (let i = 0; i < rsize1; i++) {
            var t2 = relation[t1][i]
            var rsize2 = relation[t2].length
            for (let k = 0; k < rsize2; k++) {
                let t3 = relation[t2][k]
                tickvals1.push(t1)
                tickvals2.push(t2)
                tickvals3.push(t3)
            }
        }
    }

    const make_range_array = (start, end) => [...Array((end - start) + 1)].map((_, i) => start + i);
    var names = unpack(data, "名称")
    var layout = {
        height: 200 + data.length * 30,
        margin: {
            autoexpand: false,
            l: 250
        }
    };
    var trace = {
        type: 'parcoords',
        line: {
            width: 1
        },
        unselected: {
            line: {
                color: "#00007f",
                opacity: 0.05
            }
        },
        tickfont: {
            color: "#9f3333",
            size: 15,
            family: "Balto"
        },

        dimensions: [
            {
                range: [0, names.length - 1],
                label: '名称',
                values: tickvals1,
                tickvals: make_range_array(0, names.length - 1),
                ticktext: names,
                multiselect: false
            },
            {
                range: [0, names.length - 1],
                label: '名称',
                values: tickvals2,
                tickvals: make_range_array(0, names.length - 1),
                ticktext: names
            },
            {
                range: [0, names.length - 1],
                label: '名称',
                values: tickvals3,
                tickvals: make_range_array(1, names.length - 1),
                ticktext: names,
                multiselect: false
            }
        ]
    };

    var data = [trace]

    Plotly.newPlot('SmallWorld', data, layout);
}

function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

//列ごとに配列を取得
function getColumns(data) {
    columns = [];
    var keys = d3.entries(data[0]);
    for (var i = 0; i < keys.length; i++) {
        columns.push(getColumn(keys[i].key));
        console.log(keys[i]);
    }
    return columns;
}
//列のヘッダをキーととして値を配列として取得
function getColumn(key) {
    var column = {};
    column["title"] = key;
    column["field"] = key;
    if ("cid" == key) {
        column["sorter"] = "integer";
        column["visible"] = false;
    } else if ("IdOnGitHub" == key) {
        column["sorter"] = "integer";
        column["visible"] = false;
    } else if ("Name" == key) {
        column["width"] = "30%";
        column["title"] = "リポジトリ名";
        column["formatter"] = repo_link_formatter;
    } else if ("Description" == key) {
        column["width"] = "50%";
        column["title"] = "説明";
        column["formatter"] = homepage_link_formatter;
    } else if ("Homepage" == key) {
        column["visible"] = false;
    } else if ("CreatedAt" == key) {
        column["title"] = "作成";
        column["formatter"] = CreatedAt_formatter;
    } else if ("PushedAt" == key) {
        column["title"] = "Push";
        column["formatter"] = PushedAt_formatter;
    } else if ("UpdatedAt" == key) {
        column["title"] = "更新";
        column["formatter"] = UpdatedAt_formatter;
    } else { }
    return column;
}

//   var repo_link_formatter = function(value, data, cell, row, options, formatterParams){
//     return getATagString(data, text=data["Name"], href=getRepoUrl(data), title="");
//   }
//   var homepage_link_formatter = function(value, data, cell, row, options, formatterParams){
//     return "<a href=\""+data["Homepage"]+"\">"+data["Description"]+"</a>";
//   }
//   var CreatedAt_formatter = function(value, data, cell, row, options, formatterParams){
//     return getSpanTagString(data["CreatedAt"]);
//   }
//   var PushedAt_formatter = function(value, data, cell, row, options, formatterParams){
//     return getSpanTagString(data["PushedAt"]);
//   }
//   var UpdatedAt_formatter = function(value, data, cell, row, options, formatterParams){
//     return getSpanTagString(data["UpdatedAt"]);
//   }

//   function getSpanTagString(date)
//   {
//     return "<span title=\""+ date +"\">" + abs2rel(baseTime, new Date(date)) + "前"+ "</span>";
//   }
//   function getATagString(data, text, href, title="")
//   {
//     return "<a href=\""+href+"\" title=\""+title+"\">"+text+"</a>";
//   }

//   function getRepoUrl(data)
//   {
//     var user = "ytyaru";
//     return "https://github.com/" + user + "/" + data["Name"];
//   }

//   function formatDate(date, format)
//   {
//       if (!format) format = 'yyyy-MM-dd HH:mm:ss.fff';
//       format = format.replace(/yyyy/g, date.getFullYear());
//       format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
//       format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
//       format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
//       format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
//       format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
//       if (format.match(/f/g)) {
//           var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
//           var length = format.match(/f/g).length;
//           for (var i = 0; i < length; i++) format = format.replace(/f/, milliSeconds.substring(i, i + 1));
//       }
//       return format;
//   }
//   // 日付の相対表記（yyyy-MM-ddTHH:mm:ssZ→n日）
//   function abs2rel(baseDate, targetDate)
//   {
//       var elapsedTime = Math.ceil((baseDate.getTime() - targetDate.getTime())/1000);
//       if (elapsedTime < 60) { return (elapsedTime / 60) + "秒"; }
//       else if (elapsedTime < (60 * 60)) { return Math.floor(elapsedTime / 60) + "分"; }
//       else if (elapsedTime < (60 * 60 *24)) { return Math.floor(elapsedTime / 60 / 60) + "時間"; }
//       else if (elapsedTime < (60 * 60 *24 * 7)) { return Math.floor(elapsedTime / 60 / 60 / 24) + "日"; }
//       else if (elapsedTime < (60 * 60 *24 * 30)) { return Math.floor(elapsedTime / 60 / 60 / 24 / 7) + "週"; }
//       else if (elapsedTime < (60 * 60 *24 * 365)) { return Math.floor(elapsedTime / 60 / 60 / 24 / 30) + "ヶ月"; }
//       else if (elapsedTime < (60 * 60 *24 * 365 * 100)) { return Math.floor(elapsedTime / 60 / 60 / 24 / 365) + "年"; }
//       else { return Math.floor(elapsedTime / 60 / 60 / 24 / 365 / 100) + "世紀"; }
//   }
//   }
