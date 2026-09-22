'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function LiveQuoteCalculator() {
  const [tech, setTech] = useState<'fdm' | 'resina'>('fdm');
  const [material, setMaterial] = useState<'pla' | 'petg' | 'abs' | 'resina8k'>('pla');
  const [infill, setInfill] = useState<number>(20);
  const [weight, setWeight] = useState<number>(60);
  const [layerHeight, setLayerHeight] = useState<'0.12' | '0.20'>('0.20');

  // Calculation Logic (Rates in DOP)
  const baseRatePerGram = {
    pla: 14, // RD$14 / g
    petg: 18,
    abs: 20,
    resina8k: 28,
  }[material];

  const precisionMultiplier = layerHeight === '0.12' ? 1.25 : 1.0;
  const estimatedPrice = Math.round((weight * baseRatePerGram * (1 + (infill - 20) * 0.005)) * precisionMultiplier + 150);
  const estimatedHours = Math.max(2, Math.round((weight / 15) * (layerHeight === '0.12' ? 1.6 : 1)));

  return (
    <section id="cotizador" className={`${styles.section} ${styles.calcSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Configurador de Manufactura</span>
          <h2 className={styles.sectionTitle}>Cotizador 3D en Tiempo Real</h2>
          <p className={styles.sectionSubtitle}>
            Ajusta las especificaciones técnicas para estimar el costo de fabricación de tu pieza.
          </p>
        </div>

        <div className={styles.calcCard}>
          {/* CONTROLS */}
          <div className={styles.calcControls}>
            {/* TECNOLOGÍA */}
            <div className={styles.calcGroup}>
              <label className={styles.calcLabel}>Tecnología de Fabricación:</label>
              <div className={styles.chipGroup}>
                <button
                  type="button"
                  className={`${styles.calcChip} ${tech === 'fdm' ? styles.calcChipActive : ''}`}
                  onClick={() => {
                    setTech('fdm');
                    setMaterial('pla');
                  }}
                >
                  Filamento FDM (Técnico / Funcional)
                </button>
                <button
                  type="button"
                  className={`${styles.calcChip} ${tech === 'resina' ? styles.calcChipActive : ''}`}
                  onClick={() => {
                    setTech('resina');
                    setMaterial('resina8k');
                    setLayerHeight('0.12');
                  }}
                >
                  Resina 8K (Ultra Resolución)
                </button>
              </div>
            </div>

            {/* MATERIAL */}
            <div className={styles.calcGroup}>
              <label className={styles.calcLabel}>Material Seleccionado:</label>
              <div className={styles.chipGroup}>
                {tech === 'fdm' ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.calcChip} ${material === 'pla' ? styles.calcChipActive : ''}`}
                      onClick={() => setMaterial('pla')}
                    >
                      PLA+
                    </button>
                    <button
                      type="button"
                      className={`${styles.calcChip} ${material === 'petg' ? styles.calcChipActive : ''}`}
                      onClick={() => setMaterial('petg')}
                    >
                      PETG Reforzado
                    </button>
                    <button
                      type="button"
                      className={`${styles.calcChip} ${material === 'abs' ? styles.calcChipActive : ''}`}
                      onClick={() => setMaterial('abs')}
                    >
                      ABS Industrial
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`${styles.calcChip} ${styles.calcChipActive}`}
                  >
                    Resina Fotosensible 8K Gris Espacial
                  </button>
                )}
              </div>
            </div>

            {/* PESO ESTIMADO */}
            <div className={styles.calcGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className={styles.calcLabel}>Peso Estimado:</label>
                <span className={styles.rangeVal}>{weight} g</span>
              </div>
              <div className={styles.rangeContainer}>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className={styles.rangeInput}
                />
              </div>
            </div>

            {/* RELLENO (INFILL) */}
            {tech === 'fdm' && (
              <div className={styles.calcGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className={styles.calcLabel}>Densidad de Relleno (Infill):</label>
                  <span className={styles.rangeVal}>{infill}%</span>
                </div>
                <div className={styles.rangeContainer}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={infill}
                    onChange={(e) => setInfill(Number(e.target.value))}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            )}

            {/* CALIDAD DE CAPA */}
            <div className={styles.calcGroup}>
              <label className={styles.calcLabel}>Acabado y Altura de Capa:</label>
              <div className={styles.chipGroup}>
                <button
                  type="button"
                  className={`${styles.calcChip} ${layerHeight === '0.20' ? styles.calcChipActive : ''}`}
                  onClick={() => setLayerHeight('0.20')}
                >
                  Estándar (0.20 mm)
                </button>
                <button
                  type="button"
                  className={`${styles.calcChip} ${layerHeight === '0.12' ? styles.calcChipActive : ''}`}
                  onClick={() => setLayerHeight('0.12')}
                >
                  Ultra Precisión (0.12 mm)
                </button>
              </div>
            </div>
          </div>

          {/* RESULT BOX */}
          <div className={styles.calcResultBox}>
            <span className={styles.resultTag}>Presupuesto Estimado</span>
            <div className={styles.resultPrice}>
              RD${estimatedPrice.toLocaleString()}
            </div>
            
            <div className={styles.resultDetails}>
              <span>Tiempo de fabricación: ~{estimatedHours} - {estimatedHours + 4} horas</span>
              <span>Entrega estimada: 24 a 48 horas</span>
              <span>Inspección de malla 3D incluida</span>
            </div>

            <Link
              href={`/catalogo?custom=true&tech=${tech}&mat=${material}&price=${estimatedPrice}`}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.95rem', padding: '13px' }}
            >
              Iniciar Encargo
            </Link>

            <a
              href={`https://wa.me/18494622228?text=Hola!%20Quiero%20cotizar%20una%20impresion%203D%20con%20${material.toUpperCase()}%20de%20aprox%20${weight}g.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-titanium"
              style={{ width: '100%', fontSize: '0.88rem' }}
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
