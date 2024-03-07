let glassesOption = "Polaroid PLD D485";
let DATA = [];
const CHUNK_SIZE = 1000;

async function getFileData(fileName) {
    const file = await fetch(fileName);
    const data = await (await file.text()).split('\n').map(v => {
        const item = v.trim().split(',')
        return {
            name: item[0],
            price: item[1],
            discount: item[2],
            date: item[3]
        }
    })

    return data;
}

async function fetchFileList() {
    const apiUrl = 'https://api.github.com/repos/clementesepulveda/ryk_scraper/contents/data';

    const names = await fetch(apiUrl)
        .then(response => response.json())
        .then(files => files.map(file => file.name))
        .catch(error => console.error('Error fetching file list:', error));

    for (let i = 0; i < names.length; i++) {
        let timedData = await getFileData(`./data/${names[i]}`)
        timedData = timedData.slice(1, timedData.length - 1) // remove headers and last empty line

        for (let j = 0; j < timedData.length; j += CHUNK_SIZE) {
            DATA.push(...timedData.slice(j, j + CHUNK_SIZE));
        }
    }

    // Process
    DATA = DATA.map(v => {
        v['discount'] = v['discount'].includes('%') ? parseInt(v['discount'].split('%')[0]) : 0
        v['price'] = parseInt(v['price'].replace('.', ''))
        return v
    })
}

// // SELECT GLASSES
function addOptions() {
    const names = [... new Set(DATA.map(v => v.name).sort())]

    let dom = document.getElementById('glasses-selector');
    names.forEach(name => {
        var option = document.createElement("option");
        option.text = name;
        if (name === glassesOption) {
            option.selected = true;
        }
        dom.add(option);
    });
}

let graphs;
function createGraphs() {
    graphs = {
        'Discounts': echarts.init(
            document.getElementById('discounts-container'), null, {
            renderer: 'canvas',
            useDirtyRect: false
        }),
        'Prices': echarts.init(
            document.getElementById('prices-container'), null, {
            renderer: 'canvas',
            useDirtyRect: false
        }),
    }

    window.addEventListener('resize', graphs['Discounts'].resize);
    window.addEventListener('resize', graphs['Prices'].resize);

    updateGraph('Discounts');
    updateGraph('Prices');
}


function updateGraph(graphName) {
    const graphData = DATA.filter(v => v.name.replaceAll(' ', '') === glassesOption.replaceAll(' ', ''))

    const option = {
        title: {
            text: `${graphName}`,
            subtext: `${glassesOption}`,
            x: 'center',
            textStyle: {
                width: 200,
            }
        },
        xAxis: {
            type: 'time',
            name: 'Date',
            nameLocation: 'middle',
            nameGap: 30,
            // data: graphData.map(item => [item.date, item[graphName.toLowerCase().slice(0, graphName.length-1)]   ])
        },
        yAxis: {
            type: 'value',
            name: graphName.slice(0, graphName.length - 1),
            nameGap: 25,
            nameLocation: 'middle',
        },
        series: [
            {
                data: graphData.map(item => {
                    return {
                        name: item.date,
                        value: [
                            item.date,
                            item[graphName.toLowerCase().slice(0, graphName.length - 1)]
                        ]
                    }
                }),
                type: 'line',
            }
        ],
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            left: 15,
            right: 5,
            bottom: 80,
            containLabel: true
        },
        dataZoom: [
            {
                type: 'slider'
            },
            {
                type: 'inside'
            }
        ],
    };

    if (option && typeof option === 'object') {
        graphs[graphName].setOption(option);
    }
}


document.querySelector('#glasses-selector').addEventListener("change", function () {
    const newGlassesOption = this.value
    if (newGlassesOption !== glassesOption) {
        glassesOption = newGlassesOption;
        updateGraph('Prices');
        updateGraph('Discounts');
    }
});

const removeLoading = async () => {
    const loaders = document.querySelectorAll('.loader');
    loaders.forEach(loader => {
        loader.remove();
    });

    const graphContainers = document.querySelectorAll('.graph-container');
    graphContainers.forEach(graphContainer => {
        graphContainer.style.width = '100%';
        graphContainer.style.height = '100%';
    });
}

async function init() {
    await fetchFileList()
    await removeLoading()
    await addOptions()
    await createGraphs()
}

init()