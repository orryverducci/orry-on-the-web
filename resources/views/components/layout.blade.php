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
        <link href="/favicon.ico" rel="icon" type="image/x-icon" >
        <link href="https://fonts.googleapis.com/css?family=Montserrat:200,400,700" rel="stylesheet">
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
