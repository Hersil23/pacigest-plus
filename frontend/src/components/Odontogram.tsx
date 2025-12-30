"use client";

import { useState, useEffect } from 'react';
import { FaTooth, FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface Tooth {
  number: number;
  status: 'sano' | 'caries' | 'obturacion' | 'ausente' | 'fractura' | 'corona' | 'implante' | 'endodoncia' | 'porExtraer';
  surfaces?: ('oclusal' | 'vestibular' | 'palatina' | 'mesial' | 'distal')[];
  notes?: string;
}

interface OdontogramProps {
  teeth: Tooth[];
  onChange: (teeth: Tooth[]) => void;
}

const TOOTH_COLORS = {
  sano: '#ffffff',
  caries: '#ef4444',
  obturacion: '#3b82f6',
  ausente: '#374151',
  fractura: '#f59e0b',
  corona: '#8b5cf6',
  implante: '#10b981',
  endodoncia: '#ec4899',
  porExtraer: '#f97316'
};

export default function Odontogram({ teeth, onChange }: OdontogramProps) {
  const { t } = useLanguage();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Labels traducidos
  const TOOTH_LABELS = {
    sano: t('print.toothStatus.sano'),
    caries: t('print.toothStatus.caries'),
    obturacion: t('print.toothStatus.obturacion'),
    ausente: t('print.toothStatus.ausente'),
    fractura: t('print.toothStatus.fractura'),
    corona: t('print.toothStatus.corona'),
    implante: t('print.toothStatus.implante'),
    endodoncia: t('print.toothStatus.endodoncia'),
    porExtraer: t('print.toothStatus.porExtraer')
  };

  // Inicializar dientes vacíos en useEffect para evitar actualización durante render
  useEffect(() => {
    if (teeth.length === 0) {
      const allTeeth: Tooth[] = [];
      // Cuadrantes: 18-11, 21-28, 38-31, 48-41
      for (let i = 18; i >= 11; i--) allTeeth.push({ number: i, status: 'sano' });
      for (let i = 21; i <= 28; i++) allTeeth.push({ number: i, status: 'sano' });
      for (let i = 48; i >= 41; i--) allTeeth.push({ number: i, status: 'sano' });
      for (let i = 31; i <= 38; i++) allTeeth.push({ number: i, status: 'sano' });
      onChange(allTeeth);
    }
  }, []); // Solo ejecutar una vez al montar

  const getTooth = (number: number): Tooth => {
    return teeth.find(t => t.number === number) || { number, status: 'sano' };
  };

  const updateTooth = (number: number, updates: Partial<Tooth>) => {
    const newTeeth = teeth.map(t =>
      t.number === number ? { ...t, ...updates } : t
    );
    onChange(newTeeth);
  };

  const openModal = (number: number) => {
    setSelectedTooth(number);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedTooth(null);
    setShowModal(false);
  };

  const renderTooth = (number: number) => {
    const tooth = getTooth(number);
    const color = TOOTH_COLORS[tooth.status];
    
    return (
      <button
        key={number}
        type="button"
        onClick={() => openModal(number)}
        className="flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg"
        style={{ 
          borderColor: color === '#ffffff' ? '#d1d5db' : color,
          backgroundColor: color === '#374151' ? color : `${color}20`
        }}
      >
        <FaTooth 
          className="text-2xl mb-1" 
          style={{ color: color === '#ffffff' ? '#6b7280' : color }}
        />
        <span className="text-xs font-semibold text-[rgb(var(--foreground))]">{number}</span>
      </button>
    );
  };

  const selectedToothData = selectedTooth ? getTooth(selectedTooth) : null;

  return (
    <div className="space-y-6">
      {/* Leyenda */}
      <div className="bg-[rgb(var(--background))] rounded-lg p-4 border border-[rgb(var(--border))]">
        <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3">Leyenda de Estados:</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {Object.entries(TOOTH_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ 
                  backgroundColor: TOOTH_COLORS[key as keyof typeof TOOTH_COLORS],
                  borderColor: key === 'sano' ? '#d1d5db' : TOOTH_COLORS[key as keyof typeof TOOTH_COLORS]
                }}
              />
              <span className="text-xs text-[rgb(var(--foreground))]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Odontograma */}
      <div className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))]">
        {/* Superior */}
        <div className="mb-8">
          <p className="text-center text-sm font-semibold text-[rgb(var(--gray-medium))] mb-3">
            {t('print.upperJaw')}
          </p>
          <div className="grid grid-cols-8 gap-2 mb-2">
            {[18, 17, 16, 15, 14, 13, 12, 11].map(renderTooth)}
          </div>
          <div className="grid grid-cols-8 gap-2">
            {[21, 22, 23, 24, 25, 26, 27, 28].map(renderTooth)}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t-2 border-dashed border-[rgb(var(--border))] my-6"></div>

        {/* Inferior */}
        <div>
          <div className="grid grid-cols-8 gap-2 mb-2">
            {[48, 47, 46, 45, 44, 43, 42, 41].map(renderTooth)}
          </div>
          <div className="grid grid-cols-8 gap-2 mb-3">
            {[31, 32, 33, 34, 35, 36, 37, 38].map(renderTooth)}
          </div>
          <p className="text-center text-sm font-semibold text-[rgb(var(--gray-medium))]">
            {t('print.lowerJaw')}
          </p>
        </div>
      </div>

      {/* Modal de edición */}
      {showModal && selectedToothData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--card))] rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[rgb(var(--foreground))]">
                🦷 Diente {selectedTooth}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-[rgb(var(--gray-medium))] hover:text-[rgb(var(--error))]"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Estado del diente */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Estado del Diente
                </label>
                <select
                  value={selectedToothData.status}
                  onChange={(e) => updateTooth(selectedTooth, { 
                    status: e.target.value as Tooth['status'] 
                  })}
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                >
                  {Object.entries(TOOTH_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  Observaciones
                </label>
                <textarea
                  value={selectedToothData.notes || ''}
                  onChange={(e) => updateTooth(selectedTooth, { notes: e.target.value })}
                  rows={3}
                  placeholder="Ej: Caries profunda, requiere endodoncia..."
                  className="w-full px-4 py-2 bg-[rgb(var(--background))] border border-[rgb(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))] text-[rgb(var(--foreground))]"
                />
              </div>

              {/* Botón cerrar */}
              <button
                type="button"
                onClick={closeModal}
                className="w-full px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] transition-colors font-medium"
              >
                ✅ {t('common.save')} y {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}