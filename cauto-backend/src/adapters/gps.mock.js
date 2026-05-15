const vehicles = [
  { id:"v1",  name:"Camion 01", plate:"FE-123AA", status:"active",   speed_kmh:47, fuel_pct:72, sector:"Zona Nord",  lat:44.848, lng:11.620 },
  { id:"v2",  name:"Camion 02", plate:"FE-456BB", status:"idle",     speed_kmh:0,  fuel_pct:55, sector:"Deposito",   lat:44.831, lng:11.607 },
  { id:"v3",  name:"Camion 03", plate:"FE-789CC", status:"workshop", speed_kmh:0,  fuel_pct:30, sector:"Officina",   lat:44.835, lng:11.612 },
  { id:"v4",  name:"Furgone 01",plate:"FE-321DD", status:"active",   speed_kmh:62, fuel_pct:88, sector:"Zona Sud",   lat:44.817, lng:11.600 },
  { id:"v5",  name:"Furgone 02",plate:"FE-654EE", status:"idle",     speed_kmh:0,  fuel_pct:15, sector:"Zona Est",   lat:44.836, lng:11.638 },
  { id:"v6",  name:"Camion 04", plate:"FE-987FF", status:"active",   speed_kmh:38, fuel_pct:60, sector:"Zona Ovest", lat:44.830, lng:11.585 },
];

let routes = [
  {
    // Raccolta organico nel quartiere Barco (nord Ferrara)
    id:"r1", name:"Barco – Organico", color:"#4ade80", sector:"nord",
    comune:"Ferrara", materiale:"organico", tipo_mezzo:"compattatore_post",
    vehicle:"Camion 01", status:"in_corso", stops:27,
    waypoints:[
      [44.831,11.607],  // deposito HERA
      [44.836,11.610],  // Via Porta Po
      [44.841,11.612],
      [44.846,11.613],  // Viale Po
      [44.851,11.614],
      [44.856,11.614],  // ingresso Barco
      [44.860,11.617],
      [44.863,11.621],  // centro Barco
      [44.861,11.627],
      [44.857,11.626],
      [44.853,11.622],
      [44.848,11.619],  // via di rientro
      [44.842,11.614],
      [44.836,11.611],
      [44.831,11.607],  // deposito
    ],
  },
  {
    // Raccolta differenziata nel Centro Storico
    id:"r2", name:"Centro Storico – Carta", color:"#f9a8d4", sector:"centro",
    comune:"Ferrara", materiale:"carta", tipo_mezzo:"compattatore_lat",
    vehicle:"Camion 02", status:"pianificato", stops:34,
    waypoints:[
      [44.831,11.607],  // deposito
      [44.833,11.609],  // Via Porta Reno
      [44.834,11.613],  // Via Mazzini
      [44.836,11.615],  // Piazza Repubblica
      [44.837,11.618],  // Via Garibaldi
      [44.838,11.620],  // Piazza Municipio
      [44.837,11.623],  // Via Cairoli
      [44.835,11.625],  // Via Voltapaletto
      [44.833,11.624],  // Via delle Scienze
      [44.832,11.620],  // Corso Porta Reno
      [44.832,11.615],  // Via dei Baluardi
      [44.831,11.610],
      [44.831,11.607],  // deposito
    ],
  },
  {
    // Raccolta plastica nella zona industriale est
    id:"r3", name:"Zona Industriale Est – Plastica", color:"#fb923c", sector:"est",
    comune:"Ferrara", materiale:"plastica", tipo_mezzo:"scarrabile",
    vehicle:"Furgone 02", status:"pianificato", stops:14,
    waypoints:[
      [44.831,11.607],  // deposito
      [44.832,11.617],  // Via Gramicia
      [44.833,11.626],
      [44.835,11.634],
      [44.837,11.641],  // ingresso zona ind.
      [44.839,11.648],
      [44.842,11.654],  // polo industriale
      [44.845,11.650],
      [44.843,11.641],
      [44.840,11.633],
      [44.837,11.623],
      [44.833,11.614],
      [44.831,11.607],  // deposito
    ],
  },
  {
    // RSU zona ovest / Porotto
    id:"r4", name:"Porotto – RSU", color:"#c084fc", sector:"ovest",
    comune:"Ferrara", materiale:"rsu", tipo_mezzo:"compattatore_post",
    vehicle:"Camion 04", status:"in_corso", stops:22,
    waypoints:[
      [44.831,11.607],  // deposito
      [44.831,11.599],
      [44.833,11.592],  // Via Pomposa
      [44.836,11.585],
      [44.840,11.578],
      [44.845,11.574],  // Porotto
      [44.848,11.579],
      [44.846,11.586],
      [44.842,11.591],
      [44.838,11.597],
      [44.834,11.602],
      [44.831,11.607],  // deposito
    ],
  },
  {
    // Raccolta organico zona sud / Doro
    id:"r5", name:"Doro – Organico", color:"#60a5fa", sector:"sud",
    comune:"Ferrara", materiale:"organico", tipo_mezzo:"compattatore_lat",
    vehicle:"Furgone 01", status:"in_corso", stops:19,
    waypoints:[
      [44.831,11.607],  // deposito
      [44.826,11.607],  // Via Foro Boario
      [44.821,11.607],
      [44.816,11.606],  // Doro
      [44.812,11.605],
      [44.809,11.610],  // via Bologna
      [44.811,11.617],
      [44.815,11.619],
      [44.819,11.617],
      [44.823,11.614],
      [44.827,11.612],
      [44.830,11.609],
      [44.831,11.607],  // deposito
    ],
  },
  {
    // Raccolta vetro (campane) fino a Pontelagoscuro
    id:"r6", name:"Pontelagoscuro – Vetro", color:"#facc15", sector:"nord",
    comune:"Ferrara", materiale:"vetro", tipo_mezzo:"campane",
    vehicle:"Camion 03", status:"pianificato", stops:11,
    waypoints:[
      [44.831,11.607],  // deposito
      [44.839,11.608],
      [44.848,11.608],
      [44.857,11.609],
      [44.865,11.610],
      [44.871,11.611],  // Pontelagoscuro
      [44.877,11.613],
      [44.875,11.619],
      [44.869,11.616],
      [44.860,11.613],
      [44.849,11.609],
      [44.839,11.607],
      [44.831,11.607],  // deposito
    ],
  },
];

let nextRouteId = 7;

module.exports = {
  getVehicles: async () => vehicles.map(v => ({
    ...v,
    speed_kmh: v.status === "active" ? Math.max(0, v.speed_kmh + Math.floor(Math.random()*10-5)) : 0,
  })),

  getRoutes: async () => routes,

  createRoute: async (data) => {
    const r = { id: `r${nextRouteId++}`, ...data };
    routes.push(r);
    return r;
  },

  updateRoute: async (id, data) => {
    const idx = routes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    routes[idx] = { ...routes[idx], ...data };
    return routes[idx];
  },

  deleteRoute: async (id) => {
    const idx = routes.findIndex(r => r.id === id);
    if (idx === -1) return false;
    routes.splice(idx, 1);
    return true;
  },
};
