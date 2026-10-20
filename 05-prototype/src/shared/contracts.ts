import { serviceIds,departmentIds,type ServiceId,type DepartmentId } from './catalog-ids';
export type { ServiceId,DepartmentId } from './catalog-ids';
import { z } from 'zod';
export const modes = ['RETURN_TO_DOCTOR', 'COLLECT_PAPER'] as const;
export type Mode = typeof modes[number];
export type Actor = 'patient' | 'doctor' | 'procedure' | 'control';
export type ProcedureQueueMethod = 'PAPER_TRAY' | 'TAKE_NUMBER';
export type TransportMode = 'lift' | 'stairs';
export { serviceIds, departmentIds } from './catalog-ids';
export interface DepartmentDefinition { id: DepartmentId; name: string; shortName: string; locationId: string }
export type Phase = 'UNREGISTERED' | 'WAITING_INITIAL' | 'INITIAL_ENCOUNTER' | 'SERVICES' | 'READY' | 'REVIEW_ENCOUNTER' | 'COMPLETED';
export interface Location { id: string; name: string; building: string; buildingId: string; floor: number; kind: 'entrance' | 'reception' | 'lift' | 'stairs' | 'connector' | 'room'; roomNumber?: string; x: number; y: number; campusX: number; campusY: number; landmark: string; mapLabel?: string }
export interface MapGraph { buildings: { id: string; name: string; subtitle: string; x: number; y: number; width: number; height: number }[]; locations: Location[]; landmarks?: Location[]; edges: { from: string; to: string; weight: number }[] }
export interface ServiceDefinition { id: ServiceId; name: string; locationId: string; department: string; keywords: string }
export interface Service { id: ServiceId; name: string; locationId: string; enqueuedAt?: string | null; enqueuedRevision?: number; estimatedWaitMinutes: number; resultEtaLabel: string; executionStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; performanceOrder: number | null; resultStatus: 'NOT_AVAILABLE' | 'WAITING' | 'AVAILABLE'; resultConfirmedAt: string | null; paperStatus: 'NOT_REQUIRED' | 'NOT_COLLECTED' | 'COLLECTED'; result: { title: string; content: string } | null }
export interface Notification { id: string; message: string; createdAt: string; read: boolean }
export interface Visit { visitId: string; displayName: string; age: number; journeyVersion?: number; departmentId?: DepartmentId | null; queueNumber?: number | null; transportMode?: TransportMode; recommendedServiceId?: ServiceId | null; phase: Phase; services: Service[]; locationId: string | null; outsideHospital: boolean; returning: boolean; presenceConfirmed: boolean; readySource: 'patient' | 'staff' | 'system' | null; inbox: Notification[]; history: { date: string; content: string }[] }
export interface Encounter { visitId: string; kind: 'initial' | 'review'; status: 'CALLED' | 'IN_PROGRESS'; calledAt: string; startedAt: string | null }
export interface EncounterRecord extends Encounter { endedAt: string; outcome: 'ASSIGNED' | 'COMPLETED' }
export interface SimulationRun { runId: string; generation: number; revision: number; mode: Mode; seed: string; createdAt: string; procedureQueueMethods?: Partial<Record<ServiceId, ProcedureQueueMethod>>; visits: Visit[]; activeEncounter: Encounter | null; activeEncounters?: Partial<Record<DepartmentId, Encounter>>; departmentTicketCounters?: Partial<Record<DepartmentId, number>>; encounterHistory: EncounterRecord[] }
export interface Route { from: string | null; to: string | null; nodeIds: string[]; instructions: string[]; requiresStartConfirmation: boolean }
export interface NextAction { kind: 'REGISTER' | 'WAIT_INITIAL' | 'ENCOUNTER' | 'GO_SERVICE' | 'IN_SERVICE' | 'WAIT_RESULTS' | 'COLLECT_PAPER' | 'RETURN' | 'READY' | 'WAIT_CALL' | 'COMPLETE'; title: string; description: string; destinationId: string | null; serviceId?: ServiceId; canReturn: boolean; canMarkReady: boolean; canLeave: boolean; allowedCommands: CommandType[] }
export interface ActionOption { type: CommandType; serviceId?: ServiceId; enabled: boolean; reason?: string }
export interface ProcedurePlanStep { serviceId: ServiceId; peopleAtRoom: number; distance: number | null }
export interface VisitView { visit: Visit; nextAction: NextAction; route: Route; canReturn: boolean; procedurePlan: ProcedurePlanStep[]; serviceRoutes: Partial<Record<ServiceId, Route>>; controlActions: ActionOption[] }
export interface Snapshot { runId: string; generation: number; revision: number; mode: Mode; createdAt: string; updatedAt: string; facility: string; synthetic: true; visits: Visit[]; activeEncounter: Encounter | null; activeEncounters: Partial<Record<DepartmentId, Encounter>>; departmentCatalog: DepartmentDefinition[]; encounterHistory: EncounterRecord[]; queues: { initial: string[]; review: string[] }; procedureQueues: Record<ServiceId, string[]>; procedureQueueMethods: Record<ServiceId, ProcedureQueueMethod>; serviceCatalog: ServiceDefinition[]; views: Record<string, VisitView>; graph: MapGraph; events: DomainEvent[]; ai: { configured: boolean; model: string | null } }
export const commandTypes = ['REGISTER', 'CALL_INITIAL', 'BEGIN_ENCOUNTER', 'ASSIGN_SERVICES', 'ASSIGN_DEMO_SERVICES', 'CHECK_IN_SERVICE', 'START_SERVICE', 'COMPLETE_SERVICE', 'CONFIRM_RESULT', 'COLLECT_PAPER', 'CONFIRM_LOCATION', 'SET_TRANSPORT_MODE', 'START_RETURN', 'MARK_READY', 'STAFF_MARK_READY', 'WITHDRAW_READY', 'CALL_REVIEW', 'COMPLETE_ENCOUNTER', 'MARK_NOTIFICATION_READ', 'SET_PROCEDURE_QUEUE_METHOD','RESET_VISIT'] as const;
export type CommandType = typeof commandTypes[number];
export const serviceIdSchema = z.enum(serviceIds);
export const commandSchema = z.object({ commandId: z.string().min(1).max(100), runId: z.string().min(1), expectedRevision: z.number().int().nonnegative(), expectedJourneyVersion: z.number().int().nonnegative().optional(), actor: z.enum(['patient', 'doctor', 'procedure', 'control']), type: z.enum(commandTypes), visitId: z.string().min(1), payload: z.object({ departmentId: z.enum(departmentIds).optional(), serviceId: serviceIdSchema.optional(), serviceIds: z.array(serviceIdSchema).min(1).max(serviceIds.length).optional(), locationId: z.string().nullable().optional(), transportMode: z.enum(['lift','stairs']).optional(), outsideHospital: z.boolean().optional(), presenceConfirmed: z.boolean().optional(), notificationId: z.string().optional(), queueMethod: z.enum(['PAPER_TRAY','TAKE_NUMBER']).optional() }).strict().default({}) }).strict();
export type Command = z.infer<typeof commandSchema>;
export const resetSchema = z.object({ commandId: z.string().min(1).max(100), expectedRunId: z.string().min(1), expectedRevision: z.number().int().nonnegative(), actor: z.literal('control'), mode: z.enum(modes), seed: z.string().max(100).default('demo') }).strict();
export type ResetCommand = z.infer<typeof resetSchema>;
export interface DomainEvent { id: string; runId: string; revision: number; type: string; visitId: string | null; at: string; message: string }
export interface CommandResponse { ok: boolean; duplicate?: boolean; code?: string; message?: string; snapshot: Snapshot }
export const assistantSchema = z.object({ runId: z.string(), expectedRevision: z.number().int().nonnegative(), visitId: z.string(), question: z.string().min(1).max(1000), previousIntent: z.string().max(100).optional() }).strict();
export type AssistantRequest = z.infer<typeof assistantSchema>;
export type AiIntent = 'NEXT_ACTION' | 'RESULTS' | 'PAPER' | 'RETURN' | 'READINESS' | 'ROUTE' | 'HELP' | 'OUT_OF_SCOPE';
export interface AssistantAnswer { source: 'LIVE' | 'FALLBACK'; label: string; runId: string; revision: number; intent: AiIntent; answer: string; factIds: string[]; route: Route; reason?: string }
