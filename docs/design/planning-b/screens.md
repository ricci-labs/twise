---
summary: Every designed screen and state of planning round B — goals and the emergency reserve, the commission split and holidays (PLAN-05..07), mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing PLAN-05, PLAN-06 or PLAN-07.
updated: 2026-10-15
---

# Planning screens, round B (PLAN-05..07)

30 boards. Same numbers as the Home: today is Thu 15 Oct 2026; the reserve has R$ 12.000,00 of R$ 18.000,00 in the Poupança and covers 2,4 months; this period's commission is R$ 1.500,00, the average of the last 3 is R$ 1.200,00; Lazer went R$ 60,00 over its budget; part 1 of the split (R$ 600,00 to the reserve) is the one shown in the entry detail. Notes are in pt-BR, as written by the designer; the copy in the screens is final. Orange notes on the canvas are marked PROPOSTA here: they depend on `decisions.md`.

## Goals and emergency reserve · PLAN-05 (mobile)

The "Metas" tab of Planning.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Metas | mobile | [html](screens/html/PLAN-metas.html) · [png](screens/png/PLAN-metas.png) | PLAN-05, a aba Metas do Planejamento. A reserva de emergência vem primeiro, em destaque (fundo menta claro): quanto tem, de quanto, onde está guardada, a barra e quantos meses de gastos ela cobre (da Início). Depois as metas: ilustração da conta, nome, "Guardado em", quanto tem de quanto, a barra, porcentagem e prazo, quanto falta e, quando há prazo, quanto guardar por mês (API, G58). Meta que passou do valor: selo "Meta atingida". No fim, o atalho para a Divisão da comissão. |
| Metas roladas | mobile | [html](screens/html/Metas-rolado.html) · [png](screens/png/Metas-rolado.png) | Meta atingida: barra cheia, "Passou R$ 200,00" e a dica de concluir (excluir) ou aumentar o valor. Meta sem prazo: "sem prazo" e sem o "por mês". O cartão da divisão da comissão diz quantos passos e o primeiro destino. |
| Ações de uma meta | mobile | [html](screens/html/Metas-acoes.html) · [png](screens/png/Metas-acoes.png) | Guardar dinheiro (abre o Novo lançamento como transferência para a conta da meta, com o valor por mês sugerido), Ver lançamentos da conta, Editar, Excluir. |
| Sem reserva de emergência | mobile | [html](screens/html/Metas-sem-reserva.html) · [png](screens/png/Metas-sem-reserva.png) | Sem reserva: o lugar dela continua no topo, explicando para que serve, com "Criar a reserva" (abre Nova meta com a chave da reserva ligada). |
| Nenhuma meta | mobile | [html](screens/html/Metas-vazio.html) · [png](screens/png/Metas-vazio.png) | Nada ainda: a reserva primeiro, depois "Nenhuma meta ainda." com exemplos e "Nova meta". |
| Metas · leitor | mobile | [html](screens/html/Metas-leitor.html) · [png](screens/png/Metas-leitor.png) | Leitor: sem "+", sem "⋯" e sem "Editar divisão" (a divisão abre só para ver). |

## New or edit goal · PLAN-05 (mobile)

Full screen, like the other forms.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Excluir uma meta da divisão | mobile | [html](screens/html/Meta-excluir.html) · [png](screens/png/Meta-excluir.png) | Excluir pede confirmação. Se a meta está num passo da divisão, o diálogo diz e o botão já tira o passo (o app salva a divisão sem ele). Sem isso: "Excluir {nome}? O dinheiro continua na conta." |
| Nova meta | mobile | [html](screens/html/Meta-nova.html) · [png](screens/png/Meta-nova.png) | Tela cheia. A ajuda no topo: o progresso é o saldo da conta escolhida. Nome, valor, "Guardado em" (conta de dinheiro), "Até quando" (opcional, calendário do app). Com prazo, a prévia mostra quanto guardar por mês contando com o que já está na conta (API, G58). A chave da reserva vem travada quando já existe uma, dizendo qual. |
| Guardado em | mobile | [html](screens/html/Meta-conta.html) · [png](screens/png/Meta-conta.png) | A folha de contas: as que já são de outra meta aparecem apagadas, dizendo de qual (GOAL_ACCOUNT_TAKEN nem chega a acontecer). No fim, "Criar uma conta para a meta" (abre Nova conta e volta com ela escolhida). |
| Nova reserva | mobile | [html](screens/html/Meta-reserva.html) · [png](screens/png/Meta-reserva.png) | Criando a reserva: a chave ligada explica o que muda (o app mostra quantos meses de gastos ela cobre). Sem prazo, sem a prévia mensal. |
| Conta já usada | mobile | [html](screens/html/Meta-erro.html) · [png](screens/png/Meta-erro.png) | Se a conta foi para outra meta enquanto a pessoa editava: GOAL_ACCOUNT_TAKEN no campo. RESERVE_ALREADY_SET aparece na chave da reserva. |

## Commission split · PLAN-06 (mobile)

Its own screen, opened from the card at the end of Metas and from the Home's "Editar divisão".

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Divisão da comissão | mobile | [html](screens/html/Divisao.html) · [png](screens/png/Divisao.png) | PLAN-06, aberta pelo cartão em Metas (e pelo "Editar divisão" da Início). Explica em uma frase o que é. Os passos numerados, na ordem: alça para arrastar, ilustração do destino, o que faz e um detalhe ("Neste período: Lazer passou R$ 60,00"), "⋯". "Adicionar passo" embaixo. "Como ficaria": o exemplo com esta comissão, a média ou outro valor, com o pontilhado e "Sem destino" no fim. "Salvar divisão" só libera quando algo muda. |
| Adicionar passo · tipo | mobile | [html](screens/html/Divisao-tipo.html) · [png](screens/png/Divisao-tipo.png) | Os 5 tipos em cartões de escolha, cada um com uma frase. "O que sobrar" fica apagado quando já existe (só pode haver um, e ele é o último). |
| Passo de porcentagem | mobile | [html](screens/html/Divisao-porcentagem.html) · [png](screens/png/Divisao-porcentagem.png) | Porcentagem: a conta e o número (1 a 100), com a ajuda "da comissão inteira, não do que sobra" e o cálculo ao lado com o valor do exemplo. Valor fixo: a conta e o valor. Completar uma meta: só a meta. |
| Mudando a ordem | mobile | [html](screens/html/Divisao-mover.html) · [png](screens/png/Divisao-mover.png) | Arrastar pela alça levanta o cartão (sombra, contorno escuro) e os outros abrem espaço. O exemplo se refaz na hora e "Salvar divisão" libera. |
| Ações de um passo | mobile | [html](screens/html/Divisao-acoes.html) · [png](screens/png/Divisao-acoes.png) | Sem arrastar (teclado, leitor de tela, quem prefere tocar): o "⋯" tem Mover para cima e Mover para baixo (o primeiro não tem "para cima"; o "O que sobrar" não se move, é sempre o último), Editar e Remover passo. Remover sai na hora com toast "Passo removido." e "Desfazer"; nada é salvo até "Salvar divisão". |
| Passo com meta excluída | mobile | [html](screens/html/Divisao-meta-excluida.html) · [png](screens/png/Divisao-meta-excluida.png) | Um passo que aponta para uma meta excluída fica marcado em vermelho, "Meta excluída. Remova este passo para salvar.", e o exemplo pula ele. "Salvar divisão" fica parado até remover (ALLOCATION_GOAL_INVALID não chega a acontecer). |
| Substituir a divisão | mobile | [html](screens/html/Divisao-salvar.html) · [png](screens/png/Divisao-salvar.png) | Salvar troca a lista inteira: o diálogo diz o que muda e o que não muda. Depois: toast "Divisão salva.". |
| Sem passos | mobile | [html](screens/html/Divisao-vazia.html) · [png](screens/png/Divisao-vazia.png) | Sem passos: a explicação e "Usar a sugestão" (reserva primeiro, o resto para a conta do dia a dia), além de "Adicionar passo". |
| Divisão · leitor | mobile | [html](screens/html/Divisao-leitor.html) · [png](screens/png/Divisao-leitor.png) | Leitor vê a ordem e o exemplo, sem alças, sem "⋯", sem adicionar e sem salvar. |

## Holidays · PLAN-07 (mobile), now under Configurações

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Feriados | mobile | [html](screens/html/Feriados.html) · [png](screens/png/Feriados.png) | PLAN-07, agora dentro de Configurações (PROPOSTA: rota /configuracoes/feriados no lugar de /planejamento/feriados). Também abre pelo "Ver feriados" na ajuda do dia útil do formulário de conta fixa. Ano com setas. A nota: previstos já planejados não mudam. "Do espaço" com "Adicionar feriado" e o "⋯" (Excluir). "Nacionais (bancários)": só leitura, os que já passaram em cinza e o próximo marcado. Feriado que cai no fim de semana diz isso (não muda nada no dia útil). |
| Adicionar feriado | mobile | [html](screens/html/Feriado-novo.html) · [png](screens/png/Feriado-novo.png) | Data (calendário do app) e nome. A ajuda explica que é por ano. Depois: toast "Feriado adicionado. As próximas contas fixas já contam com ele.". |
| Já é feriado nacional | mobile | [html](screens/html/Feriado-erro.html) · [png](screens/png/Feriado-erro.png) | HOLIDAY_ALREADY_NATIONAL e HOLIDAY_DATE_TAKEN aparecem no campo Data, ao sair dele. |
| Excluir feriado | mobile | [html](screens/html/Feriado-excluir.html) · [png](screens/png/Feriado-excluir.png) | Excluir pede confirmação e diz o efeito. |
| Configurações · onde ficam os feriados | mobile | [html](screens/html/Configuracoes.html) · [png](screens/png/Configuracoes.png) | PROPOSTA: Feriados é um ajuste do espaço que se mexe pouco, então vai para Configurações (Mais › Configurações), num grupo "Planejamento" com a base dos orçamentos. A linha já diz quantos são e o próximo. As outras linhas são as de SET-01 e SET-02, só para mostrar o lugar. |
| Sem feriados do espaço | mobile | [html](screens/html/Feriados-vazio.html) · [png](screens/png/Feriados-vazio.png) | Sem feriados locais: uma frase com exemplos no lugar da lista. |

## Desktop

Same width and margins as the Home; cards in a row share their height; no large empty areas.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Metas · desktop | desktop | [html](screens/html/Metas-desktop.html) · [png](screens/png/Metas-desktop.png) | Desktop: a reserva na largura toda, as metas 3 por linha (mesma altura, rodapé alinhado), o atalho da divisão embaixo. |
| Nova meta · desktop | desktop | [html](screens/html/Meta-nova-desktop.html) · [png](screens/png/Meta-nova-desktop.png) | Nova meta num diálogo médio, duas colunas. |
| Divisão da comissão · desktop | desktop | [html](screens/html/Divisao-desktop.html) · [png](screens/png/Divisao-desktop.png) | Passos à esquerda e o exemplo à direita, com a mesma altura; o exemplo ganha uma barra com a parte de cada passo (mesmas cores na lista). Embaixo, PROPOSTA "Comissões recebidas": cada comissão, quantas partes da divisão já foram registradas e "Continuar" (abre a sugestão HOME-03 com aquele valor). Precisa da API (G59). |
| Feriados · desktop | desktop | [html](screens/html/Feriados-desktop.html) · [png](screens/png/Feriados-desktop.png) | O ano como calendário (opção escolhida). No topo, três cartões da mesma altura: o próximo feriado com o que ele muda nas contas fixas (PROPOSTA, API G60), os do espaço (com ⋯ Excluir) e a legenda com a nota. Embaixo, os 12 meses em mini calendários (domingo primeiro, 4 por linha): feriado nacional em preto, do espaço em menta, hoje com contorno, o próximo com anel amarelo; embaixo de cada mês, os nomes. Meses passados mais claros, outubro com contorno. A página rola; o quadro mostra ela inteira. |
