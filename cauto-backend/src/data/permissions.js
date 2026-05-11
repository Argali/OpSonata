const ROLES   = ["superadmin","company_admin","fleet_manager","responsabile_officina","coordinatore_officina","coordinatore_operativo"];
const MODULES = ["gps","navigation","foto_timbrata","cdr","zone","punti","percorsi","pdf_export","workshop","segnalazioni","fuel","suppliers","costs","planning","territorio"];
const LEVELS  = ["none","view","edit","full"];

let matrix = {
  superadmin:             { gps:"none", navigation:"none", foto_timbrata:"none", cdr:"none", zone:"none", punti:"none", percorsi:"none", pdf_export:"none", workshop:"none", segnalazioni:"none", fuel:"none", suppliers:"none", costs:"none", planning:"none", territorio:"none", admin:"full"  },
  company_admin:          { gps:"full", navigation:"full", foto_timbrata:"full", cdr:"full", zone:"full", punti:"full", percorsi:"full", pdf_export:"full", workshop:"full", segnalazioni:"full", fuel:"full", suppliers:"full", costs:"full", planning:"full", territorio:"full", admin:"full"  },
  fleet_manager:          { gps:"full", navigation:"full", foto_timbrata:"full", cdr:"full", zone:"full", punti:"full", percorsi:"full", pdf_export:"full", workshop:"full", segnalazioni:"full", fuel:"full", suppliers:"full", costs:"full", planning:"full", territorio:"full", admin:"full"  },
  responsabile_officina:  { gps:"view", navigation:"none", foto_timbrata:"none", cdr:"view", zone:"view", punti:"view", percorsi:"view", pdf_export:"none", workshop:"full", segnalazioni:"full", fuel:"none", suppliers:"view", costs:"none", planning:"view", territorio:"view", admin:"none"  },
  coordinatore_officina:  { gps:"view", navigation:"none", foto_timbrata:"none", cdr:"view", zone:"view", punti:"view", percorsi:"view", pdf_export:"none", workshop:"edit", segnalazioni:"edit", fuel:"none", suppliers:"none", costs:"none", planning:"view", territorio:"none", admin:"none"  },
  coordinatore_operativo: { gps:"full", navigation:"full", foto_timbrata:"full", cdr:"edit", zone:"edit", punti:"edit", percorsi:"edit", pdf_export:"view", workshop:"view", segnalazioni:"edit", fuel:"full", suppliers:"view", costs:"view", planning:"full", territorio:"full", admin:"none"  },
};

module.exports = {
  ROLES, MODULES, LEVELS,
  getMatrix:  () => matrix,
  getLevel:   (role, mod) => matrix[role]?.[mod] ?? "none",
  setMatrix:  (m) => {
    for (const role of Object.keys(m)) {
      if (!ROLES.includes(role)) throw new Error(`Ruolo non valido: ${role}`);
      for (const [mod, level] of Object.entries(m[role]))
        if (!LEVELS.includes(level)) throw new Error(`Livello non valido: ${level}`);
    }
    matrix = m;
  },
  hasAccess:  (userLevel, required) => LEVELS.indexOf(userLevel) >= LEVELS.indexOf(required),
};
