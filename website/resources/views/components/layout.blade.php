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
        <link href="/favicon.ico" rel="icon" type="image/x-icon">
        <link href="{{ mix('/css/app.css') }}" rel="stylesheet">
        <script src="{{ mix('/js/app.js') }}" type="text/javascript" async></script>
    </head>
    <body>
        <header class="container-fluid">
            <div class="row">
                <div class="col">
                    @if (date("n") == "12")
                    <img src="/images/logo-xmas.svg" alt="Orry on the Web">
                    @else
                    <img src="/images/logo.svg" alt="Orry on the Web">
                    @endif
                </div>
                <div id="menu-icon" class="col-auto">
                    <a href="#">
                        <div></div>
                        <div></div>
                        <div></div>
                    </a>
                </div>
                <nav class="col-auto">
                    
                </nav>
            </div>
        </header>
        <main role="main">
            {{ $slot }}
        </main>
    </body>
</html>
