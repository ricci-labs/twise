---
summary: Every designed screen and state of planning round A — planned occurrences, recurring bills and incomes, the recurrence form and budgets (PLAN-01..04), mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing PLAN-01, PLAN-02, PLAN-03 or PLAN-04.
updated: 2026-10-15
---

# Planning screens, round A (PLAN-01..04)

37 boards. Same numbers as the Home: today is Tue 20 Oct; period out/26 runs from 5 Oct to 4 Nov; Internet is overdue since 18/10 (R$ 120,00); budgets Lazer R$ 460 of R$ 400 and Mercado R$ 820 of R$ 1.200; the card subscriptions add up to the Home's "Previsto (assinaturas) R$ 110,00". Notes are in pt-BR, as written by the designer; the copy in the screens is final. Goals, the commission split and holidays (PLAN-05..07) come in round B.

## Planned occurrences · PLAN-03 (mobile)

Planning opens here. Includes the match questions after recording a payment (RF-PLAN-6, RF-PLAN-7).

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Previstos do período | mobile | [html](screens/html/PLAN-previstos.html) · [png](screens/png/PLAN-previstos.png) | Planejamento abre em Previstos (PROPOSTA: hoje o requisito abre em Contas fixas; previstos é o que se usa todo dia). Abas no topo: Previstos, Contas fixas, Orçamentos, Metas. O seletor de período é o da Início. Um resumo da API (G53): quanto falta pagar e receber no período. Grupos: Atrasados (em vermelho; "Registrar" fica pequeno embaixo do valor, sem aumentar a linha), A vencer, Pagos e recebidos, Pulados. Cada linha: o dia, a conta fixa (≈ quando o valor é aproximado), conta ou cartão e categoria, o valor e a situação. Tocar abre as ações. |
| Previstos rolados | mobile | [html](screens/html/Previstos-rolado.html) · [png](screens/png/Previstos-rolado.png) | Rolando: os pagos mostram quando e por qual conta foram pagos; a comissão mostra o valor real e o previsto (≈ R$ 2.000,00). Pagos, recebidos e pulados ficam em cinza para o que falta se destacar. Mais de 5 num grupo: "Mostrar mais". |
| Ações de um previsto | mobile | [html](screens/html/Previstos-acoes.html) · [png](screens/png/Previstos-acoes.png) | Previsto pendente: Registrar pagamento (abre o Novo lançamento já preenchido, com data de hoje), Já registrei (escolher um lançamento existente), Mudar o valor deste, Pular este mês. Numa receita, "Registrar recebimento". |
| Depois de registrar | mobile | [html](screens/html/Previstos-registrado.html) · [png](screens/png/Previstos-registrado.png) | Depois de salvar o lançamento aberto por "Registrar pagamento", a pergunta "Este lançamento paga a Internet de 18/10?" com "Sim, paga" em destaque (foi aberto a partir dela). "Não" deixa o lançamento sem ligação. |
| Já registrei | mobile | [html](screens/html/Previstos-ja-registrei.html) · [png](screens/png/Previstos-ja-registrei.png) | "Já registrei": lançamentos do mesmo tipo e das mesmas contas, os mais parecidos primeiro (o mais provável marcado), com busca e até 5 + "Mostrar mais". Escolher e "Marcar como pago". Erros: ENTRY_ALREADY_MATCHED ("Esse lançamento já paga outro previsto.") e OCCURRENCE_ENTRY_MISMATCH no alerta da folha. |
| Mudar o valor deste | mobile | [html](screens/html/Previstos-valor.html) · [png](screens/png/Previstos-valor.png) | Muda só o valor deste mês (a conta de luz que veio maior). A ajuda diz que a conta fixa não muda. Se a conta fixa for editada depois, este valor volta para o da conta fixa (G17: o formulário avisa). |
| Previsto pulado | mobile | [html](screens/html/Previstos-pulado.html) · [png](screens/png/Previstos-pulado.png) | Pular não pergunta: a linha vai para "Pulados" e o toast fica 8 s com "Desfazer". Num pulado, a ação é "Voltar a esperar". |
| Ações de um previsto pago | mobile | [html](screens/html/Previstos-pago-acoes.html) · [png](screens/png/Previstos-pago-acoes.png) | Previsto pago: Ver lançamento (ENT-03) e Desfazer pagamento (desliga; o lançamento continua). Toast com "Desfazer". |
| Isto paga alguma conta prevista? | mobile | [html](screens/html/Sugestao-apos-lancamento.html) · [png](screens/png/Sugestao-apos-lancamento.png) | RF-PLAN-7: depois de salvar qualquer despesa, compra, receita ou transferência no Novo lançamento, se a API achar previstos parecidos, a folha pergunta "Isto paga alguma conta prevista?". O mais provável vem marcado; "Não, nenhuma" fecha sem ligar. Sem sugestões, nada aparece. |
| Nada previsto | mobile | [html](screens/html/Previstos-vazio.html) · [png](screens/png/Previstos-vazio.png) | "Nada previsto neste período." com o atalho para cadastrar a primeira conta fixa. |
| Carregando | mobile | [html](screens/html/Previstos-carregando.html) · [png](screens/png/Previstos-carregando.png) | Esqueletos no formato das linhas. |
| Previstos · leitor | mobile | [html](screens/html/Previstos-leitor.html) · [png](screens/png/Previstos-leitor.png) | Leitor vê tudo, sem "Registrar", sem ações e sem o "+". |

## Recurring bills and incomes · PLAN-01 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Contas fixas | mobile | [html](screens/html/Fixas.html) · [png](screens/png/Fixas.png) | PLAN-01. No topo, dois números da API (G52): contas fixas por mês (equivalente mensal: a diarista semanal e o seguro anual entram pela média) e receitas fixas por mês (sem a comissão, que é variável). Grupos: Contas e assinaturas, Receitas, Transferências programadas, cada um com o "+" no cabeçalho. Linha: ilustração da categoria, nome, como repete em palavras ("Todo dia 5", "No 1º dia útil", "Toda sexta", "Todo ano em 15 de março"), conta ou cartão e categoria, a próxima data (vermelha quando atrasada) e o valor (≈ quando aproximado). |
| Contas fixas roladas | mobile | [html](screens/html/Fixas-rolado.html) · [png](screens/png/Fixas-rolado.png) | Receitas em verde; a comissão com ≈ e "variável". Transferências em cinza, com "Conta X → Poupança". |
| Ações de uma conta fixa | mobile | [html](screens/html/Fixas-acoes.html) · [png](screens/png/Fixas-acoes.png) | Tocar abre a edição; o "⋯" tem Ver previstos (a aba Previstos filtrada por ela), Editar e Excluir. |
| Excluir conta fixa | mobile | [html](screens/html/Fixas-excluir.html) · [png](screens/png/Fixas-excluir.png) | Excluir pede confirmação (não tem lixeira para contas fixas). Depois: toast "Academia excluída.". |
| Sem contas fixas | mobile | [html](screens/html/Fixas-vazio.html) · [png](screens/png/Fixas-vazio.png) | "Nenhuma conta fixa cadastrada." com "Nova conta fixa" e "Nova receita". |
| Contas fixas · leitor | mobile | [html](screens/html/Fixas-leitor.html) · [png](screens/png/Fixas-leitor.png) | Leitor: sem "+" nos grupos e sem ações. |

## New or edit recurrence · PLAN-02 (mobile)

Full screen, like the other forms.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Nova conta fixa | mobile | [html](screens/html/Fixa-nova.html) · [png](screens/png/Fixa-nova.png) | PLAN-02, tela cheia. Tipo (Despesa, Compra no cartão, Receita, Transferência; não muda depois), descrição, valor e "O valor muda todo mês (aproximado)" com a explicação, conta e categoria (os rótulos mudam com o tipo: Pago com, Cartão, Recebido em, De/Para). Repete: Semanal, Mensal ou Anual e "A cada 1 mês". Quando: no dia N do mês, no Nº dia útil ou no mesmo dia da primeira data. Fim de semana ou feriado: manter, antecipar ou adiar (o seletor do app). Primeira data (o calendário do app), fim opcional e a prévia das próximas datas. |
| Prévia com dia ajustado | mobile | [html](screens/html/Fixa-prevista.html) · [png](screens/png/Fixa-prevista.png) | RF-PLAN-3: a prévia mostra as 3 próximas datas com o dia da semana, calculadas com as regras do app e os feriados. Quando uma data muda por fim de semana ou feriado, a linha diz por quê ("dia 10 é domingo, foi para segunda"). |
| No dia útil | mobile | [html](screens/html/Fixa-dia-util.html) · [png](screens/png/Fixa-dia-util.png) | "No 5º dia útil": a ajuda explica o que é dia útil e o campo de fim de semana some (o dia útil já resolve). Receita: "Recebido em" e categoria de receita. |
| Semanal | mobile | [html](screens/html/Fixa-semanal.html) · [png](screens/png/Fixa-semanal.png) | Semanal repete o dia da semana da primeira data: "Quando" some e a frase fica "Toda sexta". "A cada 2 semanas" vira "A cada 2 semanas, na sexta". |
| Editar conta fixa | mobile | [html](screens/html/Fixa-editar.html) · [png](screens/png/Fixa-editar.png) | Editar: o tipo travado. RF-PLAN-4: quando há previstos futuros com valor próprio, o aviso amarelo no topo explica que eles voltam para o valor da conta fixa e diz qual. Salvar refaz os previstos pendentes. |
| Contas que não combinam | mobile | [html](screens/html/Fixa-erro.html) · [png](screens/png/Fixa-erro.png) | RECURRENCE_ACCOUNTS_INVALID como alerta do formulário. Erros de campo (descrição, valor, data final antes da primeira: "A data final não pode ser antes da primeira.") ficam embaixo de cada campo. |

## Budgets · PLAN-04 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Orçamentos | mobile | [html](screens/html/Orcamentos.html) · [png](screens/png/Orcamentos.png) | PLAN-04. Período no topo. O resumo soma limites e gastos das categorias com orçamento (G54: vem da API) com a marca do ritmo de hoje. Cada categoria: ilustração solta (sem círculo), gasto de limite, a barra com a marca do ritmo, a situação com texto (No ritmo, Acima do ritmo, Estourado) e, embaixo, numa linha só, quanto foi nas subcategorias: as que cabem, das maiores para as menores, e "+N" para o resto (abre o orçamento com todas). A linha nunca quebra (o orçamento da mãe cobre as filhas). Sem orçamento: as categorias com o gasto do período e "Definir". |
| Orçamentos rolados | mobile | [html](screens/html/Orcamentos-rolado.html) · [png](screens/png/Orcamentos-rolado.png) | Fim da lista: "Sem orçamento" com o gasto do período de cada uma, para ajudar a decidir. |
| Orçamento de uma categoria | mobile | [html](screens/html/Orcamento-editar.html) · [png](screens/png/Orcamento-editar.png) | Folha "Orçamento de Mercado" (abre também pelo "+N" das subcategorias): primeiro o gasto do período por subcategoria, com o pontilhado e o total; depois a média dos últimos 3 meses como referência (G54), o limite por mês e "Vale a partir de" (o seletor de período), com a ajuda "Continua valendo nos meses seguintes até você mudar.". "Remover orçamento" pede confirmação. |
| Remover orçamento | mobile | [html](screens/html/Orcamento-remover.html) · [png](screens/png/Orcamento-remover.png) | Remover = sem limite a partir do mês escolhido. O texto diz que o passado não muda. |
| Definir orçamento | mobile | [html](screens/html/Orcamento-definir.html) · [png](screens/png/Orcamento-definir.png) | Em "Sem orçamento", "Definir" abre a mesma folha, vazia, com a média como referência. |
| Sem orçamentos | mobile | [html](screens/html/Orcamentos-vazio.html) · [png](screens/png/Orcamentos-vazio.png) | "Nenhum orçamento ainda." com o que ele faz e "Definir orçamento". |
| Orçamentos · sem permissão de mudar | mobile | [html](screens/html/Orcamentos-leitor.html) · [png](screens/png/Orcamentos-leitor.png) | Quem não tem budgets:update (membros e leitores, por padrão) vê os orçamentos sem "⋯" e sem "Definir". |

## Desktop

Tabs under the title; tables use the full width; the main action of a row sits in the row.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Previstos · desktop | desktop | [html](screens/html/Previstos-desktop.html) · [png](screens/png/Previstos-desktop.png) | Desktop: Planejamento no menu, as abas sob o título. Período na barra. Uma tabela com os grupos como faixas: vence, conta fixa, conta ou cartão, situação, valor, a ação principal na própria linha ("Registrar pagamento" nos pendentes, "Ver lançamento" nos pagos) e o "⋯" com o resto. |
| Contas fixas · desktop | desktop | [html](screens/html/Fixas-desktop.html) · [png](screens/png/Fixas-desktop.png) | Três indicadores no topo (contas fixas, receitas fixas e transferências por mês, da API) e uma tabela por grupo, na largura toda. |
| Ações · desktop | desktop | [html](screens/html/Fixas-desktop-menu.html) · [png](screens/png/Fixas-desktop-menu.png) | O "⋯" abre o menu suspenso com Ver previstos, Editar e Excluir. |
| Nova conta fixa · desktop | desktop | [html](screens/html/Fixa-nova-desktop.html) · [png](screens/png/Fixa-nova-desktop.png) | O diálogo grande (880 px) em duas colunas; tipo, a chave do valor aproximado, o fim e a prévia na largura toda. |
| Orçamentos · desktop | desktop | [html](screens/html/Orcamentos-desktop.html) · [png](screens/png/Orcamentos-desktop.png) | Três indicadores (limite somado, gasto e quantas fora do ritmo, da API) e a tabela: categoria com as subcategorias embaixo, barra com o ritmo, gasto de limite, situação e "⋯". Sem orçamento numa segunda tabela com "Definir". |
| Orçamento de uma categoria · desktop | desktop | [html](screens/html/Orcamento-desktop.html) · [png](screens/png/Orcamento-desktop.png) | O orçamento abre num diálogo médio no centro (não veio de um campo). |
