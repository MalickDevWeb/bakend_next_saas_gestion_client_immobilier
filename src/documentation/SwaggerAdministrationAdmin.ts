/**
 * @swagger
 * /api/clients:
 *   description: >
 *     Endpoint scope par adminId.
 *     - ADMIN: ne voit et ne manipule que ses propres clients.
 *     - SUPER_ADMIN: doit activer l impersonation (/api/authContext/impersonate) pour travailler dans le scope d un admin cible.
 *   get:
 *     summary: Liste les clients admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 *       403:
 *         description: Permission manquante ou acces hors scope admin
 *
 * /inventory-templates:
 *   get:
 *     summary: Liste les modèles d'état des lieux (admin scope)
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modèles
 *   post:
 *     summary: Crée un modèle d'état des lieux
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
 *               nom: { type: string }
 *               corps: { type: string }
 *               placeholders: { type: object, additionalProperties: true }
 *               isTable: { type: boolean }
 *     responses:
 *       200:
 *         description: Modèle créé
 * /inventory-templates/{id}:
 *   put:
 *     summary: Met à jour un modèle d'état des lieux
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
 *             properties:
 *               nom: { type: string }
 *               corps: { type: string }
 *               placeholders: { type: object, additionalProperties: true }
 *               isTable: { type: boolean }
 *     responses:
 *       200:
 *         description: Modèle mis à jour
 *   delete:
 *     summary: Supprime un modèle d'état des lieux
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
 *         description: Modèle supprimé
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
 *       403:
 *         description: Permission manquante ou acces hors scope admin
 * /api/clients/{id}:
 *   description: >
 *     Controle d appartenance strict.
 *     Le client cible doit appartenir au scope admin courant (adminId).
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
 *       403:
 *         description: Permission manquante ou client hors scope admin
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
 *       403:
 *         description: Permission manquante ou client hors scope admin
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
 *       403:
 *         description: Permission manquante ou client hors scope admin
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
 *       403:
 *         description: Permission manquante ou client hors scope admin
 *
 * /api/locations:
 *   get:
 *     summary: Liste les locations admin
 *     tags: [Administration Admin]
 *     security:
 *       - accessTokenCookie: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des locations
 *   post:
 *     summary: Cree une location admin
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
 *         description: Location creee
 * /api/locations/{id}:
 *   get:
 *     summary: Recupere une location admin
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
 *         description: Location
 *   put:
 *     summary: Met a jour une location admin
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
 *         description: Location mise a jour
 *   patch:
 *     summary: Met a jour partiellement une location admin
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
 *         description: Location mise a jour
 *   delete:
 *     summary: Supprime une location admin
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
 *           schema:
 *             type: object
 *             properties:
 *               clientId: { type: string }
 *               locationId: { type: string }
 *               nom: { type: string }
 *               type:
 *                 type: string
 *                 enum: [contract, receipt, other, etat_des_lieux]
 *               url: { type: string }
 *               estSigne: { type: boolean }
 *               statut:
 *                 type: string
 *                 enum: [draft, pending_signature, signed]
 *               templateId: { type: string, nullable: true }
 *               templateName: { type: string, nullable: true }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom: { type: string }
 *                     etat: { type: string, enum: [neuf, bon, moyen, mauvais] }
 *                     note: { type: number }
 *                     commentaire: { type: string }
 *             required: [nom, type, url]
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
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               type:
 *                 type: string
 *                 enum: [contract, receipt, other, etat_des_lieux]
 *               url: { type: string }
 *               estSigne: { type: boolean }
 *               statut:
 *                 type: string
 *                 enum: [draft, pending_signature, signed]
 *               templateId: { type: string, nullable: true }
 *               templateName: { type: string, nullable: true }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nom: { type: string }
 *                     etat: { type: string, enum: [neuf, bon, moyen, mauvais] }
 *                     note: { type: number }
 *                     commentaire: { type: string }
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
