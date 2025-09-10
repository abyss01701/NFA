import { useState } from 'react';
import FileDrop from './components/FileDrop';
import ResultsPanel from './components/ResultsPanel';
import { parseRoster } from './utils/parseRoster';
import { extractPdfText } from './utils/extractPdfText';
import { extractCrewNamesFromPdfText } from './utils/extractCrewNames';
import { matchNamesInText } from './utils/matchNames';
import { makeResultPdf } from './utils/makeResultPdf';
import { saveCsv } from './utils/saveCsv';

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [xlsFile, setXlsFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState([]);
  const [missing, setMissing] = useState([]);
  const [log, setLog] = useState([]);

  async function run() {
    if (!pdfFile || !xlsFile) {
      alert('Please upload both the schedule PDF and roster Excel file');
      return;
    }

    setBusy(true);
    setLog([]); setFound([]); setMissing([]);

    try {
      addLog('Parsing roster Excel...');
      const { mapByName } = await parseRoster(xlsFile);

      addLog('Extracting PDF text...');
      const text = await extractPdfText(pdfFile);

      addLog('Extracting crew names...');
      const crewNames = extractCrewNamesFromPdfText(text);
      addLog(`Found ${crewNames.length} crew names in PDF`);

      addLog('Matching with roster...');
      const { found: f, missing: m } = matchNamesInText(
        crewNames.join(' '),
        mapByName,
        { fuzzy: true }
      );

       console.log("Roster map sample:", Array.from(mapByName.entries()).slice(0, 10));
      console.log("Roster names:", crewNames);

      setFound(f);
      setMissing(m);
      addLog(`Matched: ${f.length}, Unmatched: ${m.length}`);
    } catch (e) {
      console.error(e);
      alert('Error: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  function addLog(msg) { setLog(x => [...x, msg]); }

  async function downloadPdf() {
    await makeResultPdf({ found, meta: { sourceName: pdfFile?.name } });
  }

  function downloadUnmatchedCsv() {
    if (!missing.length) return;
    saveCsv(missing.map(m => ({ name: m.name, number: m.number })), 'unmatched-names.csv');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Fiji Airways Flight Crew Number Automation</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-6 mt-5">
          <FileDrop
            label={pdfFile ? `Selected: ${pdfFile.name}` : 'Upload Flight Schedule (PDF)'}
            accept="application/pdf"
            onFile={setPdfFile}
          />
          <FileDrop
            label={xlsFile ? `Selected: ${xlsFile.name}` : 'Upload Roster (Excel .xlsx)'}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onFile={setXlsFile}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 cursor-pointer"
            disabled={busy}
            onClick={run}
          >
            {busy ? 'Processing…' : 'Match Numbers'}
          </button>

          <button
            className="px-4 py-2 rounded-xl bg-white border disabled:opacity-50 cursor-pointer"
            disabled={!found.length}
            onClick={downloadPdf}
          >
            Download Result PDF
          </button>

          <button
            className="px-4 py-2 rounded-xl bg-white border disabled:opacity-50 cursor-pointer"
            disabled={!missing.length}
            onClick={downloadUnmatchedCsv}
          >
            Download Unmatched CSV
          </button>
        </div>

        <ResultsPanel found={found} missing={missing} />

        <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">Activity Log</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            {log.map((l, i) => <li key={i}>• {l}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
