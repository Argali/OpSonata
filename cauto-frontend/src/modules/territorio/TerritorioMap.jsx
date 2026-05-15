import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat/dist/leaflet-heat.js";
import T from "@/theme";

const TIPO_META = {
  mancata_raccolta: { label: "Mancata raccolta", color: "#f87171" },
  abbandono:        { label: "Abbandono",         color: "#fb923c" },
  da_pulire:        { label: "Da pulire",          color: "#facc15" },
  altro:            { label: "Altro",              color: "#94a3b8" },
};

const STATUS_META = {
  aperta:         { label: "Aperta",         color: "#f87171" },
  in_lavorazione: { label: "In lavorazione", color: "#facc15" },
  chiusa:         { label: "Chiusa",         color: "#4ade80" },
};

const HEAT_GRADIENT = {
  mancata_raccolta: { 0.4: "#fde68a", 0.65: "#f97316", 1: "#f87171" },
  abbandono:        { 0.4: "#fed7aa", 0.65: "#fb923c", 1: "#ea580c" },
  da_pulire:        { 0.4: "#fef08a", 0.65: "#facc15", 1: "#ca8a04" },
  altro:            { 0.4: "#cbd5e1", 0.65: "#94a3b8", 1: "#64748b" },
  all:              { 0.4: "#93c5fd", 0.65: "#3b82f6", 1: "#1d4ed8" },
};

// ── History control ───────────────────────────────────────────────────────────
function addHistoryControl(map) {
  const hist = [{ center: map.getCenter(), zoom: map.getZoom() }];
  let histIdx = 0;
  let navigating = false;

  let btnBack, btnFwd;

  const updateBtns = () => {
    if (!btnBack || !btnFwd) return;
    btnBack.style.opacity  = histIdx > 0                  ? "1"   : "0.3";
    btnBack.style.cursor   = histIdx > 0                  ? "pointer" : "default";
    btnFwd.style.opacity   = histIdx < hist.length - 1    ? "1"   : "0.3";
    btnFwd.style.cursor    = histIdx < hist.length - 1    ? "pointer" : "default";
  };

  map.on("moveend", () => {
    if (navigating) return;
    hist.splice(histIdx + 1);
    hist.push({ center: map.getCenter(), zoom: map.getZoom() });
    histIdx = hist.length - 1;
    updateBtns();
  });

  const HistCtrl = L.Control.extend({
    options: { position: "topleft" },
    onAdd() {
      const wrap = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      wrap.style.cssText = "display:flex;flex-direction:column;";

      const mkBtn = (html, title) => {
        const a = L.DomUtil.create("a", "", wrap);
        a.innerHTML = html;
        a.title = title;
        a.href = "#";
        a.style.cssText =
          "display:flex;align-items:center;justify-content:center;" +
          "width:30px;height:30px;font-size:15px;line-height:1;" +
          "text-decoration:none;color:inherit;transition:opacity .15s;";
        L.DomEvent.disableClickPropagation(a);
        return a;
      };

      btnBack = mkBtn("&#8592;", "Vista precedente");
      btnFwd  = mkBtn("&#8594;", "Vista successiva");
      updateBtns();

      L.DomEvent.on(btnBack, "click", (e) => {
        L.DomEvent.preventDefault(e);
        if (histIdx <= 0) return;
        histIdx--;
        navigating = true;
        map.setView(hist[histIdx].center, hist[histIdx].zoom, { animate: true });
        setTimeout(() => { navigating = false; }, 700);
        updateBtns();
      });

      L.DomEvent.on(btnFwd, "click", (e) => {
        L.DomEvent.preventDefault(e);
        if (histIdx >= hist.length - 1) return;
        histIdx++;
        navigating = true;
        map.setView(hist[histIdx].center, hist[histIdx].zoom, { animate: true });
        setTimeout(() => { navigating = false; }, 700);
        updateBtns();
      });

      return wrap;
    },
  });

  new HistCtrl().addTo(map);
}

// ── TerritorioMap ─────────────────────────────────────────────────────────────
export default function TerritorioMap({ segnalazioni }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const markerLayerRef = useRef(null);
  const heatLayerRef   = useRef(null);
  const fittedRef      = useRef(false);

  const [heatActive, setHeatActive] = useState(true);
  const [filterTipo, setFilterTipo] = useState("all");

  // ── Init map once ─────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [44.835, 11.619],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    addHistoryControl(map);

    return () => {
      map.remove();
      mapRef.current    = null;
      markerLayerRef.current = null;
      heatLayerRef.current   = null;
      fittedRef.current = false;
    };
  }, []);

  // ── Sync markers + heatmap ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markerLayerRef.current) return;

    const visible = filterTipo === "all"
      ? segnalazioni
      : segnalazioni.filter((s) => s.tipo === filterTipo);

    // Markers
    markerLayerRef.current.clearLayers();
    visible.forEach((s) => {
      if (!s.lat || !s.lng) return;
      const meta  = TIPO_META[s.tipo]   || TIPO_META.altro;
      const smeta = STATUS_META[s.status] || STATUS_META.aperta;

      const m = L.circleMarker([s.lat, s.lng], {
        radius:      8,
        fillColor:   meta.color,
        color:       "#fff",
        weight:      1.5,
        opacity:     1,
        fillOpacity: 0.88,
      });

      m.bindPopup(
        `<div style="font-family:system-ui;min-width:180px;line-height:1.45;">
          <div style="font-size:12px;font-weight:700;color:${meta.color};margin-bottom:5px;">${meta.label}</div>
          <div style="font-size:11px;margin-bottom:3px;">${s.address || `${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`}</div>
          ${s.note ? `<div style="font-size:11px;color:#64748b;margin-bottom:3px;">${s.note}</div>` : ""}
          <div style="font-size:10px;color:${smeta.color};font-weight:700;">${smeta.label}</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${s.created_by_name}</div>
        </div>`,
        { maxWidth: 260 }
      );

      markerLayerRef.current.addLayer(m);
    });

    // Heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (heatActive) {
      const pts = visible.filter((s) => s.lat && s.lng).map((s) => [s.lat, s.lng, 1.0]);
      if (pts.length > 0) {
        heatLayerRef.current = L.heatLayer(pts, {
          radius:  32,
          blur:    22,
          maxZoom: 17,
          gradient: HEAT_GRADIENT[filterTipo] || HEAT_GRADIENT.all,
        }).addTo(map);
      }
    }

    // Auto-fit once when data first arrives
    if (!fittedRef.current) {
      const withCoords = segnalazioni.filter((s) => s.lat && s.lng);
      if (withCoords.length === 1) {
        map.setView([withCoords[0].lat, withCoords[0].lng], 15);
        fittedRef.current = true;
      } else if (withCoords.length > 1) {
        map.fitBounds(withCoords.map((s) => [s.lat, s.lng]), { padding: [40, 40], maxZoom: 16 });
        fittedRef.current = true;
      }
    }
  }, [segnalazioni, filterTipo, heatActive]);

  const counts = Object.fromEntries(
    Object.keys(TIPO_META).map((k) => [k, segnalazioni.filter((s) => s.tipo === k).length])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: T.font }}>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {[["all", "Tutti"], ...Object.entries(TIPO_META).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilterTipo(k)}
            style={{
              padding:    "5px 12px",
              borderRadius: 20,
              border:     `1px solid ${filterTipo === k ? (TIPO_META[k]?.color || T.blue) : T.border}`,
              background: filterTipo === k ? `${TIPO_META[k]?.color || T.blue}20` : "transparent",
              color:      filterTipo === k ? (TIPO_META[k]?.color || T.blue) : T.textSub,
              fontSize:   12,
              fontWeight: 600,
              cursor:     "pointer",
              fontFamily: T.font,
              transition: "all .15s",
            }}
          >
            {label}
            {k !== "all" && counts[k] != null && (
              <span style={{ marginLeft: 5, opacity: 0.7 }}>({counts[k]})</span>
            )}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: T.border, margin: "0 4px", flexShrink: 0 }} />

        <button
          onClick={() => setHeatActive((v) => !v)}
          style={{
            padding:    "5px 12px",
            borderRadius: 20,
            border:     `1px solid ${heatActive ? "#60a5fa" : T.border}`,
            background: heatActive ? "rgba(96,165,250,0.15)" : "transparent",
            color:      heatActive ? "#60a5fa" : T.textSub,
            fontSize:   12,
            fontWeight: 600,
            cursor:     "pointer",
            fontFamily: T.font,
            transition: "all .15s",
          }}
        >
          Mappa termica
        </button>
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        style={{
          width:        "100%",
          height:       520,
          borderRadius: 12,
          overflow:     "hidden",
          border:       `1px solid ${T.cardBorder}`,
          boxShadow:    "0 2px 12px rgba(0,0,0,0.18)",
        }}
      />

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {Object.entries(TIPO_META).map(([k, v]) => (
          <div
            key={k}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.textSub }}
          >
            <span
              style={{
                width:        10,
                height:       10,
                borderRadius: "50%",
                background:   v.color,
                display:      "inline-block",
                border:       "1.5px solid rgba(255,255,255,0.25)",
                flexShrink:   0,
              }}
            />
            {v.label}
            <span style={{ color: T.textDim }}>({counts[k]})</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: T.textDim, marginLeft: "auto" }}>
          Usa ← → nella mappa per navigare la cronologia delle viste
        </div>
      </div>
    </div>
  );
}
