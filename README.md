# 🎭 Juégatela

> **Si te la juegas, que se pague.**

Plataforma social donde retas a tus amigos, montas porras y juegas arcade en un bar
clandestino con estética neón. El dinero se habla antes, **se bloquea al aceptar y se
paga al ganar** — sin Bizums que nunca llegan.

Este repositorio es un **prototipo / MVP funcional en modo seguro**: toda la economía usa
**fichas demo ficticias**. El dinero real (depósitos, retiradas, apuestas reales) está
planteado conceptualmente y **solo se activa tras licencias, verificación de edad, KYC,
juego responsable, prevención de fraude y revisión legal**.

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** (sistema de diseño neón propio)
- **Zustand** (estado + persistencia local de la sesión demo)
- **React Router** (navegación SPA)
- **Framer Motion** (animaciones)
- **lucide-react** (iconos)
- Juegos arcade en **Canvas** (sin dependencias externas)

## Arrancar

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Qué incluye el MVP

**Navegación y cuenta**
- Landing completa con la identidad de marca.
- Registro / inicio de sesión / recuperar contraseña (con aceptación de +18, términos y juego responsable).
- **Modo invitado**: explora y practica sin cuenta. Para apostar hace falta iniciar sesión (gate de autenticación).

**Producto**
- **Wallet** con saldo disponible, bloqueado, pendiente y demo; depósitos/retiradas simulados, métodos de pago, límites de gasto e historial de movimientos.
- **Retos** (apuestas privadas) con flujo completo de estados: borrador → pendiente → activa → en verificación → ganada/perdida/disputada/reembolsada. Bloqueo de fondos al aceptar y liberación al ganador.
- **Porras grupales** con varios tipos (ganador único, varios, resultado exacto, votación, proporcional), elección de opción y reparto del bote.
- **Matchmaking** contra rivales aleatorios: selección de juego/cantidad/región, animación de búsqueda neón, rival encontrado, confirmación y bloqueo de saldo.
- **Ranking** y gamificación: niveles, XP, insignias, misiones diarias, podio y tendencias.
- Perfil público/privado, amigos, grupos, notificaciones, ajustes, soporte.

**La Sala de Juegos** — 3 juegos jugables en navegador (teclado + táctil):
- 🏓 **Neón Pong**
- 🎱 **Billar de Trastienda** (físicas de canvas)
- ⚡ **Mano Fría** (reflejos)

Cada juego tiene práctica, contra amigo/aleatorio/torneo, tutorial, chat rápido, revancha y pantalla de victoria/derrota. El resto del catálogo aparece como "próximamente".

**Cumplimiento y seguridad** (planteado desde el diseño)
- Páginas de **Juego responsable** (límites, autoexclusión, autoevaluación, recursos de ayuda) y **Legal** (términos, privacidad, cookies, reembolsos, AML, +18).
- **Panel de administración**: métricas, usuarios, apuestas, porras, transacciones, disputas, actividad sospechosa (anti-multicuenta/bots/AML) y configuración (toggle de dinero real, regiones, comisiones, logs).

## Estructura

```
src/
  components/    UI primitivas, layout (shell + nav) y componentes de dominio
  games/         Motores de juego en canvas (Pong, Billar, Reflejos)
  lib/           Tipos, datos de ejemplo, configuración de juegos/estados, utilidades
  pages/         Todas las pantallas de la app
  store/         Estado global (Zustand) con persistencia
```

## Aviso

Proyecto en modo demostración. No constituye una plataforma de juego con dinero real ni
fomenta el juego. **+18 · Juega con cabeza.**
