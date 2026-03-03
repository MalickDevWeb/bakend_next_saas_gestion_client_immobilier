import { hash, verify } from '@node-rs/argon2'
import { InterfaceServiceHachageMotDePasse } from '@/src/coeur/interfaces/InterfaceServiceHachageMotDePasse'

export class ServiceHachageMotDePasseArgon2 implements InterfaceServiceHachageMotDePasse {
  public async hacher(motDePasseClair: string): Promise<string> {
    return hash(motDePasseClair, {
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    })
  }

  public async verifier(motDePasseClair: string, motDePasseHache: string): Promise<boolean> {
    return verify(motDePasseHache, motDePasseClair)
  }
}
