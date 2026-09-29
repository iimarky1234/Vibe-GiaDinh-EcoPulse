import React, { useState } from 'react';
import { Code2, Download, Copy, Check, ExternalLink } from 'lucide-react';
import type { EnvironmentState } from '../types/environment';
import { exportToCSV, exportToJSON, THINGSPEAK_CHANNEL_ID } from '../services/thingspeak';
import type { Language } from '../utils/translations';
import { translations } from '../utils/translations';

interface DeveloperPanelProps {
  history: EnvironmentState[];
  language: Language;
}

type LangTab = 'curl' | 'js' | 'python' | 'esp32';

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ history, language }) => {
  const t = translations[language];
  const [activeCodeTab, setActiveCodeTab] = useState<LangTab>('curl');
  const [copied, setCopied] = useState(false);

  const endpointUrl = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json`;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippet = () => {
    switch (activeCodeTab) {
      case 'curl':
        return `# Fetch latest environmental state
curl -s "${endpointUrl}" | jq .

# Fetch 20 historical readings
curl -s "https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?results=20"`;

      case 'js':
        return `// Modern JavaScript (Browser / Node 18+)
async function getGiaDinhEnvironment() {
  const res = await fetch('${endpointUrl}');
  const data = await res.json();
  
  const env = {
    windSpeed: Number(data.field1),    // m/s
    windDirection: Number(data.field2),// deg
    temperature: Number(data.field3),  // °C
    pressure: Number(data.field4),     // kPa
    light: Number(data.field5),        // lux
    humidity: Number(data.field6),     // %RH
    noise: Number(data.field7),        // dB
    pm25: Number(data.field8)          // µg/m³
  };
  console.log('MakerLab Gia Dinh Environment:', env);
}
getGiaDinhEnvironment();`;

      case 'python':
        return `import requests

url = "${endpointUrl}"
response = requests.get(url, timeout=10)
data = response.json()

print(f"Temperature : {data.get('field3')} °C")
print(f"Humidity    : {data.get('field6')} %RH")
print(f"PM2.5       : {data.get('field8')} µg/m³")
print(f"Noise       : {data.get('field7')} dB")
print(f"Wind Speed  : {data.get('field1')} m/s")`;

      case 'esp32':
        return `// Arduino / ESP32 HTTPClient example
#include <WiFi.h>
#include <HTTPClient.h>

void readMakerLabStation() {
  HTTPClient http;
  http.begin("https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/fields/3/last.txt");
  int httpCode = http.GET();
  if (httpCode > 0) {
    String tempStr = http.getString();
    Serial.println("Gia Dinh Temp: " + tempStr + " °C");
  }
  http.end();
}`;
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-5 border border-slate-800 mb-8">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white m-0">
              {t.makerHubTitle}
            </h3>
            <p className="text-xs text-slate-400 m-0">
              {t.makerHubSubtitle}
            </p>
          </div>
        </div>

        {/* Download CSV / JSON Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(history)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={() => exportToJSON(history)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.exportJson}</span>
          </button>
        </div>
      </div>

      {/* API Endpoint Bar */}
      <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono">
            GET
          </span>
          <code className="text-xs text-slate-300 font-mono truncate">
            {endpointUrl}
          </code>
        </div>
        <button
          onClick={handleCopyEndpoint}
          className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition cursor-pointer shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? t.copied : t.copyApi}</span>
        </button>
      </div>

      {/* Code Snippets Viewer */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            {(['curl', 'js', 'python', 'esp32'] as LangTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCodeTab(tab)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
                  activeCodeTab === tab
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <a
            href="https://www.makerlab.vn/opendata/giadinh/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            <span>{t.viewStationOnMakerLab}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
          <code>{getCodeSnippet()}</code>
        </pre>
      </div>
    </section>
  );
};
