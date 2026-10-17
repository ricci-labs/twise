---
summary: Every designed screen and state of the contacts round — contacts, contact detail, new charge and sending (WhatsApp, email, copy), payments, the contact form, Pix receiving, the charge email and its customizable text — mobile and desktop, with HTML, PNG and designer notes.
read_when: Building or reviewing CON-01..05, SET-02, the charge email or the charge text settings.
updated: 2026-10-16
---

# Contacts and charges screens (CON-01..05, SET-02)

45 boards. Same numbers as the Home: today is Tue 20 Oct 2026; R$ 840,00 to receive from 3 contacts; R$ 200,00 overdue (Member D, since 10/10); next to receive Member C, R$ 120,00 on 25/10. Member D owes R$ 520,00: Mercado da semana R$ 120,00 and Jantar de aniversário R$ 80,00 (due 10/10), TV da sala 2/3 and 3/3 R$ 160,00 each (10/11, 10/12). The charge message follows `chargeMessage` in `packages/shared`. Notes are in pt-BR, as written by the designer; the copy in the screens is final. Notes marked NOVO or PROPOSTA depend on `decisions.md`.

## Contacts · CON-01 (mobile)

Opened from Mais › Contatos e cobranças and from the Home's "A receber" card.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Contatos | mobile | [html](screens/html/CON-contatos.html) · [png](screens/png/CON-contatos.png) | CON-01, aberta por Mais › Contatos e cobranças (e pelo "Ver contatos" do cartão A receber da Início). Mesmos números da Início: R$ 840,00 de 3 contatos, R$ 200,00 em atraso. No topo, os dois resumos e a ordem ("Mais atrasados primeiro" ou "Nome", contorno no escolhido). Linha: inicial, nome (2 linhas), a linha de baixo com o selo primeiro (Em atraso, Não quer mensagens) e a situação, e uma linha pequena com os canais (WhatsApp, E-mail). À direita, o valor e embaixo "deve", "crédito" ou "em dia"; "Cobrar" aparece quando há algo vencido que ainda não está numa cobrança. Tocar abre o contato. |
| Arquivados abertos | mobile | [html](screens/html/Contatos-arquivados.html) · [png](screens/png/Contatos-arquivados.png) | Arquivados num grupo recolhido no fim. Abrir mostra a linha apagada; o contato abre e tem "Desarquivar" no ⋯. |
| Depois de cobrar | mobile | [html](screens/html/Contatos-cobrado.html) · [png](screens/png/Contatos-cobrado.png) | Depois de enviar: o selo vira "Cobrado em 20/10" e "Cobrar" some (o que venceu já está numa cobrança). Toast com "Ver" (abre a cobrança). PROPOSTA: a API diz, por contato, se o vencido já está numa cobrança aberta (G63). |
| Carregando | mobile | [html](screens/html/Contatos-carregando.html) · [png](screens/png/Contatos-carregando.png) | Esqueleto no formato dos resumos e das linhas. |
| Nenhum contato | mobile | [html](screens/html/Contatos-vazio.html) · [png](screens/png/Contatos-vazio.png) | Vazio: o que é um contato, com exemplos, e "Novo contato". |
| Erro ao carregar | mobile | [html](screens/html/Contatos-erro.html) · [png](screens/png/Contatos-erro.png) | Erro: mensagem, código e "Tentar de novo". |
| Contatos · leitor | mobile | [html](screens/html/Contatos-leitor.html) · [png](screens/png/Contatos-leitor.png) | Leitor: sem "Novo contato" e sem "Cobrar". Vê valores e abre os contatos só para ver. |

## Contact detail · CON-02 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Contato | mobile | [html](screens/html/Contato.html) · [png](screens/png/Contato.png) | CON-02. Cabeçalho do detalhe (opção B): a inicial e o nome, "Deve" e o valor na largura toda, a frase do que ele inclui. Dois resumos: em atraso e o próximo vencimento. "Nova cobrança" e o atalho para registrar um recebimento sem cobrança (ENT-02 como recebimento de contato). "Em aberto" dividido em Vencidos e A vencer (as parcelas futuras também, PROPOSTA: a lista hoje só vai até hoje, G63). Depois as cobranças e "Falar com": WhatsApp (abre o app), e-mail, a chave Pix do contato (para vocês pagarem) e as observações. |
| Cobrança aberta | mobile | [html](screens/html/Contato-cobranca.html) · [png](screens/png/Contato-cobranca.png) | Tocar numa cobrança abre ali mesmo: como e quando foi enviada (canal, hora, para quem), os itens com o total, a mensagem (recolhível) e as ações em grade: Registrar pagamento na largura toda e, embaixo, Enviar de novo e Copiar Pix do mesmo tamanho. O ⋯ fica no cabeçalho da cobrança aberta (Copiar mensagem, Anexar comprovante, Cancelar cobrança). Os itens que já estão nela dizem "Na cobrança de 20/10". |
| Ações do contato | mobile | [html](screens/html/Contato-acoes.html) · [png](screens/png/Contato-acoes.png) | Editar, a chave "Não quer receber mensagens" (com a explicação), Arquivar (só com saldo zerado) e Excluir. |
| Excluir quem ainda deve | mobile | [html](screens/html/Contato-excluir.html) · [png](screens/png/Contato-excluir.png) | Excluir não tem lixeira: o diálogo avisa quando o contato ainda deve. Sem saldo: "Excluir Member D? Os lançamentos continuam." |
| Arquivar com saldo | mobile | [html](screens/html/Contato-arquivar.html) · [png](screens/png/Contato-arquivar.png) | CONTACT_HAS_BALANCE vira um diálogo que nomeia o contato, diz o motivo e oferece a saída (cobrar). |
| Contato com crédito | mobile | [html](screens/html/Contato-credito.html) · [png](screens/png/Contato-credito.png) | Crédito (pagou a mais): o valor em verde com "Crédito de", sem "Nova cobrança". O crédito abate a próxima dívida sozinho. |
| Pediu para não receber | mobile | [html](screens/html/Contato-sem-mensagens.html) · [png](screens/png/Contato-sem-mensagens.png) | Contato que pediu para não receber mensagens (pelo link do e-mail ou marcado por vocês): o aviso fica no cabeçalho. Enviar ainda é possível, com confirmação. Sem WhatsApp: a linha mostra "Sem número" e "Adicionar". |
| Contato · leitor | mobile | [html](screens/html/Contato-leitor.html) · [png](screens/png/Contato-leitor.png) | Leitor: sem editar, sem ⋯, sem Nova cobrança e sem Registrar pagamento; pode copiar a mensagem e o Pix. |

## New charge and sending · CON-03 (mobile)

A tall sheet over the contact.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Nova cobrança | mobile | [html](screens/html/Cobranca-nova.html) · [png](screens/png/Cobranca-nova.png) | CON-03 numa folha alta. De quem é, o campo "Cobrar o que vence até" com atalhos (Hoje; até a próxima parcela, dizendo quanto entra; Outra data abre o calendário do app) e a prévia dos itens com o total (pontilhado, linha contínua antes do total). Muda a data, a prévia se refaz (open-items?until=). |
| Incluindo a próxima parcela | mobile | [html](screens/html/Cobranca-ate-10-11.html) · [png](screens/png/Cobranca-ate-10-11.png) | Com "Até 10/11": a parcela 2/3 da TV entra e o total vai para R$ 360,00. |
| Nada a cobrar | mobile | [html](screens/html/Cobranca-nada.html) · [png](screens/png/Cobranca-nada.png) | Nada até a data (o que venceu já está numa cobrança aberta): "Criar cobrança" fica parado, a explicação diz por quê e o atalho inclui a próxima parcela. |
| Cobrança criada | mobile | [html](screens/html/Cobranca-criada.html) · [png](screens/png/Cobranca-criada.png) | RF-CON-7: primeiro como enviar, depois a mensagem exatamente como o contato vai ler (vem da API), o Pix copia e cola com "Copiar Pix" e "Como enviar": WhatsApp (abre com a mensagem), E-mail (NOVO: o app envia) e Copiar mensagem. Cada canal só aparece se o contato tem o dado. |
| Voltou do WhatsApp | mobile | [html](screens/html/Cobranca-whatsapp-voltou.html) · [png](screens/png/Cobranca-whatsapp-voltou.png) | Ao voltar do WhatsApp, a pergunta. "Ainda não" deixa como rascunho. |
| Enviar por e-mail | mobile | [html](screens/html/Cobranca-email.html) · [png](screens/png/Cobranca-email.png) | NOVO (G61, G62): confirma para quem vai, o assunto e para onde vão as respostas (o e-mail de quem cobrou). "Ver o e-mail" mostra o quadro do e-mail. Enviar marca como enviada sozinho, guarda canal e hora, e mostra o toast. |
| E-mail não saiu | mobile | [html](screens/html/Cobranca-email-falhou.html) · [png](screens/png/Cobranca-email-falhou.png) | Se o servidor de e-mail recusar o endereço, a cobrança volta para rascunho e o histórico diz o motivo. Ações na mesma grade: "Tentar o e-mail de novo" na largura toda e, embaixo, "Pelo WhatsApp" e "Corrigir e-mail" do mesmo tamanho. PROPOSTA: a API guarda o resultado do envio (G62). |
| Não quer mensagens | mobile | [html](screens/html/Cobranca-aviso.html) · [png](screens/png/Cobranca-aviso.png) | Contato que pediu para não receber: aviso antes de enviar pelo WhatsApp. Pelo e-mail o app não envia (a opção aparece apagada: "Member E pediu para não receber e-mails"), porque o pedido veio pelo link do próprio e-mail. Copiar a mensagem não pergunta. |
| Sem Pix configurado | mobile | [html](screens/html/Cobranca-sem-pix.html) · [png](screens/png/Cobranca-sem-pix.png) | Sem o Pix do espaço: a mensagem sai sem o código e a nota leva para Configurações › Recebimento por Pix (só para quem pode mudar configurações). Contato sem e-mail: a opção de e-mail não aparece; sem WhatsApp nem e-mail, sobra Copiar mensagem com o atalho "Adicionar WhatsApp ou e-mail". |

## Payment, contact form and Pix · CON-04, CON-05, SET-02 (mobile)

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Registrar pagamento | mobile | [html](screens/html/Pagamento.html) · [png](screens/png/Pagamento.png) | CON-04: a cobrança no topo (quanto e quanto falta), valor recebido (começa com o que falta), recebido em (contas de dinheiro) e data (calendário do app). |
| Valor acima do que falta | mobile | [html](screens/html/Pagamento-a-mais.html) · [png](screens/png/Pagamento-a-mais.png) | Acima do que falta: aviso, não bloqueia. |
| Pago em parte | mobile | [html](screens/html/Pagamento-registrado.html) · [png](screens/png/Pagamento-registrado.png) | Depois: toast, a cobrança vira "Paga em parte" e o histórico diz quanto entrou e quanto falta. Excluir o lançamento do pagamento desfaz. |
| Cancelar cobrança | mobile | [html](screens/html/Cobranca-cancelar.html) · [png](screens/png/Cobranca-cancelar.png) | Só sem pagamento. Com pagamento, a opção não aparece no ⋯. |
| Novo contato | mobile | [html](screens/html/Contato-novo.html) · [png](screens/png/Contato-novo.png) | CON-05 em tela cheia no celular (diálogo no desktop). Nome; WhatsApp com o país (+55) e o número; NOVO: E-mail, para cobrar por e-mail; Chave Pix (para vocês pagarem o contato); Observações com contador. Só o nome é obrigatório. |
| Erros do formulário | mobile | [html](screens/html/Contato-erro.html) · [png](screens/png/Contato-erro.png) | Erros ao sair do campo: número repetido (CONTACT_PHONE_TAKEN), número inválido ("Informe o número com DDD, como (11) 99999-0000."), e-mail inválido e e-mail de outro contato (NOVO, CONTACT_EMAIL_TAKEN). |
| Editar contato | mobile | [html](screens/html/Contato-editar.html) · [png](screens/png/Contato-editar.png) | Editar: os mesmos campos e a chave "Não quer receber mensagens". Salvar só libera quando algo muda. |
| Recebimento por Pix | mobile | [html](screens/html/Pix.html) · [png](screens/png/Pix.png) | SET-02, em Configurações › Recebimento por Pix (e pela nota da cobrança). Chave, nome de quem recebe (25) e cidade (15) com contador, e a prévia do que aparece no banco de quem paga. "Remover Pix" pede confirmação: "As próximas cobranças sairão sem o Pix copia e cola." |

## Charge email and the customizable text (new)

The email follows docs/design/account/emails.md. The text settings live in Configurações › Mensagem das cobranças.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| O e-mail da cobrança | mobile | [html](screens/html/Email-cobranca.html) · [png](screens/png/Email-cobranca.png) | NOVO, no mesmo padrão dos e-mails de conta (docs/design/account/emails.md): assunto e remetente "Twise" em nome do espaço, logo, cartão branco com a faixa menta e as duas corujas, "Oi, Member D!", o título com o valor e quem cobra, a abertura (personalizável), os itens, o vencimento, o bloco do Pix com QR code (para quem lê no computador e paga pelo celular) e o código copia e cola, o encerramento (personalizável). Notas: quem recebe o Pix e "já pagou?". Rodapé com o motivo e o link para não receber mais. Respostas vão para quem cobrou. Pré-cabeçalho: a abertura. O remetente depende do domínio do app: [DOMÍNIO]. |
| Assunto · opções | mobile | [html](screens/html/Email-assunto.html) · [png](screens/png/Email-assunto.png) | Três assuntos para escolher o padrão, como aparecem na caixa de entrada. Recomendo o A. Qualquer um pode ser mudado pelo espaço em Mensagem das cobranças. |
| Pedido para não receber | mobile | [html](screens/html/Email-descadastro.html) · [png](screens/png/Email-descadastro.png) | Página pública que abre pelo link do e-mail: confirma em uma frase. No app, o contato passa a mostrar "Pediu para não receber mensagens" (G62). |
| Mensagem das cobranças | mobile | [html](screens/html/Texto.html) · [png](screens/png/Texto.png) | NOVO, PROPOSTA (G64): Configurações › Mensagem das cobranças (quem pode mudar configurações). Personaliza o assunto do e-mail, a abertura e o encerramento (vale para WhatsApp e e-mail). Informações que mudam a cada cobrança entram por botões (Nome do contato, Quem cobra, Valor, Vencimento, Espaço) e aparecem como etiquetas no texto. O que não muda (saudação, itens, total, vencimento, Pix, link para não receber) fica explicado no cadeado. Prévia com abas E-mail e WhatsApp. "Voltar ao texto padrão". Cobranças já criadas não mudam (a mensagem fica guardada). |
| Prévia do WhatsApp | mobile | [html](screens/html/Texto-whatsapp.html) · [png](screens/png/Texto-whatsapp.png) | A aba WhatsApp mostra a mensagem inteira como sai. Aqui com uma abertura escrita pelo espaço. |
| Informação desconhecida | mobile | [html](screens/html/Texto-erro.html) · [png](screens/png/Texto-erro.png) | Se alguém digitar uma informação entre chaves que não existe, o campo marca e explica; "Salvar texto" fica parado até corrigir. |

## Desktop

Same width and margins as the Home; cards in a row share their height; no large empty areas.

| Screen | Kind | Files | Notes |
|---|---|---|---|
| Contatos · desktop | desktop | [html](screens/html/Contatos-desktop.html) · [png](screens/png/Contatos-desktop.png) | Desktop: três indicadores (a receber, em atraso, próximo) e a tabela na largura toda: contato, canais, situação (selo primeiro), quanto deve, "Cobrar" na linha e o ⋯. Ordem no cabeçalho da tabela; arquivados no fim. Embaixo, os próximos vencimentos de todos os contatos (PROPOSTA, G63) e como as cobranças saem (o Pix do espaço e os canais). |
| Contato · desktop | desktop | [html](screens/html/Contato-desktop.html) · [png](screens/png/Contato-desktop.png) | Desktop: à esquerda o valor, Em aberto e as cobranças (uma aberta); à direita "Falar com", o atalho de recebimento sem cobrança e os últimos pagamentos recebidos (lançamentos de recebimento do contato, já existem na API). "Nova cobrança" no cabeçalho. |
| Nova cobrança · desktop | desktop | [html](screens/html/Cobranca-nova-desktop.html) · [png](screens/png/Cobranca-nova-desktop.png) | Desktop: diálogo em duas colunas. À esquerda a data e os itens; à direita a prévia da mensagem, que se refaz com a data (a mesma função compartilhada que a API usa, chargeMessage). |
| Cobrança criada · desktop | desktop | [html](screens/html/Cobranca-criada-desktop.html) · [png](screens/png/Cobranca-criada-desktop.png) | Depois de criar: a mensagem à esquerda; o Pix e os canais à direita. |
| Novo contato · desktop | desktop | [html](screens/html/Contato-novo-desktop.html) · [png](screens/png/Contato-novo-desktop.png) | Novo contato num diálogo. Alinhamento: o nome na largura toda; WhatsApp e e-mail lado a lado, os dois com ajuda de uma linha, então os campos ficam na mesma altura; chave Pix e observações na largura toda. Regra: campos lado a lado têm ajudas do mesmo tamanho (uma linha) ou nenhuma; se uma precisa de mais, o campo vai para a largura toda. |
| O e-mail · desktop | mobile | [html](screens/html/Email-desktop.html) · [png](screens/png/Email-desktop.png) | O mesmo e-mail no computador: cartão de até 520 px, como os e-mails de conta. O QR code ajuda quem lê no computador e paga pelo celular. |
| Mensagem das cobranças · desktop | desktop | [html](screens/html/Texto-desktop.html) · [png](screens/png/Texto-desktop.png) | Desktop: os campos e a prévia do WhatsApp à esquerda; à direita a caixa de entrada e o e-mail inteiro, mudando enquanto digita. |
