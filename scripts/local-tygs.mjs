import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { createHash, randomBytes } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataDir = process.env.LOCAL_RUN_DATA_DIR ? path.resolve(process.env.LOCAL_RUN_DATA_DIR) : path.join(root, "local-tygs-data");
const backendPort = Number(process.env.LOCAL_BACKEND_PORT || 8097);
const frontendPort = Number(process.env.LOCAL_FRONTEND_PORT || 5197);
const frontendMode = process.env.LOCAL_FRONTEND_MODE || "preview";
if (!["preview", "dev"].includes(frontendMode)) throw new Error("LOCAL_FRONTEND_MODE must be preview or dev");
const frontendBuild = path.join(dataDir, "frontend-build");
if ([backendPort, frontendPort].some(port => !Number.isInteger(port) || port < 1024 || port > 65535) || backendPort === frontendPort) throw new Error("Use two distinct local ports between 1024 and 65535");
const credentialsPath = path.join(dataDir, "credentials.json");
const javaHome = process.env.JAVA_HOME;
const java = javaHome ? path.join(javaHome, "bin/java") : "java";
const backendDir = path.join(root, "tygs-java");
const frontendDir = path.join(root, "tygs");
const jar = path.join(backendDir, "target/market-0.0.1-SNAPSHOT.jar");
const vite = path.join(frontendDir, "node_modules/vite/bin/vite.js");
const servers = [
  { name: "backend", executable: java, args: ["-Xmx768m", "-jar", jar], cwd: backendDir, port: backendPort, match: jar },
  { name: "frontend", executable: process.execPath, args: [vite, ...(frontendMode === "preview" ? ["preview", "--outDir", frontendBuild] : []), "--host", "127.0.0.1", "--port", String(frontendPort), "--strictPort"], cwd: frontendDir, port: frontendPort, match: vite },
];

async function occupied(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: "127.0.0.1", port });
    const finish = value => { socket.destroy(); resolve(value); };
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.setTimeout(500, () => finish(false));
  });
}

function ownedPid(server) {
  const file = path.join(dataDir, `${server.name}.pid`);
  if (!fs.existsSync(file)) return null;
  const pid = Number(fs.readFileSync(file, "utf8"));
  if (!Number.isInteger(pid) || pid < 2) throw new Error("Invalid local PID file");
  let processInfo;
  try { processInfo = execFileSync("ps", ["-p", String(pid), "-o", "stat=", "-o", "command="], { encoding: "utf8" }).trim(); }
  catch { return null; }
  const [, state, command] = /^(\S+)\s+([\s\S]*)$/.exec(processInfo) || [];
  if (state?.startsWith("Z")) return null;
  if (!command?.includes(server.match)) throw new Error(`PID ${pid} no longer belongs to this ${server.name}; refusing to stop it`);
  return pid;
}

const action = process.argv[2] || "status";
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
fs.chmodSync(dataDir, 0o700);
if (action === "start") {
  for (const server of servers) if (await occupied(server.port)) throw new Error(`Port ${server.port} is occupied; no existing process was changed`);
  if (!fs.existsSync(jar) || !fs.existsSync(vite)) throw new Error("Build the backend and install the frontend dependencies first");
  try { execFileSync(java, ["-version"], { stdio: "ignore" }); }
  catch { throw new Error("Java is unavailable; set JAVA_HOME to a Java 17+ installation"); }
  if (!fs.existsSync(credentialsPath)) {
    if (fs.existsSync(path.join(dataDir, "facilities.mv.db"))) throw new Error("Existing database has no credential file; refusing to replace credentials");
    fs.writeFileSync(credentialsPath, JSON.stringify({ userName: "local-admin", passWord: randomBytes(18).toString("base64url"), dbPassword: randomBytes(24).toString("base64url") }, null, 2), { mode: 0o600, flag: "wx" });
  }
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  const env = { ...process.env, PORT: String(backendPort), SPRING_PROFILES_ACTIVE: "local", LOCAL_DATA_DIR: dataDir,
	APP_CORS_ALLOWED_ORIGINS: `http://127.0.0.1:${frontendPort},http://localhost:${frontendPort}`,
    LOCAL_ADMIN_PASSWORD: credentials.passWord, LOCAL_DB_PASSWORD: credentials.dbPassword,
    VITE_API_BASE: "/api", VITE_API_PROXY: `http://127.0.0.1:${backendPort}`, VITE_LOCAL_LEDGER: "1" };
  if (frontendMode === "preview") {
    execFileSync(process.execPath, [vite, "build", "--outDir", frontendBuild, "--emptyOutDir"], { cwd: frontendDir, env, stdio: "inherit" });
  }
  for (const server of servers) {
    const log = fs.openSync(path.join(dataDir, `${server.name}.log`), "a", 0o600);
    const child = spawn(server.executable, server.args, { cwd: server.cwd, env, detached: true, stdio: ["ignore", log, log] });
    child.unref(); fs.closeSync(log);
    fs.writeFileSync(path.join(dataDir, `${server.name}.pid`), String(child.pid), { mode: 0o600 });
  }
  for (const server of servers) {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (await occupied(server.port)) { ready = true; break; }
      if (!ownedPid(server)) throw new Error(`${server.name} exited; inspect its log in ${dataDir}`);
      await delay(500);
    }
    if (!ready) throw new Error(`${server.name} did not start in time; inspect its log`);
  }
  console.log(JSON.stringify({ url: `http://127.0.0.1:${frontendPort}/home/ledger`, credentialsPath, dataDir, frontendMode }));
} else if (action === "stop") {
  for (const server of [...servers].reverse()) {
    const pid = ownedPid(server);
    if (!pid) continue;
    process.kill(pid, "SIGTERM");
    for (let i = 0; i < 60 && ownedPid(server); i++) await delay(500);
    if (ownedPid(server)) throw new Error(`${server.name} has not stopped; database was not force-killed`);
    fs.unlinkSync(path.join(dataDir, `${server.name}.pid`));
  }
  console.log("Local servers stopped; database and source copies retained.");
} else if (action === "backup") {
  for (const server of servers) if (ownedPid(server) || await occupied(server.port)) throw new Error("Stop the local servers before making a consistent database backup");
  const h2 = process.env.H2_JAR || path.join(os.homedir(), ".m2/repository/com/h2database/h2/2.4.240/h2-2.4.240.jar");
  if (!fs.existsSync(h2)) throw new Error("Set H2_JAR to the H2 2.4.240 runtime jar");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = path.join(dataDir, "snapshots", stamp);
  fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
  const hashes = {};
  for (const name of ["facilities.mv.db", "credentials.json"]) {
    const source = path.join(dataDir, name), target = path.join(destination, name);
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    fs.chmodSync(target, 0o600);
    const hash = file => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (hash(source) !== hash(target)) throw new Error(`Backup checksum mismatch: ${name}`);
    hashes[name] = hash(target);
  }
  const restoreDir = fs.mkdtempSync(path.join(destination, "restore-check-"));
  fs.chmodSync(restoreDir, 0o700);
  fs.copyFileSync(path.join(destination, "facilities.mv.db"), path.join(restoreDir, "facilities.mv.db"));
  const credentials = JSON.parse(fs.readFileSync(path.join(destination, "credentials.json"), "utf8"));
  const sql = "SELECT kind, COUNT(*) AS records FROM ledger_record GROUP BY kind ORDER BY kind; SELECT linkStatus, COUNT(*) AS records FROM ledger_record GROUP BY linkStatus ORDER BY linkStatus; SELECT 'watermeterroom' AS facility, COUNT(*) AS records FROM watermeterroom UNION ALL SELECT 'watermeterwell', COUNT(*) FROM watermeterwell UNION ALL SELECT 'valuewell', COUNT(*) FROM valuewell UNION ALL SELECT 'firehydrant', COUNT(*) FROM firehydrant;";
  let readback;
  try {
    readback = execFileSync(java, ["-cp", h2, "org.h2.tools.Shell", "-url", `jdbc:h2:file:${path.join(restoreDir, "facilities")};MODE=MySQL;DATABASE_TO_LOWER=TRUE;IFEXISTS=TRUE`, "-user", "local", "-password", credentials.dbPassword, "-sql", sql], { encoding: "utf8" });
  } catch {
    throw new Error(`Backup saved but restore verification failed; files retained at ${destination}`);
  }
  if (/Exception|Error/i.test(readback)) throw new Error(`Restore query failed; files retained at ${destination}`);
  fs.writeFileSync(path.join(destination, "receipt.json"), JSON.stringify({ time: new Date().toISOString(), hashes, restoreReadback: readback }, null, 2), { mode: 0o600 });
  fs.rmSync(restoreDir, { recursive: true });
  console.log(JSON.stringify({ backup: destination, restoredCopyQueried: true, readback }));
} else if (action === "status") {
  for (const server of servers) console.log(JSON.stringify({ name: server.name, port: server.port, ownedPid: ownedPid(server), listening: await occupied(server.port) }));
} else {
  throw new Error("Use start, stop, status, or backup");
}
