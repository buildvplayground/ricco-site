# RICCO Construtora — site

Pipeline BuildV (`criar-site`). Fonte de verdade legível do progresso.
Espelho de máquina: `state.json`.

- **Cliente:** RICCO Construtora (RICCO Construção e Participação Ltda.)
- **Praça:** Fortaleza, CE e interior do Ceará
- **Slug:** `ricco-site`
- **Material:** Google Drive `1sMshi94g0ZmLSCDRBo5Qr-AlxA1ngPPK`
- **Stack:** HTML estático + CSS + JS vanilla (padrão BuildV, sem framework)
- **Hospedagem:** Vercel **e** `public_html` de hospedagem WordPress (as duas pastas prontas)
- **Atualizado em:** 2026-09-04

---

## Etapas

- [x] **1. Extrair do Drive** · `done`
      44 arquivos em `_raw/` via rclone. Brand board, logo em selo, peça de portfólio,
      33 fotos de obra utilizáveis, o HTML do site anterior e dois `.xlsx`.
      Pastas `Criativos/` e `Site e páginas/` estão **vazias no Drive**.
- [x] **2. Organizar pastas** · `done`
      `Marca/`, `Copys/`, `imagens/tratadas/`, `design-system/`, `Site/`.
      `.gitignore` seguro: o repo versiona só a pasta de deploy e o estado.
- [x] **2b. Repositório GitHub** · ver `state.json.links.repo`
- [x] **3. Design system** · `done` → `design-system/README.md`
      Paleta amostrada pixel a pixel das 5 cédulas do brand board. Tipografia
      derivada do wordmark real (Archivo + Spline Sans). Todo par de cores com
      contraste medido; zero reprovação AA.
- [x] **4. Extrair copy** · `done` → `Copys/copy-site.md`
      Sem wireframe no material. A copy foi mineirada do site anterior (Lovable) e
      reconciliada com o brand board. `Copys/institucional_site_antigo.md` guarda o
      texto extraído. Números contraditórios foram descartados, não publicados.
- [x] **5. Front-end** · `done` → `Site/`
      `index.html`, `privacidade.html`, `css/styles.css`, `js/motion.js`, `js/app.js`.
      9 seções, cada uma em uma tela. Hero com foto full-bleed, tablist de frentes
      com foto que troca, obras em galeria travada (pin + scrub), CTA em janelas
      que acendem. Motor de movimento próprio. **Revisado em 04/09** a pedido do
      cliente: ver `brief-pack.md` §9.
- [x] **6. Ajustes finais** · `done`
      46 imagens tratadas para `.webp` (5,26 MB no total). Overflow horizontal **zero**
      medido em 320, 360, 375, 414, 768, 900, 1024, 1200, 1440 e 1920px, nas 3 raízes.
      Contraste auditado por **amostragem de pixel** onde há texto sobre foto.
- [x] **7. Módulos e tags** · `done` (parcial, por dependência de dados)
      Banner de cookies com evento no `dataLayer` e Política de Privacidade
      instalados. **Tags e Merlin pulados:** dependem de IDs que o cliente não
      forneceu. Backend PHP não instalado: o site não tem formulário nenhum.
- [ ] **8. Revisão humana** · `doing` ← **você está aqui**
      Preview local: `node Site/preview-server.js` e abrir `http://localhost:8815`
- [ ] **9. Deploy** · `blocked`
      As duas pastas estão prontas. Falta domínio e acesso da hospedagem.

---

## Auditoria (medida, não estimada)

| Verificação | Resultado |
|---|---|
| Overflow horizontal, 320px a 1920px | **0px** em 10 larguras, nas 3 pastas |
| Contraste WCAG AA, por **amostragem de pixel** (texto sobre foto) | **0 reprovações** em 6 seções · pior caso **5,35:1** |
| Contraste WCAG AA, por cor declarada | **0 reprovações** |
| Cada seção cabe em uma tela (1440x900) | **8 de 8** seções normais em 1,00 tela |
| Cena travada da galeria | 2,15 telas de rolagem (limite recomendado: 3) |
| Testes funcionais | **19/19** |
| Testes de acessibilidade, reduced-motion e sem-JS | **15/15** |
| Erros de JavaScript no console | nenhum |
| Requisições falhas | nenhuma |
| Travessão na copy publicada | **0 ocorrências** |
| `::before` em eyebrow | **nenhum** (filete e módulo são elementos reais) |
| `<img>` sem `alt` | nenhuma |
| Âncoras mortas | nenhuma |
| Hierarquia de headings | um `h1`, zero saltos de nível |
| Formulários na página | **0** (todo CTA é botão de WhatsApp) |
| Página sem JavaScript | 100% legível, inclusive o painel de frentes |
| Altura do documento | 9.605px (era 12.073px antes da revisão) |
| Peso total | 5,26 MB, 46 imagens webp |

### Revisão de 04/09/2026

Cinco pedidos do cliente, atendidos e medidos. Detalhe completo em `brief-pack.md` §9.

1. **Mais imagens em destaque.** Imagens distintas em exibição subiram de 11 para 18,
   mais as 27 da galeria. Frentes, obras, onde construiu e método deixaram de ser
   seções de texto.
2. **Hero com foto full width no fundo.** Aérea do loteamento, escolhida por medição
   entre seis candidatas (a única larga nativa, sem upscale).
3. **CTA final redesenhado.** A linha vertical desalinhada saiu inteira. No lugar,
   três janelas de uma fachada que acendem em sequência.
4. **Patterns.** Cinco arquivos de `PROJETOS/_patterns/`, recolorados para a paleta,
   escolhidos por reforçarem a forma assinatura do site.
5. **Uma tela por seção.** `min-height:100vh` com conteúdo centrado; a galeria de obras
   virou cena travada com pin e scrub.

## Decisões que o cliente precisa saber

1. **Nenhum número foi inventado.** O material se contradiz (`+250 obras` num mockup
   de apresentação, `+100 projetos` em outra peça). A régua de credenciais usa só o
   verificável: 17 anos, CREA 39303/D, 6 cidades, 4 frentes de obra.
2. **Sem depoimentos.** Os três do site anterior não têm autoria verificável. A prova
   social é a lista real de contratantes e o histórico nomeado de obras por cidade.
3. **Playfair Display foi descartada.** O kit de criativos do cliente propõe
   "Playfair + Inter". Serifa de luxo com ouro sobre navy é o clichê visual de site
   gerado por IA, e o wordmark real da RICCO não é serifado. Ver `brief-pack.md` §3.
4. **A seção "Antes e depois" é factual.** Usa o único par real de fotos da mesma
   fachada que existe no material. A peça de criativo do cliente usava render como
   "depois"; isso não entrou no site.
