import React, { useRef } from 'react';
import { ALL_TALENTS, TALENTS_BY_ID } from '../data/talents';
import { TalentNode } from '../types/talent';
import { Download, Printer, Copy, Check, X, Shield, Sparkles, BookOpen, FileText } from 'lucide-react';

interface CharacterSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  level: number;
  totalPoints: number;
  spentPoints: number;
  remainingPoints: number;
  selectedTalents: string[];
  firstIdealOrders: string[];
  onImportBuild?: (data: any) => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  isOpen,
  onClose,
  characterName,
  level,
  totalPoints,
  spentPoints,
  remainingPoints,
  selectedTalents,
  firstIdealOrders,
  onImportBuild,
}) => {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Group acquired talents by Path -> Specialty
  const acquiredTalentNodes = selectedTalents
    .map((id) => TALENTS_BY_ID[id])
    .filter(Boolean) as TalentNode[];

  const groupedByPath: Record<string, Record<string, TalentNode[]>> = {};

  for (const talent of acquiredTalentNodes) {
    const path = talent.pathName || 'General';
    const spec = talent.specialty || (talent.isKeyTalent ? 'Key Talents' : 'General');
    if (!groupedByPath[path]) groupedByPath[path] = {};
    if (!groupedByPath[path][spec]) groupedByPath[path][spec] = [];
    groupedByPath[path][spec].push(talent);
  }

  // Generate plain text export
  const generateTextSummary = () => {
    let text = `FICHA DE PERSONAJE - COSMERE RPG\n`;
    text += `====================================\n`;
    text += `Nombre: ${characterName || 'Sin Nombre'}\n`;
    text += `Nivel: ${level}\n`;
    text += `Puntos de Talento: ${spentPoints} / ${totalPoints} (Restantes: ${remainingPoints})\n`;
    if (firstIdealOrders.length > 0) {
      text += `Orden Radiante: ${firstIdealOrders.join(', ')}\n`;
    }
    text += `\nTALENTOS ADQUIRIDOS (${acquiredTalentNodes.length}):\n`;
    text += `------------------------------------\n\n`;

    for (const [path, specs] of Object.entries(groupedByPath)) {
      text += `[${path.toUpperCase()}]\n`;
      for (const [spec, talents] of Object.entries(specs)) {
        text += `  * ${spec}:\n`;
        for (const t of talents) {
          text += `    - ${t.name}\n      ${t.description.replace(/\n/g, '\n      ')}\n\n`;
        }
      }
      text += `\n`;
    }

    return text;
  };

  const handleCopyText = () => {
    const text = generateTextSummary();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = {
      name: characterName,
      level,
      selectedTalents,
      firstIdealOrders,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName || 'personaje'}_talentos_lvl${level}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (onImportBuild) {
          onImportBuild(json);
        }
      } catch (err) {
        console.error('Invalid JSON file', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-6 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-sky-500/40 bg-slate-900/95 shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-md shadow-sky-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Ficha de Talentos del Personaje
              </h2>
              <span className="text-xs text-slate-400">
                Cosmere RPG · Resumen oficial de habilidades
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Descargar archivo JSON para guardar tu personaje"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Copiar texto para Discord o notas"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              title="Cargar archivo JSON previo"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Importar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Sheet Content */}
        <div id="printable-character-sheet" className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Character Header Card */}
          <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                  Personaje de Rol
                </span>
                <h1 className="text-2xl font-black text-white">
                  {characterName || 'Aventurero del Cosmere'}
                </h1>
                {firstIdealOrders.length > 0 && (
                  <p className="mt-1 text-xs text-sky-300 font-medium">
                    Caballero Radiante: {firstIdealOrders.join(', ')}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase text-slate-400 font-medium">Nivel</span>
                  <span className="font-mono text-xl font-black text-sky-400">{level}</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase text-slate-400 font-medium">Puntos Gastados</span>
                  <span className="font-mono text-xl font-black text-emerald-400">{spentPoints}</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase text-slate-400 font-medium">Puntos Totales (n+1)</span>
                  <span className="font-mono text-xl font-black text-white">{totalPoints}</span>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
                  <span className="block text-[10px] uppercase text-slate-400 font-medium">Restantes</span>
                  <span className={`font-mono text-xl font-black ${remainingPoints === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {remainingPoints}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Talents Breakdown */}
          {acquiredTalentNodes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
              <Sparkles className="mx-auto h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium">Aún no has adquirido ningún talento en el árbol.</p>
              <p className="text-xs text-slate-500 mt-1">
                Haz clic en los talentos resaltados en verde en el árbol para empezar tu construcción.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByPath).map(([path, specs]) => (
                <div key={path} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-base font-bold text-amber-400 border-b border-slate-800/80 pb-2 flex items-center justify-between">
                    <span>{path}</span>
                    <span className="text-xs font-mono text-slate-400">
                      {Object.values(specs).flat().length} talentos
                    </span>
                  </h3>

                  <div className="mt-3 space-y-4">
                    {Object.entries(specs).map(([spec, talents]) => (
                      <div key={spec}>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2">
                          {spec}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {talents.map((t) => (
                            <div
                              key={t.id}
                              className="rounded-lg border border-blue-900/40 bg-blue-950/20 p-3"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-sm text-white">
                                  {t.name}
                                </h5>
                                <span className="text-[10px] font-mono text-blue-300 bg-blue-900/40 px-1.5 py-0.5 rounded">
                                  {t.isKeyTalent ? 'Key' : t.cost === 0 ? 'Free' : '1 pt'}
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                                {t.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
