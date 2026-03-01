# Backend Deploy Status

## Commits critiques à vérifier en production :

- ✅ `a2b34f7` - **CRITICAL** : `expiresAt` optionnel dans CreateMissionDto
- ✅ `ab8510c` - Système de seeding avec flag `isDemo`
- ✅ `b57b0d4` - Fix seeder (enums + apostrophes)

## Dernière vérification

Date : 2026-03-01 16:45 GMT+1  
Hash attendu en prod : `9663c12` ou plus récent

## Test rapide

```bash
# Vérifier que expiresAt est optionnel
curl -X POST https://gr-attitude-api-ihn9.onrender.com/missions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Test mission","description":"Description test","category":"autre","helpType":"conseil","urgency":"moyen"}'
```

**Résultat attendu :** 201 Created (pas 400 Bad Request)
