let chartData = [];
let displayedData = [];
let chart;

const $fileInput = document.getElementById('fileInput');
const $topN = document.getElementById('topNSelect');
const $resultsTable = document.getElementById('resultsTable');
const $resultsTableBody = $resultsTable.querySelector("tbody")
const $showMore = document.getElementById('showMore')
const $showLess = document.getElementById('showLess')
const $chart = document.getElementById('killTrackerChart');
const $modal = document.getElementById("helpModal");
const $helpBtn = document.getElementById("helpBtn");
const $bgSpan = document.getElementsByClassName("close")[0];
const $colorSelect = document.querySelector('#colorSelect');
const $btnDownload = document.querySelector('#downloadGraph');

[$fileInput, $topN].forEach($el => $el.addEventListener("change", async (event) => {
    await processCSV();
    generateChart()
}));

$colorSelect.addEventListener("change", event => {
    generateChart();
})

$btnDownload.addEventListener("click", (event) => {
    downloadChart()
})

// more + less buttons
$showMore.addEventListener("click", (event) => {
    displayResults(chartData);
    $showMore.style.display = 'none';
    $showLess.style.display = 'inline-block';
})
$showLess.addEventListener("click", (event) => {
    displayedData = chartData.slice(0, 5);
    displayResults(displayedData);
    $showMore.style.display = 'inline-block';
    $showLess.style.display = 'none';
})

function processCSV() {
    return new Promise(resolve => {
        const topN = parseInt($topN.value);
        if ($fileInput.files.length === 0) {
            alert('Please select a CSV file.');
            return;
        }
        const file = $fileInput.files[0];

        Papa.parse(file, {
            header: true,
            complete: function (results) {
                const data = results.data;
                data.sort((a, b) => parseInt(b['Kill Tracker']) - parseInt(a['Kill Tracker']));
                chartData = data.slice(0, topN);
                displayedData = chartData.slice(0, 10);
                displayResults(displayedData);
                $showMore.style.display = chartData.length > 10 ? 'inline-block' : 'none';
                resolve();
            }
        });
    });
}

function displayResults(displayedData) {
    $resultsTableBody.innerHTML = '';

    displayedData.forEach(row => {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        const killTrackerTd = document.createElement('td');

        nameTd.textContent = row['Name'];
        killTrackerTd.textContent = row['Kill Tracker'];

        tr.appendChild(nameTd);
        tr.appendChild(killTrackerTd);
        $resultsTableBody.appendChild(tr);
    });
}

function generateChart() {
    const ctx = $chart.getContext('2d');
    const names = chartData.map(row => row['Name']);
    const killTrackers = chartData.map(row => row['Kill Tracker']);
    const selectedColor = document.getElementById('colorSelect').value;
    const borderColor = selectedColor.replace('0.2', '1');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: 'Kill Tracker',
                data: killTrackers,
                backgroundColor: selectedColor,
                borderColor: borderColor,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function (value) {
                        return value;
                    },
                    color: 'black',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function downloadChart() {
    if (!chart) {
        alert("theres no chart yet :( try importing your csv again!")
        return;
    }

    const _downloadElement = document.createElement("a");
    _downloadElement.download = "destiny_2_killtracker_graph.png";
    _downloadElement.href = chart.toBase64Image()
    _downloadElement.style.display = "none";
    document.querySelector("#__download")?.remove();
    document.body.append(_downloadElement);
    _downloadElement.click();
    _downloadElement.remove();
}

// ---------- MODAL ---------- //

$helpBtn.onclick = function () {
    $modal.style.display = "block";
}

$bgSpan.onclick = function () {
    $modal.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == $modal) {
        $modal.style.display = "none";
    }
}


// --- TABS --- //

$tabMenu = document.querySelector("#tab-window");
$tabMenu.querySelectorAll(".tab").forEach($el => {
    $el.addEventListener("click", (event) => {
        event.stopPropagation()
        const $evTarget = event.currentTarget;
        if ($evTarget.classList.contains("active")) return;

        const $currentActive = $tabMenu.querySelector(".active");
        const $currentActiveTab = document.querySelector("#" + $currentActive.dataset.target)
        const $newActive     = $tabMenu.querySelector(".tab:not(.active)");
        const $newActiveTab  = document.querySelector("#" +$newActive.dataset.target)

        $currentActive.ariaSelected = null;
        $currentActive.classList.remove("active");
        $currentActiveTab.style.display = "none"

        $newActive.ariaSelected = "true";
        $newActive.classList.add("active")
        $newActiveTab.style.display = null


    })
})
