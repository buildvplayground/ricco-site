# deploy-vercel

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
