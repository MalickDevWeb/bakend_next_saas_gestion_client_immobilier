import { randomUUID } from 'node:crypto'

export class UtilitaireIdentifiant {
  public static generer(): string {
    return randomUUID()
  }
}
