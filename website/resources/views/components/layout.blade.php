@props(['headerOverlay' => false, 'headerBackground' => false])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @if (isset($title))
        <title>{{ $title }} - Orry on the Web</title>
        @else
        <title>Orry on the Web</title>
        @endif
        @if (isset($themecolour))
        <meta name="theme-color" content="{{ $themecolour }}">
        @endif
        <meta name="google-site-verification" content="nLUL7swGgc-k1Io-r5lZYk_i8aXedERKq6Mb6PEYUbY">
        <meta name="msvalidate.01" content="8BD1560DF5967630C8CEE1C55F8A75A9">
        <link href="{{ config('app.url') }}{{ Request::path() }}" rel="canonical">
        <link href="/favicon.ico" rel="icon" type="image/x-icon">
        <link href="/css/app.css" rel="stylesheet">
        <script src="/js/app.js" type="text/javascript" async></script>
        @if (App::environment('production'))
        <script src='https://static.cloudflareinsights.com/beacon.min.js' defer data-cf-beacon='{"token": "2be49cce999f4eeca191d570eb429b5c"}'></script>
        @endif
    </head>
    <body>
        <header @class([
            'container-fluid',
            'overlay' => $headerOverlay,
            'background' => $headerBackground
        ]) role="banner" data-controller="header" data-header-target="menu">
            <div id="site-logo">
                @if (date("n") == "12")
                <svg role="img" aria-label="Orry on the Web"><use href="/images/logo.svg#xmas-logo"/></svg>
                @else
                <svg role="img" aria-label="Orry on the Web"><use href="/images/logo.svg#logo"/></svg>
                @endif
            </div>
            <nav>
                <ul>
                    <li><a href="{{ route('home') }}"><svg aria-hidden="true"><use xlink:href="/images/bootstrap-icons.svg#house"/></svg>Home</a></li>
                </ul>
                <ul id="social-icons">
                    <li><a href="https://twitter.com/orryverducci" title="Twitter" target="_blank"><svg role="img" aria-label="Twitter"><use href="/images/bootstrap-icons.svg#twitter"/></svg></a></li>
                    <li><a href="https://github.com/orryverducci/" title="GitHub" target="_blank"><svg role="img" aria-label="GitHub"><use href="/images/bootstrap-icons.svg#github"/></svg></a></li>
                    <li><a href="https://www.linkedin.com/in/orryv/" title="LinkedIn" target="_blank"><svg role="img" aria-label="LinkedIn"><use href="/images/bootstrap-icons.svg#linkedin"/></svg></a></li>
                </ul>
            </nav>
            <a id="menu-icon" href="#" data-action="header#toggleMenu">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </a>
        </header>
        <main role="main" {{ $attributes }}>
            {{ $slot }}
        </main>
    </body>
</html>
