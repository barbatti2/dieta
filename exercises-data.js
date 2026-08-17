// Catálogo padrão de exercícios. Cada item pode ser complementado
// com exercícios personalizados salvos no Firestore (coleção "exercicios").
// categorias: peito, costas, pernas, bracos, abdomen, gluteos, cardio

export const CATEGORIAS = [
  { id: 'peito', nome: 'Peito', icone: '💪' },
  { id: 'costas', nome: 'Costas', icone: '🔙' },
  { id: 'pernas', nome: 'Pernas', icone: '🦵' },
  { id: 'bracos', nome: 'Braços', icone: '💪' },
  { id: 'abdomen', nome: 'Abdômen', icone: '🔷' },
  { id: 'gluteos', nome: 'Glúteos', icone: '⭐' },
  { id: 'cardio', nome: 'Cardio', icone: '❤️' },
];

export const EXERCICIOS_PADRAO = [
  // PEITO
  { id: 'supino-reto-barra', nome: 'Supino reto com barra', categoria: 'peito' },
  { id: 'supino-inclinado-barra', nome: 'Supino inclinado com barra', categoria: 'peito' },
  { id: 'supino-declinado-barra', nome: 'Supino declinado com barra', categoria: 'peito' },
  { id: 'supino-reto-halteres', nome: 'Supino reto com halteres', categoria: 'peito' },
  { id: 'supino-inclinado-halteres', nome: 'Supino inclinado com halteres', categoria: 'peito' },
  { id: 'crucifixo-reto', nome: 'Crucifixo reto com halteres', categoria: 'peito' },
  { id: 'crucifixo-inclinado', nome: 'Crucifixo inclinado com halteres', categoria: 'peito' },
  { id: 'crossover', nome: 'Crossover no cabo', categoria: 'peito' },
  { id: 'peck-deck', nome: 'Peck deck (voador)', categoria: 'peito' },
  { id: 'supino-maquina', nome: 'Supino na máquina', categoria: 'peito' },
  { id: 'flexao-braco', nome: 'Flexão de braço', categoria: 'peito' },
  { id: 'paralelas-peito', nome: 'Paralelas (foco peito)', categoria: 'peito' },
  { id: 'pullover', nome: 'Pullover com halter', categoria: 'peito' },

  // COSTAS
  { id: 'puxada-frente', nome: 'Puxada frente (pulley)', categoria: 'costas' },
  { id: 'puxada-triangulo', nome: 'Puxada triângulo', categoria: 'costas' },
  { id: 'barra-fixa', nome: 'Barra fixa (pull-up)', categoria: 'costas' },
  { id: 'remada-curvada-barra', nome: 'Remada curvada com barra', categoria: 'costas' },
  { id: 'remada-cavalinho', nome: 'Remada cavalinho (T-bar)', categoria: 'costas' },
  { id: 'remada-baixa', nome: 'Remada baixa (cabo)', categoria: 'costas' },
  { id: 'remada-unilateral', nome: 'Remada unilateral com halter', categoria: 'costas' },
  { id: 'remada-maquina', nome: 'Remada na máquina', categoria: 'costas' },
  { id: 'levantamento-terra', nome: 'Levantamento terra', categoria: 'costas' },
  { id: 'levantamento-terra-romeno', nome: 'Levantamento terra romeno', categoria: 'costas' },
  { id: 'hiperextensao', nome: 'Hiperextensão lombar', categoria: 'costas' },
  { id: 'pulldown-braco-reto', nome: 'Pulldown braço reto', categoria: 'costas' },
  { id: 'face-pull', nome: 'Face pull', categoria: 'costas' },

  // PERNAS
  { id: 'agachamento-livre', nome: 'Agachamento livre com barra', categoria: 'pernas' },
  { id: 'agachamento-smith', nome: 'Agachamento no smith', categoria: 'pernas' },
  { id: 'leg-press', nome: 'Leg press 45°', categoria: 'pernas' },
  { id: 'cadeira-extensora', nome: 'Cadeira extensora', categoria: 'pernas' },
  { id: 'mesa-flexora', nome: 'Mesa flexora', categoria: 'pernas' },
  { id: 'cadeira-flexora', nome: 'Cadeira flexora', categoria: 'pernas' },
  { id: 'afundo', nome: 'Afundo (passada)', categoria: 'pernas' },
  { id: 'agachamento-bulgaro', nome: 'Agachamento búlgaro', categoria: 'pernas' },
  { id: 'stiff', nome: 'Stiff com barra', categoria: 'pernas' },
  { id: 'panturrilha-em-pe', nome: 'Panturrilha em pé', categoria: 'pernas' },
  { id: 'panturrilha-sentado', nome: 'Panturrilha sentado', categoria: 'pernas' },
  { id: 'hack-machine', nome: 'Agachamento hack', categoria: 'pernas' },
  { id: 'passada-halteres', nome: 'Passada com halteres', categoria: 'pernas' },

  // BRAÇOS
  { id: 'rosca-direta-barra', nome: 'Rosca direta com barra', categoria: 'bracos' },
  { id: 'rosca-alternada', nome: 'Rosca alternada com halteres', categoria: 'bracos' },
  { id: 'rosca-martelo', nome: 'Rosca martelo', categoria: 'bracos' },
  { id: 'rosca-scott', nome: 'Rosca Scott', categoria: 'bracos' },
  { id: 'rosca-concentrada', nome: 'Rosca concentrada', categoria: 'bracos' },
  { id: 'rosca-cabo', nome: 'Rosca no cabo', categoria: 'bracos' },
  { id: 'triceps-testa', nome: 'Tríceps testa', categoria: 'bracos' },
  { id: 'triceps-corda', nome: 'Tríceps corda no cabo', categoria: 'bracos' },
  { id: 'triceps-frances', nome: 'Tríceps francês', categoria: 'bracos' },
  { id: 'triceps-banco', nome: 'Tríceps no banco (mergulho)', categoria: 'bracos' },
  { id: 'paralelas-triceps', nome: 'Paralelas (foco tríceps)', categoria: 'bracos' },
  { id: 'supino-fechado', nome: 'Supino fechado (pegada fechada)', categoria: 'bracos' },

  // ABDOMEN
  { id: 'abdominal-supra', nome: 'Abdominal supra', categoria: 'abdomen' },
  { id: 'abdominal-infra', nome: 'Abdominal infra', categoria: 'abdomen' },
  { id: 'prancha', nome: 'Prancha isométrica', categoria: 'abdomen' },
  { id: 'prancha-lateral', nome: 'Prancha lateral', categoria: 'abdomen' },
  { id: 'elevacao-pernas', nome: 'Elevação de pernas', categoria: 'abdomen' },
  { id: 'abdominal-maquina', nome: 'Abdominal na máquina', categoria: 'abdomen' },
  { id: 'abdominal-cabo', nome: 'Abdominal no cabo (ajoelhado)', categoria: 'abdomen' },
  { id: 'abdominal-bicicleta', nome: 'Abdominal bicicleta', categoria: 'abdomen' },
  { id: 'rotacao-russa', nome: 'Rotação russa', categoria: 'abdomen' },

  // GLÚTEOS
  { id: 'elevacao-pelvica', nome: 'Elevação pélvica (hip thrust)', categoria: 'gluteos' },
  { id: 'cadeira-abdutora', nome: 'Cadeira abdutora', categoria: 'gluteos' },
  { id: 'cadeira-adutora', nome: 'Cadeira adutora', categoria: 'gluteos' },
  { id: 'coice-cabo', nome: 'Coice no cabo (glúteo)', categoria: 'gluteos' },
  { id: 'coice-maquina', nome: 'Coice na máquina', categoria: 'gluteos' },
  { id: 'agachamento-sumo', nome: 'Agachamento sumô', categoria: 'gluteos' },
  { id: 'gluteo-4-apoios', nome: 'Glúteo em 4 apoios', categoria: 'gluteos' },
  { id: 'step-up', nome: 'Step up (subida no banco)', categoria: 'gluteos' },

  // CARDIO
  { id: 'esteira', nome: 'Esteira', categoria: 'cardio' },
  { id: 'bicicleta-ergometrica', nome: 'Bicicleta ergométrica', categoria: 'cardio' },
  { id: 'eliptico', nome: 'Elíptico', categoria: 'cardio' },
  { id: 'escada-stairmaster', nome: 'Escada (stairmaster)', categoria: 'cardio' },
  { id: 'remo-ergometro', nome: 'Remo ergômetro', categoria: 'cardio' },
  { id: 'pular-corda', nome: 'Pular corda', categoria: 'cardio' },
  { id: 'hiit', nome: 'HIIT', categoria: 'cardio' },
  { id: 'corrida-rua', nome: 'Corrida na rua', categoria: 'cardio' },
];

export const DIAS_SEMANA = [
  { id: 'segunda', nome: 'Segunda' },
  { id: 'terca', nome: 'Terça' },
  { id: 'quarta', nome: 'Quarta' },
  { id: 'quinta', nome: 'Quinta' },
  { id: 'sexta', nome: 'Sexta' },
  { id: 'sabado', nome: 'Sábado' },
  { id: 'domingo', nome: 'Domingo' },
];
