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
      13 seções, 6 obras com lightbox de galeria, 3 faixas de foto, motor de
      movimento próprio. Auditoria adversarial rodada (ver abaixo).
- [x] **6. Ajustes finais** · `done`
      43 imagens tratadas para `.webp` (4,6 MB no total). Overflow horizontal **zero**
      medido em 320, 360, 375, 414, 768, 900, 1024, 1200, 1440 e 1920px.
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
| Overflow horizontal, 320px a 1920px | **0px** em 10 larguras |
| Contraste WCAG AA do texto renderizado | **0 reprovações** em 37 combinações (home) e 16 (privacidade) |
| Erros de JavaScript no console | nenhum |
| Requisições falhas | nenhuma |
| Travessão na copy publicada | **0 ocorrências** |
| `::before` em eyebrow | **nenhum** (filete e módulo são elementos reais) |
| `<img>` sem `alt` | nenhuma |
| Âncoras mortas | nenhuma |
| Testes funcionais | 14/14 passando |
| `prefers-reduced-motion` | motor desliga, nada fica invisível |
| Página sem JavaScript | 100% legível, loader dissolve por CSS puro |
| Hierarquia de headings | um `h1`, zero saltos de nível |
| Formulários na página | **0** (todo CTA é botão de WhatsApp) |

---

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
