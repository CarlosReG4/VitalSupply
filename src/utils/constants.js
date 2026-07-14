export const mainCategories = [
  { nombre: 'SpO2', icon: 'fas fa-fingerprint' },
  { nombre: 'ECG', icon: 'fas fa-wave-square' },
  { nombre: 'EKG', icon: 'fas fa-heartbeat' },
  { nombre: 'NIBP', icon: 'fas fa-stethoscope' },
  { nombre: 'IBP', icon: 'fas fa-tint' },
  { nombre: 'Temperature', icon: 'fas fa-thermometer-half' },
  { nombre: 'Fetal', icon: 'fas fa-baby' },
  { nombre: 'Oxygen Sensors', icon: 'fas fa-lungs' },
  { nombre: 'Veterinary', icon: 'fas fa-paw' },
];

export const MAPA_SUBCATEGORIAS = [
  // SpO2
  { db: "spo2_direct_connect_sensors", url: "direct-connect-spo2-sensors", title: "Direct-Connect SpO2 Sensors", main: "SpO2" },
  { db: "spo2_short_sensors", url: "short-spo2-sensors", title: "Short SpO2 Sensors", main: "SpO2" },
  { db: "spo2_adapter_cables", url: "spo2-adapter-cables", title: "SpO2 Adapter Cables", main: "SpO2" },
  { db: "spo2_disposable_sensors", url: "disposable-spo2-sensors", title: "Disposable SpO2 Sensors", main: "SpO2" },
  { db: "spo2_accessories", url: "spo2-accessories", title: "SpO2 Accessories", main: "SpO2" },
  
  // ECG
  { db: "ecg_direct_connect_cables", url: "direct-connect-ecg-cables", title: "Direct-Connect ECG Cables", main: "ECG" },
  { db: "ecg_leadwires", url: "ecg-leadwires", title: "ECG Leadwires", main: "ECG" },
  { db: "ecg_telemetry_leadwires", url: "ecg-telemetry-leadwires", title: "ECG Telemetry Leadwires", main: "ECG" },
  { db: "ecg_trunk_cables", url: "ecg-trunk-cables", title: "ECG Trunk Cables", main: "ECG" },
  { db: "ecg_disposable_direct_connect_cables", url: "disposable-direct-connect-ecg-cables", title: "Disposable Direct-Connect ECG Cables", main: "ECG" },
  { db: "ecg_disposable_electrodes", url: "disposable-ecg-electrodes", title: "Disposable ECG Electrodes", main: "ECG" },
  { db: "ecg_disposable_leadwires", url: "disposable-ecg-leadwires", title: "Disposable ECG Leadwires", main: "ECG" },
  { db: "ecg_accessories", url: "ecg-accessories", title: "ECG Accessories", main: "ECG" },
  
  // EKG
  { db: "ekg_direct_connect_cables", url: "direct-connect-ekg-cables", title: "Direct-Connect EKG Cables", main: "EKG" },
  { db: "ekg_leadwires", url: "ekg-leadwires", title: "EKG Leadwires", main: "EKG" },
  { db: "ekg_trunk_cables", url: "ekg-trunk-cables", title: "EKG Trunk Cables", main: "EKG" },
  
  // NIBP
  { db: "nibp_cuffs", url: "nibp-cuffs", title: "NIBP Cuffs", main: "NIBP" }, 
  { db: "nibp_hoses", url: "nibp-hoses", title: "NIBP Hoses", main: "NIBP" },
  { db: "nibp_connectors", url: "nibp-connectors", title: "NIBP Connectors", main: "NIBP" },
  { db: "nibp_disposable_cuffs", url: "disposable-nibp-cuffs", title: "Disposable NIBP Cuffs", main: "NIBP" },
  
  // IBP
  { db: "ibp_adapter_cables", url: "ibp-adapter-cables", title: "IBP Adapter Cables", main: "IBP" },
  { db: "ibp_disposable_transducers", url: "ibp-disposable-transducers", title: "IBP Disposable Transducers", main: "IBP" },
  
  // Temperature
  { db: "temperature_reusable_probes", url: "reusable-temperature-probes", title: "Reusable Temperature Probes", main: "Temperature" },
  { db: "temperature_disposable_probes", url: "disposable-temperature-probes", title: "Disposable Temperature Probes", main: "Temperature" },
  { db: "temperature_adapters", url: "temperature-adapters", title: "Temperature Adapters", main: "Temperature" },
 
  // Fetal
  { db: "fetal_ultrasound_transducers", url: "ultrasound-transducers", title: "Ultrasound Transducers", main: "Fetal" },
  { db: "fetal_toco_transducers", url: "toco-transducers", title: "Toco Transducers", main: "Fetal" },
  { db: "fetal_transducers_repair_cables", url: "transducers-repair-cables", title: "Transducers Repair Cables", main: "Fetal" },
  { db: "fetal_transducers_repair_cases", url: "transducers-repair-cases", title: "Transducers Repair Cases", main: "Fetal" },
  { db: "fetal_fse_cables", url: "fse-cables", title: "FSE Cables", main: "Fetal" },
  
  // Oxygen Sensors
  { db: "o2_sensors", url: "oxygen-sensors", title: "Oxygen Sensors", main: "Oxygen Sensors" },
  { db: "o2_flow_sensors", url: "flow-sensors", title: "Flow Sensors", main: "Oxygen Sensors" },
  { db: "o2_etco2_sensors", url: "etco2-sensors", title: "EtCO2 Sensors", main: "Oxygen Sensors" }
];