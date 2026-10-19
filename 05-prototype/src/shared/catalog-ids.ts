export const serviceIds = ['DEMO-US-ABD','DEMO-BLOOD-BIOCHEM','DEMO-URINE','DEMO-XRAY','DEMO-CT','DEMO-EEG','DEMO-ECG','DEMO-ENDO-ESOPHAGUS','DEMO-ENDO-STOMACH'] as const;
export type ServiceId = typeof serviceIds[number];
export const departmentIds = ['DEMO-INTERNAL','DEMO-CARDIOLOGY','DEMO-DENTISTRY','DEMO-ENT','DEMO-DERMATOLOGY'] as const;
export type DepartmentId = typeof departmentIds[number];
