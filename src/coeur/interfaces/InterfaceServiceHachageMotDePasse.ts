export interface InterfaceServiceHachageMotDePasse {
  hacher(motDePasseClair: string): Promise<string>
  verifier(motDePasseClair: string, motDePasseHache: string): Promise<boolean>
}
