/**
 * Synchronise (crée ou met à jour) les templates Brevo nécessaires à KYA.
 *
 * Utilisation :
 *   BREVO_API_KEY=... node scripts/sync-brevo-templates.mjs
 *
 * Sortie : log des templateId créés/mis à jour, à recopier dans l'env Render :
 *   BREVO_TEMPLATE_ID_ADMIN_REQUEST_CREATED=...
 *   BREVO_TEMPLATE_ID_ADMIN_REQUEST_APPROVED=...
 */

import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const API_KEY = process.env.BREVO_API_KEY
if (!API_KEY) {
  console.error('BREVO_API_KEY manquant dans l\'environnement.')
  process.exit(1)
}

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'no-reply@brevosend.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Keur Ya Aicha'
const LOGO_URL =
  process.env.BREVO_LOGO_URL ||
  'https://raw.githubusercontent.com/MalickDevWeb/keur_ya_aicha_frontend/main/assets/icon.png'

const palette = {
  // Palette claire alignée sur la page de login (bleu + blanc)
  page: '#f5f8ff',
  card: '#ffffff',
  accent: '#2563eb',
  accentSoft: '#e8f0ff',
  text: '#0f172a',
  muted: '#64748b',
  border: '#dbe7ff',
}

const htmlBase = ({
  pill,
  buttonText = 'Se connecter',
  buttonHref = 'https://keur-ya-aicha-frontend.vercel.app/auth/login',
}) => `<!doctype html><html><head><meta charset="UTF-8" />
<style>
body{margin:0;font-family:'Segoe UI',Arial;background:${palette.page};color:${palette.text};}
.wrap{max-width:680px;margin:28px auto;padding:16px;}
.card{background:${palette.card};border-radius:16px;border:1px solid ${palette.border};box-shadow:0 16px 40px rgba(37,99,235,0.08);overflow:hidden;}
.header{padding:18px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid ${palette.border};background:#f9fbff;}
.logo{width:44px;height:44px;border-radius:12px;background:#fff;border:1px solid ${palette.border};display:flex;align-items:center;justify-content:center;font-weight:800;color:${palette.accent};}
.body{padding:20px;}
.pill{display:inline-block;background:${palette.accentSoft};color:${palette.accent};padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;}
.cta{display:inline-block;margin-top:16px;background:${palette.accent};color:#fff;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:700;}
.footer{padding:12px 18px;font-size:12px;color:${palette.muted};text-align:center;background:#f9fbff;border-top:1px solid ${palette.border};}
.row{display:flex;justify-content:space-between;padding:8px 0;color:${palette.text};font-size:14px;border-bottom:1px solid #eef2ff;}
.label{color:${palette.muted};}
</style></head>
<body><div class="wrap"><div class="card">
<div class="header"><div class="logo">${
  LOGO_URL
    ? `<img src="${LOGO_URL}" alt="KYA" style="max-width:100%;max-height:100%;border-radius:10px;" />`
    : 'KYA'
}</div>
  <div>
    <div style="font-weight:800;color:${palette.text};">{{ params.sujet }}</div>
    <div style="color:${palette.muted};font-size:13px;">{{ params.evenement }}</div>
  </div>
</div>
<div class="body">
  <span class="pill">${pill}</span>
  <p style="margin:12px 0;color:${palette.text};line-height:1.5;">{{ params.message }}</p>
  <div class="row"><span class="label">Nom</span><strong>{{ params.details.name }}</strong></div>
  <div class="row"><span class="label">Email</span><strong>{{ params.details.email }}</strong></div>
  <div class="row"><span class="label">Téléphone</span><strong>{{ params.details.phone }}</strong></div>
  <div class="row"><span class="label">Entreprise</span><strong>{{ params.details.entrepriseName }}</strong></div>
  <a class="cta" href="${buttonHref}">${buttonText}</a>
</div>
<div class="footer">Keur Ya Aicha · Notifications sécurisées</div>
</div></div></body></html>`

const templates = [
  {
    code: 'ADMIN_REQUEST_CREATED',
    name: 'KYA - Demande admin créée',
    subject: 'Nouvelle demande administrateur à valider',
    htmlContent: htmlBase({ pill: 'ADMIN_REQUEST_CREATED' }),
  },
  {
    code: 'ADMIN_REQUEST_APPROVED',
    name: 'KYA - Demande admin approuvée',
    subject: 'Votre accès administrateur est approuvé',
    htmlContent: htmlBase({
      pill: 'ADMIN_REQUEST_APPROVED',
      buttonText: 'Se connecter',
      buttonHref: 'https://keur-ya-aicha-frontend.vercel.app/auth/login',
    }),
  },
  {
    code: 'CLIENT_PAYMENT_OVERDUE',
    name: 'KYA - Paiement client en retard',
    subject: 'Votre paiement est en retard',
    htmlContent: htmlBase({
      pill: 'CLIENT_PAYMENT_OVERDUE',
      buttonText: 'Se connecter',
      buttonHref: 'https://keur-ya-aicha-frontend.vercel.app/auth/login',
    }),
  },
  {
    code: 'ADMIN_SUBSCRIPTION_PAYMENT_RECORDED',
    name: 'KYA - Paiement abonnement admin enregistré',
    subject: 'Paiement abonnement enregistré',
    htmlContent: htmlBase({
      pill: 'ADMIN_SUBSCRIPTION_PAYMENT_RECORDED',
      buttonText: 'Voir mon espace',
      buttonHref: 'https://keur-ya-aicha-frontend.vercel.app/auth/login',
    }),
  },
  {
    code: 'GENERIC',
    name: 'KYA - Notification générique',
    subject: '{{ params.sujet }}',
    htmlContent: htmlBase({
      pill: 'NOTIFICATION',
      buttonText: 'Ouvrir KYA',
      buttonHref: 'https://keur-ya-aicha-frontend.vercel.app',
    }),
  },
]

const brevoFetch = (path, options = {}) =>
  fetch(`https://api.brevo.com/v3${path}`, {
    ...options,
    headers: {
      'api-key': API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  })

async function listTemplates() {
  const res = await brevoFetch('/smtp/templates?limit=50&offset=0')
  if (!res.ok) throw new Error(`List templates failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json?.templates || []
}

async function upsertTemplate(tpl, existing) {
  const payload = {
    tag: tpl.code,
    templateName: tpl.name,
    sender: { email: SENDER_EMAIL, name: SENDER_NAME },
    subject: tpl.subject,
    htmlContent: tpl.htmlContent,
    isActive: true,
  }

  if (existing) {
    const res = await brevoFetch(`/smtp/templates/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Update ${tpl.code} failed: ${res.status} ${await res.text()}`)
    const text = await res.text()
    if (!text) return existing.id
    try {
      const json = JSON.parse(text)
      return json.id || existing.id
    } catch {
      return existing.id
    }
  }

  const res = await brevoFetch('/smtp/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Create ${tpl.code} failed: ${res.status} ${await res.text()}`)
  const json = await res.json()
  return json.id
}

async function main() {
  const existing = await listTemplates()
  const results = {}

  for (const tpl of templates) {
    const found = existing.find(
      (t) =>
        String(t.tag || '').toUpperCase() === tpl.code ||
        String(t.name || '').trim().toLowerCase() === tpl.name.trim().toLowerCase()
    )
    const id = await upsertTemplate(tpl, found)
    results[tpl.code] = id
    console.log(`${tpl.code} -> templateId=${id}`)
  }

  console.log('\nÀ mettre dans Render (.env) :')
  console.log(`BREVO_TEMPLATE_ID_ADMIN_REQUEST_CREATED=${results.ADMIN_REQUEST_CREATED}`)
  console.log(`BREVO_TEMPLATE_ID_ADMIN_REQUEST_APPROVED=${results.ADMIN_REQUEST_APPROVED}`)
  console.log(`BREVO_TEMPLATE_ID_CLIENT_PAYMENT_OVERDUE=${results.CLIENT_PAYMENT_OVERDUE}`)
  console.log(
    `BREVO_TEMPLATE_ID_ADMIN_SUBSCRIPTION_PAYMENT_RECORDED=${results.ADMIN_SUBSCRIPTION_PAYMENT_RECORDED}`
  )
  console.log(`BREVO_TEMPLATE_ID_GENERIC=${results.GENERIC}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
