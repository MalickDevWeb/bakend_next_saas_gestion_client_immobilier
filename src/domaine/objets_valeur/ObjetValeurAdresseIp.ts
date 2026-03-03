export class ObjetValeurAdresseIp {
  public readonly valeur: string

  constructor(valeur: string) {
    const normalise = String(valeur || '').trim()
    const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/
    if (!ipv4.test(normalise) && !ipv6.test(normalise)) {
      throw new Error('Adresse IP invalide')
    }
    this.valeur = normalise
  }
}
