---
summary: Every designed screen and state of the settings round — Configurações (SET-01 hub), members (MEM-01), roles (MEM-02), invitations (MEM-03), my account (ME-01) and history (AUD-01) — mobile and desktop, with HTML, PNG and notes
read_when: Building or reviewing SET-01, MEM-01..03, ME-01 or AUD-01.
updated: 2026-10-29
---

# Settings, members, account and history screens

56 boards. Same data as the other rounds: today is Tue 20 Oct 2026; workspace "Casa" with Member A (Dono, you) and Member B (Admin); two pending invitations; one custom role, "Contador". The "6 pessoas" boards are the quantity test (6 members, 7 invitations, 6 roles, a long name and a long email).

## Configurações · SET-01 (mobile)

Mais › Configurações becomes a list of groups; each group opens its own screen and saves alone. Pix (SET-02), Mensagem das cobranças (SET-03) and Feriados (PLAN-07) live here.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Configurações | mobile | [html](screens/html/SET-configuracoes.html) · [png](screens/png/SET-configuracoes.png) | SET-01. No celular, Configurações vira uma lista em grupos (PROPOSTA: cada grupo abre uma tela própria e salva sozinho, como o requisito pede "cada grupo salva sozinho"). Cada linha diz o valor de agora, para não precisar abrir. Espaço: nome e moeda, mês financeiro, orçamento, calendário e fuso. Cobranças: Pix e a mensagem. Planejamento: Feriados. Leitor não vê Configurações. |
| Configurações · membro | mobile | [html](screens/html/Config-membro.html) · [png](screens/png/Config-membro.png) | Membro (só "ver"): a lista é a mesma, com a faixa "Só donos e admins mudam". As telas abrem sem o botão de salvar e com um cadeado explicando. |
| Mês financeiro | mobile | [html](screens/html/Config-periodo.html) · [png](screens/png/Config-periodo.png) | "Seu mês financeiro começa": três cartões de escolha; o número fica dentro da frase (seletor do app, 1–31 ou 1º–10º). A prévia mostra o período atual e o próximo, da API (PROPOSTA, G73: o app não calcula datas). "Salvar período" só libera quando muda; toast "Configurações salvas." |
| Orçamento | mobile | [html](screens/html/Config-orcamento.html) · [png](screens/png/Config-orcamento.png) | Duas perguntas, cada uma com o recomendado marcado em texto (não em cor). Salvar parado até mudar algo. |
| Calendário e fuso | mobile | [html](screens/html/Config-calendario.html) · [png](screens/png/Config-calendario.png) | Semana (domingo ou segunda) num controle de duas opções; fuso no seletor do app, com uma linha dizendo onde vale. |
| Escolher fuso | mobile | [html](screens/html/Config-fuso.html) · [png](screens/png/Config-fuso.png) | Fusos do Brasil primeiro, com as cidades; busca no topo; "Outros países" abre a lista toda. Escolhido = contorno, sem ✓. |
| Nome e moeda | mobile | [html](screens/html/Config-nome.html) · [png](screens/png/Config-nome.png) | Nome do espaço (1–80, WORKSPACE_NAME_INVALID ao sair do campo). Moeda só leitura, com cadeado. |
| Erro ao salvar | mobile | [html](screens/html/Config-erro.html) · [png](screens/png/Config-erro.png) | SETTINGS_INVALID: aviso no topo, os valores ficam como a pessoa deixou. |
| Configuração só para ver | mobile | [html](screens/html/Config-leitura.html) · [png](screens/png/Config-leitura.png) | Para quem só vê: a tela é a mesma, os controles ficam apagados e o cadeado diz por quê; sem botão de salvar. |

## Members · MEM-01 (mobile)

Mais › Membros, three tabs: Membros | Papéis | Convites (with the pending count).

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Membros | mobile | [html](screens/html/Membros.html) · [png](screens/png/Membros.png) | MEM-01, em Mais › Membros (não aparece para leitores). Abas Membros / Papéis / Convites (com o número de pendentes). Linha: inicial, nome com "você"; o e-mail sozinho na segunda linha (até 2 linhas, quebra em qualquer ponto); o papel como selo no começo da terceira, com "Desde". "Convidar" no topo. Nota fixa com a regra dos donos. |
| Ações de um membro | mobile | [html](screens/html/Membros-acoes.html) · [png](screens/png/Membros-acoes.png) | Mudar papel, Ver no histórico (abre o Histórico filtrado por essa pessoa, PROPOSTA G75) e Remover do espaço. Cada ação só para quem pode. |
| Minhas ações | mobile | [html](screens/html/Membros-eu.html) · [png](screens/png/Membros-eu.png) | Na própria linha: Minha conta e Sair do espaço. |
| Mudar papel | mobile | [html](screens/html/Membro-papel.html) · [png](screens/png/Membro-papel.png) | Os papéis em cartões de escolha, cada um com o que pode fazer. Dono só aparece liberado para donos; para os outros fica apagado (OWNER_ONLY nem chega a acontecer). Papéis com permissões que a pessoa não tem também ficam apagados (PERMISSION_ESCALATION). |
| Remover membro | mobile | [html](screens/html/Membro-remover.html) · [png](screens/png/Membro-remover.png) | Remover pede confirmação, diz o efeito e aceita um motivo opcional (vai para o histórico). |
| Sair do espaço | mobile | [html](screens/html/Membro-sair.html) · [png](screens/png/Membro-sair.png) | Sair: depois volta para a troca de espaço. |
| Último dono | mobile | [html](screens/html/Membro-ultimo-dono.html) · [png](screens/png/Membro-ultimo-dono.png) | LAST_OWNER vira diálogo que explica e oferece a saída. |
| Membros · visto por um membro | mobile | [html](screens/html/Membros-membro.html) · [png](screens/png/Membros-membro.png) | Membro (só "ver"): a lista sem "Convidar" e sem ⋯ nas outras pessoas; na própria linha o ⋯ continua (Sair do espaço). |
| Membros · 6 pessoas | mobile | [html](screens/html/Membros-muitos.html) · [png](screens/png/Membros-muitos.png) | QUANTIDADES: com 6 pessoas a lista só cresce para baixo (50 por vez + "Carregar mais"). Nome longo em até 2 linhas, e-mail longo em até 2 linhas, o selo sempre no começo da terceira. |

## Roles · MEM-02 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Papéis | mobile | [html](screens/html/Papeis.html) · [png](screens/png/Papeis.png) | MEM-02. Cada papel: nome, "Sistema" ou "Do espaço", quantos usam (pessoas e convites, PROPOSTA G74), o que pode em uma frase. Dono com cadeado "Não pode ser alterado". Tocar abre o papel. |
| Novo papel | mobile | [html](screens/html/Papel-novo.html) · [png](screens/png/Papel-novo.png) | Nome (único, ROLE_NAME_TAKEN), descrição (200) e "Começar a partir de" (copia as permissões de um papel). As permissões: uma linha por área com as ações que existem nela (Ver, Criar, Editar, Excluir), marcadas com contorno e ✓ (é marcação, não seleção única). Marcar qualquer uma marca Ver; desmarcar Ver desmarca o resto. |
| Editar papel | mobile | [html](screens/html/Papel-editar.html) · [png](screens/png/Papel-editar.png) | Editando Contador: vê tudo e cria comprovantes. Salvar só libera quando muda. |
| Sem permissão para dar | mobile | [html](screens/html/Papel-sem-permissao.html) · [png](screens/png/Papel-sem-permissao.png) | Um admin criando papel: o que ele não tem (Excluir em Membros) aparece com cadeado e não marca; o aviso explica. PERMISSION_ESCALATION não chega a acontecer. |
| Papel em uso | mobile | [html](screens/html/Papel-em-uso.html) · [png](screens/png/Papel-em-uso.png) | ROLE_IN_USE vira diálogo com a saída. Papel livre: "Excluir Contador? Não dá para desfazer." Papéis do sistema não têm Excluir. |
| Nome repetido | mobile | [html](screens/html/Papel-nome-erro.html) · [png](screens/png/Papel-nome-erro.png) | ROLE_NAME_TAKEN no campo, ao sair dele. |

## Invitations · MEM-03 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Convites | mobile | [html](screens/html/Convites.html) · [png](screens/png/Convites.png) | MEM-03. Pendentes, os mais novos primeiro: e-mail ou telefone, o papel, até quando vale e quem convidou. ⋯: Revogar. |
| Convidar | mobile | [html](screens/html/Convidar.html) · [png](screens/png/Convidar.png) | Por e-mail ou telefone (duas opções). Papel com o seletor do app, padrão Membro, só os que a pessoa pode dar. Sucesso por e-mail: toast "Convite enviado para member.c@exemplo.com. Ele vale por 7 dias e só esse e-mail pode aceitar." |
| Convite por telefone | mobile | [html](screens/html/Convidar-telefone.html) · [png](screens/png/Convidar-telefone.png) | Por telefone o app mostra o link uma vez só: aviso em amarelo, "Enviar pelo WhatsApp" e "Copiar link" do mesmo tamanho. |
| Já tem convite | mobile | [html](screens/html/Convidar-erro.html) · [png](screens/png/Convidar-erro.png) | INVITATION_PENDING no campo, com a explicação. |
| Revogar convite | mobile | [html](screens/html/Convite-revogar.html) · [png](screens/png/Convite-revogar.png) | Revogar pede confirmação. Se o convite já foi aceito ou revogado por outra pessoa, a lista se atualiza com um toast. |
| Nenhum convite | mobile | [html](screens/html/Convites-vazio.html) · [png](screens/png/Convites-vazio.png) | Vazio: o que é um convite e "Convidar". |

## My account · ME-01 (mobile)

Mais › Minha conta and the account menu.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Minha conta | mobile | [html](screens/html/Conta.html) · [png](screens/png/Conta.png) | ME-01, por Mais › Minha conta e pelo menu da conta. Cabeçalho com a inicial, nome e e-mail. Grupos: Você (nome, e-mail só leitura, senha), Avisos (horário de silêncio, avisos deste espaço), Aparência (tema). "Sair" no fim, sem confirmação. |
| Trocar senha | mobile | [html](screens/html/Conta-senha.html) · [png](screens/png/Conta-senha.png) | Senha atual, nova (12–128, mostrar/esconder) e repetir. Depois: toast "Senha trocada. Saímos dos outros aparelhos." |
| Senha atual errada | mobile | [html](screens/html/Conta-senha-erro.html) · [png](screens/png/Conta-senha-erro.png) | CURRENT_PASSWORD_WRONG no campo. Cinco tentativas em 15 min: aviso e o botão com contagem, como no login. |
| Horário de silêncio | mobile | [html](screens/html/Conta-silencio.html) · [png](screens/png/Conta-silencio.png) | Chave ao lado do rótulo; com ela ligada, "Das" e "Até" lado a lado (mesma altura, uma ajuda só embaixo), no seletor de horas do app. |
| Avisos do espaço | mobile | [html](screens/html/Conta-avisos.html) · [png](screens/png/Conta-avisos.png) | Só o que funciona hoje: quantos dias antes avisar (0–30). Um exemplo com uma conta de verdade mostra o efeito. |
| Tema | mobile | [html](screens/html/Conta-tema.html) · [png](screens/png/Conta-tema.png) | Três cartões com uma miniatura; muda na hora, sem salvar (fica no aparelho). |

## History · AUD-01 (mobile)

Owners and admins only.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Histórico | mobile | [html](screens/html/Historico.html) · [png](screens/png/Historico.png) | AUD-01, para donos e admins. Dias em grupos (como Lançamentos); cada evento: quem (inicial, ou o raio para "Automático"), a frase com o item em negrito, e embaixo a hora, a área e a referência; "pelo WhatsApp" como selo. 50 por vez e "Carregar mais". Filtros por área e por pessoa. |
| Detalhe da mudança | mobile | [html](screens/html/Historico-evento.html) · [png](screens/png/Historico-evento.png) | Tocar mostra antes e depois, campo a campo, com o que mudou marcado, dinheiro e datas formatados, a referência e "Ver lançamento". PROPOSTA G75: a API manda o nome de quem fez, o nome do item (mesmo excluído) e os campos já com rótulo. |
| Filtrar por área | mobile | [html](screens/html/Historico-area.html) · [png](screens/png/Historico-area.png) | As áreas do requisito, no seletor do app. |
| Só um lançamento | mobile | [html](screens/html/Historico-item.html) · [png](screens/png/Historico-item.png) | Vindo de "Histórico deste lançamento" (ENT-03): o item fica no topo com o X para ver tudo. |
| Nada registrado | mobile | [html](screens/html/Historico-vazio.html) · [png](screens/png/Historico-vazio.png) | Vazio. |

## Desktop · settings, members, roles, account

Two-column paired cards for fixed content; lists take the full row and grow. Checked at 1440 and 1920 px.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Configurações · desktop | desktop | [html](screens/html/Configuracoes-desktop.html) · [png](screens/png/Configuracoes-desktop.png) | Desktop (refeito de novo): duas colunas de cartões, em pares de altura parecida (Nome e moeda com Calendário; Mês financeiro com Orçamento). Os dois cartões da mesma linha ficam da mesma altura e o "Salvar" fica sempre no pé do cartão. Nada fica sozinho: Cobranças e planejamento ocupa a linha toda, com as três telas lado a lado. Em tela grande os cartões crescem até 1600 px de conteúdo; os campos nunca passam de meia tela. |
| Membros · desktop | desktop | [html](screens/html/Membros-desktop.html) · [png](screens/png/Membros-desktop.png) | Desktop (refeito para quantidades): REGRA: lista nunca fica em par; lista ocupa a linha toda e cresce para baixo. Pares lado a lado só para cartões de conteúdo fixo (formulários, como em Configurações). Aqui: Membros (todos, 50 por vez), Convites pendentes (os 4 mais novos + "Ver todos os N") e Papéis em blocos que se acomodam em quantas colunas couberem (até 6 + "Ver todos"). A última atividade vem do histórico (PROPOSTA G75). |
| Papel · desktop | desktop | [html](screens/html/Papel-desktop.html) · [png](screens/png/Papel-desktop.png) | Desktop: o papel numa página: nome, descrição e "começar a partir de" à esquerda, com quem usa; à direita a tabela de permissões (áreas × Ver, Criar, Editar, Excluir) com caixas de marcar. |
| Convidar · desktop | desktop | [html](screens/html/Convidar-desktop.html) · [png](screens/png/Convidar-desktop.png) | Convidar num diálogo de 560 px. |
| Minha conta · desktop | desktop | [html](screens/html/Conta-desktop.html) · [png](screens/png/Conta-desktop.png) | Desktop (refeito de novo): mesmo modelo de Configurações. Pares: Perfil com Tema (as miniaturas do tema crescem para ocupar o cartão), Horário de silêncio com Avisos do espaço (os dois são avisos); Senha na linha toda, com os três campos lado a lado e a regra da senha no topo do cartão. "Sair" foi para o topo da página. |
| Configurações · tela grande | desktop | [html](screens/html/Configuracoes-1920.html) · [png](screens/png/Configuracoes-1920.png) | A mesma tela num monitor de 1920 px: as duas colunas crescem juntas, sem esticar um campo só pela tela toda e sem sobra do lado. |
| Membros · 6 pessoas e 7 convites | desktop | [html](screens/html/Membros-muitos-desktop.html) · [png](screens/png/Membros-muitos-desktop.png) | QUANTIDADES: 6 membros, 7 convites e 6 papéis. Membros cresce para baixo (50 por vez + "Carregar mais"). Convites mostra os 4 mais novos e "Ver todos os 7 convites" (abre a aba Convites). Papéis: blocos de 3 por linha em 1440 px (4 em telas maiores), até 6 + "Ver todos". Nome longo quebra em 2 linhas; e-mail longo corta com reticências (o completo aparece ao passar o mouse). |
| Papéis · desktop | desktop | [html](screens/html/Papeis-desktop.html) · [png](screens/png/Papeis-desktop.png) | NOVO: a aba Papéis no desktop. A lista de papéis em tabela (linha toda, cresce para baixo) e a tabela "O que cada papel pode", com uma coluna por papel. Até 6 papéis cabem; com mais, ela rola para o lado e a coluna "Área" fica parada. Saiu da aba Membros, que agora mostra só um resumo dos papéis. |
| Membros · tela grande | desktop | [html](screens/html/Membros-1920.html) · [png](screens/png/Membros-1920.png) | Membros com 6 pessoas num monitor de 1920 px. |

## Desktop · history as a work screen

The page does not scroll; the list and the detail scroll on their own (app-wide rule, decisions.md).

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Histórico · desktop | desktop | [html](screens/html/Historico-desktop.html) · [png](screens/png/Historico-desktop.png) | TELA DE TRABALHO (regra nova): a tela inteira é usada e a página não rola. Filtros presos no topo da lista; a lista e o detalhe rolam cada um por conta própria (a barra fina à direita é a do sistema). As duas colunas sempre terminam juntas, com 2 ou 2.000 eventos. Teclado: cada coluna recebe foco e tem nome para leitor de tela. |
| Histórico · carregando mais | desktop | [html](screens/html/Historico-desktop-carregando.html) · [png](screens/png/Historico-desktop-carregando.png) | Perto do fim da lista (uns 300 px antes), os próximos 50 carregam sozinhos: três linhas cinzas e "Carregando mais…". A lista não pula. Sem botão aqui, porque dentro da coluna não existe rodapé a alcançar. |
| Histórico · erro ao carregar | desktop | [html](screens/html/Historico-desktop-erro.html) · [png](screens/png/Historico-desktop-erro.png) | Se falhar, o que já carregou fica e aparece "Tentar de novo" no fim da lista. Ele não tenta sozinho em repetição. |
| Histórico · fim da lista | desktop | [html](screens/html/Historico-desktop-fim.html) · [png](screens/png/Historico-desktop-fim.png) | No fim: uma linha discreta diz que acabou e desde quando existe o histórico. Nada mais carrega. |
| Histórico · tela baixa | desktop | [html](screens/html/Historico-desktop-baixa.html) · [png](screens/png/Historico-desktop-baixa.png) | Janela com menos de 700 px de altura: as colunas ficariam espremidas, então a tela volta ao modo de página que rola, com "Carregar mais" no fim da lista e o detalhe parado no topo à direita. |
| Histórico · tela grande | desktop | [html](screens/html/Historico-1920.html) · [png](screens/png/Historico-1920.png) | Histórico num monitor de 1920 x 1080: mais linhas visíveis de uma vez, mesmas regras. |
