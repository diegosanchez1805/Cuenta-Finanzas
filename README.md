# Finanzas

App web personal para llevar el control de tu dinero: ingresos, gastos, cuentas, presupuestos, metas de ahorro y deudas. Se instala en el celular como una app (PWA), funciona sin internet y guarda los datos en Firebase.

**Sitio:** https://dynamic-speculoos-449542.netlify.app

---

## Contenido

- [Funciones](#funciones)
- [Tecnologías](#tecnologías)
- [Correrla en tu computadora](#correrla-en-tu-computadora)
- [Estructura del código](#estructura-del-código)
- [Cómo se guardan los datos](#cómo-se-guardan-los-datos)
- [Seguridad](#seguridad)
- [Publicación en Netlify](#publicación-en-netlify)
- [Instalarla en el celular](#instalarla-en-el-celular)
- [Conceptos importantes del código](#conceptos-importantes-del-código)

---

## Funciones

La app tiene cinco secciones:

| Sección | Qué hace |
|---|---|
| **Resumen** | Balance del mes, comparación con el mes anterior, saldo de cada cuenta, indicadores (gasto diario, proyección, mayor gasto), gráficas y últimos movimientos. |
| **Movimientos** | Lista de movimientos agrupada por día, búsqueda (en el mes o en todos los meses), filtros, exportar a CSV y movimientos recurrentes. |
| **Presupuestos** | Límite mensual por categoría con avisos al 80 % y al 100 %, y tus categorías personalizadas. |
| **Metas** | Metas de ahorro con fecha límite opcional; te dice cuánto apartar por mes y por quincena. |
| **Deudas** | Lo que debes y lo que te deben, con abonos y fecha límite. |

Además:

- **Movimientos de tres tipos:** gasto, ingreso y transferencia entre cuentas (la transferencia no cuenta como gasto ni ingreso).
- **Varias cuentas:** débito, crédito y efectivo. Las tarjetas de crédito muestran deuda, crédito disponible, día de corte, día de pago y un botón para pagarlas.
- **Saldos automáticos:** cada movimiento puede sumar o restar de su cuenta; al editarlo o borrarlo, el saldo se corrige solo.
- **Recurrentes:** semanal, quincenal (15 y fin de mes), mensual o anual. Se registran solos en su fecha.
- **Categorías personalizadas** con ícono y color.
- **Deshacer** al borrar movimientos, recurrentes y deudas.
- **Modo sin conexión:** registra movimientos sin internet; se sincronizan al reconectar.
- **Modo privado:** el botón del ojo oculta todas las cantidades.
- **Perfil:** nombre a mostrar en lugar del correo.
- **Modo claro y oscuro**, animaciones al cambiar de sección y atajo de teclado **N** para un nuevo movimiento.

---

## Tecnologías

| Herramienta | Uso |
|---|---|
| [React 18](https://react.dev) | Interfaz |
| [Vite 5](https://vitejs.dev) | Servidor de desarrollo y compilación |
| [Tailwind CSS 3](https://tailwindcss.com) | Estilos |
| [Firebase 10](https://firebase.google.com) | Inicio de sesión (Authentication) y base de datos (Firestore) |
| [Chart.js](https://www.chartjs.org) + react-chartjs-2 | Gráficas |
| [lucide-react](https://lucide.dev) | Íconos |
| [SweetAlert2](https://sweetalert2.github.io) | Ventanas de confirmación y avisos |
| [Netlify](https://www.netlify.com) | Publicación del sitio |

---

## Correrla en tu computadora

Necesitas [Node.js](https://nodejs.org) 20 o más reciente.

```bash
npm install
```

```bash
npm run dev
```

La app abre en `http://localhost:5173`. Para entrar necesitas una cuenta existente en Firebase (el registro está desactivado, ver [Seguridad](#seguridad)).

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Compila la app en la carpeta `dist/` |
| `npm run preview` | Sirve la versión compilada de `dist/` para probarla |

### Variables de entorno

| Variable | Para qué sirve |
|---|---|
| `VITE_ALLOW_SIGNUP` | Si vale `true`, la pantalla de inicio muestra "Crear cuenta". Por defecto está apagada porque la app es personal. |

Se definen en un archivo `.env.local` en tu computadora o en **Project configuration → Environment variables** en Netlify.

---

## Estructura del código

```
├── public/                  Archivos que se publican tal cual
│   ├── _headers             Cabeceras de seguridad y caché (Netlify)
│   ├── _redirects           Toda ruta abre index.html (Netlify)
│   ├── manifest.webmanifest Datos de la app instalable (nombre, íconos, colores)
│   ├── sw.js                Service worker: guarda la app para abrir rápido y sin conexión
│   ├── favicon.svg
│   └── icons/               Íconos de la app para Android e iPhone
├── src/
│   ├── main.jsx             Punto de entrada; registra el service worker
│   ├── App.jsx              Estado global, lectura/escritura en Firestore y pestañas
│   ├── index.css            Estilos base, clases reutilizables y animaciones
│   ├── firebase/config.js   Conexión a Firebase con caché local (modo sin conexión)
│   ├── hooks/useOnline.js   Indica si hay conexión a internet
│   ├── components/          Secciones de la pantalla
│   ├── modals/              Ventanas para crear y editar
│   └── utils/               Funciones de apoyo
├── firestore.rules          Reglas de seguridad de la base de datos
├── netlify.toml             Cómo compila Netlify el sitio
├── tailwind.config.js
├── vite.config.js
└── index.backup.html        Versión antigua de la app en un solo archivo (ya no se usa)
```

### Componentes (`src/components/`)

| Archivo | Qué muestra |
|---|---|
| `Header.jsx` | Barra superior: logo, pestañas (computadora), modo privado, tema, perfil y cerrar sesión |
| `BottomNav.jsx` | Barra de pestañas inferior (celular y tableta) |
| `AuthScreen.jsx` | Inicio de sesión y recuperación de contraseña |
| `MonthSwitcher.jsx` | Selector de mes |
| `BalanceHero.jsx` | Tarjeta morada con el balance del mes |
| `WalletsSection.jsx` | Saldo de cada cuenta y tarjeta de crédito |
| `InsightsSection.jsx` | Indicadores del mes |
| `ChartsSection.jsx` | Gráfica de gastos por categoría y tendencia de 6 meses |
| `TransactionList.jsx` | Lista de movimientos, búsqueda, filtros y exportar CSV; también `RecentTransactions` |
| `RecurringSection.jsx` | Lista de movimientos recurrentes |
| `BudgetsSection.jsx` | Presupuestos por categoría; también `BudgetAlerts` para el Resumen |
| `CategoriesSection.jsx` | Categorías personalizadas |
| `SavingsSection.jsx` | Metas de ahorro |
| `DebtsSection.jsx` | Deudas y préstamos |
| `OfflineBanner.jsx` | Aviso de "Sin conexión" |
| `UndoToast.jsx` | Aviso con el botón "Deshacer" |
| `Logo.jsx` | Logo de la app |

### Ventanas (`src/modals/`)

| Archivo | Para qué |
|---|---|
| `TransactionModal.jsx` | Nuevo o editar movimiento, transferencia o recurrente |
| `AccountModal.jsx` | Nueva o editar cuenta / tarjeta de crédito |
| `CategoryModal.jsx` | Nueva o editar categoría personalizada |
| `BudgetModal.jsx` | Presupuesto de una categoría |
| `GoalModal.jsx` | Nueva o editar meta de ahorro |
| `DepositModal.jsx` | Abonar o retirar de una meta |
| `DebtModal.jsx` | Nueva o editar deuda |
| `DebtPaymentModal.jsx` | Registrar un abono a una deuda |
| `ProfileModal.jsx` | Cambiar el nombre a mostrar |

### Utilidades (`src/utils/`)

| Archivo | Contenido |
|---|---|
| `formatters.js` | Formato de dinero (MXN), fechas, meses, categorías de la app y sus colores, modo privado |
| `registry.js` | Cuentas y categorías personalizadas del usuario (ver [Conceptos importantes](#conceptos-importantes-del-código)) |
| `recurring.js` | Cálculo de la siguiente fecha de un recurrente |
| `categoryIcons.js` | Ícono de cada categoría de la app |

---

## Cómo se guardan los datos

Todo vive en Firestore dentro de `users/{uid}`, donde `uid` es el id del usuario en Firebase Authentication.

```
users/{uid}/
├── transactions/{id}     Movimientos
├── recurring/{id}        Movimientos recurrentes
├── savings/{id}          Metas de ahorro
├── debts/{id}            Deudas y préstamos
├── wallets/current       Saldo de cada cuenta
└── settings/
    ├── accounts          Lista de cuentas
    ├── categories        Categorías personalizadas
    └── budgets           Presupuestos por categoría
```

### `transactions/{id}`

| Campo | Tipo | Descripción |
|---|---|---|
| `type` | `"egreso"` \| `"ingreso"` \| `"transferencia"` | Tipo de movimiento |
| `amount` | número | Monto, siempre positivo |
| `category` | texto | Nombre de la categoría (`"Transferencia"` en transferencias) |
| `description` | texto | Opcional |
| `date` | `"AAAA-MM-DD"` | Fecha local del movimiento |
| `method` | id de cuenta | Cuenta usada (gastos e ingresos) |
| `affectsWallet` | booleano | Si suma o resta del saldo de la cuenta |
| `from`, `to` | id de cuenta | Origen y destino (solo transferencias) |
| `recurringId` | id | Si lo creó un recurrente |
| `createdAt` | número | Fecha de creación en milisegundos |

### `recurring/{id}`

Los mismos campos de un movimiento (sin `date`), más:

| Campo | Tipo | Descripción |
|---|---|---|
| `frequency` | `"weekly"` \| `"biweekly"` \| `"monthly"` \| `"yearly"` | Cada cuánto se repite |
| `day` | número | Día original del mes, para no perderlo tras un mes corto |
| `nextDate` | `"AAAA-MM-DD"` | Próxima fecha en que se registrará |
| `active` | booleano | `false` si está en pausa |

### `savings/{id}`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | texto | Nombre de la meta |
| `target` | número | Monto meta |
| `saved` | número | Lo ahorrado hasta ahora |
| `deadline` | `"AAAA-MM-DD"` o `null` | Fecha límite opcional |

### `debts/{id}`

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | texto | Con quién es la deuda |
| `direction` | `"owe"` \| `"owed"` | `owe` = yo debo; `owed` = me deben |
| `total` | número | Monto total |
| `paid` | número | Lo abonado |
| `dueDate` | `"AAAA-MM-DD"` o `null` | Fecha límite |
| `note` | texto | Nota opcional |

### `wallets/current`

Un documento con el saldo de cada cuenta: `{ card: 11450, cash: 2830, acc_xyz: -4200 }`.
En las tarjetas de crédito el saldo es **negativo** cuando hay deuda (−4200 = debes $4,200).

### `settings/accounts`

`{ items: [...] }`, donde cada cuenta es:

| Campo | Descripción |
|---|---|
| `id` | `card` y `cash` son las cuentas originales; las nuevas usan `acc_…` |
| `name` | Nombre visible |
| `type` | `"debit"`, `"credit"` o `"cash"` |
| `color` | Color en hexadecimal |
| `limit`, `cutDay`, `payDay` | Solo crédito: límite, día de corte y día de pago |

Si el documento no existe, la app usa las cuentas "Tarjeta" (`card`) y "Efectivo" (`cash`).

### `settings/categories` y `settings/budgets`

- `categories`: `{ items: [{ name, type: "egreso" | "ingreso", icon, color }] }`
- `budgets`: `{ limits: { "Comida": 4500, "Transporte": 1500 } }`

---

## Seguridad

La configuración de Firebase en `src/firebase/config.js` es pública por diseño; lo que protege los datos son estas medidas:

1. **Reglas de Firestore** ([firestore.rules](firestore.rules)): cada usuario solo puede leer y escribir dentro de `users/{su uid}`; todo lo demás está bloqueado. Se publican en **Firebase Console → Firestore Database → Reglas**.
2. **Registro desactivado:** en **Firebase Console → Authentication → Configuración → Acciones del usuario**, la creación de cuentas está apagada, y la app oculta "Crear cuenta" (ver `VITE_ALLOW_SIGNUP`).
3. **Dominios autorizados:** en **Authentication → Configuración → Dominios autorizados** solo están el dominio de Netlify y `localhost`.
4. **Cabeceras del sitio** ([public/_headers](public/_headers)): política de contenido (CSP) que solo permite conectarse a Firebase y a Google Fonts, HTTPS obligatorio (HSTS) y bloqueo para que otros sitios no puedan mostrar la app dentro de un marco.
5. **En la app:** cierre de sesión tras **8 horas sin uso**, modo privado y recuperación de contraseña.

> Si agregas otro servicio externo (por ejemplo, una API), hay que permitirlo en la línea `connect-src` de `public/_headers` o el navegador lo bloqueará.

---

## Publicación en Netlify

El sitio está conectado al repositorio de GitHub: **cada vez que se sube un cambio a la rama `main`, Netlify compila y publica la app sola** en menos de un minuto.

- `netlify.toml` le indica a Netlify que compile con `npm run build` usando Node 20 y publique la carpeta `dist`.
- `public/_headers` y `public/_redirects` se copian a `dist` al compilar, así funcionan también si alguna vez subes la carpeta `dist` a mano en **Deploys**.

Si un deploy falla, el log aparece en **Netlify → Deploys**.

---

## Instalarla en el celular

Abre el sitio y:

- **iPhone:** en **Safari**, toca **Compartir** y luego **Agregar a pantalla de inicio**.
- **Android:** en **Chrome**, abre el menú ⋮ y toca **Instalar app**.

Después de publicar una versión nueva, cierra la app y vuelve a abrirla para que se actualice.

---

## Conceptos importantes del código

### Saldos automáticos

`walletEffect(tx)` en `App.jsx` calcula cuánto cambia cada cuenta por un movimiento (por ejemplo, `{ card: -450 }`). Al crear, editar o borrar, el movimiento y el cambio de saldo se escriben **juntos en un mismo lote** (`writeBatch`) con `increment()`, para que nunca queden desfasados. Editar aplica el efecto inverso del movimiento anterior más el del nuevo.

### Registro de cuentas y categorías

`src/utils/registry.js` guarda las cuentas y categorías personalizadas del usuario. `App.jsx` lo actualiza en cada render con `setAccounts()` y `setCustomCategories()`, y cualquier componente puede consultar `getAccounts()`, `accountLabel(id)`, `getCategories(tipo)` o `getCategoryMeta(nombre)` sin pasar props por toda la app. El modo privado funciona igual con `setHideAmounts()` en `formatters.js`.

### Recurrentes sin duplicados

Al abrir la app, los recurrentes vencidos se registran dentro de una transacción de Firestore (`runTransaction`) que vuelve a leer la regla antes de escribir. Así, si la app está abierta en dos dispositivos, solo uno los registra. Las transacciones necesitan internet; sin conexión se reintenta al reconectar.

### Modo sin conexión

`firebase/config.js` activa la caché local de Firestore (`persistentLocalCache`). Sin internet, las escrituras se guardan en el dispositivo y la función `settle()` de `App.jsx` evita que la pantalla se quede esperando a que el servidor confirme. El service worker (`public/sw.js`) guarda los archivos de la app, pero nunca los datos de Firebase.

### Fechas

Las fechas se guardan como texto `AAAA-MM-DD` en **hora local** (`todayISO()` en `formatters.js`), para que un gasto registrado de noche no quede con la fecha del día siguiente.
