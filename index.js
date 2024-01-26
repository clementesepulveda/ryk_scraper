let glassesOption = "Adidas OR5014"

function loadDataFromCSV(url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error('Error fetching CSV data:', error));
}

function fetchFileList() {
    const apiUrl = 'https://api.github.com/repos/clementesepulveda/ryk_scraper/contents/data';

    return fetch(apiUrl)
        .then(response => response.json())
        .then(files => files.map(file => file.name))
        .catch(error => console.error('Error fetching file list:', error));
}

async function fetchAndProcessFiles(fileList) {
    let data = [];

    // Use Promise.all to wait for all fetch promises to resolve
    await Promise.all(fileList.map(async (file) => {
        const fileUrl = `https://raw.githubusercontent.com/clementesepulveda/ryk_scraper/main/data/${file}`;

        try {
            const response = await fetch(fileUrl);
            const csvData = await response.text();
            const dataArray = processData(csvData);

            const glassesData = dataArray.filter((v) => v.name === glassesOption);

            glassesData.forEach((g) => {
                g['date'] = file
                data.push(g);
            });
        } catch (error) {
            console.error(`Error reading CSV file ${file}:`, error);
        }
    }));

    console.log(data);
    return data
}

// SELECT GLASSES
function addOptions(csvData) {
    var dataArray = processData(csvData);
    const names = dataArray.map(v => v.name).sort()

    let dom = document.getElementById('glasses-selector');
    names.forEach(name => {
        var option = document.createElement("option");
        option.text = name;
        dom.add(option);
    });
}
loadDataFromCSV('data/26_01_24 10.10.csv', addOptions); // a bit hardcoded but will fix later


// SHOW GRAPH
var dom = document.getElementById('container');
var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

window.addEventListener('resize', myChart.resize);


var option;
function updateChartWithData(dataArray) {
    option = {
        title: {
            text: 'Discount'
        },
        xAxis: {
            type: 'category',
            name: 'date',
            nameLocation: 'middle',
            nameGap: 35,
            data: dataArray.map(item => item.date)
        },
        yAxis: {
            type: 'value',
            name: 'Discount',
            nameGap: 35,
            nameLocation: 'middle',
        },
        series: [
            {
                data: dataArray.map(item => item.discount),
                type: 'line'
            }
        ],
        tooltip: {
            trigger: 'axis',
        },
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
}


function processData(csvData) {
    let lines = csvData.split('\n');
    let dataArray = [];
    for (let i = 1; i < lines.length - 1; i++) { // Start from 1 to skip header
        let cols = lines[i].split(',');

        dataArray.push({
            id: parseInt(cols[0]),
            name: cols[1],
            price: parseFloat(cols[2]),
            discount: cols[3].includes('%') ? parseInt(cols[3].slice(0, 2)) : 0,
        });
    }

    const orderedDataArray = dataArray.sort((a, b) => a.price - b.price)
    // console.log(orderedDataArray)
    return orderedDataArray;
}

// get data for discounts
fetchFileList()
    .then(async fileList => {
        const data = await fetchAndProcessFiles(fileList);
        updateChartWithData(data);
    })
    .catch(error => console.error('Error fetching files:', error));


document.querySelector('#glasses-selector').addEventListener("change", function () {
    glassesOption = this.value
    fetchFileList()
        .then(async fileList => {
            const data = await fetchAndProcessFiles(fileList);
            updateChartWithData(data);
        })
        .catch(error => console.error('Error fetching files:', error));
});