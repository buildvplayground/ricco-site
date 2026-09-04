# -*- coding: utf-8 -*-
"""
Gera as duas pastas de deploy a partir de `Site/`.

  deploy-vercel/               -> Root Directory no Vercel (Framework: Other)
  deploy-wordpress/public_html/ -> conteudo para subir na public_html da
                                   hospedagem WordPress (Apache)

Idempotente: pode rodar quantas vezes quiser.
"""
import os, shutil, io, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(ROOT, 'Site')
VER  = os.path.join(ROOT, 'deploy-vercel')
WP   = os.path.join(ROOT, 'deploy-wordpress')
WPUB = os.path.join(WP, 'public_html')

# o servidor de preview e ferramenta local, nao entra em producao
SKIP_FILES = {'preview-server.js'}
SKIP_DIRS  = {'.git', '__pycache__'}


def copy_site(dest):
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    n = 0
    for base, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel = os.path.relpath(base, SRC)
        out = dest if rel == '.' else os.path.join(dest, rel)
        os.makedirs(out, exist_ok=True)
        for f in files:
            if f in SKIP_FILES:
                continue
            shutil.copy2(os.path.join(base, f), os.path.join(out, f))
            n += 1
    return n


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    io.open(path, 'w', encoding='utf-8', newline='\n').write(text)


# =============================================================== VERCEL
n_ver = copy_site(VER)

write(os.path.join(VER, 'vercel.json'), """{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
      ]
    },
    {
      "source": "/assets/img/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/assets/logos/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/(css|js)/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800, must-revalidate" }]
    }
  ]
}
""")

write(os.path.join(VER, 'robots.txt'), """User-agent: *
Allow: /

Sitemap: https://riccopar.com.br/sitemap.xml
""")

write(os.path.join(VER, 'sitemap.xml'), """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://riccopar.com.br/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://riccopar.com.br/privacidade</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
""")

write(os.path.join(VER, 'LEIA-ME.md'), """# deploy-vercel

Pasta estatica pronta para o Vercel. **Nao e um projeto Next.js** e nao precisa de build:
e HTML, CSS e JS vanilla, que e o padrao BuildV para todas as hospedagens.

## Publicar pelo painel do Vercel

1. Importe o repositorio `dev-buildv/ricco-site`.
2. **Root Directory:** `deploy-vercel`
3. **Framework Preset:** `Other`
4. **Build Command:** deixe vazio · **Output Directory:** deixe vazio
5. Deploy.

## Publicar pelo terminal

```bash
cd deploy-vercel
vercel --prod
```

## Dominio

Aponte `riccopar.com.br` e `www.riccopar.com.br` para o projeto em
Settings > Domains. O `sitemap.xml`, o `robots.txt` e as tags `canonical` /
`og:url` das paginas ja usam `https://riccopar.com.br`. **Se o dominio final for
outro, troque nesses quatro lugares.**

## O que o `vercel.json` faz

- `cleanUrls`: `/privacidade` serve `privacidade.html` (o link no rodape usa
  `privacidade.html`, que continua funcionando).
- Cabecalhos de seguranca: nosniff, SAMEORIGIN, referrer-policy, permissions-policy e HSTS.
- Cache de um ano para imagem e logo, uma semana com revalidacao para CSS e JS.
""")

# ============================================================ WORDPRESS
n_wp = copy_site(WPUB)

write(os.path.join(WPUB, '.htaccess'), """# RICCO Construtora — Apache (hospedagem WordPress)
# Site estatico servido da raiz do dominio.

<IfModule mod_rewrite.c>
  RewriteEngine On

  # HTTPS obrigatorio
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

  # www -> raiz (inverta se o dominio canonico for com www)
  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

  # URL limpa: /privacidade serve privacidade.html
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}\\.html -f
  RewriteRule ^(.+?)/?$ $1.html [L]
</IfModule>

DirectoryIndex index.html

# .webp e .svg costumam faltar no mime.types de hospedagem compartilhada
<IfModule mod_mime.c>
  AddType image/webp .webp
  AddType image/svg+xml .svg
  AddType application/javascript .js
  AddType font/woff2 .woff2
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
  AddOutputFilterByType DEFLATE image/svg+xml application/json text/xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp        "access plus 1 year"
  ExpiresByType image/svg+xml     "access plus 1 year"
  ExpiresByType text/css          "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
  ExpiresByType text/html         "access plus 0 seconds"
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Diretorio nao lista arquivos
Options -Indexes

# Bloqueia acesso a arquivos de apoio
<FilesMatch "^(\\.htaccess|\\.git.*|.*\\.md|.*\\.py)$">
  Require all denied
</FilesMatch>

ErrorDocument 404 /index.html
""")

write(os.path.join(WPUB, 'robots.txt'), """User-agent: *
Allow: /

Sitemap: https://riccopar.com.br/sitemap.xml
""")

write(os.path.join(WPUB, 'sitemap.xml'), """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://riccopar.com.br/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://riccopar.com.br/privacidade.html</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
""")

write(os.path.join(WP, 'LEIA-ME.md'), """# deploy-wordpress

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
""")

# ================================================================ resumo
def tree_size(d):
    tot = cnt = 0
    for b, _, fs in os.walk(d):
        for f in fs:
            tot += os.path.getsize(os.path.join(b, f)); cnt += 1
    return cnt, tot / 1048576.0

for name, d in (('deploy-vercel', VER), ('deploy-wordpress/public_html', WPUB)):
    c, mb = tree_size(d)
    print(f"{name:32s} {c:3d} arquivos  {mb:5.2f} MB")
