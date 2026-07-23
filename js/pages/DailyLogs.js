import { recordStore } from "../recordStore.js";
import { Button } from "../components/Button.js";
import { Card } from "../components/Card.js";
import { auth } from "../auth.js";

export class DailyLogs {
    render() {
        const logs = recordStore.getDailyLogs();
        const activeLog = logs[0] || {};

        return `
            <section class="page-header">
                <div class="stack">
                    <span class="eyebrow">Field Management</span>
                    <h1>Daily Field Construction Logs</h1>
                    <p>Track site weather conditions, subcontractor trade headcounts, equipment, safety, and daily work progress.</p>
                </div>
                <div class="toolbar">
                    <button class="button primary" id="btn-new-daily-log" type="button"><i data-lucide="plus"></i> New Daily Log Entry</button>
                    <button class="button" id="btn-print-daily-log" type="button"><i data-lucide="printer"></i> Print Daily Report</button>
                </div>
            </section>

            <div class="dashboard-grid">
                <div class="stack">
                    <!-- Weather Widget -->
                    ${Card.render({
                        title: `Daily Weather & Site Conditions (${activeLog.date || 'Today'})`,
                        eyebrow: "Environmental Log",
                        body: `
                            <div class="weather-panel">
                                <div class="split">
                                    <span class="badge info large"><i data-lucide="sun"></i> ${activeLog.weather || '78°F Clear'}</span>
                                    <span class="badge neutral"><i data-lucide="wind"></i> ${activeLog.wind || '5 mph'}</span>
                                </div>
                                <p style="margin-top: 0.75rem;"><strong>Site Impact Notes:</strong> ${activeLog.siteConditions || 'Dry site conditions.'}</p>
                                <p style="margin-top: 0.5rem;"><strong>Safety Observation:</strong> ${activeLog.safety || 'No safety incidents reported.'}</p>
                            </div>
                        `
                    })}

                    <!-- Trade Workforce Headcount Table -->
                    ${Card.render({
                        title: `Trade Headcount & Manpower (${activeLog.headcountTotal || 0} Total Workers)`,
                        eyebrow: "Labor Breakdown",
                        body: `
                            <div class="table-wrap">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Subcontractor Company</th>
                                            <th>Trade / Craft</th>
                                            <th>Workers Count</th>
                                            <th>Total Hours</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${activeLog.trades ? activeLog.trades.map((t) => `
                                            <tr>
                                                <td><strong>${t.company}</strong></td>
                                                <td>${t.trade}</td>
                                                <td><span class="badge info">${t.count} Workers</span></td>
                                                <td>${t.hours} hrs</td>
                                            </tr>
                                        `).join('') : '<tr><td colspan="4">No trade labor recorded today.</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        `
                    })}
                </div>

                <div class="stack">
                    <!-- Work Accomplished -->
                    ${Card.render({
                        title: "Work Accomplished & Deliveries",
                        eyebrow: "Site Activities",
                        body: `
                            <div class="stack">
                                <div>
                                    <strong>Work Progress:</strong>
                                    <p style="white-space: pre-line; margin-top: 0.25rem;">${activeLog.notes || 'Routine field framing and MEP rough-in.'}</p>
                                </div>
                                <div style="border-top: 1px dashed var(--border-color); padding-top: 0.75rem;">
                                    <strong>Material Deliveries:</strong>
                                    <p style="margin-top: 0.25rem;">${activeLog.deliveries || 'None logged.'}</p>
                                </div>
                            </div>
                        `
                    })}

                    <!-- Historical Daily Logs Register -->
                    ${Card.render({
                        title: "Daily Log Archives",
                        eyebrow: "Log History",
                        body: `
                            <div class="stack">
                                ${logs.map((log) => `
                                    <div class="timeline-item split" style="cursor: pointer;" onclick="document.dispatchEvent(new CustomEvent('toast', { detail: 'Viewing log for ${log.date}' }))">
                                        <div>
                                            <strong>${log.date} &bull; ${log.author}</strong>
                                            <p class="muted">${log.headcountTotal} Workers &bull; ${log.weather}</p>
                                        </div>
                                        <button class="button small ghost" type="button"><i data-lucide="eye"></i> View</button>
                                    </div>
                                `).join('')}
                            </div>
                        `
                    })}
                </div>
            </div>
        `;
    }

    bind() {
        const currentUser = auth.getCurrentUser();

        document.getElementById("btn-new-daily-log")?.addEventListener("click", () => {
            const body = `
                <form id="form-new-daily-log" class="record-form">
                    <div class="form-grid">
                        <div class="field">
                            <label for="log-date">Log Date</label>
                            <input class="input" id="log-date" name="date" type="date" value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="field">
                            <label for="log-weather">Weather</label>
                            <input class="input" id="log-weather" name="weather" value="78°F, Clear & Sunny" required>
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="field">
                            <label for="log-headcount">Total Workers Count</label>
                            <input class="input" id="log-headcount" name="headcountTotal" type="number" value="40" required>
                        </div>
                        <div class="field">
                            <label for="log-wind">Wind / Conditions</label>
                            <input class="input" id="log-wind" name="wind" value="5 mph SW">
                        </div>
                    </div>
                    <div class="field">
                        <label for="log-notes">Work Progress & Notes</label>
                        <textarea class="textarea" id="log-notes" name="notes" rows="3" required placeholder="Describe framing, concrete pours, MEP rough-in, or inspections..."></textarea>
                    </div>
                    <div class="field">
                        <label for="log-safety">Safety Observations</label>
                        <input class="input" id="log-safety" name="safety" value="No safety incidents. Toolbox talk conducted.">
                    </div>
                    <div class="split">
                        <span class="muted">Author: ${currentUser.name}</span>
                        <button class="button primary" type="submit"><i data-lucide="check"></i> Save Daily Log</button>
                    </div>
                </form>
            `;

            document.dispatchEvent(new CustomEvent("open-modal", {
                detail: {
                    title: "New Daily Field Log",
                    body,
                    onSubmit: (values) => {
                        values.author = currentUser.name;
                        values.trades = [
                            { company: currentUser.company, trade: "General Operations", count: 12, hours: 96 },
                            { company: "Volt Electric Inc.", trade: "Electricians", count: 14, hours: 112 },
                            { company: "Hardrock Concrete", trade: "Concrete", count: 14, hours: 112 }
                        ];
                        recordStore.addDailyLog(values);
                        document.dispatchEvent(new CustomEvent("toast", { detail: `Daily log for ${values.date} saved` }));
                        location.hash = "#/logs";
                    }
                }
            }));
        });

        document.getElementById("btn-print-daily-log")?.addEventListener("click", () => {
            const logs = recordStore.getDailyLogs();
            const activeLog = logs[0] || {};
            window.print();
        });
    }
}
