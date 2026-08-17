# Dois — protótipo

Site estático (HTML + CSS + JS vanilla com ES Modules). Como os módulos
ES exigem `http://`, abrir o `index.html` direto pelo `file://` não
funciona no Chrome/Safari — suba um servidor local simples:

```bash
# dentro da pasta do projeto
python3 -m http.server 8000
# ou
npx serve .
```

Depois acesse `http://localhost:8000`.

## Estrutura
- `index.html`, `style.css` — casca e estilos
- `js/mock-data.js` — catálogo de exercícios, templates de treino e
  geração determinística do histórico de sessões
- `js/data-service.js` — única camada que lê os dados; é o arquivo a
  trocar por chamadas ao Firestore no futuro
- `js/state.js`, `js/router.js`, `js/ui.js` — estado, navegação por hash
  e helpers de DOM
- `js/components/` — peças reutilizáveis (switcher de perfil, bottom
  nav, cards, stepper, gráfico, calendário etc.)
- `js/screens/` — as 6 telas: Hoje, Treinos, Execução, Cardio,
  Progresso, Calendário

Troque o perfil pelo seletor no topo para ver dados diferentes de
"Você" e "Parceira".
