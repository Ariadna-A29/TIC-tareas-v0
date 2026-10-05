export type Category = 'Movimiento' | 'Combate' | 'Interfaz' | 'Audio' | 'Física' | 'Niveles'

export type Task = {
  id: string
  code: string
  title: string
  summary: string
  description: string
  requirements: string[]
  prerequisites: string[]
  points: number
  category: Category
}

export type Student = { id: string; name: string; groupId: string }
export type Group = { id: string; name: string; game: string }

export type ReservationStatus = 'reservada' | 'entregada' | 'aprobada' | 'rechazada'

export type Reservation = {
  id: string
  taskId: string
  studentId: string
  groupId: string
  status: ReservationStatus
  checklist: boolean[]
  note: string
  selfAssessment?: 'cumple' | 'parcial'
  feedback?: string
  updatedAt: string
}

export type TaskState = 'disponible' | 'bloqueada' | 'tomada' | ReservationStatus

export const CATEGORIES: Category[] = ['Movimiento', 'Combate', 'Interfaz', 'Audio', 'Física', 'Niveles']

export const GROUPS: Group[] = [
  { id: 'g1', name: 'Grupo 1', game: 'Plataformero 2D' },
  { id: 'g2', name: 'Grupo 2', game: 'Shooter espacial' },
  { id: 'g3', name: 'Grupo 3', game: 'Aventura de puzzles' },
]

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Sofía Martínez', groupId: 'g1' },
  { id: 's2', name: 'Tomás Gómez', groupId: 'g1' },
  { id: 's3', name: 'Valentina Ruiz', groupId: 'g1' },
  { id: 's4', name: 'Mateo Fernández', groupId: 'g2' },
  { id: 's5', name: 'Camila López', groupId: 'g2' },
  { id: 's6', name: 'Lucas Díaz', groupId: 'g3' },
  { id: 's7', name: 'Martina Sosa', groupId: 'g3' },
]

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    code: 'M-01',
    title: 'Movimiento del personaje',
    summary: 'El jugador puede caminar hacia los costados con el teclado.',
    description:
      'Hacé que el personaje principal se mueva a izquierda y derecha usando las flechas o A/D. El movimiento debe ser suave y frenar cuando se suelta la tecla.',
    requirements: [
      'Se mueve con flechas y con A/D',
      'La velocidad es constante',
      'Se detiene al soltar la tecla',
    ],
    prerequisites: [],
    points: 10,
    category: 'Movimiento',
  },
  {
    id: 't2',
    code: 'M-02',
    title: 'Salto',
    summary: 'El personaje salta al presionar la barra espaciadora.',
    description:
      'Agregá un salto con gravedad. El personaje solo puede saltar si está tocando el piso (no se permite saltar en el aire).',
    requirements: ['Salta con la barra espaciadora', 'Cae por gravedad', 'No salta en el aire'],
    prerequisites: ['t1'],
    points: 15,
    category: 'Física',
  },
  {
    id: 't3',
    code: 'M-03',
    title: 'Barra de vida',
    summary: 'Se muestra en pantalla cuánta vida le queda al jugador.',
    description:
      'Dibujá una barra de vida en la esquina superior. Debe bajar cuando el jugador recibe daño y cambiar de color cuando queda poca vida.',
    requirements: ['Visible en todo momento', 'Baja al recibir daño', 'Cambia de color con poca vida'],
    prerequisites: [],
    points: 10,
    category: 'Interfaz',
  },
  {
    id: 't4',
    code: 'M-04',
    title: 'Enemigo que patrulla',
    summary: 'Un enemigo camina de un lado a otro y lastima al tocarte.',
    description:
      'Creá un enemigo que se mueva entre dos puntos. Si toca al jugador, le resta vida.',
    requirements: ['Se mueve entre dos puntos', 'Gira al llegar al borde', 'Resta vida al tocar al jugador'],
    prerequisites: ['t1', 't3'],
    points: 20,
    category: 'Combate',
  },
  {
    id: 't5',
    code: 'M-05',
    title: 'Música y efectos',
    summary: 'El juego tiene música de fondo y sonidos al saltar.',
    description:
      'Agregá una música que se repita en loop y un efecto de sonido al saltar. Incluí un botón para silenciar.',
    requirements: ['Música en loop', 'Sonido al saltar', 'Botón de silencio'],
    prerequisites: ['t2'],
    points: 10,
    category: 'Audio',
  },
  {
    id: 't6',
    code: 'M-06',
    title: 'Monedas coleccionables',
    summary: 'Al tocar una moneda, desaparece y suma puntos.',
    description:
      'Ubicá monedas en el nivel. Cuando el jugador las toca, desaparecen y se suma al contador de puntaje en pantalla.',
    requirements: ['Las monedas desaparecen al tocarlas', 'Se suma al contador', 'El contador es visible'],
    prerequisites: ['t1'],
    points: 15,
    category: 'Niveles',
  },
  {
    id: 't7',
    code: 'M-07',
    title: 'Pantalla de Game Over',
    summary: 'Cuando la vida llega a cero, aparece un cartel para reiniciar.',
    description:
      'Mostrá una pantalla de fin de juego cuando el jugador se queda sin vida, con un botón para volver a empezar.',
    requirements: ['Aparece con vida en cero', 'Botón de reinicio funcional', 'Muestra el puntaje final'],
    prerequisites: ['t3', 't4'],
    points: 20,
    category: 'Interfaz',
  },
]

const now = () => new Date().toISOString()

export const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'r1', taskId: 't1', studentId: 's1', groupId: 'g1', status: 'aprobada', checklist: [true, true, true], note: 'Usé velocidad 5.', selfAssessment: 'cumple', feedback: '¡Muy bien!', updatedAt: now() },
  { id: 'r2', taskId: 't3', studentId: 's2', groupId: 'g1', status: 'entregada', checklist: [true, true, true], note: 'La barra se pone roja con menos de 30%.', selfAssessment: 'cumple', updatedAt: now() },
  { id: 'r3', taskId: 't2', studentId: 's3', groupId: 'g1', status: 'reservada', checklist: [true, false, false], note: '', updatedAt: now() },
  { id: 'r4', taskId: 't1', studentId: 's4', groupId: 'g2', status: 'aprobada', checklist: [true, true, true], note: '', selfAssessment: 'cumple', updatedAt: now() },
  { id: 'r5', taskId: 't6', studentId: 's5', groupId: 'g2', status: 'entregada', checklist: [true, true, false], note: 'Falta mostrar el contador.', selfAssessment: 'parcial', updatedAt: now() },
  { id: 'r6', taskId: 't3', studentId: 's6', groupId: 'g3', status: 'rechazada', checklist: [true, true, false], note: '', selfAssessment: 'parcial', feedback: 'Falta el cambio de color con poca vida.', updatedAt: now() },
]

export const STATE_LABEL: Record<TaskState, string> = {
  disponible: 'Disponible',
  bloqueada: 'Bloqueada',
  tomada: 'Tomada por el grupo',
  reservada: 'En curso',
  entregada: 'Entregada',
  aprobada: 'Aprobada',
  rechazada: 'Para corregir',
}
