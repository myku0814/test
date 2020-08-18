// for <input type="file">

// document.getElementById('upload').addEventListener('change', function(e) {
//     console.log(e);
//     const reader = new FileReader();
//     reader.readAsText(e.target.files[0]);
//     reader.onload = function() {
//         console.log(reader.result);
//         let value = reader.result.split("/\s*\,\s*/");
//         console.log(value);
//         document.getElementById('fileContent').value = value;
//     };
// });

// for drop
// 需要定義 dragover 事件，並設定 preventDefault()
// 如果沒有定義，會在觸發 Drop 事件之前就把檔案開啟了
let _fileName = "";
let _content = [];
let xRangeMin = 0;
let xRangeMax = 1090;

document.querySelectorAll('.range').forEach(el => {
    el.addEventListener('input', function(e) {
        if(e.target.id == 'min') {
            xRangeMin = e.target.value;
            document.getElementById('minLabel').innerHTML = `Xmin: <span style=\"color: green;\">${xRangeMin}</span>`;
            console.log(`xRangeMin: ${xRangeMin}`);
        } else if(e.target.id == 'max') {
            xRangeMax = e.target.value;
            document.getElementById('maxLabel').innerHTML = `Xmax: <span style=\"color: green;\">${xRangeMax}</span>`;
            console.log(`xRangeMax: ${xRangeMax}`);
        } else {
            console.log(`something wrong...\nthis is evt: ${e}`);
        }
    });
});

document.querySelectorAll('.file').forEach(el => {
    el.addEventListener('input', function(e) {
        if(e.target.id == 'fileName') {
            _fileName = e.target.value;
            document.getElementById('fileNameLabel').innerHTML = `fileName: <span style=\"color: green;\">${_fileName}</span>`;
            console.log(`fileName: ${_fileName}`);
        } else {
            console.log(`something wrong...\nthis is evt: ${e}`);
        }
    });
});

document.querySelector('#drop-zone').addEventListener('dragover', function (event) {
    // 取消拖拉時開啟檔案
    event.preventDefault();

    const dropZone = document.getElementById('drop-zone');
    dropZone.style.backgroundColor = "rgba(36, 245, 17, 0.664)";
    dropZone.style.transitionDuration = "1s";
});

document.querySelector('#drop-zone').addEventListener('dragleave', function (event) {
    // 取消拖拉時開啟檔案
    event.preventDefault();

    document.getElementById('drop-zone').style.backgroundColor = "inherit";
});
  
document.querySelector('#drop-zone').addEventListener('drop', function (event) {
    // 取消拖拉時開啟檔案
    event.preventDefault();
    document.getElementById('drop-zone').style.backgroundColor = "inherit";

    // 取得拖拉的檔案清單
    let filelist = event.dataTransfer.files;
    console.log(filelist);
    for (let i = 0; i < filelist.length; i++) {  
        // 透過 FileReader 取得檔案內容
        let reader = new FileReader();
  
        // 設定檔案讀取完畢時觸發的事件
        reader.onload = event => {
            // 取得檔案完整內容
            // console.log("=================");
            // console.log(event.target.result);
            // console.log("=================");
            console.log(extract(event.target.result));
            _content[i] = extract(event.target.result);
        };
  
        // 設定 onprogress event 查詢進度
        reader.onprogress = function (evt) {
            // 確定 evt 是否為 ProgressEvent
            if (evt.lengthComputable) {
            // 計算百分比
            let percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // 注意：這裡的百分比的數字不會到 100
            console.log(`進度條: ${percentLoaded}`);
            }
        };
  
        // 開始讀取檔案，以文字字串型式讀取資料
        reader.readAsText(filelist[i]);
    }
});

document.getElementById('download-btn').addEventListener('click', function(e) {
    _content.forEach((el, i) => {
        const content = el || "content_placeholder";
        const fileName = (_fileName + "_" + String(i)) || "default";
        saveFile(content, fileName);
    });
});

function saveFile(content, file_name) {
    const blob = new Blob([content], { type: 'text/txt;charset=utf-8;' });
    const link = document.createElement("a");
  
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', file_name + '.txt');
    link.classList.add('hidden');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function extract(string) {
    let data = [];
    
    if(String(string).indexOf("[Data]") != -1) {
        data = String(string).slice(String(string).indexOf("[Data]")).split(/\s*\n\s*/).slice(2);
    } else {
        data = String(string).split(/\s*\n\s*/);
    }

    // const data = String(string).split(/\s*\n\s*/);
    console.log(data);

    let dataX = [];
    let dataY = [];
    let dataYscale = [];
    let result = "";

    data.forEach(el => {
        if(el.length != 0) {
            const tmp = el.split(/\s+/);
            dataX.push(parseFloat(tmp[0]));
            dataY.push(parseFloat(tmp[1]));
        }
    });

    console.log("-------");
    console.log(dataX);
    console.log(dataY);
    console.log("-------");

    // 減掉最小值
    const smallest = Math.min(...dataY);
    console.log(`smallest: ${smallest}`);
    let tmp1 = [];
    dataY.forEach(el=> {
        el -= smallest;
        tmp1.push(el);
    });

    const indexArr = rangeIn(xRangeMin, xRangeMax, dataX);
    let tmp2 = [];
    indexArr.forEach(el => {
        tmp2.push(tmp1[el]);
    });

    const biggest = Math.max(...tmp2);
    console.log(`biggest: ${biggest}`);
    tmp1.forEach(el => {
        el /= biggest;
        dataYscale.push(el);
    });

    console.log("-------");
    console.log(dataYscale);
    console.log("-------");
    
    for(let i=0; i<dataX.length; i++) {
        result += dataX[i] + "\t" + dataYscale[i] + "\n"
    }
    return result;
}

// 回傳符合範圍的index
function rangeIn(min, max, arr) {
    let tmp = [];
    arr.forEach((el, i) => {
        if(el>=min && el<=max) {
            tmp.push(i);
        }
    });

    return tmp;
}