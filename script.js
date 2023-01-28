//データの配列
let tableData = [
    { name: 'さまよえるオランダ人', rating: 5, check: true, date: '2022-07-01' },
    { name: '山田ちぬ', rating: 3, check: false, date: '2022-07-01' },
    { name: 'ユッスー・ンドゥール', rating: 4, check: true, date: '1959-10-01' }
  ];

//データをJSONで渡す場合
//tableData = JSON.stringify(tableData);

//インスタンス生成
let table = new Tabulator('#example-table', {
data: tableData,   //データの読み込み
autoColumns: true, //自動で列の設定を最適化する
});


//plotly
function plot() {
    let graph = "myDiv";
    let data = [];
    let layout = {};
    let config = {};

    data = [
        {
            x: ['もなか', 'ようかん', 'だんご', 'だいふく', 'すあま'],
            y: [30, 10, 20, 25, 15],
            type: 'bar'
        }
    ];

    Plotly.newPlot(graph, data, layout, config);
}