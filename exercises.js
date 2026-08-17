// Catálogo de exercícios — 84 exercícios cobrindo os principais grupos musculares
// Imagens reais casadas a partir do dataset free-exercise-db (yuhonas/free-exercise-db, domínio público)

export const GROUPS = [
  {
    "id": "peito",
    "nome": "Peito"
  },
  {
    "id": "costas",
    "nome": "Costas"
  },
  {
    "id": "ombro",
    "nome": "Ombro"
  },
  {
    "id": "biceps",
    "nome": "Bíceps"
  },
  {
    "id": "triceps",
    "nome": "Tríceps"
  },
  {
    "id": "perna",
    "nome": "Perna"
  },
  {
    "id": "gluteo_posterior",
    "nome": "Posterior & Glúteo"
  },
  {
    "id": "abdomen",
    "nome": "Abdômen"
  }
];

export const EXERCISES = {
  "supino_reto_barra": {
    "nome": "Supino Reto com Barra",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "front-deltoids",
      "triceps"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg"
  },
  "supino_inclinado_barra": {
    "nome": "Supino Inclinado com Barra",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "front-deltoids",
      "triceps"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg"
  },
  "supino_declinado_barra": {
    "nome": "Supino Declinado com Barra",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Barbell_Bench_Press/0.jpg"
  },
  "supino_reto_halteres": {
    "nome": "Supino Reto com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "front-deltoids",
      "triceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg"
  },
  "supino_inclinado_halteres": {
    "nome": "Supino Inclinado com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "front-deltoids",
      "triceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg"
  },
  "crucifixo_reto_halteres": {
    "nome": "Crucifixo Reto com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg"
  },
  "crucifixo_inclinado_halteres": {
    "nome": "Crucifixo Inclinado com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Flyes/0.jpg"
  },
  "cross_over_cabo": {
    "nome": "Cross Over (Cabo)",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg"
  },
  "peck_deck": {
    "nome": "Peck Deck (Voador)",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg"
  },
  "flexao_bracos": {
    "nome": "Flexão de Braços",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps",
      "front-deltoids"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg"
  },
  "supino_maquina": {
    "nome": "Supino Máquina",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Bench_Press/0.jpg"
  },
  "flexao_declinada": {
    "nome": "Flexão Declinada",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [
      "front-deltoids",
      "triceps"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg"
  },
  "puxada_frente": {
    "nome": "Puxada pela Frente (Pulley)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg"
  },
  "puxada_triangulo": {
    "nome": "Puxada Triângulo",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Front_Lat_Pulldown/0.jpg"
  },
  "remada_curvada_barra": {
    "nome": "Remada Curvada com Barra",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps",
      "back-deltoids"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg"
  },
  "remada_curvada_halteres": {
    "nome": "Remada Curvada com Halteres",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg"
  },
  "remada_cavalinho": {
    "nome": "Remada Cavalinho (T-bar)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Barra T",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg"
  },
  "remada_baixa_cabo": {
    "nome": "Remada Baixa (Cabo)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg"
  },
  "remada_serrote": {
    "nome": "Remada Unilateral (Serrote)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg"
  },
  "barra_fixa": {
    "nome": "Barra Fixa (Pull-up)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg"
  },
  "barra_fixa_supinada": {
    "nome": "Barra Fixa Pegada Supinada (Chin-up)",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "biceps"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg"
  },
  "pulldown_corda": {
    "nome": "Pulldown com Corda",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg"
  },
  "levantamento_terra": {
    "nome": "Levantamento Terra",
    "grupo": "costas",
    "primary": [
      "lower-back"
    ],
    "secondary": [
      "gluteal",
      "hamstring",
      "upper-back"
    ],
    "equipamento": "Barra",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg"
  },
  "terra_romeno": {
    "nome": "Levantamento Terra Romeno",
    "grupo": "costas",
    "primary": [
      "hamstring"
    ],
    "secondary": [
      "gluteal",
      "lower-back"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg"
  },
  "hiperextensao_lombar": {
    "nome": "Hiperextensão Lombar",
    "grupo": "costas",
    "primary": [
      "lower-back"
    ],
    "secondary": [
      "gluteal",
      "hamstring"
    ],
    "equipamento": "Banco Romano",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hyperextensions_Back_Extensions/0.jpg"
  },
  "pullover_halteres": {
    "nome": "Pull-over com Halteres",
    "grupo": "costas",
    "primary": [
      "upper-back"
    ],
    "secondary": [
      "chest"
    ],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg"
  },
  "desenvolvimento_militar": {
    "nome": "Desenvolvimento Militar com Barra",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg"
  },
  "desenvolvimento_halteres": {
    "nome": "Desenvolvimento com Halteres",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shoulder_Press/0.jpg"
  },
  "desenvolvimento_arnold": {
    "nome": "Desenvolvimento Arnold",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Arnold_Dumbbell_Press/0.jpg"
  },
  "elevacao_lateral": {
    "nome": "Elevação Lateral com Halteres",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg"
  },
  "elevacao_frontal": {
    "nome": "Elevação Frontal com Halteres",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg"
  },
  "elevacao_posterior": {
    "nome": "Elevação Posterior (Crucifixo Invertido)",
    "grupo": "ombro",
    "primary": [
      "back-deltoids"
    ],
    "secondary": [
      "upper-back"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg"
  },
  "remada_alta_barra": {
    "nome": "Remada Alta com Barra",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [
      "trapezius"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg"
  },
  "encolhimento_ombros": {
    "nome": "Encolhimento de Ombros",
    "grupo": "ombro",
    "primary": [
      "trapezius"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg"
  },
  "desenvolvimento_maquina": {
    "nome": "Desenvolvimento Máquina",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [
      "triceps"
    ],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Overhead_Shoulder_Press/0.jpg"
  },
  "face_pull": {
    "nome": "Face Pull (Cabo)",
    "grupo": "ombro",
    "primary": [
      "back-deltoids"
    ],
    "secondary": [
      "upper-back",
      "trapezius"
    ],
    "equipamento": "Cabo",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg"
  },
  "rosca_direta_barra": {
    "nome": "Rosca Direta com Barra",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Barra",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg"
  },
  "rosca_direta_halteres": {
    "nome": "Rosca Direta com Halteres",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg"
  },
  "rosca_alternada": {
    "nome": "Rosca Alternada com Halteres",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Alternate_Incline_Dumbbell_Curl/0.jpg"
  },
  "rosca_martelo": {
    "nome": "Rosca Martelo",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg"
  },
  "rosca_scott": {
    "nome": "Rosca Scott",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [],
    "equipamento": "Barra W",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Preacher_Curl/0.jpg"
  },
  "rosca_concentrada": {
    "nome": "Rosca Concentrada",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Concentration_Curls/0.jpg"
  },
  "rosca_cabo": {
    "nome": "Rosca no Cabo",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg"
  },
  "rosca_21": {
    "nome": "Rosca 21",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [
      "forearm"
    ],
    "equipamento": "Barra",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg"
  },
  "triceps_corda": {
    "nome": "Tríceps Corda (Pulley)",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg"
  },
  "triceps_testa": {
    "nome": "Tríceps Testa com Barra",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Barra W",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg"
  },
  "triceps_frances": {
    "nome": "Tríceps Francês com Halteres",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Triceps_Press/0.jpg"
  },
  "mergulho_banco": {
    "nome": "Mergulho no Banco (Dips)",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest",
      "front-deltoids"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg"
  },
  "triceps_coice": {
    "nome": "Tríceps Coice com Halteres",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Tricep_Dumbbell_Kickback/0.jpg"
  },
  "supino_pegada_fechada": {
    "nome": "Supino Pegada Fechada",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [
      "chest"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Close-Grip_Barbell_Bench_Press/0.jpg"
  },
  "triceps_barra_v": {
    "nome": "Tríceps Barra V",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown_-_V-Bar_Attachment/0.jpg"
  },
  "triceps_acima_cabeca": {
    "nome": "Extensão de Tríceps Acima da Cabeça",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg"
  },
  "agachamento_livre": {
    "nome": "Agachamento Livre",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal",
      "hamstring"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg"
  },
  "agachamento_frontal": {
    "nome": "Agachamento Frontal",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Barra",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Barbell_Squat/0.jpg"
  },
  "agachamento_bulgaro": {
    "nome": "Agachamento Búlgaro",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Side_Split_Squat/0.jpg"
  },
  "leg_press": {
    "nome": "Leg Press 45°",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg"
  },
  "cadeira_extensora": {
    "nome": "Cadeira Extensora",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg"
  },
  "afundo": {
    "nome": "Afundo (Passada)",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg"
  },
  "agachamento_smith": {
    "nome": "Agachamento no Smith",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Smith",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg"
  },
  "agachamento_sumo": {
    "nome": "Agachamento Sumô",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal",
      "adductors"
    ],
    "equipamento": "Halteres",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Squat/0.jpg"
  },
  "passada_halteres": {
    "nome": "Passada com Halteres",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg"
  },
  "step_up": {
    "nome": "Step Up",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Halteres",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Step_Ups/0.jpg"
  },
  "hack_squat": {
    "nome": "Hack Squat",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Máquina",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg"
  },
  "cadeira_adutora": {
    "nome": "Cadeira Adutora",
    "grupo": "perna",
    "primary": [
      "adductors"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg"
  },
  "cadeira_abdutora": {
    "nome": "Cadeira Abdutora",
    "grupo": "perna",
    "primary": [
      "abductors"
    ],
    "secondary": [
      "gluteal"
    ],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg"
  },
  "panturrilha_em_pe": {
    "nome": "Panturrilha em Pé",
    "grupo": "perna",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg"
  },
  "cadeira_flexora": {
    "nome": "Cadeira Flexora",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg"
  },
  "stiff": {
    "nome": "Stiff",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [
      "gluteal",
      "lower-back"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Barbell_Deadlift/0.jpg"
  },
  "elevacao_pelvica": {
    "nome": "Elevação Pélvica (Hip Thrust)",
    "grupo": "gluteo_posterior",
    "primary": [
      "gluteal"
    ],
    "secondary": [
      "hamstring"
    ],
    "equipamento": "Barra",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg"
  },
  "gluteo_cabo": {
    "nome": "Glúteo no Cabo (Coice)",
    "grupo": "gluteo_posterior",
    "primary": [
      "gluteal"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hip_Adduction/0.jpg"
  },
  "mesa_flexora": {
    "nome": "Mesa Flexora",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg"
  },
  "panturrilha_sentado": {
    "nome": "Panturrilha Sentado",
    "grupo": "gluteo_posterior",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg"
  },
  "cadeira_flexora_unilateral": {
    "nome": "Cadeira Flexora Unilateral",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Leg_Curl/0.jpg"
  },
  "bom_dia": {
    "nome": "Bom Dia (Good Morning)",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [
      "lower-back",
      "gluteal"
    ],
    "equipamento": "Barra",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Good_Morning/0.jpg"
  },
  "abdominal_reto": {
    "nome": "Abdominal Reto (Crunch)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg"
  },
  "abdominal_infra": {
    "nome": "Abdominal Infra (Elevação de Pernas)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg"
  },
  "prancha": {
    "nome": "Prancha",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [
      "obliques"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg"
  },
  "abdominal_bicicleta": {
    "nome": "Abdominal Bicicleta",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [
      "obliques"
    ],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg"
  },
  "abdominal_obliquo": {
    "nome": "Abdominal Oblíquo",
    "grupo": "abdomen",
    "primary": [
      "obliques"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Oblique_Crunches/0.jpg"
  },
  "abdominal_polia": {
    "nome": "Abdominal na Polia (Cable Crunch)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Intermediário",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg"
  },
  "abdominal_maquina": {
    "nome": "Abdominal Máquina",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg"
  },
  "elevacao_pernas_barra": {
    "nome": "Elevação de Pernas na Barra",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg"
  },
  "prancha_lateral": {
    "nome": "Prancha Lateral",
    "grupo": "abdomen",
    "primary": [
      "obliques"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg"
  },
  "ab_wheel": {
    "nome": "Roda Abdominal (Ab Wheel)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [
      "obliques"
    ],
    "equipamento": "Ab Wheel",
    "nivel": "Avançado",
    "imagem": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Roller/0.jpg"
  }
};
