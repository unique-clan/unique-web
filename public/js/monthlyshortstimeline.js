// Champions Timeline Chart - Unified for all years
document.addEventListener('DOMContentLoaded', function() {
    
    // Configuration for each year
    const yearConfigs = {
        2026: {
            canvasId: 'championsTimeline2026',
            mapsListId: 'mapsList2026',
            downloadFunction: 'downloadMaps2026',
            labels: ['January 2026'],
            datasets: [
                {
                    label: 'Fullspeed Champion',
                    data: [
                        { 
                            x: 'January 2026', 
                            y: 120.456, 
                            player: 'timakro',
                            mapName: 'run_venice',
                            mapper: 'Assa',
                            top5: [
                                { name: 'timakro', time: 120.456 },
                                { name: 'Ryozuki', time: 121.234 },
                                { name: 'Tezcan', time: 122.890 },
                                { name: 'Assa', time: 123.456 },
                                { name: 'nether', time: 124.123 }
                            ]
                        }
                    ],
                    borderColor: '#3273dc',
                    backgroundColor: '#3273dc'
                },
                {
                    label: 'Hook Champion',
                    data: [
                        { 
                            x: 'January 2026', 
                            y: 240.5, 
                            player: 'Assa',
                            mapName: 'hook_tower',
                            mapper: 'Ryozuki',
                            top5: [
                                { name: 'Assa', time: 240.5 },
                                { name: 'Ryozuki', time: 241.8 },
                                { name: 'Tezcan', time: 243.2 },
                                { name: 'timakro', time: 245.0 },
                                { name: 'nether', time: 247.3 }
                            ]
                        }
                    ],
                    borderColor: '#ff9800',
                    backgroundColor: '#ff9800'
                },
                {
                    label: 'Skill Champion',
                    data: [
                        { 
                            x: 'January 2026', 
                            y: 65.8, 
                            player: 'Tezcan',
                            mapName: 'skillmap_pro',
                            mapper: 'timakro',
                            top5: [
                                { name: 'Tezcan', time: 65.8 },
                                { name: 'Assa', time: 67.1 },
                                { name: 'nether', time: 68.5 },
                                { name: 'timakro', time: 69.8 },
                                { name: 'Ryozuki', time: 71.2 }
                            ]
                        }
                    ],
                    borderColor: '#48c774',
                    backgroundColor: '#48c774'
                },
                {
                    label: 'LOL Champion',
                    data: [
                        { 
                            x: 'January 2026', 
                            y: 138.5, 
                            player: 'Ryozuki',
                            mapName: 'lol_crazy',
                            mapper: 'nether',
                            top5: [
                                { name: 'Ryozuki', time: 138.5 },
                                { name: 'nether', time: 139.8 },
                                { name: 'Assa', time: 141.2 },
                                { name: 'Tezcan', time: 142.5 },
                                { name: 'timakro', time: 143.9 }
                            ]
                        }
                    ],
                    borderColor: '#f14668',
                    backgroundColor: '#f14668'
                },
                {
                    label: 'Fastcap Champion',
                    data: [
                        { 
                            x: 'January 2026', 
                            y: 29.8, 
                            player: 'Ryozuki',
                            mapName: 'fastcap_rush',
                            mapper: 'Tezcan',
                            top5: [
                                { name: 'Ryozuki', time: 29.8 },
                                { name: 'timakro', time: 30.5 },
                                { name: 'Tezcan', time: 31.9 },
                                { name: 'Assa', time: 32.6 },
                                { name: 'nether', time: 33.3 }
                            ]
                        }
                    ],
                    borderColor: '#ffdd57',
                    backgroundColor: '#ffdd57'
                }
            ]
        },
        2027: {
            canvasId: 'championsTimeline2027',
            mapsListId: 'mapsList2027',
            downloadFunction: 'downloadMaps2027',
            labels: ['January 2027'],
            datasets: [
                {
                    label: 'Fullspeed Champion',
                    data: [
                        { 
                            x: 'January 2027', 
                            y: 125.678, 
                            player: 'Assa',
                            mapName: 'run_paradise',
                            mapper: 'timakro',
                            top5: [
                                { name: 'Assa', time: 125.678 },
                                { name: 'timakro', time: 126.234 },
                                { name: 'Tezcan', time: 127.890 },
                                { name: 'Ryozuki', time: 128.456 },
                                { name: 'nether', time: 129.123 }
                            ]
                        }
                    ],
                    borderColor: '#3273dc',
                    backgroundColor: '#3273dc'
                },
                {
                    label: 'Hook Champion',
                    data: [
                        { 
                            x: 'January 2027', 
                            y: 245.8, 
                            player: 'Ryozuki',
                            top5: [
                                { name: 'Ryozuki', time: 245.8 },
                                { name: 'Assa', time: 246.5 },
                                { name: 'Tezcan', time: 248.2 },
                                { name: 'timakro', time: 250.1 },
                                { name: 'nether', time: 252.3 }
                            ]
                        }
                    ],
                    borderColor: '#ff9800',
                    backgroundColor: '#ff9800'
                },
                {
                    label: 'Skill Champion',
                    data: [
                        { 
                            x: 'January 2027', 
                            y: 68.3, 
                            player: 'Tezcan',
                            top5: [
                                { name: 'Tezcan', time: 68.3 },
                                { name: 'Assa', time: 69.6 },
                                { name: 'nether', time: 71.0 },
                                { name: 'timakro', time: 72.3 },
                                { name: 'Ryozuki', time: 73.7 }
                            ]
                        }
                    ],
                    borderColor: '#48c774',
                    backgroundColor: '#48c774'
                },
                {
                    label: 'LOL Champion',
                    data: [
                        { 
                            x: 'January 2027', 
                            y: 142.5, 
                            player: 'nether',
                            top5: [
                                { name: 'nether', time: 142.5 },
                                { name: 'Ryozuki', time: 143.8 },
                                { name: 'Assa', time: 145.2 },
                                { name: 'Tezcan', time: 146.5 },
                                { name: 'timakro', time: 147.9 }
                            ]
                        }
                    ],
                    borderColor: '#f14668',
                    backgroundColor: '#f14668'
                },
                {
                    label: 'Fastcap Champion',
                    data: [
                        { 
                            x: 'January 2027', 
                            y: 32.8, 
                            player: 'timakro',
                            top5: [
                                { name: 'timakro', time: 32.8 },
                                { name: 'Ryozuki', time: 33.5 },
                                { name: 'Tezcan', time: 34.9 },
                                { name: 'Assa', time: 35.6 },
                                { name: 'nether', time: 36.3 }
                            ]
                        }
                    ],
                    borderColor: '#ffdd57',
                    backgroundColor: '#ffdd57'
                }
            ]
        }
    };

    // Create chart for a specific year
    function createChartForYear(year, config) {
        const ctx = document.getElementById(config.canvasId);
        if (!ctx) return;

        let chartInstance = null;

        function createChart() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const isDarkMode = currentTheme === 'dark';
            const textColor = isDarkMode ? '#ffffff' : '#4a4a4a';
            const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

            // Add common properties to datasets
            const datasets = config.datasets.map(ds => ({
                ...ds,
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false
            }));

            const chartConfig = {
                type: 'bar',
                data: {
                    labels: config.labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: {
                        mode: 'nearest',
                        intersect: true
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: textColor,
                                font: {
                                    size: 14,
                                    family: 'Montserrat, sans-serif'
                                },
                                padding: 20,
                                boxWidth: 15,
                                boxHeight: 15,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 16,
                            titleFont: {
                                size: 16,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 13,
                                family: 'Montserrat, monospace'
                            },
                            bodySpacing: 4,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label + ' - ' + context[0].dataset.label;
                                },
                                beforeBody: function(context) {
                                    const dataPoint = context[0].raw;
                                    const lines = ['Champion: ' + dataPoint.player + ' - ' + dataPoint.y.toFixed(3) + 's'];
                                    if (dataPoint.mapName && dataPoint.mapper) {
                                        lines.push(dataPoint.mapName + ' by ' + dataPoint.mapper);
                                    }
                                    return lines;
                                },
                                label: function(context) {
                                    return '';
                                },
                                afterBody: function(context) {
                                    const dataPoint = context[0].raw;
                                    const lines = ['', 'Following:'];
                                    
                                    if (dataPoint.top5 && dataPoint.top5.length > 1) {
                                        for (let i = 1; i < dataPoint.top5.length; i++) {
                                            const entry = dataPoint.top5[i];
                                            lines.push((i + 1) + '. ' + entry.name.padEnd(15) + entry.time.toFixed(3) + 's');
                                        }
                                    }
                                    
                                    return lines;
                                }
                            }
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'category',
                            grid: {
                                color: gridColor,
                                display: false
                            },
                            ticks: {
                                color: textColor,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            reverse: false,
                            grid: {
                                color: gridColor
                            },
                            ticks: {
                                color: textColor,
                                font: {
                                    size: 11
                                },
                                callback: function(value) {
                                    return value.toFixed(1) + 's';
                                }
                            }
                        }
                    }
                }
            };

            if (chartInstance) {
                chartInstance.destroy();
            }
            chartInstance = new Chart(ctx, chartConfig);
        }

        createChart();

        // Listen for theme changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme') {
                    createChart();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Extract unique maps
        function getMaps() {
            const maps = [];
            const seenMaps = new Set();
            
            config.datasets.forEach(dataset => {
                dataset.data.forEach(point => {
                    if (point.mapName && point.mapper && !seenMaps.has(point.mapName)) {
                        maps.push({
                            name: point.mapName,
                            mapper: point.mapper,
                            category: dataset.label.replace(' Champion', '')
                        });
                        seenMaps.add(point.mapName);
                    }
                });
            });
            
            return maps;
        }

        // Create download function
        window[config.downloadFunction] = function() {
            const maps = getMaps();
            if (maps.length === 0) {
                alert('No maps available for download');
                return;
            }
            
            maps.forEach(map => {
                const link = document.createElement('a');
                link.href = `/static/maps/${map.name}.map`;
                link.download = `${map.name}.map`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        };
    }

    // Initialize all years
    Object.keys(yearConfigs).forEach(year => {
        createChartForYear(year, yearConfigs[year]);
    });
});
