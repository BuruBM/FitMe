# FitMe

App personal de seguimiento de salud: alimentación, calorías/macros, agua, sueño, entrenamiento en casa y gamificación. Pensada como PWA (se instala en el celular desde el navegador, sin pasar por App Store/Play Store).

## Qué incluye

- **Comida**: buscador con base de datos curada de alimentos vegetarianos (con foco en soja, huevo y proteína en polvo), búsqueda en Open Food Facts como respaldo, entrada de texto libre ("milanesa de soja con ensalada y arroz") y carga manual.
- **Calorías y macros**: objetivos calculados automáticamente (Mifflin-St Jeor + déficit conservador) según altura, peso, edad, actividad y objetivo, con foco en proteína, calcio (osteopenia) y sodio (hinchazón).
- **Agua, sueño, peso y síntomas** (hinchazón/energía/ánimo): carga rápida desde el dashboard y la pantalla de progreso, con gráfico de tendencia de peso.
- **Entrenamiento en casa**: rutinas sin equipamiento, filtrables por nivel de energía, con foco en ejercicios de fuerza que ayudan a la densidad ósea.
- **Gamificación**: XP, niveles, racha diaria, logros y un desafío distinto cada semana.
- **Recomendaciones personalizadas**: tips por categoría (proteína, hinchazón, huesos, trabajo, social, energía, sueño).
- **Cuenta regresiva** para el viaje a la playa.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Postgres + Auth) — cada usuaria tiene sus propios datos protegidos por Row Level Security
- Open Food Facts (API pública, sin key) como respaldo de búsqueda de alimentos
- PWA con manifest + service worker para instalar en el celular

No usa reconocimiento de fotos por IA todavía: la carga de comida es por búsqueda/texto/manual. La arquitectura ya está lista para sumarlo más adelante (ver "Próximos pasos").

## Puesta en marcha

### 1. Crear el proyecto de Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (el plan gratuito alcanza).
2. En el SQL Editor del proyecto, pegá y ejecutá el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Esto crea todas las tablas, la seguridad por usuaria (RLS) y el trigger que arma tu perfil automáticamente al registrarte.
3. En **Project Settings → API**, copiá la **Project URL** y la **anon public key**.
4. En **Authentication → Providers**, dejá habilitado "Email" (viene por defecto). Si no querés que pida confirmación por mail para empezar más rápido, podés desactivar "Confirm email" en Authentication → Settings.

### 2. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá con los valores del paso anterior:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Correr en local

```bash
npm install
npm run dev
```

Abrí http://localhost:3000, creá tu cuenta y completá el onboarding.

### 4. Deploy para usarla desde el celular

1. Subí el repo a GitHub (ya está en este repositorio).
2. Andá a [vercel.com](https://vercel.com), "Add New Project" e importá el repo.
3. En "Environment Variables" cargá las mismas dos variables del paso 2.
4. Deploy. Vercel te da una URL tipo `https://fitme-tuusuario.vercel.app`.
5. Desde el celular, abrí esa URL en Chrome/Safari y usá "Agregar a pantalla de inicio" (Safari) o el ícono de instalar (Chrome/Android) para tenerla como una app.

## Estructura del proyecto

```
src/
  app/
    login/, onboarding/        páginas públicas
    (app)/dashboard, food,
          workouts, progress,
          profile             pantallas principales (requieren sesión)
    api/food-search           proxy a Open Food Facts
  components/                 UI (client components)
  data/                       base de alimentos, rutinas, tips y desafíos (estáticos)
  lib/
    actions/                  server actions (mutaciones)
    supabase/                 clientes de Supabase (browser/server/middleware)
    nutrition.ts              cálculo de objetivos (BMR/TDEE/macros)
    gamification.ts           XP, rachas, logros
    queries.ts                lecturas para las páginas
    date.ts                   fecha "de hoy" en huso horario de Argentina
supabase/migrations/          SQL de la base de datos
```

## Próximos pasos posibles

- **Reconocimiento de comida por foto**: se puede sumar como una pestaña más en `FoodLogger`, llamando a la API de Claude (Anthropic) con la foto para estimar el plato y sus macros. Requiere una API key propia (console.anthropic.com) y tiene un costo pequeño por uso.
- **Recordatorios/notificaciones**: push notifications para recordar tomar agua o registrar comidas (requiere configurar un service worker con Web Push).
- **Exportar datos** a CSV/PDF para compartir con nutricionista o traumatólogo (osteopenia).
