
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import {
  createPolicyInputSchema,
  createControlInputSchema,
  createRiskInputSchema,
  createAssetInputSchema,
  createVulnerabilityInputSchema,
  createIncidentInputSchema,
  createAuditFindingInputSchema
} from './schema';
import { createPolicy } from './handlers/create_policy';
import { getPolicies } from './handlers/get_policies';
import { createControl } from './handlers/create_control';
import { getControls } from './handlers/get_controls';
import { createRisk } from './handlers/create_risk';
import { getRisks } from './handlers/get_risks';
import { createAsset } from './handlers/create_asset';
import { getAssets } from './handlers/get_assets';
import { createVulnerability } from './handlers/create_vulnerability';
import { getVulnerabilities } from './handlers/get_vulnerabilities';
import { createIncident } from './handlers/create_incident';
import { getIncidents } from './handlers/get_incidents';
import { createAuditFinding } from './handlers/create_audit_finding';
import { getAuditFindings } from './handlers/get_audit_findings';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Policy routes
  createPolicy: publicProcedure
    .input(createPolicyInputSchema)
    .mutation(({ input }) => createPolicy(input)),
  getPolicies: publicProcedure
    .query(() => getPolicies()),
  
  // Control routes
  createControl: publicProcedure
    .input(createControlInputSchema)
    .mutation(({ input }) => createControl(input)),
  getControls: publicProcedure
    .query(() => getControls()),
  
  // Risk routes
  createRisk: publicProcedure
    .input(createRiskInputSchema)
    .mutation(({ input }) => createRisk(input)),
  getRisks: publicProcedure
    .query(() => getRisks()),
  
  // Asset routes
  createAsset: publicProcedure
    .input(createAssetInputSchema)
    .mutation(({ input }) => createAsset(input)),
  getAssets: publicProcedure
    .query(() => getAssets()),
  
  // Vulnerability routes
  createVulnerability: publicProcedure
    .input(createVulnerabilityInputSchema)
    .mutation(({ input }) => createVulnerability(input)),
  getVulnerabilities: publicProcedure
    .query(() => getVulnerabilities()),
  
  // Incident routes
  createIncident: publicProcedure
    .input(createIncidentInputSchema)
    .mutation(({ input }) => createIncident(input)),
  getIncidents: publicProcedure
    .query(() => getIncidents()),
  
  // Audit Finding routes
  createAuditFinding: publicProcedure
    .input(createAuditFindingInputSchema)
    .mutation(({ input }) => createAuditFinding(input)),
  getAuditFindings: publicProcedure
    .query(() => getAuditFindings()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
