/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Liste les clients admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 *   post:
 *     summary: Cree un client admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Client cree
 * /api/clients/{id}:
 *   get:
 *     summary: Recupere un client admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Client
 *   put:
 *     summary: Met a jour un client admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Client mis a jour
 *   patch:
 *     summary: Met a jour partiellement un client admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Client mis a jour
 *   delete:
 *     summary: Supprime un client admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/documents:
 *   get:
 *     summary: Liste les documents admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des documents
 *   post:
 *     summary: Cree un document admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Document cree
 * /api/documents/{id}:
 *   get:
 *     summary: Recupere un document admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document
 *   put:
 *     summary: Met a jour un document admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Document mis a jour
 *   patch:
 *     summary: Met a jour partiellement un document admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Document mis a jour
 *   delete:
 *     summary: Supprime un document admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/payments:
 *   get:
 *     summary: Liste les paiements admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements
 *   post:
 *     summary: Cree un paiement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement cree
 * /api/payments/{id}:
 *   get:
 *     summary: Recupere un paiement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paiement
 *   put:
 *     summary: Met a jour un paiement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement mis a jour
 *   patch:
 *     summary: Met a jour partiellement un paiement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement mis a jour
 *   delete:
 *     summary: Supprime un paiement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/deposits:
 *   get:
 *     summary: Liste les depots admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des depots
 *   post:
 *     summary: Cree un depot admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Depot cree
 * /api/deposits/{id}:
 *   get:
 *     summary: Recupere un depot admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Depot
 *   put:
 *     summary: Met a jour un depot admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Depot mis a jour
 *   patch:
 *     summary: Met a jour partiellement un depot admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Depot mis a jour
 *   delete:
 *     summary: Supprime un depot admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/work_items:
 *   get:
 *     summary: Liste les travaux admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des travaux
 *   post:
 *     summary: Cree un item de travail admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Item cree
 * /api/work_items/{id}:
 *   get:
 *     summary: Recupere un item de travail admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Travail
 *   put:
 *     summary: Met a jour un item de travail admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Travail mis a jour
 *   patch:
 *     summary: Met a jour partiellement un item de travail admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Travail mis a jour
 *   delete:
 *     summary: Supprime un item de travail admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/settings:
 *   get:
 *     summary: Liste les parametres admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des parametres
 *   post:
 *     summary: Cree un parametre admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Parametre cree
 * /api/settings/{id}:
 *   put:
 *     summary: Met a jour un parametre admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Parametre mis a jour
 *   patch:
 *     summary: Met a jour partiellement un parametre admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Parametre mis a jour
 *   delete:
 *     summary: Supprime un parametre admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/import_runs:
 *   get:
 *     summary: Liste les executions import admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des imports
 *   post:
 *     summary: Cree une execution import admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Import cree
 * /api/import_runs/{id}:
 *   get:
 *     summary: Recupere une execution import admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Import
 *   put:
 *     summary: Met a jour une execution import admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Import mis a jour
 *   patch:
 *     summary: Met a jour partiellement une execution import admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Import mis a jour
 *
 * /api/notifications:
 *   get:
 *     summary: Liste les notifications admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 * /api/notifications/{id}:
 *   patch:
 *     summary: Marque une notification comme lue
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification mise a jour
 *
 * /api/undo-actions:
 *   get:
 *     summary: Liste les actions annulables
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des actions undo
 * /api/undo-actions/{id}/rollback:
 *   post:
 *     summary: Annule une action recente
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Rollback effectue
 *
 * /api/admin_payments:
 *   get:
 *     summary: Liste les paiements abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des paiements admin
 *   post:
 *     summary: Cree un paiement abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement admin cree
 * /api/admin_payments/{id}:
 *   get:
 *     summary: Recupere un paiement abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paiement admin
 *   put:
 *     summary: Met a jour un paiement abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement admin mis a jour
 *   patch:
 *     summary: Met a jour partiellement un paiement abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Paiement admin mis a jour
 *   delete:
 *     summary: Supprime un paiement abonnement admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 * /api/admin_payments/status:
 *   get:
 *     summary: Recupere le statut abonnement admin courant
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut abonnement admin
 *
 * /api/audit_logs:
 *   get:
 *     summary: Liste les logs d audit admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des audits
 *   post:
 *     summary: Cree un log d audit admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: Audit cree
 * /api/audit_logs/{id}:
 *   get:
 *     summary: Recupere un log d audit admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Audit
 *   delete:
 *     summary: Supprime un log d audit admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Suppression effectuee
 *
 * /api/blocked_ips:
 *   get:
 *     summary: Liste les IP bloquees admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des IP bloquees
 *   post:
 *     summary: Bloque une IP
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200:
 *         description: IP bloquee
 * /api/blocked_ips/{id}:
 *   get:
 *     summary: Recupere une IP bloquee
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: IP bloquee
 *   delete:
 *     summary: Debloque une IP
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: IP debloquee
 *
 * /api/cloudinary/open-url:
 *   post:
 *     summary: Retourne une URL cloudinary ouvrable cote client
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *         csrfHeader: []
 *       - bearerAuth: []
 *         csrfHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: URL traitee
 */
export const SWAGGER_ADMINISTRATION_ADMIN_ACTIVE = true

