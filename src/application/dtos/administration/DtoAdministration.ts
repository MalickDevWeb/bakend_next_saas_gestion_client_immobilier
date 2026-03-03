import { EntiteAdmin } from '@/src/domaine/entites/administration/EntiteAdmin'
import { EntiteBrandingAdmin } from '@/src/domaine/entites/administration/EntiteBrandingAdmin'
import { EntiteConfigurationPlateforme } from '@/src/domaine/entites/systeme/EntiteConfigurationPlateforme'
import { EntiteDemandeAdmin } from '@/src/domaine/entites/administration/EntiteDemandeAdmin'
import { EntitePermissionsAdmin } from '@/src/domaine/entites/administration/EntitePermissionsAdmin'
import { EntiteStatutAbonnementAdmin } from '@/src/domaine/entites/administration/EntiteStatutAbonnementAdmin'

export interface DtoAdmin {
  donnees: EntiteAdmin
}

export interface DtoBrandingAdmin {
  donnees: EntiteBrandingAdmin
}

export interface DtoConfigurationPlateforme {
  donnees: EntiteConfigurationPlateforme
}

export interface DtoDemandeAdmin {
  donnees: EntiteDemandeAdmin
}

export interface DtoPermissionsAdmin {
  donnees: EntitePermissionsAdmin
}

export interface DtoStatutAbonnementAdmin {
  donnees: EntiteStatutAbonnementAdmin
}
