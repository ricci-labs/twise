---
summary: Every designed screen and state of the app shell, workspace creation and the Home (SHELL-01, WS-01, HOME-01), mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing the app shell, WS-01 or any part of HOME-01.
updated: 2026-10-09
---

# Shell, workspace and Home screens

Each row links a standalone HTML (open it in a browser: exact copy, spacing and states) and a PNG. Mobile frames are 390×844 (the full Home page is 390×4700), desktop 1440 wide. Animations are looped demos; in the app each plays **once**.

Notes come from the design canvas and are in **pt-BR**. UI copy in them is final; quote it exactly. Notes marked **PROPOSTA** are not in the requirements yet (see `decisions.md`).

All numbers in the screens are fake but consistent: period 5 out – 4 nov, today 20 out, budget income R$ 9.000,00.

## Create a workspace (WS-01)

Route: the first screen after log in when the person has no workspace.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Criar espaço · padrão | mobile | [html](screens/html/WS-criar.html) · [png](screens/png/WS-criar.png) | WS-01. Primeira tela de quem entrou e ainda não tem espaço (RF-WS-3). Mesmo layout das telas de conta: topo menta com a coruja e a casinha (cena nova). Um campo, "Nome do espaço", placeholder "Casa". A dica de convite evita que a segunda pessoa do casal crie um espaço separado por engano. "Sair" no rodapé, já que ainda não há menu. |
| Criar espaço · pronto | mobile | [html](screens/html/WS-pronto.html) · [png](screens/png/WS-pronto.png) | Nome válido (1 a 80, sem espaços nas pontas): o botão libera. |
| Criar espaço · nome vazio | mobile | [html](screens/html/WS-erro.html) · [png](screens/png/WS-erro.png) | WORKSPACE_NAME_INVALID, ao sair do campo vazio ou com mais de 80 caracteres. |
| Criar espaço · criando | mobile | [html](screens/html/WS-criando.html) · [png](screens/png/WS-criando.png) | POST /api/workspaces. Spinner no botão, campo só leitura. Sucesso: abre a Início do espaço novo, no estado de primeiro uso. Quem cria vira Dono. |
| Animação · criar espaço | animation | [html](animations/Animacao-criar-espaco.html) | Entrada nova, "Construir": a coruja já está lá; as paredes sobem do chão (0,25–0,65 s), o telhado desce e assenta com um pulinho (0,55–0,92 s), a porta (0,85 s) e a chaminé (0,95 s) aparecem, e o brilho estala (1,25 s). Termina em 1,7 s. Tela de formulário: só a coruja se mexe. Kit kit-espaco (mesmos traços da cena parada, então nada pula no fim). Em loop só aqui no canvas; no app toca uma vez. |

## First run (HOME-01 with no accounts)

Right after creating the workspace.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Início · primeiro uso · desktop | desktop | [html](screens/html/Desktop-primeiro-uso.html) · [png](screens/png/Desktop-primeiro-uso.png) | Primeiro uso no desktop, com mais presença: uma faixa menta de boas-vindas com a coruja e a casinha grandes, o título, o porquê em uma frase, a barra de progresso e um botão direto para o primeiro passo. Abaixo, o passo a passo numerado (o próximo aberto, com o botão da ação) e, ao lado, uma prévia apagada do que a Início vai mostrar, dizendo qual passo libera cada número. Assim a tela vazia já ensina o que o app faz. O convite (PROPOSTA, contorno tracejado) sai da lista e vira um cartão próprio. Sem seletor de período, porque ainda não há números. |
| Início · primeiro uso | mobile | [html](screens/html/Inicio-primeiro-uso.html) · [png](screens/png/Inicio-primeiro-uso.png) | HOME-01 sem contas, no mesmo desenho do desktop: faixa menta de boas-vindas com a coruja e a casinha, o título, o porquê em uma frase, o progresso e o botão direto para o primeiro passo. Abaixo, o passo a passo numerado com o próximo aberto. No topo só o avatar de quem criou, porque ainda não há mais ninguém no espaço. |
| Início · primeiro uso (rolada) | mobile | [html](screens/html/Inicio-primeiro-uso-rolada.html) · [png](screens/png/Inicio-primeiro-uso-rolada.png) | Rolando: a prévia apagada dos indicadores, cada um dizendo qual passo o libera, e o convite em cartão próprio (PROPOSTA, contorno tracejado). A prévia do gráfico fica só no desktop, para não alongar a tela. |
| Animação · espaço criado | animation | [html](animations/Animacao-espaco-criado.html) | Logo depois de criar o espaço (conquista, então pode brilhar e piscar): a faixa menta sobe (0,1–0,45 s), o brilho estala (0,6 s), a barra de progresso enche até o primeiro tiquinho (0,6–1 s), os passos entram um a um, 80 ms de diferença, o selo "Próximo passo" salta (1,2 s) e a coruja dá uma piscadinha (1,1–1,6 s). Termina em 1,6 s. |

## Home · mobile (HOME-01)

Route `/` inside a workspace. `GET /overview?period=YYYY-MM`.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Início · ao abrir | mobile | [html](screens/html/Main.html) · [png](screens/png/Main.png) | HOME-01 no celular, no mesmo desenho do desktop. Indicadores em carrossel: o cartão seguinte aparece pela metade à direita, mostrando que dá para deslizar, e as bolinhas embaixo dizem quantos são. O "Livre para gastar" vem sempre primeiro. Botão flutuante "Novo lançamento". |
| Início · página inteira | mobile | [html](screens/html/Inicio-pagina.html) · [png](screens/png/Inicio-pagina.png) | Página inteira, na mesma ordem do desktop: indicadores, Posso comprar?, avisos, contas que vencem em 7 dias, previsão de saldo (a troca de conta fica dentro do cartão do gráfico), ritmo do período, orçamentos, próximos meses, para onde vai a renda, faturas (com a parte de outras pessoas), reserva e metas, comissões e a receber de contatos. |
| Início · carrossel no 2º indicador | mobile | [html](screens/html/Inicio-carrossel.html) · [png](screens/png/Inicio-carrossel.png) | Carrossel deslizado para o 2º indicador. Desliza com o dedo, encaixa um cartão por vez (scroll-snap) e as bolinhas também são botões. Com leitor de tela, cada cartão é lido como "2 de 4". |
| Início · carregando | mobile | [html](screens/html/Inicio-carregando.html) · [png](screens/png/Inicio-carregando.png) | Esqueletos no formato do carrossel e dos cartões. Topo e período aparecem na hora. Ao trocar de período, os números antigos ficam até chegar o novo. |
| Início · passou do planejado | mobile | [html](screens/html/Inicio-passou.html) · [png](screens/png/Inicio-passou.png) | freeToSpend negativo: o primeiro indicador troca o menta pelo vermelho claro, valor em vermelho, selo "Passou do planejado", a frase do porquê e "Ver onde ajustar". Sem o por dia. O cofrinho vira a versão "no vermelho" (rachado, suando, moeda escapando), mesmo traço e sem brilhos, como manda a regra dos avisos. Gasto vai para 73% da renda. Avisos de alerta primeiro, na ordem da API. |
| Início · sem avisos | mobile | [html](screens/html/Inicio-tudo-certo.html) · [png](screens/png/Inicio-tudo-certo.png) | Sem avisos: "Tudo em ordem por aqui." numa linha calma de sucesso, não um cartão. |
| Início · período encerrado | mobile | [html](screens/html/Inicio-periodo-encerrado.html) · [png](screens/png/Inicio-periodo-encerrado.png) | Período passado: selo "Período encerrado", o primeiro indicador sai do menta e mostra quanto sobrou, sem o por dia. Logo abaixo, "Conquistas de setembro": o que deu certo no mês, para motivar (PROPOSTA). "Ir para o período atual" é proposta. |
| Início · uma seção falhou (rolada) | mobile | [html](screens/html/Inicio-secao-erro.html) · [png](screens/png/Inicio-secao-erro.png) | Parcial: o cartão que falhou mostra o erro com o código e "Tentar de novo" só dele; o resto continua. (Rolada até a previsão.) |
| Início · sem orçamentos e metas (rolada) | mobile | [html](screens/html/Inicio-sem-config.html) · [png](screens/png/Inicio-sem-config.png) | Sem orçamentos e sem metas: os cartões viram um convite curto com o link (só para quem pode criar). |
| Início · sem conexão | mobile | [html](screens/html/Inicio-offline.html) · [png](screens/png/Inicio-offline.png) | Sem conexão: faixa no topo e os últimos números guardados, com a hora da última atualização. |
| Início · leitor | mobile | [html](screens/html/Inicio-leitor.html) · [png](screens/png/Inicio-leitor.png) | Papel Leitor: faixa discreta, sem botão flutuante e sem ações de escrita (Registrar, Dividir, Cobrar); os "Ver…" ficam. |

## App shell · mobile (SHELL-01)

Bottom tab bar, the "Mais" sheet, workspace switcher, period picker, help.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Menu Mais | mobile | [html](screens/html/Shell-mais.html) · [png](screens/png/Shell-mais.png) | "Mais" abre uma folha: a conta, as áreas que não cabem na barra e, separados, "Minha conta" e "Sair" (sem confirmação; volta ao login com "Você saiu."). Itens sem permissão não aparecem. |
| Trocar de espaço | mobile | [html](screens/html/Shell-espacos.html) · [png](screens/png/Shell-espacos.png) | Tocar no nome do espaço abre a lista: nome e papel, o atual marcado. Trocar abre a Início daquele espaço; o último usado fica lembrado no aparelho. "Criar espaço" leva ao WS-01. |
| Espaço sem acesso | mobile | [html](screens/html/Shell-sem-acesso.html) · [png](screens/png/Shell-sem-acesso.png) | WORKSPACE_NOT_FOUND: abre a lista de espaços com "Você não tem mais acesso a este espaço." e nenhum marcado. |
| Escolher período | mobile | [html](screens/html/Shell-periodo.html) · [png](screens/png/Shell-periodo.png) | Tocar no período abre os meses do ano, cada um com o intervalo. O atual em menta, os futuros tracejados. O período vai na URL (?period=2026-10). |
| Ajuda do "Livre para gastar" | mobile | [html](screens/html/Shell-ajuda.html) · [png](screens/png/Shell-ajuda.png) | Cada "?" abre a explicação do número em linguagem simples. Fecha ao tocar fora. |

## Home · desktop (HOME-01, SHELL-01)

From 1024 px: sidebar + 12-column grid. The "tela real" boards are the true 1440×900 viewport with the collapsible sidebar.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Início · desktop | desktop | [html](screens/html/Desktop-inicio.html) · [png](screens/png/Desktop-inicio.png) | Grade de 12 colunas, cada linha com a mesma altura: indicadores; previsão de saldo (abas por conta) e avisos; orçamentos e ritmo do período; próximos meses e para onde vai a renda; contas que vencem em 7 dias, faturas com a parte de outras pessoas e reserva e metas; comissões e a receber de contatos. Gráficos no padrão shadcn/ui (Recharts). Cores validadas para daltonismo. |
| Início · passou do planejado · desktop | desktop | [html](screens/html/Desktop-passou.html) · [png](screens/png/Desktop-passou.png) | Livre para gastar negativo no desktop: o primeiro indicador troca o menta pelo vermelho claro, com o valor em vermelho, o selo "Passou do planejado", uma frase do porquê e o atalho "Ver onde ajustar" (leva aos orçamentos mais adiantados). O cofrinho vira a versão "no vermelho": rachado, suando e com a moeda escapando, no mesmo traço das ilustrações e sem brilhos (regra dos avisos). A previsão marca em vermelho o trecho abaixo de zero. Gasto sobe para 73% da renda; os números batem: 6.580 + 2.800 − 9.000 = −380. |
| Início · desktop · tela real | desktop | [html](screens/html/Desktop-app.html) · [png](screens/png/Desktop-app.png) | A tela como ela aparece de verdade num monitor de 1440 × 900: a barra lateral fica fixa na altura da janela e só o conteúdo rola. No topo da barra, ao lado da logo, o botão de recolher o menu. Dá para clicar nele aqui no canvas. Espaço e conta ficam presos no rodapé da barra. |
| Início · desktop · menu recolhido | desktop | [html](screens/html/Desktop-app-recolhido.html) · [png](screens/png/Desktop-app-recolhido.png) | Menu recolhido: a barra vira uma coluna de 76 px só com os ícones, e o conteúdo ganha espaço. Logo vira só a coruja; "Novo lançamento" vira um botão redondo com "+"; "Mais" vira um traço divisório; no rodapé ficam a casinha do espaço e o avatar. Ao passar o mouse, o nome aparece numa etiqueta escura (aqui, em Lançamentos). O botão abaixo da coruja abre de novo. A escolha fica lembrada no navegador. Atalho de teclado (Ctrl/⌘ + B) é PROPOSTA. |

## Home · desktop states

Same states as mobile, on the real 1440×900 viewport.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Início · desktop · carregando | desktop | [html](screens/html/Desktop-carregando.html) · [png](screens/png/Desktop-carregando.png) | Esqueletos no formato dos indicadores e dos cartões; topo, período e menu aparecem na hora. Ao trocar de período, os números antigos ficam até chegar o novo. Nunca um spinner de tela cheia. |
| Início · desktop · sem avisos | desktop | [html](screens/html/Desktop-sem-avisos.html) · [png](screens/png/Desktop-sem-avisos.png) | Sem avisos: o cartão continua no lugar (a grade não pula) e mostra "Tudo em ordem por aqui." com o ícone de certo em verde. |
| Início · desktop · período encerrado | desktop | [html](screens/html/Desktop-encerrado.html) · [png](screens/png/Desktop-encerrado.png) | Período passado (set/26): selo "Período encerrado" e "Ir para o período atual" (proposta) ao lado da data. "Livre para gastar" sai do menta e mostra quanto sobrou (R$ 410,00); Comprometido zera. No lugar da previsão (que não vale para o passado) entram as "Conquistas de setembro" (PROPOSTA): fecharam no azul pelo 3º mês seguido, 4 de 5 orçamentos no limite, 12 de 13 contas em dia, +R$ 600,00 na reserva e a meta Viagem de 30% a 40%. Pede um resumo do período na API (a tela não calcula). O ritmo vira "Como o período terminou" (gasto e sobra). Sem "Posso comprar?". Números batem: 9.000 − 8.590 − 0 = 410. |
| Início · desktop · uma seção falhou | desktop | [html](screens/html/Desktop-erro.html) · [png](screens/png/Desktop-erro.png) | Parcial: só o cartão da previsão falhou; mostra o erro com o código e "Tentar de novo" só dele. O resto da tela continua normal. |
| Início · desktop · sem conexão | desktop | [html](screens/html/Desktop-offline.html) · [png](screens/png/Desktop-offline.png) | Sem conexão: faixa escura no topo do conteúdo e "Atualizado às 14:32" junto da data. Os números são os últimos guardados. Clicar em "Novo lançamento" ou em qualquer ação de salvar avisa que não dá agora. |
| Início · desktop · leitor | desktop | [html](screens/html/Desktop-leitor.html) · [png](screens/png/Desktop-leitor.png) | Papel Leitor (matriz de permissões): some o "Novo lançamento"; no menu somem Membros, Configurações, Histórico e Lixeira (o Leitor não tem acesso); faixa discreta sob o título; somem Registrar, Dividir e Cobrar. Os "Ver…" e o "Posso comprar?" (só simula) ficam. No rodapé, "Leitor · 2 pessoas". |

## Motion

Looped demos; in the app each plays once. Details in `motion.md`.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Animação · Início desktop | animation | [html](animations/Animacao-inicio-desktop.html) | Como a Início chega na primeira vez da sessão: os 4 indicadores sobem um a um (60 ms de diferença), os cartões entram juntos logo depois, a linha da previsão se desenha da esquerda para a direita (0,5–1,2 s) e o degradê aparece por baixo, as barras crescem da base, as barras de orçamento enchem e o anel do ritmo dá a volta. Tudo pronto em 1,3 s. Trocar de período NÃO repete isso: só os números trocam com um esmaecer de 200 ms. Em loop só aqui no canvas. |
| Animação · Início celular | animation | [html](animations/Animacao-inicio-celular.html) | A mesma entrada no celular: indicadores do carrossel sobem, "Posso comprar?" e os avisos entram logo depois, e cada gráfico se desenha quando aparece na tela ao rolar (não antes). Em loop só aqui no canvas. |
| Movimento · Início | animation | [html](animations/Movimento-inicio.html) | Plano de movimento para o time, com os tempos de cada peça. No código: gráficos com a animação do próprio Recharts (isAnimationActive, animationDuration, animationEasing ease-out), o resto em CSS (transições e keyframes), sem biblioteca nova. Tudo desligado com prefers-reduced-motion. |

## Reference sheets

Icon set and the bottom tab bar comparison.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Ícones Twise | reference | [html](screens/html/Icones.html) · [png](screens/png/Icones.png) | Folha de referência para o time: como o ícone é montado (traço + preenchimento), os 15 ícones de interface e os 3 de aviso, nos dois estados, e como fica a seleção na barra inferior (celular) e na barra lateral (desktop). A seleção desenhada aqui foi revista em 2026-10-09: ícone nunca preenchido na seleção (ver `../assets/icones/README.md`). Utilitários pequenos (setas, fechar, calendário do período) seguem Lucide, porque precisam ser neutros e muito legíveis em 16 px. Exportar como SVG de duas camadas: o preenchimento usa var(--ti-fill), o traço usa currentColor. |
| Barra inferior · opções | reference | [html](screens/html/Barra-opcoes.html) · [png](screens/png/Barra-opcoes.png) | Comparação da barra inferior do celular. Escolhida: C, encostada embaixo. Revisto em 2026-10-09: sem o risco embaixo do nome e sem preenchimento; o item atual fica com traço e nome em `--mint-ink` (`components.md`). |
