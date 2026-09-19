# Startup Playbook (tradução em português)

Tradução para o português do Brasil do [Startup Playbook](https://playbook.samaltman.com/) de Sam Altman. A tradução tem 7.823 palavras e cobre os 14 capítulos do texto original.

## Sobre o projeto

O site é uma página única, estática, sem framework de front-end, sem processo de build e sem dependências. O texto é de Sam Altman e as ilustrações são de Gregory Koberger. A tradução para o português é de Juan José Gouvêa.

Este projeto é independente e não tem vínculo oficial com Sam Altman, a Y Combinator ou os detentores dos direitos do texto original. Os créditos completos estão em [CREDITS.md](CREDITS.md).

## Links

- Original em inglês: https://playbook.samaltman.com/
- Tradução em espanhol (Platzi): https://platzi.com/startup-playbook/

## Rodando localmente

O site é HTML, CSS e JavaScript estáticos. Não há build, não há dependências para instalar e não há variáveis de ambiente.

```
python3 -m http.server 8000 --directory public
```

Abra `http://localhost:8000` no navegador.

## Estrutura de arquivos

```
public/              arquivos publicados
  index.html         página principal
  404.html           página de erro
  favicon.ico
  css/playbook.css
  js/playbook.js
  fonts/*.woff2
  img/**
  robots.txt
  sitemap.xml
  llms.txt
  _headers           cabeçalhos de segurança e cache
wrangler.jsonc       configuração do Cloudflare Workers
README.md
CREDITS.md
```

## Deploy no Cloudflare Workers

O projeto publica os arquivos estáticos da pasta `public/`. Não há build, não há variáveis de ambiente e não há código de servidor.

A configuração fica em `wrangler.jsonc`:

```jsonc
{
  "name": "startup-playbook-br",
  "compatibility_date": "2026-09-18",
  "assets": {
    "directory": "./public",
    "not_found_handling": "404-page"
  }
}
```

### Pelo painel do Cloudflare

Em Workers & Pages, use **Continue with GitHub** e conecte o repositório. Deixe o build command em branco. O Cloudflare lê o `wrangler.jsonc` e publica o conteúdo de `public/`.

### Pela linha de comando

```
npx wrangler deploy
```

O arquivo `public/_headers` define os cabeçalhos de segurança (CSP, HSTS, X-Frame-Options e outros) e as regras de cache. O Workers lê esse arquivo automaticamente, do mesmo jeito que o Pages lia.

Para novos projetos o Cloudflare recomenda Workers em vez do Pages: o Pages continua funcionando, mas as novas funcionalidades vão para o Workers. Requisições a arquivos estáticos não são cobradas.
