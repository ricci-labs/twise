---
summary: Every designed screen and state of the entries list, detail, edit and trash (ENT-01, ENT-03, ENT-04, ENT-05), mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing ENT-01, ENT-03, ENT-04 or ENT-05.
updated: 2026-10-14
---

# Entries list, detail, edit and trash screens

47 boards. Same numbers as the Home and the accounts screens: today is Tue 20 Oct; period out/26 runs from 5 Oct to 4 Nov; Cartão X closes on the 25th and is due on the 4th. Notes are in pt-BR, as written by the designer; the copy in the screens is final. A note that starts with "PROPOSTA" depends on a decision or an API change (`decisions.md`).

## Entries list · ENT-01 (mobile)

The "Lançamentos" tab. 50 at a time with "Mostrar mais"; search and filters ask the API.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Lançamentos | mobile | [html](screens/html/ENT-lista.html) · [png](screens/png/ENT-lista.png) | ENT-01, rota /lancamentos, a aba "Lançamentos" da barra. No topo, o mesmo seletor de período da Início (out/26 · 5 out – 4 nov, com setas). Busca pela descrição e o botão "Filtros". A linha de resumo (Saiu, Entrou, quantos) vem pronta da API (proposta G46). Lançamentos do mais novo para o mais antigo, agrupados por dia ("Hoje", "Ontem", "sáb, 17 out"). Cada linha: ilustração da categoria (soltas; sistema: transferência, recebimento), descrição com os selos ("3×" parcelas, contatos, comprovante), categoria › subcategoria e conta ou cartão, "por Member B" só quando foi outra pessoa, e o valor: saída em tinta com "−", entrada em verde com "+", transferência sem sinal e em cinza (não é gasto). Tocar abre o detalhe (ENT-03). O "+" flutuante abre o Novo lançamento. Lixeira no topo (só com entries:delete). |
| Lista rolada · fim da página | mobile | [html](screens/html/Lista-rolada.html) · [png](screens/png/Lista-rolada.png) | Rolando: os dias seguem, cada um num cartão branco. A lista carrega 50 por vez; no fim, "Mostrar mais" (sem números de página) busca os próximos 50 na API. |
| Carregando mais | mobile | [html](screens/html/Lista-mostrando-mais.html) · [png](screens/png/Lista-mostrando-mais.png) | "Mostrar mais" vira "Carregando…" com o giro, no mesmo lugar; os novos dias entram embaixo, sem pular a rolagem. Se falhar: "Não foi possível carregar mais." com "Tentar de novo" no lugar do botão. |
| Fim do período | mobile | [html](screens/html/Lista-fim.html) · [png](screens/png/Lista-fim.png) | Quando não há mais o que carregar no período, a lista termina com "Isso é tudo de out/26." e o atalho para o período anterior. Nada de rolagem infinita sem fim visível. |
| Filtros | mobile | [html](screens/html/Lista-filtros.html) · [png](screens/png/Lista-filtros.png) | "Filtros" abre a folha com tudo num lugar só: Tipo (um ou mais, os 7 tipos), Conta ou cartão e Categoria (os seletores do app, com os mais usados primeiro e busca), Quem gastou e "Só os divididos com contatos". Escolher uma categoria inclui as subcategorias dela. "Ver resultados" aplica e fecha; a busca e os filtros perguntam à API (G45), não filtram só o que já está na tela. |
| Com filtros | mobile | [html](screens/html/Lista-filtrada.html) · [png](screens/png/Lista-filtrada.png) | Filtros ativos viram etiquetas com "×" logo abaixo da busca, e "Limpar" tira todos. O botão mostra quantos estão ativos ("Filtros 2") e ganha o contorno escuro. O resumo passa a contar só o que está filtrado. |
| Buscando | mobile | [html](screens/html/Lista-busca.html) · [png](screens/png/Lista-busca.png) | A busca procura na API a partir da 2ª letra, ignorando acento e maiúscula (G45), dentro do período escolhido; a parte encontrada fica destacada. Embaixo, "Buscar em todos os períodos" amplia sem perder o texto. O "×" limpa a busca. |
| Filtros sem resultado | mobile | [html](screens/html/Lista-sem-resultado.html) · [png](screens/png/Lista-sem-resultado.png) | Nenhum resultado com os filtros: a ilustração solta, "Nada encontrado com esses filtros." e "Limpar filtros". Os filtros continuam à vista para tirar um por um. |
| Período sem lançamentos | mobile | [html](screens/html/Lista-vazia.html) · [png](screens/png/Lista-vazia.png) | Período sem nada (aqui um futuro): "Nenhum lançamento neste período." com "Novo lançamento". As setas do período continuam para voltar. |
| Carregando | mobile | [html](screens/html/Lista-carregando.html) · [png](screens/png/Lista-carregando.png) | Esqueletos no formato das linhas, agrupados como dias. Período, busca e filtros aparecem na hora. |
| Erro ao carregar | mobile | [html](screens/html/Lista-erro.html) · [png](screens/png/Lista-erro.png) | Erro: a mensagem com o código e "Tentar de novo". O resto do topo continua funcionando. |
| Leitor | mobile | [html](screens/html/Lista-leitor.html) · [png](screens/png/Lista-leitor.png) | Leitor: a faixa discreta, sem o "+" flutuante e sem a lixeira. Tocar abre o detalhe só para ver. |

## Period, calendar, ready-made filters and notices · ENT-01 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Escolher período | mobile | [html](screens/html/Periodo.html) · [png](screens/png/Periodo.png) | Tocar no período abre a mesma folha da Início (os períodos de 5 a 4, com o ano e as setas). Embaixo, atalhos: "Últimos 30 dias", "Este ano" e "Escolher datas", que abre o calendário do app (nunca o do navegador). |
| Escolher datas | mobile | [html](screens/html/Calendario.html) · [png](screens/png/Calendario.png) | Calendário do app (o CalendarSheet já construído, agora escolhendo um intervalo): mês com setas, semana começando no domingo, hoje com o pontinho, o primeiro e o último dia com o contorno escuro e os dias entre eles num fundo claro. "De" e "Até" no topo mostram o que foi escolhido. O botão diz o que vai acontecer ("Ver de 5 a 20 out"). |
| Escolher datas · só o primeiro dia | mobile | [html](screens/html/Calendario-meio.html) · [png](screens/png/Calendario-meio.png) | Depois do primeiro toque: "Até" fica pedindo o último dia e o botão espera. Tocar num dia antes do primeiro recomeça a escolha a partir dele. |
| Aberta por uma categoria | mobile | [html](screens/html/Lista-da-categoria.html) · [png](screens/png/Lista-da-categoria.png) | ENT-01 aberta a partir de Contas e categorias (tocar numa conta, cartão, categoria ou subcategoria). A seta volta para onde estava. O filtro vem pronto como etiqueta: numa categoria mãe, "Mercado e subcategorias" (inclui Feira e Padaria); numa subcategoria, só ela. Dá para tirar o filtro e ver tudo. |
| Lançamento excluído | mobile | [html](screens/html/Lista-excluido.html) · [png](screens/png/Lista-excluido.png) | Depois de excluir no detalhe, volta para a lista sem a linha e o toast fica 8 s com "Desfazer" (restaura na hora). O "+" sobe enquanto o toast aparece. |
| Filtros inválidos | mobile | [html](screens/html/Lista-filtros-invalidos.html) · [png](screens/png/Lista-filtros-invalidos.png) | ENTRY_QUERY_INVALID (um link antigo com filtro que não existe mais, por exemplo): a lista volta sem filtros e o toast explica. |

## Entry detail · ENT-03 (mobile)

One board per kind of entry. Header: option B (drawing and name on one line).

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Detalhe · compra parcelada | mobile | [html](screens/html/Detalhe.html) · [png](screens/png/Detalhe.png) | ENT-03, rota /lancamentos/:id. Aparece na hora com o que a lista já tem e completa quando a API responde. Topo: voltar, "Editar" (lápis) e "⋯". O resumo (opção B escolhida): ilustração e nome na mesma linha, o tipo em texto pequeno acima do nome (sem selo, para não parecer situação), o valor grande na largura toda e "3× de R$ 333,34 · ter, 20 out 2026". Detalhes em pares rótulo e valor (cartão, categoria, forma de pagamento, quem gastou, quem registrou e de onde: "pela web", "pelo WhatsApp"). Parcelas: uma linha por fatura, com a situação; tocar abre a fatura (CARD-03). Observações, Comprovantes (anexar abre o ATT-01) e o Histórico (só com audit:view). |
| Detalhe · dividido com contatos | mobile | [html](screens/html/Detalhe-dividido.html) · [png](screens/png/Detalhe-dividido.png) | Com divisão: a seção "Dividido com contatos" vem logo depois do resumo, com o pontilhado ligando nome e valor (lista sem divisórias) e "Sua parte" fechando embaixo. "Ver cobranças" leva para Contatos e cobranças. A fatura em que a compra caiu aparece como link nos detalhes. |
| Ações do lançamento | mobile | [html](screens/html/Detalhe-acoes.html) · [png](screens/png/Detalhe-acoes.png) | O "⋯" tem: Repetir (abre o Novo lançamento com tudo igual e a data de hoje, o valor selecionado para trocar), Anexar comprovante, Excluir com motivo e Excluir. Editar fica só no lápis (uma ação por destino). Excluir não pergunta: volta para a lista com "Desfazer". |
| Excluir com motivo | mobile | [html](screens/html/Detalhe-motivo.html) · [png](screens/png/Detalhe-motivo.png) | "Excluir com motivo": a folha com o motivo opcional (até 200 caracteres), que aparece na lixeira. O botão vermelho diz o que faz. Depois, o mesmo toast com "Desfazer". |
| Detalhe · despesa com comprovante | mobile | [html](screens/html/Detalhe-despesa.html) · [png](screens/png/Detalhe-despesa.png) | Despesa simples, registrada pelo WhatsApp, com um comprovante já anexado (o "⋯" do arquivo tem Abrir, Baixar e Excluir: rodada de anexos). Quando o lançamento pagou uma conta prevista do Planejamento, aparece o atalho "Pagou a conta prevista Aluguel de outubro". |
| Detalhe · transferência | mobile | [html](screens/html/Detalhe-transferencia.html) · [png](screens/png/Detalhe-transferencia.png) | Transferência: "De onde para onde" com as duas contas e a seta, e a frase de que não conta como gasto nem receita. Sem categoria e sem "Quem gastou". Quando ela foi uma parte da divisão da comissão, o atalho leva até a divisão. |
| Detalhe · receita | mobile | [html](screens/html/Detalhe-receita.html) · [png](screens/png/Detalhe-receita.png) | Receita: valor em verde com "+", a categoria com o selo da natureza (Variável). Numa renda variável, o cartão menta mostra como está a divisão sugerida ("4 de 4 partes") e leva até ela (HOME-03). |
| Detalhe · pagamento de fatura | mobile | [html](screens/html/Detalhe-pagamento.html) · [png](screens/png/Detalhe-pagamento.png) | Pagamento de fatura: a ilustração de fatura paga, a fatura que ele pagou (tocar abre CARD-03) e a frase de que não é um gasto novo. Como a fatura de outubro já fechou, vem a nota com o cadeado e o "⋯" perde as exclusões. |
| Detalhe · fatura fechada | mobile | [html](screens/html/Detalhe-fatura-fechada.html) · [png](screens/png/Detalhe-fatura-fechada.png) | RF-ENT-10: parte do lançamento está numa fatura fechada. A nota com cadeado fica no topo; o lápis continua (só descrição e observações mudam) e o "⋯" mostra só Repetir e Anexar comprovante. Com muitas parcelas, aparecem 3 (a fechada, a aberta e a próxima) e "Mostrar mais 7 parcelas". |
| Lançamento não encontrado | mobile | [html](screens/html/Detalhe-nao-encontrado.html) · [png](screens/png/Detalhe-nao-encontrado.png) | ENTRY_NOT_FOUND (excluído ou trocado por uma versão nova enquanto a pessoa olhava): a ilustração, a explicação e "Voltar para Lançamentos". |
| Detalhe · leitor | mobile | [html](screens/html/Detalhe-leitor.html) · [png](screens/png/Detalhe-leitor.png) | Leitor: sem lápis, sem "⋯", sem "Anexar comprovante" e sem Histórico (precisa de audit:view). Comprovantes mostra os que existem ou "Nenhum comprovante." |

## Edit entry · ENT-04 (mobile)

The new-entry form, prefilled.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Editar · começo | mobile | [html](screens/html/Editar.html) · [png](screens/png/Editar.png) | ENT-04: o mesmo formulário do Novo lançamento, preenchido, com o título "Editar lançamento" e um botão só, "Salvar alterações", que libera quando algo muda. Não há "Salvar e registrar outro". |
| Editar · só descrição | mobile | [html](screens/html/Editar-descricao.html) · [png](screens/png/Editar-descricao.png) | Mudou só a descrição ou as observações: salva no lugar (PATCH), sem aviso, e volta para o detalhe com "Lançamento atualizado.". |
| Editar · valor mudou | mobile | [html](screens/html/Editar-valor.html) · [png](screens/png/Editar-valor.png) | Mudou valor, data, conta, categoria, parcelas, divisão ou tipo: aparece no topo, só nesse momento, a nota azul "Mudou o valor, então ao salvar criamos uma nova versão do lançamento. A anterior fica no histórico." (o texto diz o que mudou). A prévia das parcelas se refaz. Ao salvar (PUT), o app vai para o lançamento novo; comprovantes e a conta prevista acompanham. |
| Editar · fatura fechada | mobile | [html](screens/html/Editar-fatura-fechada.html) · [png](screens/png/Editar-fatura-fechada.png) | Com parte numa fatura fechada, o formulário mostra só Descrição e Observações. O resto aparece num bloco travado com o cadeado ("O que não muda") e a explicação. Sem os tipos no topo. |
| Editar · alguém mudou antes | mobile | [html](screens/html/Editar-conflito.html) · [png](screens/png/Editar-conflito.png) | ENTRY_ALREADY_DELETED: outra pessoa excluiu ou editou antes. O alerta vermelho no topo, com "Ver a versão atual". O que a pessoa digitou fica na tela para copiar. |
| Editar · descartar | mobile | [html](screens/html/Editar-descartar.html) · [png](screens/png/Editar-descartar.png) | Fechar com mudanças: o mesmo "Descartar as alterações?" do Novo lançamento, com o texto de edição. |
| Editado · de volta ao detalhe | mobile | [html](screens/html/Editar-salvo.html) · [png](screens/png/Editar-salvo.png) | Salvou: volta para o detalhe já atualizado, com o toast "Lançamento atualizado." (sem "Desfazer": a versão anterior está no histórico). |

## Trash · ENT-05 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Lixeira de lançamentos | mobile | [html](screens/html/Lixeira.html) · [png](screens/png/Lixeira.png) | ENT-05, rota /lancamentos/lixeira (entries:delete). PROPOSTA de navegação: "Lixeira" no Mais e no menu do desktop abre esta página, com as abas Lançamentos e Contas e categorias (a ACC-04); o ícone de lixeira de cada tela abre direto a aba certa. Linhas como na lista, mais "Excluído em … por …" e o motivo, e "Restaurar". 50 por vez com "Mostrar mais". |
| Lançamento restaurado | mobile | [html](screens/html/Lixeira-restaurado.html) · [png](screens/png/Lixeira-restaurado.png) | Restaurar não pergunta: a linha sai e o toast oferece "Ver", que abre o lançamento. |
| Não dá para restaurar | mobile | [html](screens/html/Lixeira-nao-restaura.html) · [png](screens/png/Lixeira-nao-restaura.png) | ENTRY_CANNOT_BE_RESTORED: toast de erro com a mensagem. Quando o motivo é uma conta excluída e a API disser qual (proposta G47), o toast oferece "Restaurar Conta Y", como na lixeira de contas. |
| Lixeira vazia | mobile | [html](screens/html/Lixeira-vazia.html) · [png](screens/png/Lixeira-vazia.png) | "A lixeira está vazia." com a frase do que acontece com os excluídos. |

## Desktop

Filters open as menus under their buttons; the detail opens in a panel on the right; editing is the new-entry dialog.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Lançamentos · desktop | desktop | [html](screens/html/Lista-desktop.html) · [png](screens/png/Lista-desktop.png) | Desktop: "Lançamentos" marcado no menu. Uma barra: período (o da Início), busca e um botão por filtro (Tipo, Conta ou cartão, Categoria, Quem gastou), cada um abre um menu logo abaixo, da largura do botão (288 a 480 px). Tabela na largura toda, com os dias como faixas: lançamento (ilustração, descrição e selos), categoria, conta ou cartão, quem gastou, valor alinhado à direita e "⋯". Cabeçalho do quadro com o resumo da API (G46). "Mostrar mais" no fim, 50 por vez. Margens da Início (32 px). |
| Filtro aberto · desktop | desktop | [html](screens/html/Lista-desktop-filtro.html) · [png](screens/png/Lista-desktop-filtro.png) | Filtro aberto: menu sob o botão, com caixas de marcar (um ou mais tipos), e "Limpar". Marcar já aplica. Botões com filtro ativo mostram o valor ("Tipo: Compra no cartão") com o contorno escuro; "Limpar filtros" no fim da barra. |
| Período · desktop | desktop | [html](screens/html/Lista-desktop-periodo.html) · [png](screens/png/Lista-desktop-periodo.png) | No desktop, o período abre um balão sob ele (nunca folha de baixo): atalhos à esquerda (Este período, Período anterior, Últimos 30 dias, Este ano, Escolher datas) e o calendário do app à direita, com o intervalo marcado e "Aplicar". |
| Ações de uma linha · desktop | desktop | [html](screens/html/Lista-desktop-menu.html) · [png](screens/png/Lista-desktop-menu.png) | O "⋯" da linha abre o menu suspenso: Editar, Repetir, Anexar comprovante, Excluir com motivo e Excluir. Clicar na linha abre o detalhe. |
| Detalhe · desktop | desktop | [html](screens/html/Detalhe-desktop.html) · [png](screens/png/Detalhe-desktop.png) | No desktop, o detalhe abre num painel à direita (480 px) sobre a lista, que continua visível atrás; a rota muda para /lancamentos/:id, então o link funciona sozinho. Topo do painel: "Editar" (botão), "⋯" e fechar. Esc fecha. |
| Editar · desktop | desktop | [html](screens/html/Editar-desktop.html) · [png](screens/png/Editar-desktop.png) | Editar no desktop: o mesmo diálogo grande do Novo lançamento (880 px), título "Editar lançamento", a nota de nova versão no topo quando um valor muda, rodapé com "Cancelar" e "Salvar alterações". |
| Lixeira · desktop | desktop | [html](screens/html/Lixeira-desktop.html) · [png](screens/png/Lixeira-desktop.png) | Lixeira no desktop, aberta pelo item "Lixeira" do menu: abas Lançamentos e Contas e categorias; tabela com lançamento, quando e quem excluiu, motivo, valor e "Restaurar". |
