# Portafolio JNVR (Ionic + Angular)

Aplicación de portafolio personal construida con Ionic 8 y Angular 19. Presenta inicio, proyectos, experiencia y contacto. Usa componentes standalone, lazy-loading y SCSS. Diseño con tipografía Poppins y paleta en tonos azules.

## Stack

- Angular 19, Ionic 8, TypeScript ~5.6
- Capacitor (webDir `www/`)
- ESLint + Angular-ESLint, Karma + Jasmine

Referencias: `package.json:1`, `angular.json:1`, `capacitor.config.ts:1`.

## Requisitos

- Node.js 18.19+ o 20/22 y npm 9+
- Chrome disponible para pruebas headless (Karma)

## Instalación y scripts

```bash
npm install
npm start        # dev server http://localhost:4200
npm run build    # build producción a www/
npm run watch    # build en modo watch (dev)
npm run lint     # ESLint
npm test         # Karma + Jasmine
npm run deploy   # publica www/ en gh-pages
```

## Estructura clave

- `src/index.html:1` base HTML y fuentes
- `src/global.scss:1` estilos globales Ionic
- `src/theme/variables.scss:1` variables de tema y mixins
- `src/app/app.routes.ts:1` rutas (lazy load)
- `src/app/pages/**` páginas standalone (home, projects, experience, contact, not-found)
- `src/app/components/header/*` header opcional
- `src/assets/**` logos, íconos y proyectos

## Rutas

- `/home` (raíz redirige a home)
- `/projects`
- `/experience`
- `/contact`
- `**` → 404 (NotFoundPage)

Nota: el Header incluye un enlace `/about` que no existe en `app.routes.ts`. Crea la página y ruta, o elimina ese botón.

## Páginas

- Home: logo + texto animado palabra por palabra, incluye secciones Projects/Experience/Contact.
- Projects: grid responsivo con tarjetas (imagen + overlay en hover).
- Experience: línea de tiempo con chips de tecnologías.
- Contact: tarjeta con correo, LinkedIn y GitHub (SVG propios).
- Not Found: 404 con animación SVG y botón a Home.

## Estilos y tema

- Base y utilidades: `src/global.scss:1`
- Variables: `src/theme/variables.scss:1` (`--ion-color-primary`, `--ion-text-color`, mixin `fadeInUp`)
- Estilos por página: `*.page.scss` (home, projects, experience, contact, not-found)
- Tipografía Poppins: `src/index.html:1`

## Desarrollo

```bash
npm start
```

## Lint y pruebas

```bash
npm run lint
npm test
```

Si Karma no detecta Chrome, define la variable de entorno `CHROME_BIN` con la ruta a tu navegador.

## Despliegue

Build producción:

```bash
npm run build
```

### GitHub Pages

Para repos con subcarpeta (p. ej. `/jnvrportfolio/`), compila con base-href:

```bash
ng build --configuration production --base-href /jnvrportfolio/ --deploy-url /jnvrportfolio/
npx gh-pages -d www
```

También puedes actualizar el script `deploy` en `package.json` para incluir `--base-href`.

### Firebase Hosting

`firebase.json` ya redirige todo a `index.html`.

```bash
npm run build
npx firebase login
npx firebase deploy
```

## Capacitor (opcional)

```bash
npm run build
npx cap add android   # o ios
npx cap copy
npx cap open android
```

## Personalización rápida

- Home text: `src/app/pages/home/home.page.ts:1` (propiedad `fullText`)
- Proyectos: `src/app/pages/projects/projects.page.html:1` + imágenes en `src/assets/proyectos/`
- Experiencia: `src/app/pages/experience/experience.page.html:1`
- Contacto: `src/app/pages/contact/contact.page.html:1`
- Colores: `src/theme/variables.scss:1`
- Header: `src/app/components/header/header.component.html:1` (y montar en `app.component.*` si se usa)

## Problemas conocidos

- Enlace `/about` del Header sin ruta definida.
- En GitHub Pages, usar `--base-href`/`--deploy-url` para rutas bajo subcarpeta.

## Licencia

MIT. Ver `LICENSE`.
