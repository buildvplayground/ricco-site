# deploy-wordpress

Conteudo de `public_html/` pronto para a hospedagem do WordPress (Apache).
Site **estatico** (HTML, CSS e JS vanilla), padrao BuildV. Nao precisa de PHP,
nao precisa de banco e nao precisa do WordPress rodando.

## Como subir

1. Entre no gerenciador de arquivos ou no FTP da hospedagem.
2. **Antes de qualquer coisa, faca backup do que estiver hoje em `public_html/`.**
   O WordPress atual, se existir, tem `wp-admin/`, `wp-content/`, `wp-includes/`,
   `wp-config.php` e um `index.php`. Baixe tudo isso antes.
3. Suba o **conteudo** de `deploy-wordpress/public_html/` para dentro da
   `public_html/` do servidor (nao a pasta em si, o conteudo dela).
4. Garanta que o `.htaccess` subiu. Ele e arquivo oculto: muitos clientes de FTP
   escondem por padrao. Sem ele, `/privacidade` nao resolve e o `.webp` pode ser
   servido com o tipo errado.
5. Se o WordPress continuar na pasta, o `index.php` dele disputa a raiz com o
   `index.html`. Escolha um dos caminhos:
   - **substituir:** remova os arquivos do WordPress da `public_html/`; ou
   - **conviver:** mova o WordPress para uma subpasta (`/blog/`, por exemplo) e
     ajuste as URLs dele em Configuracoes > Geral.

## Decisao a confirmar com o cliente

Esta pasta entrega o site **como HTML estatico na raiz do dominio**, que e o
padrao BuildV e o formato mais rapido e mais barato de manter. Se a RICCO quiser
editar o conteudo pelo painel do WordPress, o caminho e outro: transformar este
HTML em **tema WordPress** (com `style.css`, `functions.php`, `header.php`,
`footer.php`, `front-page.php` e campos editaveis). E um trabalho a mais e nao
foi feito aqui porque nao foi pedido. Ver a pendencia no `../state.json`.

## Dominio

`sitemap.xml`, `robots.txt` e as tags `canonical` / `og:url` das paginas usam
`https://riccopar.com.br`. **Se o dominio final for outro, troque nesses quatro
lugares.** O `.htaccess` esta configurado para canonizar **sem** `www`; se o
canonico for com `www`, inverta a regra marcada no arquivo.
