export class SeederAbstrait {
  constructor(prisma) {
    this.prisma = prisma
  }

  async executer() {
    throw new Error('Methode executer() non implementee')
  }
}
