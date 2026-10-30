---
summary: Every designed state of "Posso comprar?" (HOME-02), mobile and desktop, with HTML, PNG and notes
read_when: Building or reviewing HOME-02.
updated: 2026-10-29
---

# Posso comprar? screens (HOME-02)

21 boards. Same numbers as the Home: period 5 out – 4 nov, today 20 out; "Livre para gastar" R$ 2.340,00, "Por dia" R$ 146,25. The earlier HOME-02 draft inside the Home canvas (09/10) is replaced by this one.

## Posso comprar? · HOME-02 (mobile)

Opened from the Home's "Posso comprar?" card (route /posso-comprar).

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Posso comprar? · cabe, mas aperta | mobile | [html](screens/html/PC-aperta.html) · [png](screens/png/PC-aperta.png) | HOME-02, aberto pelo cartão "Posso comprar?" da Início (rota /posso-comprar). O formulário fica no topo e o resultado aparece embaixo, sozinho, meio segundo depois de cada mudança válida (sem botão "Simular"). Parcelas e as faturas em que caem usam o mesmo bloco do Novo lançamento (RF-ENT-6), calculado no aparelho com as regras de fatura. Escolha de pagamento com contorno, como no app todo. |
| Posso comprar? · começo | mobile | [html](screens/html/PC-comeco.html) · [png](screens/png/PC-comeco.png) | Começo: "No cartão" e o cartão mais usado já escolhidos, 1 parcela, hoje. Até ter um valor, o espaço do resultado explica o que vai aparecer. Nada é registrado em nenhum momento. |
| Posso comprar? · calculando | mobile | [html](screens/html/PC-calculando.html) · [png](screens/png/PC-calculando.png) | Calculando: o resultado anterior dá lugar ao esqueleto no mesmo formato. Se a pessoa continuar digitando, só a última conta vale. |
| Posso comprar? · cabe | mobile | [html](screens/html/PC-cabe.html) · [png](screens/png/PC-cabe.png) | Cabe: veredito em menta, nenhum aviso novo (o cartão de avisos diz isso em vez de sumir). |
| Posso comprar? · resultado rolado | mobile | [html](screens/html/PC-aperta-rolada.html) · [png](screens/png/PC-aperta-rolada.png) | Rolando até o fim: avisos que apareceriam, a nota "É só uma simulação" e "Registrar esta compra" (PROPOSTA: abre o Novo lançamento já preenchido com valor, cartão, parcelas e data; só para quem pode lançar). |
| Posso comprar? · não cabe (na conta) | mobile | [html](screens/html/PC-nao-cabe.html) · [png](screens/png/PC-nao-cabe.png) | Na conta: sem parcelas. Valor depois negativo em vermelho; "Por dia" mostra R$ 0,00 (vem da API). A linha da conta mostra o saldo de hoje antes e depois (PROPOSTA G77). |
| Posso comprar? · compra no próximo período | mobile | [html](screens/html/PC-futuro.html) · [png](screens/png/PC-futuro.png) | "Quando" depois do fim do período: este período não muda ("sem mudança" no lugar da seta) e uma nota explica onde o efeito aparece. PROPOSTA G78: a API diz em que período a compra cai. |
| Posso comprar? · leitor | mobile | [html](screens/html/PC-leitor.html) · [png](screens/png/PC-leitor.png) | Leitor também simula (só lê, tem "Relatórios: ver"). Some apenas "Registrar esta compra". |

## Pickers, errors and the stress test (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Escolher o cartão | mobile | [html](screens/html/PC-cartao.html) · [png](screens/png/PC-cartao.png) | O seletor do app, com o vencimento e o limite livre de cada cartão (PROPOSTA G77). Arquivados ficam escondidos em "Mostrar arquivados": dá para simular com eles, como o requisito pede. Escolhido com contorno. |
| Parcelas demais para o valor | mobile | [html](screens/html/PC-erro-parcelas.html) · [png](screens/png/PC-erro-parcelas.png) | SIMULATION_QUERY_INVALID no campo. A tela já impede antes de perguntar à API (o "+" para no máximo de parcelas que o valor permite). |
| Cartão que não vale mais | mobile | [html](screens/html/PC-erro-cartao.html) · [png](screens/png/PC-erro-cartao.png) | SIMULATION_CARD_INVALID (e SIMULATION_ACCOUNT_INVALID na conta): o erro fica no campo, com o texto da tabela de erros. |
| Sem conexão | mobile | [html](screens/html/PC-erro.html) · [png](screens/png/PC-erro.png) | Sem conexão: a faixa escura no topo, como na Início e no Novo lançamento. O formulário continua livre; no lugar do resultado, um aviso no centro diz o que houve e que volta sozinho; "Tentar de novo" para quem não quer esperar. Nenhum resultado velho fica na tela (poderia não valer para o que está digitado). |
| Erro do servidor | mobile | [html](screens/html/PC-erro-servidor.html) · [png](screens/png/PC-erro-servidor.png) | Erro do servidor (500): mesmo aviso, com o código e a referência para o suporte. Os campos continuam como estavam. |
| Teste: valor de 7 dígitos em 48× | mobile | [html](screens/html/PC-grande.html) · [png](screens/png/PC-grande.png) | Estresse: R$ 1.256.200,00 em 48× num cartão de nome comprido. O nome do cartão vai a 2 linhas; o valor nunca quebra; a lista de parcelas mostra 3 e "+ 45 parcelas"; barras acima de 100% param no fim com a marca de excesso. |
| Teste: 48× (rolado) | mobile | [html](screens/html/PC-grande-rolada.html) · [png](screens/png/PC-grande-rolada.png) | Avisos novos do estresse: passar do limite do cartão (PROPOSTA G77, aviso card_limit_exceeded) e 412% da renda fixa. |

## Desktop · work screen

The purchase on the left, what changes on the right; each column scrolls on its own.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Posso comprar? · desktop | desktop | [html](screens/html/PC-desktop.html) · [png](screens/png/PC-desktop.png) | Desktop como tela de trabalho: a compra à esquerda, o que muda à direita, cada coluna rola sozinha e as duas terminam juntas. O resultado se atualiza enquanto a pessoa digita. |
| Posso comprar? · não cabe · desktop | desktop | [html](screens/html/PC-desktop-nao-cabe.html) · [png](screens/png/PC-desktop-nao-cabe.png) | Na conta, não cabe. |
| Posso comprar? · começo · desktop | desktop | [html](screens/html/PC-desktop-comeco.html) · [png](screens/png/PC-desktop-comeco.png) | Começo: a coluna da direita explica o que vai aparecer. |
| Posso comprar? · calculando · desktop | desktop | [html](screens/html/PC-desktop-calculando.html) · [png](screens/png/PC-desktop-calculando.png) | Calculando. |
| Posso comprar? · sem conexão · desktop | desktop | [html](screens/html/PC-desktop-erro.html) · [png](screens/png/PC-desktop-erro.png) | Sem conexão: faixa no topo do conteúdo; a coluna da direita mostra o aviso no centro, no mesmo formato do começo (ícone, título, frase, botão). Erro do servidor: o mesmo aviso, com o código. |
| Posso comprar? · tela grande | desktop | [html](screens/html/PC-1920.html) · [png](screens/png/PC-1920.png) | 1920 × 1080 com o teste de 7 dígitos. |
