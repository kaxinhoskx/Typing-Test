# ⌨️ Teste de Digitação

Teste de digitação de 30 segundos com três níveis de dificuldade, cálculo de palavras por minuto (PPM), precisão e ranking local dos melhores resultados. Feito com HTML, CSS e JavaScript puro, sem bibliotecas.

🔗 **Demo:** https://kaxinhoskx.github.io/Typing-Test/

![Print do Teste de Digitação](prints/app.png)

## ✨ Funcionalidades

- **3 níveis de dificuldade** (fácil, médio e difícil) com bancos de palavras em português
- **Textos aleatórios** gerados a cada teste (100 palavras sorteadas)
- **Cronômetro de 30 segundos** que só começa quando você digita a primeira tecla
- **PPM em tempo real**, calculado pelo padrão da digitação (5 caracteres corretos = 1 palavra)
- **Precisão em tempo real**, considerando todas as teclas digitadas, inclusive as erradas corrigidas depois
- **Feedback visual por letra**: acertos, erros e cursor na posição atual
- **Rolagem automática** do texto, mantendo a linha atual sempre visível
- **Ranking dos 5 melhores resultados** salvo no navegador (`localStorage`), com aviso de novo recorde
- **Bloqueio de colar texto** para evitar trapaça
- Botão de **reiniciar** o teste a qualquer momento

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+): manipulação do DOM, eventos, `setInterval`, `performance.now()`, `localStorage`

## 🧠 Como funciona

- **PPM:** `caracteres corretos ÷ 5 ÷ minutos decorridos`
- **Precisão:** `(teclas digitadas − teclas erradas) ÷ teclas digitadas`. Apagar não conta como tecla nova.
- **Ranking:** os resultados são ordenados por PPM, e só os 5 melhores ficam salvos no navegador.

## 🚀 Como rodar localmente

```bash
git clone https://github.com/kaxinhoskx/Typing-Test.git
cd Typing-Test
# abra o index.html no navegador ou use a extensão Live Server do VS Code
```

## 📚 O que aprendi

- Criar elementos dinamicamente no DOM e atualizar a interface a cada tecla
- Controlar tempo com `setInterval` e `performance.now()`
- Calcular métricas (PPM e precisão) a partir do estado do app
- Persistir dados com `localStorage` e tratar falhas com `try/catch`
- Organizar o código em funções com responsabilidades separadas

## 🔮 Próximos passos

- Ranking separado por nível de dificuldade
- Escolha de duração (15s, 30s, 60s)
- Textos com pontuação e maiúsculas

## 👤 Autor

**Kayo** · [LinkedIn](https://www.linkedin.com/in/kayo-alves-pereira-zamboni-26419b426/) · [GitHub](https://github.com/kaxinhoskx)
