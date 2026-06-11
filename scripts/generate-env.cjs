const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'src', 'environments', 'environment.generated.ts');

const fallback = {
  production: true,
  apiUrl: '/api',
};

// El panel de cuentas demo (credenciales del seeder) se muestra por defecto
// (es un despliegue de demo). Se puede ocultar con DEMO_ACCOUNTS=false.

function parseEnv(content) {
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

function toBoolean(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

const fileEnv = fs.existsSync(envPath)
  ? parseEnv(fs.readFileSync(envPath, 'utf8'))
  : {};

// Precedencia: variable de entorno del build (Vercel) > archivo .env local > fallback.
// Así en Vercel basta con definir API_URL en el panel, sin commitear URLs.
const production = toBoolean(process.env.PRODUCTION ?? fileEnv.PRODUCTION, fallback.production);

const environment = {
  production,
  apiUrl: process.env.API_URL || fileEnv.API_URL || fallback.apiUrl,
  demoAccounts: toBoolean(process.env.DEMO_ACCOUNTS ?? fileEnv.DEMO_ACCOUNTS, true),
};

const output = `export const environment = ${JSON.stringify(environment, null, 2)};\n`;

fs.writeFileSync(outputPath, output, 'utf8');
