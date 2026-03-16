import crypto from 'crypto'
import { v4 as uuid } from 'uuid'

type TypePayloadContrat = Record<string, unknown>

export type TypeResultatRenduContrat = {
  pdfUrl: string | null
  hashContenu: string
  payloadRendu: string
}

type TypeConfigCloudinary = { apiKey: string; apiSecret: string; cloudName: string }

export class ServiceRenduContrat {
  public async rendre(
    corpsTemplate: string,
    donnees: TypePayloadContrat
  ): Promise<TypeResultatRenduContrat> {
    const html = this.remplacerPlaceholders(corpsTemplate, donnees)
    const hash = crypto.createHash('sha256').update(html, 'utf8').digest('hex')

    const pdfBuffer = await this.genererPdf(html).catch(() => null)
    const pdfUrl = pdfBuffer ? await this.uploaderCloudinary(pdfBuffer) : null

    return {
      pdfUrl,
      hashContenu: hash,
      payloadRendu: html,
    }
  }

  // --- PDF rendering ---
  private async genererPdf(html: string): Promise<Buffer | null> {
    let PDFDocument: any
    try {
      // Chargement dynamique pour éviter l’échec si pdfkit est absent
      PDFDocument = (await import('pdfkit')).default
    } catch {
      return null
    }
    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []
    return await new Promise<Buffer>((resolve) => {
      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))

      doc.fontSize(16).text('Contrat', { align: 'center' })
      doc.moveDown()
      doc.fontSize(10).text(this.nettoyerHtml(html), { align: 'left' })
      doc.end()
    })
  }

  // --- Upload Cloudinary ---
  private async uploaderCloudinary(buffer: Buffer): Promise<string | null> {
    const cfg = this.lireConfigCloudinary()
    if (!cfg) return null

    const folder = 'contracts'
    const arrayBuffer = Uint8Array.from(buffer).buffer
    const fileBlob = new Blob([arrayBuffer], { type: 'application/pdf' })

    // 1) Si un upload_preset est dispo, utiliser l'upload unsigned (même logique que l'upload photo qui marche déjà)
    const uploadPreset = String(process.env.CLOUDINARY_UPLOAD_PRESET || '').trim()
    if (uploadPreset) {
      const form = new FormData()
      form.append('file', fileBlob, `contract-${uuid()}.pdf`)
      form.append('upload_preset', uploadPreset)
      form.append('folder', folder)

      const resUnsigned = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`, {
        method: 'POST',
        body: form,
      })
      if (resUnsigned.ok) {
        const payload = (await resUnsigned.json().catch(() => ({}))) as {
          secure_url?: string
          url?: string
        }
        const url = payload.secure_url || payload.url
        if (url) return url
      }
      // Si l'unsigned échoue, on tente le signed juste après
    }

    // 2) Fallback: upload signé
    const timestamp = Math.floor(Date.now() / 1000)
    const params: Record<string, string> = { timestamp: String(timestamp), folder }
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    const signature = crypto.createHash('sha1').update(`${toSign}${cfg.apiSecret}`).digest('hex')

    const form = new FormData()
    form.append('file', fileBlob, `contract-${uuid()}.pdf`)
    form.append('api_key', cfg.apiKey)
    form.append('timestamp', String(timestamp))
    form.append('signature', signature)
    form.append('folder', folder)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return null
    const payload = (await res.json().catch(() => ({}))) as { secure_url?: string; url?: string }
    return payload.secure_url || payload.url || null
  }

  private lireConfigCloudinary(): TypeConfigCloudinary | null {
    const url = String(process.env.CLOUDINARY_URL || '').trim()
    const envFromUrl = this.parserCloudinaryUrl(url)
    const apiKey = String(process.env.CLOUDINARY_API_KEY || envFromUrl?.apiKey || '').trim()
    const apiSecret = String(process.env.CLOUDINARY_API_SECRET || envFromUrl?.apiSecret || '').trim()
    const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || envFromUrl?.cloudName || '').trim()
    if (!cloudName) return null
    return { apiKey, apiSecret, cloudName }
  }

  private parserCloudinaryUrl(valeur: string): TypeConfigCloudinary | null {
    const brute = String(valeur || '').trim()
    if (!brute || !brute.startsWith('cloudinary://')) return null
    try {
      const sansProtocole = brute.slice('cloudinary://'.length)
      const [authPart, cloudNamePart] = sansProtocole.split('@')
      const [apiKeyPart, apiSecretPart] = String(authPart || '').split(':')
      const apiKey = String(apiKeyPart || '').trim()
      const apiSecret = String(apiSecretPart || '').trim()
      const cloudName = String(cloudNamePart || '').trim()
      if (!apiKey || !apiSecret || !cloudName) return null
      return { apiKey, apiSecret, cloudName }
    } catch {
      return null
    }
  }

  private remplacerPlaceholders(template: string, data: Record<string, unknown>): string {
    return template.replace(/\\{\\{\\s*([^\\s}]+)\\s*\\}\\}/g, (_, key: string) => {
      const valeur = this.lireChemin(data, key)
      if (valeur === null || valeur === undefined) return ''
      return String(valeur)
    })
  }

  private lireChemin(data: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: any = data
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return undefined
      }
    }
    return current
  }

  private nettoyerHtml(html: string): string {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  }
}
