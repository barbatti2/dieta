// Catálogo de exercícios — curado à mão, cobrindo os principais grupos musculares
// (o próximo passo é você ir ajustando/completando com o que vocês realmente usam)

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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
  },
  "crucifixo_reto_halteres": {
    "nome": "Crucifixo Reto com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
  },
  "crucifixo_inclinado_halteres": {
    "nome": "Crucifixo Inclinado com Halteres",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário"
  },
  "cross_over_cabo": {
    "nome": "Cross Over (Cabo)",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Intermediário"
  },
  "peck_deck": {
    "nome": "Peck Deck (Voador)",
    "grupo": "peito",
    "primary": [
      "chest"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Avançado"
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
    "nivel": "Avançado"
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
    "nivel": "Iniciante"
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
    "nivel": "Avançado"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
  },
  "elevacao_lateral": {
    "nome": "Elevação Lateral com Halteres",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
  },
  "elevacao_frontal": {
    "nome": "Elevação Frontal com Halteres",
    "grupo": "ombro",
    "primary": [
      "front-deltoids"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
  },
  "encolhimento_ombros": {
    "nome": "Encolhimento de Ombros",
    "grupo": "ombro",
    "primary": [
      "trapezius"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
  },
  "rosca_scott": {
    "nome": "Rosca Scott",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [],
    "equipamento": "Barra W",
    "nivel": "Intermediário"
  },
  "rosca_concentrada": {
    "nome": "Rosca Concentrada",
    "grupo": "biceps",
    "primary": [
      "biceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Avançado"
  },
  "triceps_corda": {
    "nome": "Tríceps Corda (Pulley)",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante"
  },
  "triceps_testa": {
    "nome": "Tríceps Testa com Barra",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Barra W",
    "nivel": "Intermediário"
  },
  "triceps_frances": {
    "nome": "Tríceps Francês com Halteres",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
  },
  "triceps_coice": {
    "nome": "Tríceps Coice com Halteres",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
  },
  "triceps_barra_v": {
    "nome": "Tríceps Barra V",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante"
  },
  "triceps_acima_cabeca": {
    "nome": "Extensão de Tríceps Acima da Cabeça",
    "grupo": "triceps",
    "primary": [
      "triceps"
    ],
    "secondary": [],
    "equipamento": "Halteres",
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
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
    "nivel": "Avançado"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
  },
  "cadeira_extensora": {
    "nome": "Cadeira Extensora",
    "grupo": "perna",
    "primary": [
      "quadriceps"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
  },
  "cadeira_adutora": {
    "nome": "Cadeira Adutora",
    "grupo": "perna",
    "primary": [
      "adductors"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
  },
  "panturrilha_em_pe": {
    "nome": "Panturrilha em Pé",
    "grupo": "perna",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
  },
  "cadeira_flexora": {
    "nome": "Cadeira Flexora",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
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
    "nivel": "Intermediário"
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
    "nivel": "Intermediário"
  },
  "gluteo_cabo": {
    "nome": "Glúteo no Cabo (Coice)",
    "grupo": "gluteo_posterior",
    "primary": [
      "gluteal"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Iniciante"
  },
  "mesa_flexora": {
    "nome": "Mesa Flexora",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
  },
  "panturrilha_sentado": {
    "nome": "Panturrilha Sentado",
    "grupo": "gluteo_posterior",
    "primary": [
      "calves"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
  },
  "cadeira_flexora_unilateral": {
    "nome": "Cadeira Flexora Unilateral",
    "grupo": "gluteo_posterior",
    "primary": [
      "hamstring"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Intermediário"
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
    "nivel": "Avançado"
  },
  "abdominal_reto": {
    "nome": "Abdominal Reto (Crunch)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante"
  },
  "abdominal_infra": {
    "nome": "Abdominal Infra (Elevação de Pernas)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
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
    "nivel": "Iniciante"
  },
  "abdominal_obliquo": {
    "nome": "Abdominal Oblíquo",
    "grupo": "abdomen",
    "primary": [
      "obliques"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante"
  },
  "abdominal_polia": {
    "nome": "Abdominal na Polia (Cable Crunch)",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Cabo",
    "nivel": "Intermediário"
  },
  "abdominal_maquina": {
    "nome": "Abdominal Máquina",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Máquina",
    "nivel": "Iniciante"
  },
  "elevacao_pernas_barra": {
    "nome": "Elevação de Pernas na Barra",
    "grupo": "abdomen",
    "primary": [
      "abs"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Avançado"
  },
  "prancha_lateral": {
    "nome": "Prancha Lateral",
    "grupo": "abdomen",
    "primary": [
      "obliques"
    ],
    "secondary": [],
    "equipamento": "Peso corporal",
    "nivel": "Iniciante"
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
    "nivel": "Avançado"
  }
};
