# update_dark.ps1 – favicon.png gruen + iPhone Screens Dark Mode
$baseDir = 'd:\IDEA\Projekt\ladeKompass_lp'

# ===== 1. favicon.png regenerieren (gruen #16a34a) =====
try {
    Add-Type -AssemblyName System.Drawing -ErrorAction Stop
    $bmp = New-Object System.Drawing.Bitmap(64, 64)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::FromArgb(22, 163, 74))
    $wb = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $pts = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(37, 10)),
        (New-Object System.Drawing.PointF(24, 34)),
        (New-Object System.Drawing.PointF(31.5, 34)),
        (New-Object System.Drawing.PointF(27, 54)),
        (New-Object System.Drawing.PointF(40, 30)),
        (New-Object System.Drawing.PointF(32.5, 30))
    )
    $g.FillPolygon($wb, $pts)
    $bmp.Save("$baseDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $wb.Dispose()
    Write-Host 'OK favicon.png gruen gespeichert'
} catch {
    Write-Host "WARN favicon: $_"
}

# ===== 2. index.html laden =====
$f    = "$baseDir\index.html"
$html = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
Write-Host "Geladen: $($html.Length) Zeichen"

# Marker
$m1 = '<!-- Screen 1: Karte / Map -->'
$m2 = '<!-- Screen 2: Stationen -->'
$m3 = '<!-- Screen 3: Route planner -->'
$me = '</div><!-- /iphone-screen -->'

# Wiederverwendbare dunkle Header-Komponente
$darkHeader = '<div style="background:#111827;padding:42px 10px 7px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;flex-shrink:0;"><div style="display:flex;align-items:center;gap:5px;"><svg viewBox="0 0 64 64" fill="none" style="width:16px;height:16px;"><circle cx="32" cy="32" r="28" fill="#16a34a"/><path d="M36 14 L26 33 L31.5 33 L28 50 L38 31 L32.5 31 Z" fill="white"/></svg><span style="font-size:10px;font-weight:800;color:white;font-family:system-ui,sans-serif;">LadeKompass</span></div><div style="display:flex;gap:4px;"><div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div><div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div></div></div>'

# Wiederverwendbare dunkle Nav-Leiste Basisicons
$navIcon_karte    = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>'
$navIcon_route    = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>'
$navIcon_dash     = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
$navIcon_fz       = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
$navIcon_set      = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'

function DarkNav($active) {
    $items = @(
        @{ key='karte'; label='Karte'; icon=$navIcon_karte },
        @{ key='route'; label='Route'; icon=$navIcon_route },
        @{ key='dash';  label='Dashboard'; icon=$navIcon_dash },
        @{ key='fz';    label='Fahrzeuge'; icon=$navIcon_fz },
        @{ key='set';   label='Einst.'; icon=$navIcon_set }
    )
    $out = '<div style="background:#111827;border-top:1px solid #1f2937;display:flex;justify-content:space-around;align-items:center;padding:4px 0 5px;flex-shrink:0;">'
    foreach ($item in $items) {
        $isActive = $item.key -eq $active
        $stroke = if ($isActive) { '#16a34a' } else { '#6b7280' }
        $color  = if ($isActive) { '#16a34a' } else { '#6b7280' }
        $fw     = if ($isActive) { 'font-weight:700;' } else { '' }
        $svg = $item.icon -replace 'stroke-width', "stroke=`"$stroke`" stroke-width"
        $out += "<div style=`"display:flex;flex-direction:column;align-items:center;gap:1px;`">$svg<span style=`"font-size:6px;color:$color;$fw`">$($item.label)</span></div>"
    }
    $out += '</div>'
    return $out
}

$navKarte = DarkNav 'karte'
$navDash  = DarkNav 'dash'
$navRoute = DarkNav 'route'

# ===== SCREEN 1: DUNKEL – Karte/Map =====
$newS1 = @'
<!-- Screen 1: Karte / Map -->
                <div class="app-screen active screen-dashboard" style="background:#0f1a0e;padding:0;overflow:hidden;position:relative;">
                  <svg style="position:absolute;inset:0;width:100%;height:100%;" viewBox="0 0 270 500" preserveAspectRatio="none">
                    <rect width="270" height="500" fill="#0f1a0e"/>
                    <path d="M0,155 Q135,148 270,158" stroke="#243020" stroke-width="6" fill="none"/>
                    <path d="M0,235 Q135,228 270,238" stroke="#243020" stroke-width="5" fill="none"/>
                    <path d="M75,0 Q78,250 72,500" stroke="#243020" stroke-width="5" fill="none"/>
                    <path d="M160,0 Q163,250 157,500" stroke="#243020" stroke-width="4" fill="none"/>
                    <path d="M0,100 Q135,95 270,105" stroke="#1a2818" stroke-width="3" fill="none"/>
                    <path d="M35,0 Q37,250 33,500" stroke="#1a2818" stroke-width="3" fill="none"/>
                    <rect x="0"   y="108" width="33" height="43" rx="1" fill="#1a2d16"/>
                    <rect x="42"  y="108" width="28" height="43" rx="1" fill="#1a2d16"/>
                    <rect x="84"  y="108" width="28" height="43" rx="1" fill="#1a2d16"/>
                    <rect x="168" y="108" width="36" height="43" rx="1" fill="#1a2d16"/>
                    <rect x="0"   y="163" width="33" height="66" rx="1" fill="#1a2d16"/>
                    <rect x="42"  y="163" width="28" height="66" rx="1" fill="#1a2d16"/>
                    <rect x="84"  y="163" width="28" height="66" rx="1" fill="#1a2d16"/>
                    <rect x="168" y="163" width="36" height="66" rx="1" fill="#1a2d16"/>
                    <rect x="0"   y="243" width="33" height="50" rx="1" fill="#1a2d16"/>
                    <rect x="0"   y="305" width="68" height="70" rx="2" fill="#1e3a1a"/>
                  </svg>
                  <svg style="position:absolute;top:118px;left:88px;"  width="16" height="20" viewBox="0 0 16 20"><path d="M8 0C3.6 0 0 3.6 0 8c0 5.5 8 12 8 12s8-6.5 8-12C16 3.6 12.4 0 8 0z" fill="#16a34a"/><path d="M8 5L6 9h2v4l4-5.5H9.5V5z" fill="white"/></svg>
                  <svg style="position:absolute;top:145px;left:168px;" width="16" height="20" viewBox="0 0 16 20"><path d="M8 0C3.6 0 0 3.6 0 8c0 5.5 8 12 8 12s8-6.5 8-12C16 3.6 12.4 0 8 0z" fill="#16a34a"/><path d="M8 5L6 9h2v4l4-5.5H9.5V5z" fill="white"/></svg>
                  <svg style="position:absolute;top:175px;left:42px;"  width="16" height="20" viewBox="0 0 16 20"><path d="M8 0C3.6 0 0 3.6 0 8c0 5.5 8 12 8 12s8-6.5 8-12C16 3.6 12.4 0 8 0z" fill="#16a34a"/><path d="M8 5L6 9h2v4l4-5.5H9.5V5z" fill="white"/></svg>
                  <svg style="position:absolute;top:205px;left:215px;" width="16" height="20" viewBox="0 0 16 20"><path d="M8 0C3.6 0 0 3.6 0 8c0 5.5 8 12 8 12s8-6.5 8-12C16 3.6 12.4 0 8 0z" fill="#22c55e"/><path d="M8 5L6 9h2v4l4-5.5H9.5V5z" fill="white"/></svg>
                  <svg style="position:absolute;top:248px;left:95px;"  width="16" height="20" viewBox="0 0 16 20"><path d="M8 0C3.6 0 0 3.6 0 8c0 5.5 8 12 8 12s8-6.5 8-12C16 3.6 12.4 0 8 0z" fill="#16a34a"/><path d="M8 5L6 9h2v4l4-5.5H9.5V5z" fill="white"/></svg>
                  <div style="position:absolute;top:172px;left:127px;width:18px;height:18px;border-radius:50%;background:rgba(59,130,246,0.25);display:flex;align-items:center;justify-content:center;">
                    <div style="width:9px;height:9px;border-radius:50%;background:#3b82f6;border:2px solid white;"></div>
                  </div>
                  <div style="position:absolute;top:0;left:0;right:0;background:#111827;padding:42px 10px 7px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;">
                    <div style="display:flex;align-items:center;gap:5px;">
                      <svg viewBox="0 0 64 64" fill="none" style="width:18px;height:18px;"><circle cx="32" cy="32" r="28" fill="#16a34a"/><path d="M36 14 L26 33 L31.5 33 L28 50 L38 31 L32.5 31 Z" fill="white"/></svg>
                      <span style="font-size:10px;font-weight:800;color:white;font-family:system-ui,sans-serif;">LadeKompass</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                      <div style="width:18px;height:18px;border-radius:4px;background:#1f2937;display:flex;align-items:center;justify-content:center;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg></div>
                      <div style="width:18px;height:18px;border-radius:4px;background:#1f2937;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#9ca3af;">DE</div>
                    </div>
                  </div>
                  <div style="position:absolute;bottom:42px;left:0;right:0;background:#111827;border-radius:10px 10px 0 0;padding:8px 8px 5px;box-shadow:0 -4px 16px rgba(0,0,0,0.6);">
                    <div style="font-size:7px;font-weight:700;color:white;margin-bottom:5px;">G&#252;nstigste Ladepunkte · 50 km</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                      <div style="background:#1e293b;border-radius:6px;padding:4px 5px;border:1px solid #374151;">
                        <div style="font-size:6.5px;font-weight:700;color:white;margin-bottom:2px;">Stockholmer Str.</div>
                        <div style="display:flex;align-items:center;gap:2px;margin-bottom:1px;">
                          <span style="font-size:5.5px;background:#166534;color:#86efac;padding:1px 3px;border-radius:3px;font-weight:700;">Frei</span>
                          <span style="font-size:5.5px;color:#6b7280;">3.5 km</span>
                        </div>
                        <div style="font-size:6.5px;font-weight:700;color:#4ade80;">11 kW · Kostenlos</div>
                      </div>
                      <div style="background:#1e293b;border-radius:6px;padding:4px 5px;border:1px solid #374151;">
                        <div style="font-size:6.5px;font-weight:700;color:white;margin-bottom:2px;">Br&#252;sseler Str.</div>
                        <div style="display:flex;align-items:center;gap:2px;margin-bottom:1px;">
                          <span style="font-size:5.5px;background:#166534;color:#86efac;padding:1px 3px;border-radius:3px;font-weight:700;">Frei</span>
                          <span style="font-size:5.5px;color:#6b7280;">3.6 km</span>
                        </div>
                        <div style="font-size:6.5px;font-weight:700;color:#4ade80;">50 kW</div>
                      </div>
                    </div>
                  </div>
'@
$newS1 += $navKarte
$newS1 += @'
                </div>
                
'@

# ===== SCREEN 2: DUNKEL – Dashboard / Stationen =====
$newS2 = @'
<!-- Screen 2: Stationen -->
                <div class="app-screen screen-wizard" style="background:#0f172a;padding:0;overflow:hidden;display:flex;flex-direction:column;">
                  <div style="background:#111827;padding:40px 10px 7px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:5px;">
                      <svg viewBox="0 0 64 64" fill="none" style="width:16px;height:16px;"><circle cx="32" cy="32" r="28" fill="#16a34a"/><path d="M36 14 L26 33 L31.5 33 L28 50 L38 31 L32.5 31 Z" fill="white"/></svg>
                      <span style="font-size:10px;font-weight:800;color:white;font-family:system-ui,sans-serif;">LadeKompass</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                      <div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div>
                      <div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div>
                    </div>
                  </div>
                  <div style="flex:1;overflow:hidden;padding:8px 8px 0;display:flex;flex-direction:column;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                      <div style="display:flex;align-items:center;gap:4px;">
                        <span style="font-size:9px;font-weight:700;color:white;">In der N&#228;he</span>
                        <span style="font-size:7.5px;font-weight:700;color:#4ade80;background:#166534;padding:1px 5px;border-radius:10px;">120</span>
                      </div>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    </div>
                    <div style="display:flex;gap:3px;margin-bottom:5px;">
                      <div style="padding:2px 5px;border-radius:12px;background:#1e293b;border:1px solid #374151;font-size:7px;color:#9ca3af;font-weight:600;">10 km</div>
                      <div style="padding:2px 5px;border-radius:12px;background:#1e293b;border:1px solid #374151;font-size:7px;color:#9ca3af;font-weight:600;">25 km</div>
                      <div style="padding:2px 5px;border-radius:12px;background:#16a34a;font-size:7px;color:white;font-weight:700;">50 km</div>
                      <div style="padding:2px 5px;border-radius:12px;background:#1e293b;border:1px solid #374151;font-size:7px;color:#9ca3af;font-weight:600;">100 km</div>
                    </div>
                    <div style="display:flex;gap:8px;margin-bottom:5px;border-bottom:1px solid #1f2937;padding-bottom:3px;">
                      <span style="font-size:7.5px;font-weight:700;color:#4ade80;border-bottom:2px solid #16a34a;padding-bottom:2px;">N&#228;chste</span>
                      <span style="font-size:7.5px;color:#6b7280;">Schnelllader</span>
                      <span style="font-size:7.5px;color:#6b7280;">Status</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:3px;">
                      <div style="background:#1e293b;border-radius:8px;padding:5px 6px;display:flex;align-items:center;gap:4px;border:1px solid #374151;">
                        <span style="font-size:7.5px;font-weight:700;color:#6b7280;width:10px;">1</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:7.5px;font-weight:600;color:white;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">Fleming's Conf. Hotel Ffm</div>
                          <div style="font-size:6px;color:#6b7280;">Frankfurt am Main</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-size:7.5px;font-weight:700;color:#4ade80;">1.2 km</div>
                          <div style="font-size:6px;color:#6b7280;">11 kW</div>
                        </div>
                      </div>
                      <div style="background:#1e293b;border-radius:8px;padding:5px 6px;display:flex;align-items:center;gap:4px;border:1px solid #374151;">
                        <span style="font-size:7.5px;font-weight:700;color:#6b7280;width:10px;">2</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:7.5px;font-weight:600;color:white;white-space:nowrap;">P&#252;tzerstra&#223;e</div>
                          <div style="font-size:6px;color:#6b7280;">Frankfurt am Main</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-size:7.5px;font-weight:700;color:#4ade80;">1.2 km</div>
                          <div style="font-size:6px;color:#6b7280;">3.6 kW</div>
                        </div>
                      </div>
                      <div style="background:#1e293b;border-radius:8px;padding:5px 6px;display:flex;align-items:center;gap:4px;border:1px solid #374151;">
                        <span style="font-size:7.5px;font-weight:700;color:#6b7280;width:10px;">3</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:7.5px;font-weight:600;color:white;white-space:nowrap;">E-Bike Station Rewe</div>
                          <div style="font-size:6px;color:#6b7280;">Frankfurt am Main</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-size:7.5px;font-weight:700;color:#4ade80;">1.4 km</div>
                          <div style="font-size:6px;color:#6b7280;">2.3 kW</div>
                        </div>
                      </div>
                      <div style="background:#1e293b;border-radius:8px;padding:5px 6px;display:flex;align-items:center;gap:4px;border:1px solid #374151;">
                        <span style="font-size:7.5px;font-weight:700;color:#6b7280;width:10px;">4</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div style="flex:1;min-width:0;">
                          <div style="font-size:7.5px;font-weight:600;color:white;white-space:nowrap;">Mainova Stromtankstelle</div>
                          <div style="font-size:6px;color:#6b7280;">Frankfurt am Main</div>
                        </div>
                        <div style="text-align:right;flex-shrink:0;">
                          <div style="font-size:7.5px;font-weight:700;color:#4ade80;">1.7 km</div>
                        </div>
                      </div>
                    </div>
                  </div>
'@
$newS2 += $navDash
$newS2 += @'
                </div>
                
'@

# ===== SCREEN 3: DUNKEL – Route planen =====
$newS3 = @'
<!-- Screen 3: Route planner -->
                <div class="app-screen screen-calendar" style="background:#0f172a;padding:0;overflow:hidden;display:flex;flex-direction:column;">
                  <div style="background:#111827;padding:40px 10px 7px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f2937;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:5px;">
                      <svg viewBox="0 0 64 64" fill="none" style="width:16px;height:16px;"><circle cx="32" cy="32" r="28" fill="#16a34a"/><path d="M36 14 L26 33 L31.5 33 L28 50 L38 31 L32.5 31 Z" fill="white"/></svg>
                      <span style="font-size:10px;font-weight:800;color:white;font-family:system-ui,sans-serif;">LadeKompass</span>
                    </div>
                    <div style="display:flex;gap:4px;">
                      <div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div>
                      <div style="width:16px;height:16px;border-radius:4px;background:#1f2937;"></div>
                    </div>
                  </div>
                  <div style="flex:1;padding:10px;display:flex;flex-direction:column;gap:6px;overflow:hidden;">
                    <div>
                      <div style="font-size:12px;font-weight:800;color:white;margin-bottom:1px;">Route planen</div>
                      <div style="font-size:7px;color:#6b7280;line-height:1.4;">Plane deine Langstrecke mit Ladestopps.</div>
                    </div>
                    <div>
                      <div style="font-size:6.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Startpunkt</div>
                      <div style="background:#1e293b;border:1px solid #374151;border-radius:8px;padding:5px 7px;display:flex;align-items:center;gap:5px;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span style="font-size:7px;color:#4b5563;">Stadt oder PLZ eingeben&#8230;</span>
                      </div>
                      <div style="font-size:6px;color:#16a34a;margin-top:2px;padding-left:2px;">&#8964; Koordinaten manuell (optional)</div>
                    </div>
                    <div>
                      <div style="font-size:6.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Ziel</div>
                      <div style="background:#1e293b;border:1px solid #374151;border-radius:8px;padding:5px 7px;display:flex;align-items:center;gap:5px;">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <span style="font-size:7px;color:#4b5563;">Stadt oder PLZ eingeben&#8230;</span>
                      </div>
                      <div style="font-size:6px;color:#16a34a;margin-top:2px;padding-left:2px;">&#8964; Koordinaten manuell (optional)</div>
                    </div>
                    <div>
                      <div style="font-size:6.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Fahrzeugparameter</div>
                      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;">
                        <div>
                          <div style="font-size:5.5px;color:#6b7280;margin-bottom:2px;">Akku (kWh)</div>
                          <div style="background:#1e293b;border:1px solid #374151;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:600;color:white;">60</div>
                        </div>
                        <div>
                          <div style="font-size:5.5px;color:#6b7280;margin-bottom:2px;">Akt. SoC %</div>
                          <div style="background:#1e293b;border:1px solid #374151;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:600;color:white;">80</div>
                        </div>
                        <div>
                          <div style="font-size:5.5px;color:#6b7280;margin-bottom:2px;">Min. Ankunft</div>
                          <div style="background:#1e293b;border:1px solid #374151;border-radius:5px;padding:4px 5px;font-size:9px;font-weight:600;color:white;">15</div>
                        </div>
                      </div>
                    </div>
                    <div style="background:#16a34a;border-radius:8px;padding:8px;display:flex;align-items:center;justify-content:center;gap:5px;">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      <span style="font-size:8.5px;font-weight:700;color:white;">Route berechnen</span>
                    </div>
                  </div>
'@
$newS3 += $navRoute
$newS3 += @'
                </div>

'@

# ===== 3. Ersetze jede Screen-Sektion =====

# Screen 1: von m1 bis m2
$i1 = $html.IndexOf($m1)
$i2 = $html.IndexOf($m2)
if ($i1 -lt 0 -or $i2 -lt 0) { Write-Host "FEHLER: Marker 1/2 nicht gefunden"; exit 1 }
$html = $html.Substring(0, $i1) + $newS1 + $html.Substring($i2)
Write-Host "Screen 1 ersetzt. Laenge: $($html.Length)"

# Screen 2: von m2 bis m3
$i2 = $html.IndexOf($m2)
$i3 = $html.IndexOf($m3)
if ($i2 -lt 0 -or $i3 -lt 0) { Write-Host "FEHLER: Marker 2/3 nicht gefunden"; exit 1 }
$html = $html.Substring(0, $i2) + $newS2 + $html.Substring($i3)
Write-Host "Screen 2 ersetzt. Laenge: $($html.Length)"

# Screen 3: von m3 bis me (</div><!-- /iphone-screen -->)
$i3 = $html.IndexOf($m3)
$ie = $html.IndexOf($me)
if ($i3 -lt 0 -or $ie -lt 0) { Write-Host "FEHLER: Marker 3/end nicht gefunden"; exit 1 }
$html = $html.Substring(0, $i3) + $newS3 + $html.Substring($ie)
Write-Host "Screen 3 ersetzt. Laenge: $($html.Length)"

# ===== 4. Speichern =====
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($f, $html, $utf8)
Write-Host "GESPEICHERT: $($html.Length) Zeichen"

# ===== 5. Validieren =====
Set-Location $baseDir
node tests/validate.js
