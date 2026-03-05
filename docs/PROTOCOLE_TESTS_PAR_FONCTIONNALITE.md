# Protocole Tests Par Fonctionnalite

Ce document impose la regle suivante:

- une fonctionnalite n est pas "terminee" tant que ses tests ne sont pas executes et valides;
- on ne passe pas a la fonctionnalite suivante sans preuve de test.

---

## 1. Minimum obligatoire pour chaque fonctionnalite

1. Tests qualite globaux:
- `npm run test:qualite`
- `npm run qualite:score` (seuil minimum 80%, portee par defaut: delta de la fonctionnalite)
- audit complet optionnel: `QUALITE_PORTEE=projet npm run qualite:score`

2. Tests unitaires cibles:
- logique metier des services modifies;
- validations/metiers sensibles (montant, telephone, statut, permissions, etc.).

3. Tests integration/API cibles:
- endpoint nominal;
- endpoint erreur metier;
- endpoint securite/autorisation.

4. Tests manuels traces:
- execution Swagger/curl/Postman;
- resultat note (OK/KO) + message d erreur observe si KO.

5. Boucle qualite:
- si score < 80%, refactoriser et relancer les commandes jusqu a >= 80%.

---

## 2. Matrice de test a remplir (copier-coller)

```md
## Matrice de test - {{NOM_FONCTIONNALITE}}

### A. Qualite
- [ ] npm run test:qualite
- [ ] npm run qualite:score (>= 80%)

### B. Unitaires
- [ ] Cas 1: {{description}} -> Attendu: {{resultat}}
- [ ] Cas 2: {{description}} -> Attendu: {{resultat}}

### C. Integration/API
- [ ] Cas nominal `{{METHODE}} {{ENDPOINT}}` -> {{code attendu}}
- [ ] Cas erreur metier `{{METHODE}} {{ENDPOINT}}` -> {{code attendu}}
- [ ] Cas autorisation `{{METHODE}} {{ENDPOINT}}` -> {{code attendu}}

### D. Manuel (Swagger/curl)
- [ ] Scenario 1 execute
- [ ] Scenario 2 execute
- [ ] Scenario 3 execute

### E. Resultat final
- [ ] Pret a merger / deployer
```

---

## 3. Commande standard avant review

```bash
npm run test:qualite
npm run qualite:score
# option audit complet
QUALITE_PORTEE=projet npm run qualite:score
```

Puis executer les scenarios API de la fonctionnalite (Swagger/curl) et consigner les resultats dans le guide module.

---

## 4. Ou consigner les preuves

Ajouter dans le document du module concerne:

- `docs/GUIDE_MODULE_{{MODULE}}_DE_A_A_Z.md`

Section recommandee:

- "Resultats de test"
- tableau: cas, entree, sortie attendue, sortie observee, statut.

---

## 5. Criteres de blocage (on ne passe pas a la suite)

- `npm run test:qualite` en echec;
- score qualite < 80%;
- un endpoint critique non teste;
- une regle metier sensible non testee;
- aucun resultat de test ecrit dans la doc du module.
