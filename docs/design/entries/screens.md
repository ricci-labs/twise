---
summary: Every designed screen and state of ENT-02 "Novo lançamento" (all seven types), mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing any part of ENT-02.
updated: 2026-10-14
---

# New entry screens (ENT-02)

37 boards. Fictitious, consistent numbers: today is 20 Oct, Cartão X closes on 25/10 and is due on 04/11. Notes are in pt-BR, as written by the designer; the copy in the screens is final.

## Expense and the basics (mobile)

Full screen, opened by the floating button. Includes the approved shortcuts: "Repetir um recente" and the description suggestion that fills the rest.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Novo lançamento · começo | mobile | [html](screens/html/Main.html) · [png](screens/png/Main.png) | ENT-02 no celular: tela cheia, aberta pelo botão flutuante. Abre em "Despesa" (o tipo mais usado) com o foco no Valor e o teclado numérico. Logo abaixo dos tipos, "Repetir um recente": os lançamentos que vocês mais repetem, numa faixa que rola para o lado e começa na margem de 16 px (só no formulário novo, não quando ele já vem preenchido de outra tela). Os tipos são botões de escolha em duas linhas, todos visíveis; o escolhido usa o fundo menta (o mesmo da seleção do menu no desktop). "Mais" abre os outros três tipos. Formulário longo com obrigatórios e opcionais: começa com "* obrigatório". "Pago com" já vem na conta usada da última vez. Sem os obrigatórios, "Salvar lançamento" fica apagado (aria-disabled), sem texto de dica. |
| Despesa · preenchida | mobile | [html](screens/html/ENT-despesa-preenchida.html) · [png](screens/png/ENT-despesa-preenchida.png) | Tudo certo: o botão libera. Data em atalhos (Hoje, Ontem, Outra data), porque quase tudo é registrado no dia. "Quem gastou" já vem em quem está usando o app. Os botões ficam presos no rodapé enquanto a tela rola. |
| Despesa · opcionais (rolada) | mobile | [html](screens/html/ENT-despesa-rolada.html) · [png](screens/png/ENT-despesa-rolada.png) | Rolando: os opcionais, sem asterisco. Forma de pagamento (Pix, Débito, Crédito, Dinheiro, Boleto, Transferência bancária, Débito automático, Outro), Quem gastou, Dividir com contatos e Observações com contador (até 2000). |
| Despesa · erros ao sair do campo | mobile | [html](screens/html/ENT-despesa-erros.html) · [png](screens/png/ENT-despesa-erros.png) | Erros aparecem ao sair do campo, com ícone e texto, nunca só em vermelho. Mensagens do ui-standards.md. Os erros que voltam da API (ex.: ACCOUNT_NOT_AVAILABLE, "Conta X está arquivada ou foi excluída. Escolha outra.") caem no campo certo, pela tabela do entries.md. |
| Despesa · sugestões na descrição | mobile | [html](screens/html/ENT-sugestoes.html) · [png](screens/png/ENT-sugestoes.png) | Ao digitar a descrição, até 3 sugestões das descrições recentes do espaço. Escolher uma preenche a descrição e também o resto (ver "Sugestão da descrição preenche o resto", no fim da linha). |
| Escolher categoria | mobile | [html](screens/html/ENT-categoria.html) · [png](screens/png/ENT-categoria.png) | Categoria abre uma folha de baixo com busca e as categorias de despesa ativas em grade, as mais usadas primeiro. Cada quadrado tem o mesmo fundo de papel da ilustração (sem círculo por cima, para não cortar os detalhes). A escolhida fica toda em menta, com o nome em negrito e o sinal de certo no canto, para não depender só da cor. |
| Escolher conta (Pago com) | mobile | [html](screens/html/ENT-conta.html) · [png](screens/png/ENT-conta.png) | Pago com: só contas de dinheiro ativas (sem cartões e sem arquivadas), com o saldo de hoje para ajudar a escolher. |
| Salvando | mobile | [html](screens/html/ENT-salvando.html) · [png](screens/png/ENT-salvando.png) | POST /entries. Spinner no botão com "Salvando…", os dois botões travados. Não fecha a tela até a resposta. |
| Salvo · volta para a Início | mobile | [html](screens/html/ENT-salvo.html) · [png](screens/png/ENT-salvo.png) | Sucesso: fecha e volta para onde estava, com o toast embaixo, acima da barra: "Lançamento registrado." e "Ver" (abre o detalhe, ENT-03). Some em 4 s; pausa ao tocar. O botão flutuante sobe enquanto o toast aparece. Os números da Início atualizam. "Salvar e registrar outro" mostra o mesmo toast, mas mantém a tela, limpando tudo menos tipo, data e contas. |
| Cancelar com alterações | mobile | [html](screens/html/ENT-descartar.html) · [png](screens/png/ENT-descartar.png) | "X" (Cancelar) com algo preenchido: "Descartar as alterações?" com "Continuar editando" e "Descartar". Sem nada preenchido, fecha direto. |
| Repetir um recente · tocado | mobile | [html](screens/html/ENT-recentes.html) · [png](screens/png/ENT-recentes.png) | Um toque em "Mercado da semana" preenche tudo como da última vez (descrição, conta, categoria, forma de pagamento e o valor) e deixa o foco no Valor, já selecionado, para trocar se mudou. Dá para salvar em 2 toques. "Desfazer" limpa o que foi preenchido. A lista é por quem está usando o app e por tipo; some quando o tipo não tem repetidos. Pede à API a lista dos lançamentos frequentes (entra em api-gaps.md). |
| Sugestão da descrição preenche o resto | mobile | [html](screens/html/ENT-sugestao-escolhida.html) · [png](screens/png/ENT-sugestao-escolhida.png) | Ao escolher "Mercado da semana" nas sugestões, o app preenche também categoria, conta e forma de pagamento iguais à última vez, e o foco volta para o Valor (o que muda de uma vez para outra). Uma linha discreta diz o que foi preenchido, com "Desfazer". Pede à API, junto da sugestão, a categoria, a conta e a forma de pagamento usadas por último (entra em api-gaps.md). |

## Card purchase (mobile)

Installments, the invoice preview (computed with `packages/shared` billing rules), a closed invoice and a purchase already in progress.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Compra no cartão · à vista | mobile | [html](screens/html/ENT-cartao-vista.html) · [png](screens/png/ENT-cartao-vista.png) | Compra no cartão: os campos comuns (valor, descrição, data, quem gastou) continuam ao trocar de tipo. Cartão mostra fechamento e vencimento. Parcelas começa em "À vista". Logo abaixo, a prévia: "Entra na fatura que vence em 04/11", calculada pelas regras de fatura do pacote compartilhado (a tela não chama a API para isso). Forma de pagamento vem em "Crédito". |
| Compra no cartão · em 3× | mobile | [html](screens/html/ENT-cartao-parcelado.html) · [png](screens/png/ENT-cartao-parcelado.png) | (Rolada.) Em 3×: "3× de R$ 333,34" ao lado das parcelas e a lista na prévia, uma linha por fatura. A 1ª parcela leva os centavos do arredondamento (333,34 + 333,33 + 333,33). De 1 a 48 parcelas ("Use de 1 a 48 parcelas."). |
| Compra no cartão · fatura já fechada | mobile | [html](screens/html/ENT-cartao-fatura-fechada.html) · [png](screens/png/ENT-cartao-fatura-fechada.png) | Compra de 20 set: a 1ª parcela cairia na fatura de outubro, que já fechou. A prévia marca a fatura "Fechada" e o aviso aparece antes de salvar: "A fatura de outubro já fechou. Registre a partir da parcela 2." com o botão "Começar da parcela 2", que liga "Compra já em andamento" e ajusta. O mesmo texto vale para INVOICE_CLOSED vindo da API. (Mostrada rolada.) |
| Compra no cartão · já em andamento | mobile | [html](screens/html/ENT-cartao-andamento.html) · [png](screens/png/ENT-cartao-andamento.png) | Para quem começa a usar o app com compras já parceladas: "Compra já em andamento" abre "Começar da parcela", com a explicação antes do campo. Geladeira de R$ 3.000,00 em 10×, comprada em julho: começa da 4ª. O valor continua sendo o total. A prévia mostra só as que faltam. (Mostrada rolada.) |

## Shares with contacts (RF-ENT-8)

Chosen: variation A (dotted leader). The variation boards are kept as reference.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Dividir com contatos | mobile | [html](screens/html/ENT-dividir.html) · [png](screens/png/ENT-dividir.png) | RF-ENT-8, em despesa e compra no cartão. Cada linha: contato e quanto ele deve, ligados por uma linha pontilhada (a mesma linguagem tracejada do cartão "Livre para gastar"); os valores ficam numa coluna só, e "Sua parte" fecha a lista alinhada a eles. Atalhos "Metade" e "Dividir igualmente" (entre você e os contatos). "Sua parte" atualiza ao vivo. Até 10 contatos ("Até 10 contatos por lançamento."); cada um uma vez só ("Esse contato já está na divisão."). "Novo contato" dentro da escolha abre o cadastro (CON-05) num diálogo. No cartão, as partes se dividem entre as parcelas. (Rolada.) |
| Dividir · soma passa do total | mobile | [html](screens/html/ENT-dividir-erro.html) · [png](screens/png/ENT-dividir-erro.png) | As partes somam R$ 270,00, mais que os R$ 240,00 do jantar: "A soma das partes passa do valor total." e "Sua parte" fica em branco. O botão de salvar trava até corrigir. |
| Dividir com contatos · variações (celular) | reference | [html](screens/html/Dividir-opcoes-celular.html) · [png](screens/png/Dividir-opcoes-celular.png) | Escolhida: A (pontilhado). Quatro jeitos de mostrar a divisão no celular, com os mesmos números (jantar de R$ 240,00 dividido em três). Escolha uma e ela vale para o celular e o desktop. As parcelas da prévia da fatura ficaram sem pontilhado: o fio entre as linhas já guia. |
| Dividir com contatos · variações (desktop) | reference | [html](screens/html/Dividir-opcoes-desktop.html) · [png](screens/png/Dividir-opcoes-desktop.png) | Escolhida: A, e no diálogo ela vai de ponta a ponta. As mesmas quatro variações na largura do diálogo do desktop (até 620 px na A, B e D; 420 px na C). |

## Income, transfer and the "Mais" types (mobile)

Income (Fixa/Variável), transfer (also prefilled from HOME-03), invoice payment, settlement and opening balance.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Receita | mobile | [html](screens/html/ENT-receita.html) · [png](screens/png/ENT-receita.png) | Receita: "Recebido em" e a categoria de receita, com o selo "Fixa" ou "Variável" (a Variável entra como comissão). Sem "Quem gastou" e sem dividir com contatos. |
| Receita variável · salva | mobile | [html](screens/html/ENT-receita-salva.html) · [png](screens/png/ENT-receita-salva.png) | Quando a receita é variável (comissão), o toast troca o "Ver" por "Ver sugestão de divisão", que abre o Dividir a comissão (HOME-03) com esse valor. |
| Transferência · mesma conta | mobile | [html](screens/html/ENT-transferencia.html) · [png](screens/png/ENT-transferencia.png) | Transferência entre as contas de vocês: não conta como gasto. Só De, Para, data e observações; sem forma de pagamento, categoria ou quem gastou. Mesma conta nos dois: "Escolha uma conta diferente da de origem." em "Para" (SAME_ACCOUNT). |
| Transferência · vinda da comissão | mobile | [html](screens/html/ENT-transferencia-comissao.html) · [png](screens/png/ENT-transferencia-comissao.png) | Aberta pelo "Transferir" do Dividir a comissão (HOME-03): já vem preenchida (valor, origem onde a comissão caiu e destino da parte). Uma faixa no topo lembra de onde veio. Ao salvar, volta para a divisão e a parte fica "Feito". |
| Outros tipos (Mais) | mobile | [html](screens/html/ENT-mais.html) · [png](screens/png/ENT-mais.png) | "Mais" abre os três tipos menos usados numa folha, cada um com uma frase do que é. Escolher um troca o formulário e o botão "Mais" passa a mostrar o nome do tipo. |
| Pagamento de fatura | mobile | [html](screens/html/ENT-fatura.html) · [png](screens/png/ENT-fatura.png) | Pagamento de fatura (também aberto pela fatura, CARD-02/03). Escolhe o cartão e a fatura, com o quanto falta pagar; vem marcada a mais antiga com saldo, e o valor vem com esse saldo. Pagar parte é permitido. Pagar a mais só avisa, em âmbar: "O valor é maior que o saldo da fatura." (não trava). "Pago com" vem na conta padrão do cartão. Não conta como gasto. |
| Recebimento de contato | mobile | [html](screens/html/ENT-contato.html) · [png](screens/png/ENT-contato.png) | Recebimento de contato (também aberto em Contatos, CON-02). O contato vem primeiro, mostrando quanto ele deve; o valor vem com esse total e dá para receber só uma parte. Receber a mais só avisa, sem travar. |
| Escolher contato | mobile | [html](screens/html/ENT-contato-folha.html) · [png](screens/png/ENT-contato-folha.png) | A escolha de contato mostra quanto cada um deve e o que está em atraso (selo vermelho com texto). "Novo contato" no fim. |
| Saldo inicial | mobile | [html](screens/html/ENT-saldo-inicial.html) · [png](screens/png/ENT-saldo-inicial.png) | Saldo inicial (também aberto ao criar uma conta, ACC-01/03): "Saldo" no lugar de "Valor" e a chave "Negativo (cheque especial)", que põe o sinal de menos e o vermelho. Não pode ser zero. Descrição já vem "Saldo inicial". |

## Situations

Save and register another, a save error, losing the connection, no account yet.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Salvar e registrar outro | mobile | [html](screens/html/ENT-salvo-outro.html) · [png](screens/png/ENT-salvo-outro.png) | Depois de "Salvar e registrar outro": a tela continua aberta, com o toast "Lançamento registrado." logo acima dos botões. Ficam o tipo, a data e as contas (aqui Despesa, Hoje e Conta X); o resto limpa e o foco volta para o Valor. Bom para registrar várias compras seguidas. |
| Erro ao salvar | mobile | [html](screens/html/ENT-erro-salvar.html) · [png](screens/png/ENT-erro-salvar.png) | Erro que não é de um campo (ex.: falha do servidor): a mensagem aparece logo acima dos botões, com o código para o suporte, e nada do que foi digitado se perde. Os botões voltam a funcionar para tentar de novo. Erros de campo continuam no próprio campo. |
| Sem conexão | mobile | [html](screens/html/ENT-sem-conexao.html) · [png](screens/png/ENT-sem-conexao.png) | A conexão caiu com o formulário aberto (sem conexão antes de abrir, o "Novo lançamento" nem abre: mostra "Sem conexão. Dá para salvar quando a internet voltar.", como na Início). Faixa no topo e os botões de salvar apagados. O formulário continua editável e o que foi digitado não se perde; quando a conexão volta, a faixa some e o botão libera. Nada é salvo escondido para enviar depois (isso seria outra decisão). |
| Ainda sem conta cadastrada | mobile | [html](screens/html/ENT-sem-conta.html) · [png](screens/png/ENT-sem-conta.png) | Primeiro uso: ao abrir "Pago com" sem nenhuma conta, a folha explica e oferece "Cadastrar conta" (ACC-03), que volta para cá com a conta nova já escolhida e sem perder o que foi digitado. O mesmo vale para "Cartão" ("Vocês ainda não têm um cartão." e "Cadastrar cartão") e para categorias. |

## Desktop

A large dialog (880 px) over the current screen; two columns; equal-height fields except money.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Novo lançamento · desktop | desktop | [html](screens/html/ENT-desktop.html) · [png](screens/png/ENT-desktop.png) | Desktop: um diálogo grande (880 px) sobre a tela onde a pessoa estava, aberto pelo "Novo lançamento" do menu. Campos em duas colunas, na mesma ordem do celular. Lado a lado, todos os campos têm a mesma altura (48 px); só o Valor é maior, de propósito. Rodapé fixo com Cancelar à esquerda e, à direita, "Salvar e registrar outro" e "Salvar lançamento". Esc ou clicar fora seguem a mesma regra do Cancelar. |
| Compra no cartão · desktop | desktop | [html](screens/html/ENT-desktop-cartao.html) · [png](screens/png/ENT-desktop-cartao.png) | Compra no cartão no desktop: a prévia das parcelas ocupa a largura toda do diálogo, de ponta a ponta (as linhas separadas por um fio já guiam, sem pontilhado), logo abaixo de Cartão e Parcelas. O corpo do diálogo rola; cabeçalho e rodapé ficam. |
| Dividir com contatos · desktop | desktop | [html](screens/html/ENT-desktop-dividir.html) · [png](screens/png/ENT-desktop-dividir.png) | A divisão no desktop, já rolada dentro do diálogo até os contatos (variação A, escolhida). A lista vai de ponta a ponta do diálogo: o nome à esquerda, o valor à direita, e a linha pontilhada entre os dois guia o olho. "Sua parte" fecha a lista, com o valor alinhado na mesma coluna dos campos. |
| Salvo · desktop | desktop | [html](screens/html/ENT-desktop-salvo.html) · [png](screens/png/ENT-desktop-salvo.png) | No desktop o toast aparece no canto superior direito, por 4 s. |
