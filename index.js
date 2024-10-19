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

function removeMiddleOfThreeConsecutive(arr) {
    if (arr.length < 3) return arr;
    console.log(arr)

    // be careful with different types
    // be careful with discount and price

    let result = [];
    let i = 0;

    while (i < arr.length) {
        let current = arr[i];
        let start = i;

        // Find the end of the sequence of identical prices/glasses/discounts
        while (
            i < arr.length &&
            arr[i].discount === current.discount &&
            arr[i].price === current.price &&
            arr[i].name === current.name
        ) {
            i++;
        }

        if (i !== start) {
            result.push(arr[start]); // add the first one
            result.push(arr[i]); // add the last one
        } else {
            result.push(arr[start])
        }
    }

    return result;
}

async function fetchFileList() {
    const apiUrl = 'https://api.github.com/repos/clementesepulveda/ryk_scraper/contents/data';

    const names = await fetch(apiUrl)
        .then(response => response.json())
        .then(files => files.map(file => file.name))
        .catch(error => {
            console.error('Error fetching file list:', error)
            removeLoading();
        });

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

    // sort by date
    DATA.sort((a, b) => (a.date > b.date) ? 1 : ((b.date > a.date) ? -1 : 0))
    // sort by glasses
    DATA.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

    DATA = removeMiddleOfThreeConsecutive(DATA)

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
        'Descuentos': echarts.init(
            document.getElementById('descuentos-container'), null, {
            renderer: 'canvas',
            useDirtyRect: false
        }),
        'Precios': echarts.init(
            document.getElementById('precios-container'), null, {
            renderer: 'canvas',
            useDirtyRect: false
        }),
    }

    window.addEventListener('resize', graphs['Descuentos'].resize);
    window.addEventListener('resize', graphs['Precios'].resize);

    updateGraph('Descuentos');
    updateGraph('Precios');
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
            name: 'Fecha',
            nameLocation: 'middle',
            nameGap: 30,
        },
        yAxis: {
            type: 'value',
            name: graphName.slice(0, graphName.length - 1),
            nameGap: graphName === 'Descuentos' ? 40 : 60,
            nameLocation: 'middle',
            axisLabel: {
                formatter: value => {
                    if (graphName === 'Descuentos') {
                        return `${value}%`
                    }
                    return `\$${value.toLocaleString('es-CL')}`
                }
            }
        },
        series: [
            {
                data: graphData.map(item => {
                    const type = graphName == 'Precios' ? 'price' : 'discount'
                    return {
                        name: item.date,
                        value: [
                            item.date,
                            item[type]
                        ]
                    }
                }),
                type: 'line',
                areaStyle: {}
            }
        ],
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                const values = params[0].value
                if (graphName === 'Descuentos') {
                    return `${(new Date(Date.parse(values[0]))).toLocaleString()} <br />
                    <span style="float: right; font-weight: bold">${values[1]}% de descuento</span>`;
                }
                return `${(new Date(Date.parse(values[0]))).toLocaleString()} <br />
                <span style="float: right; font-weight: bold">\$${values[1].toLocaleString('es-CL')}</span>`;
            }
        },
        grid: {
            left: 30,
            right: 5,
            bottom: 80,
            containLabel: true,
            tooltip: {
                show: true,
                // formater
            }
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
        updateGraph('Precios');
        updateGraph('Descuentos');
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