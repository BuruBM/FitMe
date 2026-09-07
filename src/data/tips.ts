export interface Tip {
  id: string;
  category: "proteína" | "hinchazón" | "huesos" | "trabajo" | "social" | "energía" | "sueño";
  title: string;
  body: string;
}

export const TIPS: Tip[] = [
  {
    id: "proteina-reparto",
    category: "proteína",
    title: "Repartí la proteína en el día",
    body: "En vez de concentrarla en la cena, sumá una fuente en cada comida: huevo o proteína en polvo en el desayuno, tofu/milanesa de soja en el almuerzo, yogur griego en la merienda. Ayuda a la saciedad y a conservar masa muscular mientras bajás de peso.",
  },
  {
    id: "hinchazon-sodio",
    category: "hinchazón",
    title: "Cuidá el sodio en la comida del trabajo",
    body: "Si el almuerzo lo provee el trabajo, elegí las opciones con salsas aparte o pedí que sean livianas, y sumá agua extra después. El exceso de sodio es una de las causas más comunes de hinchazón.",
  },
  {
    id: "hinchazon-fodmap",
    category: "hinchazón",
    title: "Detectá gatillantes personales",
    body: "La soja en general se tolera bien, pero legumbres en gran cantidad, gaseosas y edulcorantes (sorbitol/xilitol) pueden hincharte. Registrá síntomas junto a las comidas para ir viendo tu propio patrón.",
  },
  {
    id: "hinchazon-caminata",
    category: "hinchazón",
    title: "Caminata corta después de comer",
    body: "10 minutos caminando después de almorzar o cenar ayuda a la digestión y reduce la sensación de hinchazón, sin sumar 'entrenamiento' a tu lista de pendientes.",
  },
  {
    id: "huesos-calcio",
    category: "huesos",
    title: "Calcio + vitamina D todos los días",
    body: "Con tendencia a osteopenia, apuntá a ~1200mg de calcio/día: tofu, lácteos, almendras, brócoli. La vitamina D (sol 10-15 min/día o suplemento si tu médica lo indica) ayuda a absorberlo.",
  },
  {
    id: "huesos-fuerza",
    category: "huesos",
    title: "El ejercicio de fuerza cuida tus huesos",
    body: "Sentadillas, zancadas y ejercicios con tu propio peso (o una mochila con libros) generan la carga que estimula la densidad ósea. Más importante que la duración es la constancia: 2-3 veces por semana alcanza.",
  },
  {
    id: "trabajo-desayuno",
    category: "trabajo",
    title: "Desayuno que sostenga hasta el almuerzo",
    body: "Con el despertador a las 6am, un desayuno con proteína (huevo, proteína en polvo, yogur griego) + algo de fibra evita el bajón de media mañana y las ganas de picar cualquier cosa.",
  },
  {
    id: "trabajo-almuerzo",
    category: "trabajo",
    title: "Cómo elegir en el menú del trabajo",
    body: "Priorizá: 1) una porción de proteína vegetariana si hay, 2) vegetales o ensalada, 3) una porción moderada de carbohidrato. Si el plato es muy pesado, comé la mitad y guardá el resto o sumá una fruta después.",
  },
  {
    id: "social-alcohol",
    category: "social",
    title: "Juntadas con amigos, sin todo o nada",
    body: "Podés registrar el vino o la cerveza como cualquier otra comida: no hace falta 'compensar' de más al otro día. Alternar con agua entre tragos ayuda a controlar cantidad e hinchazón.",
  },
  {
    id: "social-delivery",
    category: "social",
    title: "El delivery también entra en el plan",
    body: "Un gusto ocasional (pizza, empanadas) no arruina el proceso. Elegí porciones conscientes, agregá una ensalada al costado si podés, y disfrutalo sin culpa: lo que importa es el promedio de la semana, no un día puntual.",
  },
  {
    id: "energia-mate",
    category: "energía",
    title: "Tu mate de la mañana",
    body: "El mate en ayunas está bien, pero si notás acidez o ansiedad, probá tomarlo después del desayuno en vez de antes.",
  },
  {
    id: "energia-siestas",
    category: "energía",
    title: "Microdescansos en vez de siesta larga",
    body: "Si dormiste poco, una pausa de 10-15 min (sin pantalla) a media tarde recupera más energía que forzar una siesta larga que después te complique dormir a la noche.",
  },
  {
    id: "sueno-rutina",
    category: "sueño",
    title: "Protegé el horario de dormir",
    body: "Con el despertador a las 6am, definí una hora límite para acostarte (por ejemplo 22:30) y una rutina corta antes: luz baja, sin pantallas 20 minutos antes, algún estiramiento suave.",
  },
  {
    id: "sueno-gatos",
    category: "sueño",
    title: "Organizá la rutina de los gatos antes de dormir",
    body: "Dejar la comida/arena de los gatos lista temprano en la noche (no justo antes de acostarte) te da más margen para tu propia rutina de descanso.",
  },
];

export function tipsForCategory(category: Tip["category"]): Tip[] {
  return TIPS.filter((t) => t.category === category);
}
