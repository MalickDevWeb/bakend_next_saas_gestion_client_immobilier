export class EntiteInventoryTemplate {
  constructor(
    public readonly id: string,
    public readonly adminId: string,
    public readonly nom: string,
    public readonly corps: string,
    public readonly placeholders: Record<string, unknown> | null,
    public readonly isTable: boolean,
    public readonly version: number,
    public readonly creeLe: Date,
    public readonly misAJourLe: Date
  ) {}
}
