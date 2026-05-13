import sys

with open('data.js', 'r', encoding='utf-8') as f:
    js_data = f.read()

html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HDPUV - Strategic Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #0f172a;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border-color: rgba(255, 255, 255, 0.1);
            --green: #10b981;
            --yellow: #f59e0b;
            --red: #ef4444;
            --primary: #3b82f6;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            min-height: 100vh;
            padding: 2rem;
            background-image: 
                radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%);
            background-attachment: fixed;
        }}
        header {{
            margin-bottom: 3rem;
            text-align: center;
        }}
        h1 {{
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #60a5fa, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}
        h2.subtitle {{
            color: var(--text-muted);
            font-weight: 300;
            font-size: 1.1rem;
        }}
        
        .perspectives-nav {{
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }}
        .perspective-btn {{
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            color: var(--text-muted);
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }}
        .perspective-btn:hover {{
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-main);
        }}
        .perspective-btn.active {{
            background: var(--primary);
            color: #fff;
            border-color: var(--primary);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }}

        .dashboard-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 1.5rem;
        }}

        .kpi-card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            display: flex;
            flex-direction: column;
        }}
        .kpi-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
            border-color: rgba(255,255,255,0.2);
        }}
        
        .kpi-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }}
        .kpi-title {{
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 0.25rem;
        }}
        .kpi-perspective {{
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
        }}
        .status-indicator {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 5px;
            box-shadow: 0 0 8px currentColor;
        }}
        
        .kpi-stats {{
            display: flex;
            align-items: flex-end;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }}
        .kpi-value-container {{
            display: flex;
            flex-direction: column;
        }}
        .kpi-current-value {{
            font-size: 2.25rem;
            font-weight: 700;
            line-height: 1;
        }}
        .kpi-meta {{
            color: var(--text-muted);
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }}
        
        .chart-container {{
            position: relative;
            height: 120px;
            width: 100%;
            margin-top: auto;
        }}

        /* Utility Colors */
        .text-green {{ color: var(--green); }}
        .text-yellow {{ color: var(--yellow); }}
        .text-red {{ color: var(--red); }}
        .bg-green {{ background-color: var(--green); }}
        .bg-yellow {{ background-color: var(--yellow); }}
        .bg-red {{ background-color: var(--red); }}
        
        @media (max-width: 768px) {{
            body {{ padding: 1rem; }}
            .dashboard-grid {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>

    <header>
        <h1>HDPUV BSC Dashboard 2024-2029</h1>
        <h2 class="subtitle">Tablero de Control Estratégico - Área TI</h2>
    </header>

    <div class="perspectives-nav" id="nav-container">
        <!-- Buttons injected here -->
    </div>

    <div class="dashboard-grid" id="dashboard-grid">
        <!-- Cards injected here -->
    </div>

    <script>
        // Embed data from python script
        {js_data}
        
        // Define perspectives
        const perspectives = ['Todas', 'Clientes', 'Procesos', 'Aprendizaje', 'Financiera', 'PETI'];
        let currentPerspective = 'Todas';
        const charts = {{}}; // store chart instances

        function getComplianceLogic(kpiName, valor, meta) {{
            // Less is better logic
            if (kpiName === 'Incidentes Criticos Seguridad' || kpiName === 'Incidentes Criticos HC') {{
                if (valor === 0) return {{ pct: 100, color: 'green' }};
                if (valor < 0.5) return {{ pct: 85, color: 'yellow' }};
                return {{ pct: 0, color: 'red' }};
            }}
            // Glosas Logic
            if (kpiName === 'Glosas Facturacion') {{
                let pct = (1.2 / valor) * 100;
                return {{ pct, color: getTrafficLight(pct) }};
            }}
            
            // Standard
            let pct = (valor / meta) * 100;
            return {{ pct, color: getTrafficLight(pct) }};
        }}

        function getTrafficLight(pct) {{
            if (pct >= 100) return 'green';
            if (pct >= 80) return 'yellow';
            return 'red';
        }}

        function initNav() {{
            const nav = document.getElementById('nav-container');
            perspectives.forEach(p => {{
                const btn = document.createElement('button');
                btn.className = 'perspective-btn' + (p === 'Todas' ? ' active' : '');
                btn.textContent = p;
                btn.onclick = () => {{
                    document.querySelectorAll('.perspective-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentPerspective = p;
                    renderDashboard();
                }};
                nav.appendChild(btn);
            }});
        }}

        function renderDashboard() {{
            const grid = document.getElementById('dashboard-grid');
            grid.innerHTML = '';
            
            // Cleanup old charts
            Object.values(charts).forEach(c => c.destroy());

            Object.entries(kpiData).forEach(([kpiName, dataObj], index) => {{
                if (currentPerspective !== 'Todas' && dataObj.p !== currentPerspective) return;

                // Sort data by date just in case
                dataObj.data.sort((a,b) => new Date(a.f) - new Date(b.f));
                
                const latestData = dataObj.data[dataObj.data.length - 1];
                const valor = latestData ? latestData.v : 0;
                const meta = dataObj.m;
                const unit = dataObj.u;
                
                const compliance = getComplianceLogic(kpiName, valor, meta);
                
                const card = document.createElement('div');
                card.className = 'kpi-card';
                card.innerHTML = `
                    <div class="kpi-header">
                        <div>
                            <div class="kpi-title">${{kpiName}}</div>
                            <div class="kpi-perspective">${{dataObj.p}}</div>
                        </div>
                        <div class="status-indicator bg-${{compliance.color}}" title="Cumplimiento: ${{compliance.pct.toFixed(1)}}%"></div>
                    </div>
                    <div class="kpi-stats">
                        <div class="kpi-value-container">
                            <div class="kpi-current-value text-${{compliance.color}}">${{valor}}${{unit}}</div>
                            <div class="kpi-meta">Meta: ${{meta}}${{unit}}</div>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="chart-${{index}}"></canvas>
                    </div>
                `;
                grid.appendChild(card);

                // Render Chart
                const ctx = document.getElementById(`chart-${{index}}`).getContext('2d');
                const colorMap = {{
                    'green': '#10b981',
                    'yellow': '#f59e0b',
                    'red': '#ef4444'
                }};
                
                const chartColor = colorMap[compliance.color];
                
                charts[`chart-${{index}}`] = new Chart(ctx, {{
                    type: 'line',
                    data: {{
                        labels: dataObj.data.map(d => d.f.substring(0, 7)),
                        datasets: [{{
                            label: 'Valor',
                            data: dataObj.data.map(d => d.v),
                            borderColor: chartColor,
                            backgroundColor: chartColor + '33', // 20% opacity
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            fill: true,
                            tension: 0.4
                        }}]
                    }},
                    options: {{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {{
                            legend: {{ display: false }},
                            tooltip: {{
                                mode: 'index',
                                intersect: false,
                                callbacks: {{
                                    label: function(context) {{
                                        return `${{context.parsed.y}} ${{unit}}`;
                                    }}
                                }}
                            }}
                        }},
                        scales: {{
                            x: {{ display: false }},
                            y: {{ 
                                display: false,
                                min: kpiName === 'Glosas Facturacion' ? 0 : Math.min(...dataObj.data.map(d => d.v)) * 0.9,
                                max: kpiName === 'Incidentes Criticos Seguridad' ? 5 : Math.max(meta, ...dataObj.data.map(d => d.v)) * 1.1
                            }}
                        }},
                        interaction: {{
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }}
                    }}
                }});
            }});
        }}

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {{
            initNav();
            renderDashboard();
        }});
    </script>
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_template)
print("Dashboard generado en index.html")
