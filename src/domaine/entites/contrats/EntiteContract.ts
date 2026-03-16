export class EntiteContract {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public readonly clientId: string,
    public readonly locationId: string | null,
    public readonly templateId: string | null,
    public readonly statut: 'pending_signature' | 'signed' | 'draft',
    public readonly pdfUrl: string | null,
    public readonly payload: Record<string, unknown> | null,
    public readonly hashContenu: string | null,
    public readonly signeLe: Date | null,
    public readonly creeLe: Date,
    public readonly misAJourLe: Date
  ) {}
}
