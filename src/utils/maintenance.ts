import { MOTORCYCLE_DATABASE, DEFAULT_SCHEDULE, MaintenanceSchedule } from '../data/motorcycles';

export interface MaintenanceAlert {
  item: string;
  nextKm: number;
  remainingKm: number;
  status: 'ok' | 'near' | 'late';
  lastKm: number | null;
}

export function getMaintenanceAlerts(moto: any, logs: any[]): MaintenanceAlert[] {
  const brandModels = MOTORCYCLE_DATABASE[moto.marca] || [];
  const modelInfo = brandModels.find(m => m.name === moto.modelo);
  const schedule = modelInfo?.schedule || DEFAULT_SCHEDULE;

  const alerts: MaintenanceAlert[] = [];

  // 1. Óleo
  const oilLogs = logs.filter(l => l.tipo === 'Óleo');
  const lastOilKm = oilLogs.length > 0 ? Math.max(...oilLogs.map(l => l.quilometragem)) : 0;
  const nextOil = lastOilKm === 0 ? schedule.firstRevision : lastOilKm + schedule.oilChange;
  alerts.push(createAlert('Troca de Óleo', nextOil, moto.quilometragem_atual, lastOilKm));

  // 2. Filtro de Ar
  if (schedule.airFilter) {
    const airLogs = logs.filter(l => l.tipo === 'Filtro de ar');
    const lastAirKm = airLogs.length > 0 ? Math.max(...airLogs.map(l => l.quilometragem)) : 0;
    const nextAir = lastAirKm === 0 ? schedule.airFilter : lastAirKm + schedule.airFilter;
    alerts.push(createAlert('Filtro de Ar', nextAir, moto.quilometragem_atual, lastAirKm));
  }

  // 3. Velas
  if (schedule.sparkPlugs) {
    const sparkLogs = logs.filter(l => l.tipo === 'Velas');
    const lastSparkKm = sparkLogs.length > 0 ? Math.max(...sparkLogs.map(l => l.quilometragem)) : 0;
    const nextSpark = lastSparkKm === 0 ? schedule.sparkPlugs : lastSparkKm + schedule.sparkPlugs;
    alerts.push(createAlert('Velas de Ignição', nextSpark, moto.quilometragem_atual, lastSparkKm));
  }

  // 4. Revisão Geral (baseado em regularRevision)
  const lastRevKm = logs.length > 0 ? Math.max(...logs.map(l => l.quilometragem)) : 0;
  const nextRev = lastRevKm === 0 ? schedule.firstRevision : lastRevKm + schedule.regularRevision;
  alerts.push(createAlert('Revisão Geral', nextRev, moto.quilometragem_atual, lastRevKm));

  return alerts.sort((a, b) => a.remainingKm - b.remainingKm);
}

function createAlert(item: string, nextKm: number, currentKm: number, lastKm: number): MaintenanceAlert {
  const remaining = nextKm - currentKm;
  let status: 'ok' | 'near' | 'late' = 'ok';
  
  if (remaining <= 0) status = 'late';
  else if (remaining <= 500) status = 'near';

  return {
    item,
    nextKm,
    remainingKm: remaining,
    status,
    lastKm: lastKm > 0 ? lastKm : null
  };
}
