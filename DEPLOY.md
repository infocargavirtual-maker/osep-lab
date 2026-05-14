# Deploy OSEP Convenio 2.868 → GitHub Pages

## Paso 1: crear el repo vacío en GitHub
1. Abrí https://github.com/new
2. **Repository name**: `osep-lab`
3. **Visibility**: Public (requerido para Pages gratis)
4. NO marcar nada más (ni README, ni .gitignore, ni license)
5. Click "Create repository"

## Paso 2: conectar y pushear
Copiá estos comandos en la terminal (reemplazá `TU_USUARIO` por tu username).
Estás parado en `D:\Usuario\Desktop\CLAUDE\convenio2868\osep-lab`.

```bash
git remote add origin https://github.com/TU_USUARIO/osep-lab.git
git push -u origin main
```

GitHub te va a pedir credenciales. Usá un **Personal Access Token** (no la
contraseña). Para crear uno:
- https://github.com/settings/tokens/new
- Note: "osep-lab deploy"
- Expiration: 90 days
- Scopes: marcá solo **repo**
- "Generate token", copialo. Pegalo cuando git pida password.

## Paso 3: activar GitHub Pages
1. En el repo → **Settings** → **Pages** (menú izq.)
2. Source: **Deploy from a branch**
3. Branch: **main** / folder: **/ (root)** → Save
4. Esperá 1–2 minutos. La URL queda en:
   `https://TU_USUARIO.github.io/osep-lab/`

## Listo
Compartí esa URL con Luciano y el equipo. Cada vez que cambies algo:

```bash
git add -A
git commit -m "describe el cambio"
git push
```

Pages se actualiza solo en ~1 minuto.
