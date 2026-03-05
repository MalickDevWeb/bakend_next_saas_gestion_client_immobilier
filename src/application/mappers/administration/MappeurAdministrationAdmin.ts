import {
  EntiteClient,
  EntiteDocument,
  EntiteExecutionImport,
  EntiteIpBloquee,
  EntiteItemTravail,
  EntiteJournalAudit,
  EntiteLocation,
  EntiteNotification,
  EntitePaiementAbonnementAdmin,
  EntitePaiementCaution,
  EntiteTransactionPaiement,
} from '@/src/domaine/entites'
import {
  TypeStatutMouvement,
  TypeStatutPaiementAdminDto,
} from '@/src/domaine/types/administration'
export class MappeurAdministrationAdmin {
  constructor(
    private readonly statutsPaiement: Map<string, TypeStatutMouvement>,
    private readonly statutsDepot: Map<string, TypeStatutMouvement>
  ) {}
  public mapperClientEnDto(client: EntiteClient): Record<string, unknown> {
    return {
      id: client.id,
      adminId: client.adminId,
      firstName: client.prenom,
      lastName: client.nom,
      phone: client.telephone,
      email: client.email,
      cni: client.cni,
      status: client.statut,
      createdAt: client.creeLe.toISOString(),
      rentals: client.locations.map((location) => this.mapperLocationEnDto(location)),
    }
  }
  public mapperLocationEnDto(
    location: EntiteLocation,
    client?: EntiteClient
  ): Record<string, unknown> {
    return {
      id: location.id,
      clientId: location.clientId,
      clientName: client ? `${client.prenom} ${client.nom}`.trim() : '',
      propertyType: location.typeBien,
      propertyName: location.nomBien,
      monthlyRent: location.loyerMensuel,
      startDate: location.dateDebut.toISOString(),
      deposit: {
        total: location.caution.montantTotal,
        paid: location.caution.montantPaye,
        payments: location.caution.paiements.map((paiement) => this.mapperDepotEnDto(paiement)),
      },
      payments: location.paiementsMensuels.map((paiement) => ({
        id: paiement.id,
        rentalId: paiement.locationId,
        periodStart: paiement.periodeDebut.toISOString(),
        periodEnd: paiement.periodeFin.toISOString(),
        dueDate: paiement.dateEcheance.toISOString(),
        amount: paiement.montantDu,
        paidAmount: paiement.montantPaye,
        status: paiement.statut,
        payments: paiement.transactions.map((transaction) =>
          this.mapperPaiementEnDto(transaction)
        ),
      })),
      documents: location.documents.map((document) => this.mapperDocumentEnDto(document)),
    }
  }
  public mapperDocumentEnDto(document: EntiteDocument): Record<string, unknown> {
    return {
      id: document.id,
      name: document.nom,
      type: document.type,
      url: document.url,
      uploadedAt: document.dateAjout.toISOString(),
      signed: document.estSigne,
    }
  }
  public mapperPaiementEnDto(paiement: EntiteTransactionPaiement): Record<string, unknown> {
    return {
      id: paiement.id,
      amount: paiement.montant,
      date: paiement.datePaiement.toISOString(),
      receiptNumber: paiement.numeroRecu,
      description: paiement.description || '',
      status: this.statutsPaiement.get(paiement.id) || 'completed',
    }
  }
  public mapperDepotEnDto(depot: EntitePaiementCaution): Record<string, unknown> {
    return {
      id: depot.id,
      amount: depot.montant,
      date: depot.datePaiement.toISOString(),
      receiptNumber: depot.numeroRecu,
      description: depot.note || '',
      status: this.statutsDepot.get(depot.id) || 'completed',
    }
  }
  public mapperTravailEnDto(travail: EntiteItemTravail): Record<string, unknown> {
    return {
      id: travail.id,
      title: travail.titre,
      description: travail.description,
      status: this.mapperStatutTravailSortie(travail.statut),
      priority: travail.priorite,
      createdAt: travail.creeLe.toISOString(),
      dueDate: travail.dateEcheance?.toISOString(),
      detectedAutomatically: travail.detecteAutomatiquement,
    }
  }
  public mapperExecutionImportEnDto(execution: EntiteExecutionImport): Record<string, unknown> {
    return {
      id: execution.id,
      adminId: execution.adminId,
      fileName: execution.nomFichier,
      totalRows: execution.nombreLignesTotal,
      inserted: execution.lignesInserees.map((ligne) => ({
        id: ligne.id,
        firstName: ligne.prenom,
        lastName: ligne.nom,
        phone: ligne.telephone,
        email: ligne.email,
      })),
      errors: execution.erreurs.map((erreur) => ({
        rowNumber: erreur.numeroLigne,
        errors: erreur.erreurs,
        parsed: erreur.donneesBrutes,
      })),
      ignored: execution.ignoree,
      readSuccess: execution.lectureReussie,
      readErrors: execution.lectureAvecErreurs,
      createdAt: execution.creeLe.toISOString(),
      updatedAt: execution.misAJourLe.toISOString(),
    }
  }
  public mapperNotificationEnDto(notification: EntiteNotification): Record<string, unknown> {
    return {
      id: notification.id,
      user_id: notification.utilisateurId,
      type: notification.type,
      message: notification.message,
      is_read: notification.estLue,
      created_at: notification.creeLe.toISOString(),
    }
  }
  public mapperPaiementAdminEnDto(
    paiement: EntitePaiementAbonnementAdmin
  ): Record<string, unknown> {
    return {
      id: paiement.id,
      adminId: paiement.adminId,
      entrepriseId: paiement.entrepriseId,
      amount: paiement.montant,
      method: paiement.methode,
      status: paiement.statut,
      provider: paiement.fournisseur,
      providerReference: paiement.referenceFournisseur,
      checkoutUrl: paiement.urlPaiement,
      payerPhone: paiement.telephonePayeur,
      transactionRef: paiement.referenceTransaction,
      note: paiement.note,
      paidAt: paiement.payeLe ? paiement.payeLe.toISOString() : null,
      month: paiement.mois,
      approvedAt: paiement.approuveLe ? paiement.approuveLe.toISOString() : null,
      approvedBy: paiement.approuvePar,
      subscriptionMode: paiement.modeAbonnement,
      createdAt: paiement.creeLe.toISOString(),
    }
  }
  public mapperStatutPaiementAdminEnDto(
    statut: TypeStatutPaiementAdminDto
  ): Record<string, unknown> {
    return {
      adminId: statut.adminId,
      blocked: statut.bloque,
      overdueMonth: statut.moisEnRetard,
      dueAt: statut.echeance ? statut.echeance.toISOString() : null,
      requiredMonth: statut.moisRequis,
      currentMonth: statut.moisCourant,
      graceDays: statut.joursGrace,
      subscriptionMode: statut.modeAbonnement,
      expectedAmount: statut.montantAttendu,
      allowCustomAmount: statut.autoriserMontantLibre,
    }
  }
  public mapperJournalAuditEnDto(journal: EntiteJournalAudit): Record<string, unknown> {
    return {
      id: journal.id,
      actor: journal.acteur,
      action: journal.action,
      targetType: journal.typeCible,
      targetId: journal.idCible,
      message: journal.message,
      ipAddress: journal.adresseIp,
      createdAt: journal.creeLe.toISOString(),
    }
  }
  public mapperIpBloqueeEnDto(ip: EntiteIpBloquee): Record<string, unknown> {
    return {
      id: ip.id,
      ip: ip.adresseIp,
      reason: ip.raison,
      createdAt: ip.creeLe.toISOString(),
    }
  }
  private mapperStatutTravailSortie(valeur: string): 'pending' | 'in_progress' | 'completed' {
    if (valeur === 'in-progress') return 'in_progress'
    if (valeur === 'completed') return 'completed'
    return 'pending'
  }
}
