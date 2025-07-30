document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE & SELECTORS ---
    let allData = [];
    const selectors = {
        csvUploader: document.getElementById('csvUploader'),
        navItems: document.querySelectorAll('.nav-item'),
        views: document.querySelectorAll('.view'),
        phaseList: document.getElementById('phaseList'),
        impactNetworkGraph: document.getElementById('impactNetworkGraph'),
        analyticsView: document.getElementById('analyticsView')
    };
    let charts = {}; // To hold chart instances

    // --- INITIALIZATION ---
    const init = () => {
        selectors.csvUploader.addEventListener('change', handleFileUpload);
        selectors.navItems.forEach(item => item.addEventListener('click', handleNavClick));
    };

    // --- DATA HANDLING ---
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        Papa.parse(file, {
            header: true, dynamicTyping: true, skipEmptyLines: true,
            complete: (results) => {
                allData = results.data;
                renderApp();
            }
        });
    };

    // --- MAIN RENDER LOGIC ---
    const renderApp = () => {
        renderPlanView();
        renderAnalyticsView();
    };

    // --- NAVIGATION ---
    const handleNavClick = (event) => {
        const viewName = event.currentTarget.dataset.view;
        selectors.navItems.forEach(i => i.classList.remove('active'));
        event.currentTarget.classList.add('active');

        selectors.views.forEach(v => v.classList.remove('active'));
        document.getElementById(`${viewName}View`).classList.add('active');
        
        // ECharts needs to be resized when its container becomes visible
        if(viewName === 'analytics') {
            Object.values(charts).forEach(chart => chart.resize());
        }
    };

    // --- PLAN VIEW ---
    const renderPlanView = () => {
        const phases = allData.reduce((acc, row) => { (acc[row.Phase] = acc[row.Phase] || []).push(row); return acc; }, {});
        selectors.phaseList.innerHTML = Object.keys(phases).map(phaseName => `
            <div class="phase-group expanded">
                <div class="phase-group-header">
                    <i class="fa-solid fa-chevron-right chevron"></i> ${phaseName}
                </div>
                <div class="milestone-table">
                    ${phases[phaseName].map(ms => `
                        <div class="milestone-row" data-id="${ms.ID}">
                            <div class="ms-status" title="${ms.Status}"><i class="${getIconForStatus(ms.Status)}"></i></div>
                            <div class="ms-title">${ms.Title}</div>
                            <div class="ms-owner">${ms.Owner}</div>
                            <div class="ms-risk" title="Risk: ${ms.Risk}"><div class="risk-badge ${ms.Risk}"></div></div>
                        </div>`).join('')}
                </div>
            </div>`).join('');
        
        renderImpactNetwork(allData);
        addPlanEventListeners();
    };
    
    const addPlanEventListeners = () => {
        document.querySelectorAll('.phase-group-header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('expanded')));
    };

    // --- ANALYTICS VIEW ---
    const renderAnalyticsView = () => {
        // KPI Calculations
        const total = allData.length;
        const completed = allData.filter(d => d.Status === 'Complete').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const riskCounts = allData.reduce((acc, d) => { acc[d.Risk] = (acc[d.Risk] || 0) + 1; return acc; }, {});
        const sentimentCounts = allData.reduce((acc, d) => { acc[d.Sentiment] = (acc[d.Sentiment] || 0) + 1; return acc; }, {});

        // Render KPIs
        document.getElementById('kpiOverallProgress').innerHTML = `<div class="kpi-title">Overall Progress</div><div class="kpi-value">${progress}%</div><div class="kpi-subvalue">${completed} / ${total} items</div>`;
        document.getElementById('kpiRiskDistribution').innerHTML = `<div class="kpi-title">High & Medium Risk</div><div class="kpi-value">${(riskCounts.High || 0) + (riskCounts.Medium || 0)}</div><div class="kpi-subvalue">${riskCounts.High || 0} High, ${riskCounts.Medium || 0} Medium</div>`;
        document.getElementById('kpiSentiment').innerHTML = `<div class="kpi-title">Overall Sentiment</div><div class="kpi-value">${sentimentCounts.Positive || 0} <span style="color:var(--status-green)">▲</span> ${sentimentCounts.Negative || 0} <span style="color:var(--status-red)">▼</span></div><div class="kpi-subvalue">Positive vs Negative</div>`;

        // Render Charts
        renderTasksByPhaseChart(allData);
        renderTasksByOwnerChart(allData);
    };

    // --- ECHARTS VISUALIZATIONS ---
    const renderImpactNetwork = (data) => {
        const chart = echarts.init(selectors.impactNetworkGraph);
        const stakeholderGroups = [...new Set(data.map(d => d.StakeholderGroup))];
        const phases = [...new Set(data.map(d => d.Phase))];

        const nodes = [
            ...stakeholderGroups.map(g => ({ id: g, name: g, symbolSize: 50, category: 'group' })),
            ...phases.map(p => ({ id: p, name: p, symbolSize: 30, category: 'phase' }))
        ];
        const links = data.map(d => ({ source: d.Phase, target: d.StakeholderGroup }));
        
        const option = {
            tooltip: {},
            series: [{
                type: 'graph', layout: 'force',
                nodes: nodes, links: links,
                categories: [{ name: 'group' }, { name: 'phase' }],
                roam: true, label: { show: true },
                force: { repulsion: 200 }
            }]
        };
        chart.setOption(option);
    };

    const renderTasksByPhaseChart = (data) => {
        const chartDom = document.getElementById('chartTasksByPhase');
        charts.tasksByPhase = echarts.init(chartDom);
        const phaseData = data.reduce((acc, d) => { acc[d.Phase] = (acc[d.Phase] || 0) + 1; return acc; }, {});
        const option = {
            title: { text: 'Tasks by Phase', textStyle: { color: 'var(--text-secondary)' } },
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: Object.keys(phaseData) },
            yAxis: { type: 'value' },
            series: [{ data: Object.values(phaseData), type: 'bar' }],
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
        };
        charts.tasksByPhase.setOption(option);
    };
    
    const renderTasksByOwnerChart = (data) => {
        const chartDom = document.getElementById('chartTasksByOwner');
        charts.tasksByOwner = echarts.init(chartDom);
        const ownerData = data.reduce((acc, d) => { acc[d.Owner] = (acc[d.Owner] || 0) + 1; return acc; }, {});
        const option = {
            title: { text: 'Tasks by Owner', textStyle: { color: 'var(--text-secondary)' } },
            tooltip: { trigger: 'item' },
            series: [{
                type: 'pie', radius: '60%',
                data: Object.entries(ownerData).map(([name, value]) => ({name, value})),
                emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
            }]
        };
        charts.tasksByOwner.setOption(option);
    };

    // --- UTILITY FUNCTIONS ---
    const getIconForStatus = (status) => {
        if (status === 'Complete') return 'fa-solid fa-circle-check';
        if (status === 'In Progress') return 'fa-solid fa-circle-half-stroke';
        return 'fa-regular fa-circle';
    };

    // --- KICK OFF THE APP ---
    init();
});
